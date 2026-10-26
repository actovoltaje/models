import { z } from "zod";
import { cardSecretConfigured, signCard } from "@/lib/card-sig";
import { clientIp, createLimiter } from "@/lib/limits";
import { isSharedPlatform, normalizeDomain } from "@/lib/pulso/brand";
import { getEngines, usingSimulatedEngines } from "@/lib/pulso/engines";
import { ScanError, runScan } from "@/lib/pulso/scan";
import { guardRequest } from "@/lib/request-guard";

/** Un escaneo hace 60 llamadas a APIs externas: dejamos margen en la función serverless. */
export const maxDuration = 60;

const FREE_TEXT = /^[\p{L}\p{N} .,'’-]+$/u;
const text = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(FREE_TEXT)
  .refine((v) => v.split(/\s+/).length <= 6);

const Body = z.object({ url: z.string().min(3).max(200), sector: text, city: text });

const DAY = 24 * 60 * 60 * 1000;
const perIp = createLimiter({ max: 3, windowMs: 60 * 60 * 1000 });
const perDomain = createLimiter({ max: 2, windowMs: DAY });
/** Tope global de gasto: corta aunque rote la IP. */
const globalDaily = createLimiter({ max: Number(process.env.MAX_SCANS_PER_DAY) || 200, windowMs: DAY, maxKeys: 1 });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(req: Request): Promise<Response> {
  const blocked = guardRequest(req);
  if (blocked) return blocked;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const parsed = Body.safeParse(raw);
  const domain = parsed.success ? normalizeDomain(parsed.data.url) : null;
  if (!parsed.success || !domain) return json(400, { error: "invalid_request" });
  if (isSharedPlatform(domain)) return json(400, { error: "own_domain_required" });

  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  };
  const simulated = usingSimulatedEngines(env);
  const production = process.env.NODE_ENV === "production";
  if (production && ((simulated && process.env.ALLOW_SIMULATED_ENGINES !== "1") || !cardSecretConfigured())) {
    return json(503, { error: "not_configured" });
  }

  if (!perIp.hit(clientIp(req)) || !perDomain.hit(domain)) return json(429, { error: "rate_limited" });
  if (!globalDaily.hit("all")) return json(503, { error: "capacity" });

  const label = domain.split(".")[0] ?? domain;
  try {
    const result = await runScan({ domain, sector: parsed.data.sector, city: parsed.data.city }, getEngines(env, label));
    const cardUrl = `/api/card?score=${result.score}&brand=${encodeURIComponent(domain)}&sig=${signCard(domain, result.score)}`;
    return json(200, { ...result, domain, scanId: crypto.randomUUID(), simulated, cardUrl });
  } catch (e) {
    if (e instanceof ScanError) return json(502, { error: "engines_unavailable" });
    return json(500, { error: "internal_error" });
  }
}
