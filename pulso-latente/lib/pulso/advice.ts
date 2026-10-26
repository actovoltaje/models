import type { Competitor } from "./types";

interface AdviceContext {
  readonly score: number;
  readonly city: string;
  readonly competitors: readonly Competitor[];
  readonly ownSourceCited: boolean;
}

const FALLBACKS: readonly string[] = [
  "Mantén al día tu ficha de Google Business: nombre, servicios, horarios y reseñas recientes.",
  "Publica casos reales con datos concretos (qué hiciste, para quién, con qué resultado): la IA cita lo específico.",
  "Pide reseñas con el nombre del servicio y la ciudad; es lo que los motores leen para recomendar.",
];

/** Exactamente 3 acciones, de la más a la menos urgente según el resultado. */
export function buildAdvice(ctx: AdviceContext): string[] {
  const out: string[] = [];
  if (ctx.score < 40) {
    out.push(`Crea una página por servicio con ${ctx.city} y preguntas frecuentes: la IA recomienda lo que puede leer y resumir.`);
  }
  const top = ctx.competitors[0];
  if (top) {
    out.push(`Estudia a ${top.name}: sale más que tú. Mira qué fuentes lo citan y consigue aparecer en ellas.`);
  }
  if (!ctx.ownSourceCited) {
    out.push("Consigue menciones en directorios y prensa local: son las fuentes que más citan los motores y hoy no citan tu web.");
  }
  return [...new Set([...out, ...FALLBACKS])].slice(0, 3);
}
