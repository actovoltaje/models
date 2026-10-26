import { z } from "zod";
import type { Engine } from "../types";

const Body = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })),
  citations: z.array(z.string()).optional(),
});

export function createPerplexityEngine(apiKey: string, model = "sonar"): Engine {
  return {
    id: "perplexity",
    async ask(question, signal) {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }),
        signal,
      });
      if (!res.ok) throw new Error(`perplexity ${res.status}`);
      const body = Body.parse(await res.json());
      return { text: body.choices[0]?.message.content ?? "", sources: body.citations ?? [] };
    },
  };
}
