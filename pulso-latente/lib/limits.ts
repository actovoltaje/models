export interface Limiter {
  /** true si la petición cabe en la ventana; false si ya se superó el máximo. */
  hit(key: string): boolean;
}

/**
 * Límite en memoria por clave. En Vercel cada instancia tiene el suyo: sirve como primera barrera;
 * para el límite real en producción, mover a Supabase/Redis (fase 2 del roadmap).
 */
export function createLimiter(opts: { max: number; windowMs: number }, now: () => number = Date.now): Limiter {
  const hits = new Map<string, number[]>();
  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((ts) => t - ts < opts.windowMs);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return false;
      }
      hits.set(key, [...recent, t]);
      return true;
    },
  };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}
