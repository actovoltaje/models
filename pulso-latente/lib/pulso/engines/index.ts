import type { Engine } from "../types";
import { createGeminiEngine } from "./gemini";
import { createMockEngine } from "./mock";
import { createOpenAIEngine } from "./openai";
import { createPerplexityEngine } from "./perplexity";

export { createMockEngine };

export interface EngineEnv {
  readonly OPENAI_API_KEY?: string | undefined;
  readonly GEMINI_API_KEY?: string | undefined;
  readonly PERPLEXITY_API_KEY?: string | undefined;
}

/** Motor real si hay clave; simulado si no. Cada motor es intercambiable. */
export function getEngines(env: EngineEnv, brand: string): Engine[] {
  return [
    env.OPENAI_API_KEY ? createOpenAIEngine(env.OPENAI_API_KEY) : createMockEngine("chatgpt", brand),
    env.GEMINI_API_KEY ? createGeminiEngine(env.GEMINI_API_KEY) : createMockEngine("gemini", brand),
    env.PERPLEXITY_API_KEY ? createPerplexityEngine(env.PERPLEXITY_API_KEY) : createMockEngine("perplexity", brand),
  ];
}

export function usingSimulatedEngines(env: EngineEnv): boolean {
  return !(env.OPENAI_API_KEY && env.GEMINI_API_KEY && env.PERPLEXITY_API_KEY);
}
