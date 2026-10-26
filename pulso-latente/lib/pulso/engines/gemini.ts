import { z } from "zod";
import type { Engine } from "../types";

const Body = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({ parts: z.array(z.object({ text: z.string().optional() })).optional() }).optional(),
        groundingMetadata: z
          .object({ groundingChunks: z.array(z.object({ web: z.object({ title: z.string().optional() }).optional() })).optional() })
          .optional(),
      }),
    )
    .optional(),
});

export function createGeminiEngine(apiKey: string, model = "gemini-2.5-flash"): Engine {
  return {
    id: "gemini",
    async ask(question, signal) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: question }] }], tools: [{ google_search: {} }] }),
        signal,
      });
      if (!res.ok) throw new Error(`gemini ${res.status}`);
      const first = Body.parse(await res.json()).candidates?.[0];
      return {
        text: (first?.content?.parts ?? []).map((p) => p.text ?? "").join("\n"),
        sources: (first?.groundingMetadata?.groundingChunks ?? []).flatMap((c) => (c.web?.title ? [`https://${c.web.title}`] : [])),
      };
    },
  };
}
