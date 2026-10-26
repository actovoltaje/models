import { fold } from "./brand";
import type { Analysis, Tone } from "./types";

/** Hipótesis de partida: se validan con los primeros 20 escaneos reales. */
export const WEIGHTS = {
  mention: 50,
  position: [30, 20, 10] as readonly number[],
  tone: { positive: 20, neutral: 10, negative: 0 } as Record<Tone, number>,
} as const;

export function scoreResponse(a: Analysis): number {
  if (a.position === null) return 0;
  const bonus = WEIGHTS.position[a.position] ?? 0;
  return Math.min(100, WEIGHTS.mention + bonus + WEIGHTS.tone[a.tone]);
}

export function computePulso(scores: readonly number[]): { score: number; margin: number } {
  if (scores.length === 0) return { score: 0, margin: 0 };
  const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
  const variance = scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length;
  return { score: Math.round(mean), margin: Math.round(Math.sqrt(variance) / Math.sqrt(scores.length)) };
}

const NEGATIVE = ["no lo recomiendo", "no recomiendo", "malas resenas", "mala fama", "evitar", "queja", "decepcion", "peor"];
const POSITIVE = ["excelente", "recomendable", "recomiendo", "destaca", "referente", "lider", "buenas resenas", "muy valorad", "mejor"];

export function detectTone(text: string, aliases: readonly string[]): Tone {
  const names = aliases.map(fold);
  const sentences = fold(text)
    .split(/[.!?\n]+/)
    .filter((s) => names.some((n) => s.includes(n)));
  const scope = sentences.join(" . ");
  if (!scope) return "neutral";
  if (NEGATIVE.some((w) => scope.includes(w))) return "negative";
  if (POSITIVE.some((w) => scope.includes(w))) return "positive";
  return "neutral";
}
