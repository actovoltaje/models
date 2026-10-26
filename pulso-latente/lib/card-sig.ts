import { createHmac, timingSafeEqual } from "node:crypto";

export function cardSecretConfigured(): boolean {
  return Boolean(process.env.CARD_SECRET) || process.env.NODE_ENV !== "production";
}

function secret(): string {
  const s = process.env.CARD_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("CARD_SECRET no configurado");
  return "dev-only-secret";
}

/** Firma de la tarjeta: solo se pueden pintar notas que haya emitido el servidor. */
export function signCard(brand: string, score: number): string {
  return createHmac("sha256", secret()).update(`${brand}|${score}`).digest("hex").slice(0, 32);
}

export function verifyCard(brand: string, score: number, sig: string): boolean {
  const expected = Buffer.from(signCard(brand, score));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
