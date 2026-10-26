import { describe, expect, it } from "vitest";
import { buildQuestions } from "./questions";

describe("buildQuestions", () => {
  const qs = buildQuestions("  Clínica de fisioterapia ", "granada");
  it("devuelve exactamente 10 únicas", () => {
    expect(qs).toHaveLength(10);
    expect(new Set(qs).size).toBe(10);
  });
  it("todas incluyen sector y ciudad limpios", () => {
    for (const q of qs) {
      expect(q.toLowerCase()).toContain("clínica de fisioterapia");
      expect(q).toContain("Granada");
    }
  });
  it("sector vacío lanza error", () => {
    expect(() => buildQuestions("  ", "Granada")).toThrow();
  });
});
