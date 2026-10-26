export interface Limiter {
  /** true si la petición cabe en la ventana; false si ya se superó el máximo. */
  hit(key: string): boolean;
  size(): number;
}

/**
 * Límite en memoria por clave, con tope de claves (expulsa las más antiguas). En Vercel cada
 * instancia tiene el suyo: sirve como primera barrera; el límite real va a Redis/Supabase (fase 2).
 */
export function createLimiter(
  opts: { max: number; windowMs: number; maxKeys?: number },
  now: () => number = Date.now,
): Limiter {
  const maxKeys = opts.maxKeys ?? 10_000;
  const hits = new Map<string, number[]>();
  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((ts) => t - ts < opts.windowMs);
      hits.delete(key);
      const allowed = recent.length < opts.max;
      hits.set(key, allowed ? [...recent, t] : recent);
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return allowed;
    },
    size: () => hits.size,
  };
}

function ipv6Prefix64(ip: string): string {
  const [head = "", tail] = ip.split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = tail === undefined ? h : [...h, ...new Array<string>(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t];
  return `${groups.slice(0, 4).map((g) => g.toLowerCase()).join(":")}::/64`;
}

/** IP del cliente: primer valor de x-forwarded-for (o x-real-ip); las IPv6 se agrupan por /64. */
export function clientIp(req: Request): string {
  const raw = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim();
  if (!raw) return "unknown";
  return raw.includes(":") ? ipv6Prefix64(raw) : raw;
}
