// Minimal server-side OpenAI client. Uses the REST API via fetch (no SDK
// dependency), returns null when OPENAI_API_KEY is absent so callers can fall
// back cleanly. Never import this from a client component — it reads the key
// from server env and must not reach the browser.

export const VISION_MODEL = "gpt-4o-mini"; // vision-capable, low cost

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
};

export type OpenAIClient = {
  /** Chat completion constrained to a single JSON object response. */
  chatJSON(messages: ChatMessage[], opts?: { model?: string; maxTokens?: number }): Promise<string>;
};

export function getOpenAI(): OpenAIClient | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return {
    async chatJSON(messages, opts) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: opts?.model ?? VISION_MODEL,
          messages,
          max_tokens: opts?.maxTokens ?? 1400,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        // Never let a hung request stall the whole pipeline.
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
