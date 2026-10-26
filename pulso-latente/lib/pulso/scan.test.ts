import { describe, expect, it } from "vitest";
import { ScanError, runScan } from "./scan";
import { createMockEngine, getEngines } from "./engines";
import type { Engine, EngineId, ScanInput } from "./types";

const input: ScanInput = { domain: "clinicasol.es", sector: "clínica de fisioterapia", city: "Granada" };

const fake = (id: EngineId, text: string): Engine => ({ id, ask: async () => ({ text, sources: ["https://clinicasol.es/x"] }) });
const failing = (id: EngineId): Engine => ({ id, ask: async () => { throw new Error("boom sk-secret"); } });

const LIST_FIRST = "1. **Clínica Sol** - excelente y muy recomendable\n2. Fisio Norte\n3. Fisio Norte Plus";
const LIST_OTHERS = "1. Fisio Norte\n2. Fisio Norte Plus\n3. Centro Alfa\n4. Beta Salud\n5. Fisio Norte";

describe("runScan", () => {
  it("marca siempre primera y positiva = 100", async () => {
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST)], 2);
    expect(r.score).toBe(100);
    expect(r.partial).toBe(false);
    expect(r.advice).toHaveLength(3);
  });

  it("nunca aparece = 0 y sin competidores de la propia marca", async () => {
    const r = await runScan(input, [fake("gemini", LIST_OTHERS)], 2);
    expect(r.score).toBe(0);
    expect(r.competitors[0]?.name).toBe("Fisio Norte");
    expect(r.competitors).toHaveLength(3);
  });

  it("excluye la propia marca de los competidores", async () => {
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST)], 1);
    expect(r.competitors.map((c) => c.name)).not.toContain("Clínica Sol");
  });

  it("un motor que falla da resultado parcial con el resto", async () => {
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST), failing("gemini")], 1);
    expect(r.partial).toBe(true);
    expect(r.enginesOk).toEqual(["chatgpt"]);
    expect(r.enginesFailed).toEqual(["gemini"]);
    expect(r.score).toBe(100);
  });

  it("si todos fallan lanza ScanError sin filtrar el mensaje original", async () => {
    const p = runScan(input, [failing("chatgpt"), failing("gemini")], 1);
    await expect(p).rejects.toBeInstanceOf(ScanError);
    await expect(p).rejects.toMatchObject({ code: "all_engines_failed" });
    await expect(p).rejects.not.toThrow(/sk-secret/);
  });

  it("trata un motor colgado como fallo por timeout", async () => {
    const hung: Engine = { id: "perplexity", ask: () => new Promise(() => {}) };
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST), hung], 1, { timeoutMs: 20 });
    expect(r.enginesFailed).toEqual(["perplexity"]);
  });

  it("limita la concurrencia a 6 llamadas", async () => {
    let inFlight = 0;
    let peak = 0;
    const slow: Engine = {
      id: "chatgpt",
      ask: async () => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 5));
        inFlight -= 1;
        return { text: LIST_OTHERS, sources: [] };
      },
    };
    await runScan(input, [slow], 2);
    expect(peak).toBeLessThanOrEqual(6);
  });

  it("respuesta vacía cuenta como no mencionado, no como fallo", async () => {
    const r = await runScan(input, [fake("chatgpt", "")], 1);
    expect(r.score).toBe(0);
    expect(r.enginesFailed).toEqual([]);
  });
});

describe("motor simulado", () => {
  it("es determinista", async () => {
    const a = createMockEngine("chatgpt", "Clínica Sol");
    const b = createMockEngine("chatgpt", "Clínica Sol");
    expect(await a.ask("¿mejor fisio en Granada?")).toEqual(await b.ask("¿mejor fisio en Granada?"));
  });
  it("sin claves getEngines devuelve los 3 motores simulados", () => {
    expect(getEngines({}, "Clínica Sol").map((e) => e.id)).toEqual(["chatgpt", "gemini", "perplexity"]);
  });
});
