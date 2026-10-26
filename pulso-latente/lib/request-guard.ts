const deny = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json" } });

/**
 * Defensa contra peticiones cruzadas que no necesitan preflight (JSON enviado como text/plain
 * desde otra web): exige JSON y un origen propio. null = la petición pasa.
 */
export function guardRequest(req: Request): Response | null {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return deny(415, "unsupported_media_type");
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return deny(403, "forbidden");
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      return deny(403, "forbidden");
    }
    if (originHost !== host) return deny(403, "forbidden");
  }
  return null;
}
