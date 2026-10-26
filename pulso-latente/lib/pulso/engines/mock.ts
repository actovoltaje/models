import type { Engine, EngineId } from "../types";

const POOL = ["Centro Alfa", "Beta Salud", "Fisio Norte", "Clínica Delta", "Estudio Gamma", "Espacio Épsilon"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Motor simulado y determinista: permite enseñar y testear el producto sin claves de API. */
export function createMockEngine(id: EngineId, brand: string): Engine {
  return {
    id,
    async ask(question) {
      const h = hash(`${id}|${brand}|${question}`);
      const names = [...POOL].sort((a, b) => hash(a + question) - hash(b + question)).slice(0, 4);
      const roll = h % 100;
      if (roll < 45) {
        const at = h % 3;
        names.splice(at, 0, brand);
      }
      const lines = names.map((n, i) => `${i + 1}. ${n}${n === brand ? " - muy recomendable" : ""}`);
      return { text: lines.join("\n"), sources: roll < 45 ? [] : ["https://directorio.example/listado"] };
    },
  };
}
