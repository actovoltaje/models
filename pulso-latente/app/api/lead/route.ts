import { z } from "zod";
import { CONSENT_VERSION, createMemoryLeadStore } from "@/lib/leads";
import { clientIp, createLimiter } from "@/lib/limits";
import { guardRequest } from "@/lib/request-guard";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  scanId: z.string().uuid(),
  consent: z.literal(true),
});

const perEmail = createLimiter({ max: 1, windowMs: 24 * 60 * 60 * 1000 });
const perIp = createLimiter({ max: 10, windowMs: 60 * 60 * 1000 });
const store = createMemoryLeadStore();

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
  if (!parsed.success) return json(400, { error: "invalid_request" });
  if (!perIp.hit(clientIp(req)) || !perEmail.hit(parsed.data.email)) return json(429, { error: "rate_limited" });

  const now = new Date().toISOString();
  await store.save({ email: parsed.data.email, scanId: parsed.data.scanId, createdAt: now, consentAt: now, consentVersion: CONSENT_VERSION });
  return new Response(null, { status: 204 });
}
