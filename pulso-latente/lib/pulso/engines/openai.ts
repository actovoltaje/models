import { z } from "zod";
import type { Engine } from "../types";

const Body = z.object({
  output: z.array(
    z.object({
      content: z
        .array(
          z.object({
            text: z.string().optional(),
            annotations: z.array(z.object({ url: z.string().optional() })).optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export function createOpenAIEngine(apiKey: string, model = "gpt-4o-mini"): Engine {
  return {
    id: "chatgpt",
    async ask(question, signal) {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, tools: [{ type: "web_search" }], input: question }),
        signal,
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const parsed = Body.parse(await res.json());
      const parts = parsed.output.flatMap((o) => o.content ?? []);
      return {
        text: parts.map((p) => p.text ?? "").join("\n"),
        sources: parts.flatMap((p) => p.annotations ?? []).flatMap((a) => (a.url ? [a.url] : [])),
      };
    },
  };
}
