import { describe, expect, it } from "vitest";
import { ScanError, runScan } from "./scan";
import { createMockEngine, getEngines } from "./engines";
import type { Engine, EngineId, ScanInput } from "./types";

const input: ScanInput = { domain: "clinicasol.es", sector: "clínica de fisioterapia", city: "Granada" };

const fake = (id: EngineId, text: string): Engine => ({ id, ask: async () => ({ text, sources: [] }) });
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

  it("una respuesta vacía es un fallo del motor, no un cero", async () => {
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST), fake("gemini", "")], 1);
    expect(r.enginesFailed).toEqual(["gemini"]);
    expect(r.partial).toBe(true);
    expect(r.score).toBe(100);
  });

  it("marca partial si fallan muchas llamadas sueltas aunque el motor responda", async () => {
    let n = 0;
    const flaky: Engine = { id: "chatgpt", ask: async () => { n += 1; if (n % 2 === 0) throw new Error("x"); return { text: LIST_FIRST, sources: [] }; } };
    const r = await runScan(input, [flaky], 2);
    expect(r.enginesOk).toEqual(["chatgpt"]);
    expect(r.partial).toBe(true);
  });

  it("deja de encolar trabajo al agotar el presupuesto total y devuelve parcial", async () => {
    const slow: Engine = { id: "gemini", ask: () => new Promise((r) => setTimeout(() => r({ text: LIST_FIRST, sources: [] }), 30)) };
    const r = await runScan(input, [fake("chatgpt", LIST_FIRST), slow], 2, { concurrency: 2, budgetMs: 50 });
    expect(r.partial).toBe(true);
  });

  it("una fuente que cita tu dominio cuenta como mención", async () => {
    const r = await runScan(input, [{ id: "perplexity", ask: async () => ({ text: "1. Fisio Norte [1]", sources: ["https://blog.clinicasol.es/x"] }) }], 1);
    expect(r.score).toBeGreaterThan(0);
  });

  it("no usa etiquetas de campos como competidores", async () => {
    const text = "1. **Fisio Norte**\n   - Dirección: calle\n   - Valoración: 4,8\n2. Centro Alfa\n   - Dirección: otra\n   - Valoración: 4,1";
    const r = await runScan(input, [fake("chatgpt", text)], 1);
    expect(r.competitors.map((c) => c.name)).toEqual(["Fisio Norte", "Centro Alfa"]);
  });

  it("no cuenta como mención un alias formado solo por sector y ciudad", async () => {
    const generic: ScanInput = { domain: "fisioterapiagranada.es", sector: "fisioterapia", city: "Granada" };
    const r = await runScan(generic, [fake("chatgpt", "1. Fisioterapia Granada Centro\n2. Otro")], 1);
    expect(r.score).toBe(0);
  });

  it("pasa una señal de cancelación al motor al vencer el timeout", async () => {
    let aborted = false;
    const hung: Engine = { id: "perplexity", ask: (_q, signal) => new Promise(() => { signal?.addEventListener("abort", () => { aborted = true; }); }) };
    await runScan(input, [fake("chatgpt", LIST_FIRST), hung], 1, { timeoutMs: 20 });
    expect(aborted).toBe(true);
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

describe("perQuestion", () => {
  it("solo marca como mencionada la pregunta si la marca sale en la mitad o más de las respuestas", async () => {
    let calls = 0;
    const alternating: Engine = {
      id: "chatgpt",
      ask: async () => {
        calls += 1;
        return { text: calls % 4 === 1 ? "1. Clínica Sol" : "1. Fisio Norte", sources: [] };
      },
    };
    const r = await runScan(input, [alternating], 2, { concurrency: 1 });
    expect(r.perQuestion.filter((q) => q.mentioned).length).toBeLessThan(10);
  });
});
