"use client";

import { useState, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import { Result, type ScanView } from "./Result";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; data: ScanView };

const MESSAGE: Record<number, string> = {
  400: copy.errors.invalid,
  429: copy.errors.rate,
  502: copy.errors.engines,
};

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
        setState({ kind: "error", message: MESSAGE[res.status] ?? copy.errors.generic });
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
      {busy && <p className="muted" role="status">{copy.form.loading}</p>}
      {state.kind === "error" && <p className="field-error" role="alert">{state.message}</p>}
      {state.kind === "done" && <Result data={state.data} />}
    </div>
  );
}
