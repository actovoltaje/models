import { buildAdvice } from "./advice";
import { brandAliasesFromDomain, fold, findMentions, listItems, mentionPosition } from "./brand";
import { buildQuestions } from "./questions";
import { computePulso, detectTone, scoreResponse } from "./score";
import type { Competitor, Engine, EngineId, QuestionResult, ScanInput, ScanResult } from "./types";

export class ScanError extends Error {
  constructor(readonly code: "all_engines_failed") {
    super(code);
    this.name = "ScanError";
  }
}

interface Options {
  /** Tiempo máximo por llamada. */
  readonly timeoutMs?: number;
  /** Llamadas simultáneas. */
  readonly concurrency?: number;
  /** Presupuesto total: al agotarse no se lanzan más llamadas y se devuelve lo conseguido. */
  readonly budgetMs?: number;
}

interface Sample {
  readonly engine: EngineId;
  readonly question: string;
  readonly score: number;
  readonly mentioned: boolean;
  readonly text: string;
  readonly sources: readonly string[];
}

/** Proporción de llamadas fallidas a partir de la cual el resultado se marca como parcial. */
const PARTIAL_RATIO = 0.2;
/** Posición asignada cuando solo nos cita una fuente y no el texto. */
const SOURCE_ONLY_POSITION = 2;
const FIELD_LABELS = new Set([
  "direccion", "precio", "precios", "valoracion", "valoraciones", "horario", "horarios", "telefono",
  "web", "resenas", "ubicacion", "servicios", "opiniones", "contacto", "puntuacion",
]);

function withTimeout<T>(p: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      onTimeout();
      reject(new Error("timeout"));
    }, ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e: unknown) => { clearTimeout(t); reject(e); },
    );
  });
}

async function pool<T>(jobs: ReadonlyArray<() => Promise<T>>, limit: number): Promise<T[]> {
  const out: T[] = new Array<T>(jobs.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < jobs.length) {
      const i = next;
      next += 1;
      const job = jobs[i];
      if (job) out[i] = await job();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  return out;
}

function extractNames(text: string): string[] {
  return listItems(text).flatMap((item) => {
    const first = item.split("\n")[0] ?? "";
    const body = first.replace(/^(?:\d+[.)]|[-*•])\s+/, "").replace(/[*_`]/g, "");
    const name = (body.split(/\s[-–—:]\s|:|,|\(/)[0] ?? "").trim();
    const ok = name.length >= 2 && name.length <= 60 && !FIELD_LABELS.has(fold(name));
    return ok ? [name] : [];
  });
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** ¿El alias se forma solo con palabras del sector y la ciudad («fisioterapiagranada»)? Entonces no identifica la marca. */
function isGeneric(alias: string, tokens: readonly string[]): boolean {
  const target = fold(alias).replace(/[^a-z0-9]/g, "");
  const reach = new Array<boolean>(target.length + 1).fill(false);
  reach[0] = true;
  for (let i = 0; i < target.length; i += 1) {
    if (!reach[i]) continue;
    for (const t of tokens) if (target.startsWith(t, i)) reach[i + t.length] = true;
  }
  return reach[target.length] === true;
}

export async function runScan(
  input: ScanInput,
  engines: readonly Engine[],
  repetitions = 2,
  options: Options = {},
): Promise<ScanResult> {
  const { timeoutMs = 20_000, concurrency = 6, budgetMs = 45_000 } = options;
  const startedAt = Date.now();
  const questions = buildQuestions(input.sector, input.city);
  const tokens = fold(`${input.sector} ${input.city}`).split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  const allAliases = brandAliasesFromDomain(input.domain);
  const aliases = allAliases.filter((a) => !isGeneric(a, tokens));
  const ownHost = (url: string): boolean => {
    const h = hostOf(url);
    return h !== null && (h === input.domain || h.endsWith(`.${input.domain}`));
  };

  const jobs = engines.flatMap((engine) =>
    questions.flatMap((question) =>
      Array.from({ length: repetitions }, () => async (): Promise<Sample | null> => {
        const remaining = budgetMs - (Date.now() - startedAt);
        if (remaining <= 0) return null;
        const ctrl = new AbortController();
        try {
          const answer = await withTimeout(engine.ask(question, ctrl.signal), Math.min(timeoutMs, remaining), () => ctrl.abort());
          if (!answer.text.trim() && answer.sources.length === 0) return null;
          const inText = mentionPosition(answer.text, aliases, input.domain);
          const position = inText ?? (answer.sources.some(ownHost) ? SOURCE_ONLY_POSITION : null);
          const tone = inText === null ? "neutral" : detectTone(answer.text, aliases);
          return {
            engine: engine.id,
            question,
            score: scoreResponse({ position, tone }),
            mentioned: position !== null,
            text: answer.text,
            sources: answer.sources,
          };
        } catch {
          return null;
        }
      }),
    ),
  );

  const samples = (await pool(jobs, concurrency)).filter((s): s is Sample => s !== null);
  const enginesOk = engines.map((e) => e.id).filter((id) => samples.some((s) => s.engine === id));
  const enginesFailed = engines.map((e) => e.id).filter((id) => !enginesOk.includes(id));
  if (enginesOk.length === 0) throw new ScanError("all_engines_failed");

  const { score, margin } = computePulso(samples.map((s) => s.score));
  const failedRatio = jobs.length === 0 ? 0 : (jobs.length - samples.length) / jobs.length;

  const counts = new Map<string, Competitor>();
  for (const s of samples) {
    for (const name of extractNames(s.text)) {
      if (findMentions(name, aliases, input.domain).length > 0) continue;
      const key = name.toLowerCase();
      const prev = counts.get(key);
      counts.set(key, { name: prev?.name ?? name, mentions: (prev?.mentions ?? 0) + 1 });
    }
  }
  const competitors = [...counts.values()].sort((a, b) => b.mentions - a.mentions).slice(0, 3);

  const hosts = samples.flatMap((s) => s.sources.map(hostOf)).filter((h): h is string => h !== null);
  const sources = [...new Set(hosts)].slice(0, 5);

  const perQuestion: QuestionResult[] = questions.map((question) => {
    const own = samples.filter((s) => s.question === question);
    return {
      question,
      score: computePulso(own.map((s) => s.score)).score,
      mentioned: own.length > 0 && own.filter((s) => s.mentioned).length * 2 >= own.length,
      answered: own.length,
    };
  });

  return {
    score,
    margin,
    enginesOk,
    enginesFailed,
    partial: enginesFailed.length > 0 || failedRatio >= PARTIAL_RATIO,
    competitors,
    sources,
    perQuestion,
    advice: buildAdvice({ score, city: input.city, competitors, ownSourceCited: samples.some((s) => s.sources.some(ownHost)) }),
  };
}
