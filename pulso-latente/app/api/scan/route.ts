import { z } from "zod";
import { clientIp, createLimiter } from "@/lib/limits";
import { normalizeDomain } from "@/lib/pulso/brand";
import { getEngines, usingSimulatedEngines } from "@/lib/pulso/engines";
import { ScanError, runScan } from "@/lib/pulso/scan";

const Body = z.object({
  url: z.string().min(3).max(200),
  sector: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
});

const perIp = createLimiter({ max: 3, windowMs: 60 * 60 * 1000 });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const parsed = Body.safeParse(raw);
  const domain = parsed.success ? normalizeDomain(parsed.data.url) : null;
  if (!parsed.success || !domain) return json(400, { error: "invalid_request" });

  if (!perIp.hit(clientIp(req))) return json(429, { error: "rate_limited" });

  const env = process.env;
  const label = domain.split(".")[0] ?? domain;
  try {
    const result = await runScan(
      { domain, sector: parsed.data.sector, city: parsed.data.city },
      getEngines(env, label),
    );
    return json(200, { ...result, domain, scanId: crypto.randomUUID(), simulated: usingSimulatedEngines(env) });
  } catch (e) {
    if (e instanceof ScanError) return json(502, { error: "engines_unavailable" });
    return json(500, { error: "internal_error" });
  }
}
