import { buildAdvice } from "./advice";
import { brandAliasesFromDomain, findMentions } from "./brand";
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
  readonly timeoutMs?: number;
  readonly concurrency?: number;
}

interface Sample {
  readonly engine: EngineId;
  readonly question: string;
  readonly score: number;
  readonly mentioned: boolean;
  readonly text: string;
  readonly sources: readonly string[];
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
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

const LIST_LINE = /^\s*(?:\d+[.)]|[-*•])\s+(.+)$/;

function extractNames(text: string): string[] {
  return text
    .split("\n")
    .map((l) => LIST_LINE.exec(l)?.[1])
    .flatMap((raw) => {
      if (!raw) return [];
      const name = (raw.replace(/[*_`]/g, "").split(/\s[-–—:]\s|:|,|\(/)[0] ?? "").trim();
      return name.length >= 2 && name.length <= 60 ? [name] : [];
    });
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function runScan(
  input: ScanInput,
  engines: readonly Engine[],
  repetitions = 2,
  options: Options = {},
): Promise<ScanResult> {
  const { timeoutMs = 20_000, concurrency = 6 } = options;
  const aliases = brandAliasesFromDomain(input.domain);
  const questions = buildQuestions(input.sector, input.city);

  const jobs = engines.flatMap((engine) =>
    questions.flatMap((question) =>
      Array.from({ length: repetitions }, () => async (): Promise<Sample | null> => {
        try {
          const answer = await withTimeout(engine.ask(question), timeoutMs);
          const hits = findMentions(answer.text, aliases, input.domain);
          const position = hits[0] ?? null;
          const tone = position === null ? "neutral" : detectTone(answer.text, aliases);
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
      mentioned: own.some((s) => s.mentioned),
    };
  });

  return {
    score,
    margin,
    enginesOk,
    enginesFailed,
    partial: enginesFailed.length > 0,
    competitors,
    sources,
    perQuestion,
    advice: buildAdvice({
      score,
      city: input.city,
      competitors,
      ownSourceCited: hosts.includes(input.domain),
    }),
  };
}
