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

import { isSharedPlatform, listItems, mentionPosition } from "./brand";

describe("dominios con tilde o ñ", () => {
  it("normalizeDomain devuelve la forma unicode y detecta la marca", () => {
    const domain = normalizeDomain("https://peluqueríaluna.es/");
    expect(domain).toBe("peluqueríaluna.es");
    const aliases = brandAliasesFromDomain(domain as string);
    expect(findMentions("1. Peluquería Luna", aliases, domain as string)).toEqual([0]);
  });
});

describe("falsos positivos entre frases", () => {
  const aliases = brandAliasesFromDomain("esteticagranada.es");
  it("no une palabras separadas por puntuación", () => {
    expect(findMentions("Opciones de estética. Granada tiene muchas", aliases, "esteticagranada.es")).toEqual([]);
    expect(findMentions("1. Centro Alfa (Estética, Granada centro)", aliases, "esteticagranada.es")).toEqual([]);
  });
});

describe("plataformas compartidas", () => {
  it("bloquea redes y agregadores como marca", () => {
    expect(isSharedPlatform("instagram.com")).toBe(true);
    expect(isSharedPlatform("l.instagram.com")).toBe(true);
    expect(isSharedPlatform("clinicasol.es")).toBe(false);
  });
  it("en plataformas de subdominio la marca es la etiqueta de la izquierda", () => {
    expect(brandAliasesFromDomain("clinicasol.wixsite.com")).toContain("clinicasol");
    expect(brandAliasesFromDomain("clinicasol.wixsite.com")).not.toContain("wixsite");
  });
});

describe("mentionPosition", () => {
  const aliases = ["pulso"];
  it("cuenta puestos de la lista, no líneas de introducción", () => {
    expect(mentionPosition("Aquí tienes opciones:\n1. Centro Alfa\n2. Pulso", aliases, "pulso.es")).toBe(1);
  });
  it("ignora subpuntos con sangría como elementos", () => {
    const t = "1. Centro Alfa\n   - Dirección: x\n2. Pulso\n   - Valoración: 5";
    expect(mentionPosition(t, aliases, "pulso.es")).toBe(1);
  });
  it("prosa sin lista cuenta como posición intermedia (1)", () => {
    expect(mentionPosition("Te recomiendo Pulso por su trato.", aliases, "pulso.es")).toBe(1);
  });
  it("null si no aparece", () => {
    expect(mentionPosition("1. Alfa\n2. Beta", aliases, "pulso.es")).toBeNull();
  });
});

describe("listItems", () => {
  it("devuelve solo elementos de primer nivel con su continuación indentada", () => {
    const items = listItems("Intro\n1. **A**\n   - Dirección: x\n2. B");
    expect(items).toHaveLength(2);
    expect(items[0]).toContain("Dirección");
  });
});
