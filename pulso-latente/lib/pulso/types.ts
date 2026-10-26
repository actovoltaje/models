export type EngineId = "chatgpt" | "gemini" | "perplexity";
export type Tone = "positive" | "neutral" | "negative";

export interface Analysis {
  /** Posición (0 = primera) del primer bloque donde aparece la marca; null si no aparece. */
  readonly position: number | null;
  readonly tone: Tone;
}

export interface EngineAnswer {
  readonly text: string;
  readonly sources: readonly string[];
}

export interface Engine {
  readonly id: EngineId;
  ask(question: string): Promise<EngineAnswer>;
}

export interface ScanInput {
  readonly domain: string;
  readonly sector: string;
  readonly city: string;
}

export interface Competitor {
  readonly name: string;
  readonly mentions: number;
}

export interface QuestionResult {
  readonly question: string;
  readonly score: number;
  readonly mentioned: boolean;
}

export interface ScanResult {
  readonly score: number;
  readonly margin: number;
  readonly enginesOk: readonly EngineId[];
  readonly enginesFailed: readonly EngineId[];
  readonly partial: boolean;
  readonly competitors: readonly Competitor[];
  readonly sources: readonly string[];
  readonly perQuestion: readonly QuestionResult[];
  readonly advice: readonly string[];
}
