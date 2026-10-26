import { describe, expect, it } from "vitest";
import { computePulso, detectTone, scoreResponse } from "./score";

describe("scoreResponse", () => {
  it("0 sin mención", () => {
    expect(scoreResponse({ position: null, tone: "positive" })).toBe(0);
  });
  it("primera posición y tono positivo = 100", () => {
    expect(scoreResponse({ position: 0, tone: "positive" })).toBe(100);
  });
  it("tercera posición neutra = 70", () => {
    expect(scoreResponse({ position: 2, tone: "neutral" })).toBe(70);
  });
  it("mención tardía y negativa = 50", () => {
    expect(scoreResponse({ position: 7, tone: "negative" })).toBe(50);
  });
});

describe("computePulso", () => {
  it("sin datos devuelve 0 y 0", () => {
    expect(computePulso([])).toEqual({ score: 0, margin: 0 });
  });
  it("media redondeada", () => {
    expect(computePulso([100, 0]).score).toBe(50);
  });
  it("margen 0 si todo igual", () => {
    expect(computePulso([40, 40, 40]).margin).toBe(0);
  });
  it("margen positivo si hay variabilidad", () => {
    expect(computePulso([100, 0]).margin).toBeGreaterThan(0);
  });
});

describe("detectTone", () => {
  it("positivo", () => {
    expect(detectTone("Pulso es una opción excelente y muy recomendable.", ["pulso"])).toBe("positive");
  });
  it("negativo", () => {
    expect(detectTone("Pulso tiene malas reseñas y no lo recomiendo.", ["pulso"])).toBe("negative");
  });
  it("neutro si no hay señales", () => {
    expect(detectTone("Pulso está en Granada.", ["pulso"])).toBe("neutral");
  });
});
