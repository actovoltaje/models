"use client";

import { useState, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import { Result, type ScanView } from "./Result";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; data: ScanView };

function messageFor(status: number, code: string | undefined): string {
  if (status === 400) return code === "own_domain_required" ? copy.errors.ownDomain : copy.errors.invalid;
  if (status === 429) return copy.errors.rate;
  if (status === 502) return copy.errors.engines;
  if (status === 503) return code === "capacity" ? copy.errors.capacity : copy.errors.generic;
  return copy.errors.generic;
}

export function Scanner() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: f.get("url"), sector: f.get("sector"), city: f.get("city") }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ kind: "error", message: messageFor(res.status, body.error) });
        return;
      }
      setState({ kind: "done", data: (await res.json()) as ScanView });
    } catch {
      setState({ kind: "error", message: copy.errors.generic });
    }
  }

  const busy = state.kind === "loading";

  return (
    <div className="scanner">
      <form onSubmit={onSubmit} noValidate={false}>
        <label>
          <span>{copy.form.url}</span>
          <input name="url" required maxLength={200} inputMode="url" autoComplete="url" placeholder={copy.form.urlPlaceholder} disabled={busy} />
        </label>
        <label>
          <span>{copy.form.sector}</span>
          <input name="sector" required minLength={2} maxLength={60} placeholder={copy.form.sectorPlaceholder} disabled={busy} />
        </label>
        <label>
          <span>{copy.form.city}</span>
          <input name="city" required minLength={2} maxLength={60} placeholder={copy.form.cityPlaceholder} disabled={busy} />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Midiendo…" : copy.form.submit}</button>
      </form>
      {busy && (
        <div className="loading" role="status">
          <svg viewBox="0 0 72 24" aria-hidden="true"><path d="M0 12 H27 L31 3 L38 21 L42 12 H72" /></svg>
          <p className="muted">{copy.form.loading}</p>
        </div>
      )}
      {state.kind === "error" && <p className="field-error" role="alert">{state.message}</p>}
      {state.kind === "done" && <Result data={state.data} />}
    </div>
  );
}
