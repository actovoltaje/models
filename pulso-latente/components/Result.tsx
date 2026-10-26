"use client";

import { useState, type FormEvent } from "react";
import { bandFor, copy } from "@/lib/copy";

export interface ScanView {
  readonly score: number;
  readonly margin: number;
  readonly domain: string;
  readonly scanId: string;
  readonly simulated: boolean;
  readonly partial: boolean;
  readonly enginesOk: readonly string[];
  readonly competitors: readonly { name: string; mentions: number }[];
  readonly perQuestion: readonly { question: string; score: number; mentioned: boolean }[];
  readonly advice: readonly string[];
}

const ENGINE_LABEL: Record<string, string> = { chatgpt: "ChatGPT", gemini: "Gemini", perplexity: "Perplexity" };
const RING = 2 * Math.PI * 54;

function LeadForm({ scanId }: { scanId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, scanId }),
      });
      setState(res.status === 204 ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <p className="lead-done" role="status">{copy.result.leadDone}</p>;
  return (
    <form className="lead" onSubmit={onSubmit}>
      <label htmlFor="lead-email" className="sr-only">Email</label>
      <input id="lead-email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" />
      <button type="submit" disabled={state === "sending"}>{copy.result.leadSubmit}</button>
      {state === "error" && <p className="field-error" role="alert">No hemos podido guardarlo. Revisa el email o inténtalo más tarde.</p>}
    </form>
  );
}

export function Result({ data }: { data: ScanView }) {
  const dash = (data.score / 100) * RING;
  const cardHref = `/api/card?score=${data.score}&brand=${encodeURIComponent(data.domain)}`;

  return (
    <section className="result" aria-live="polite" aria-label="Resultado del escaneo">
      <div className="score-row">
        <div className="ring" role="img" aria-label={`Pulso Latente ${data.score} sobre 100`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" className="ring-track" />
            <circle cx="60" cy="60" r="54" className="ring-fill" strokeDasharray={`${dash} ${RING}`} transform="rotate(-90 60 60)" />
          </svg>
          <span className="ring-num">{data.score}</span>
        </div>
        <div>
          <p className="eyebrow">{copy.index} · {data.domain}</p>
          <h3 className="band">{bandFor(data.score)}</h3>
          <p className="muted">± {data.margin} puntos · {data.enginesOk.map((e) => ENGINE_LABEL[e] ?? e).join(", ")}</p>
        </div>
      </div>

      {data.simulated && <p className="notice">{copy.result.simulated}</p>}
      {data.partial && <p className="notice">{copy.result.partial}</p>}

      <div className="strip" aria-label="Aparición por pregunta">
        {data.perQuestion.map((q) => (
          <span key={q.question} className={q.mentioned ? "tick on" : "tick"} style={{ height: `${12 + q.score * 0.36}px` }} title={q.question} />
        ))}
      </div>

      <div className="cols">
        <div>
          <h4>Quién sale en tu lugar</h4>
          {data.competitors.length === 0 ? (
            <p className="muted">No hemos detectado competidores en las respuestas.</p>
          ) : (
            <ol className="list">
              {data.competitors.map((c) => (
                <li key={c.name}>{c.name} <span className="muted">· {c.mentions} menciones</span></li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <h4>Tres acciones</h4>
          <ol className="list">
            {data.advice.map((a) => <li key={a}>{a}</li>)}
          </ol>
        </div>
      </div>

      <div className="gate">
        <h4>{copy.result.leadTitle}</h4>
        <p className="muted">{copy.result.leadBody}</p>
        <LeadForm scanId={data.scanId} />
        <a className="link" href={cardHref} download={`pulso-${data.domain}.svg`}>{copy.result.card}</a>
      </div>

      <p className="caveat">{copy.result.caveat}</p>
    </section>
  );
}
