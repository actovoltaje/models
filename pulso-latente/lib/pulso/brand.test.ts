import { describe, expect, it } from "vitest";
import { brandAliasesFromDomain, findMentions, normalizeDomain } from "./brand";

describe("normalizeDomain", () => {
  it("normaliza protocolo, www, ruta y mayúsculas", () => {
    expect(normalizeDomain("HTTPS://www.ClinicaSol.es/precios?x=1")).toBe("clinicasol.es");
  });
  it("acepta dominio sin protocolo", () => {
    expect(normalizeDomain("clinicasol.es")).toBe("clinicasol.es");
  });
  it("rechaza texto que no es una URL", () => {
    expect(normalizeDomain("no es url")).toBeNull();
    expect(normalizeDomain("")).toBeNull();
  });
  it("rechaza esquemas peligrosos y hosts internos", () => {
    expect(normalizeDomain("javascript:alert(1)")).toBeNull();
    expect(normalizeDomain("http://localhost:3000")).toBeNull();
    expect(normalizeDomain("http://192.168.1.10")).toBeNull();
  });
});

describe("brandAliasesFromDomain", () => {
  it("genera alias con y sin separación", () => {
    expect(brandAliasesFromDomain("clinicasol.es")).toContain("clinicasol");
    expect(brandAliasesFromDomain("clinica-sol.es")).toContain("clinica sol");
  });
});

describe("findMentions", () => {
  const aliases = ["pulso"];
  it("no cuenta una palabra que solo contiene la marca", () => {
    expect(findMentions("Te recomiendo Impulso Digital", aliases, "pulso.es")).toEqual([]);
  });
  it("ignora acentos y mayúsculas", () => {
    expect(findMentions("1. CLÍNICA SOL\n2. Otra", ["clinica sol"], "clinicasol.es")).toEqual([0]);
  });
  it("cuenta el dominio citado como mención", () => {
    expect(findMentions("Fuente: https://www.pulso.es/blog", [], "pulso.es")).toEqual([0]);
  });
  it("devuelve la posición de aparición por línea de lista", () => {
    const text = "1. Alfa\n2. Beta\n3. Pulso, muy recomendable";
    expect(findMentions(text, aliases, "pulso.es")).toEqual([2]);
  });
});
