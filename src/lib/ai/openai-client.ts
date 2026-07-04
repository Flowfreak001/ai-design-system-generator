// Minimal server-side OpenAI client. Uses the REST API via fetch (no SDK
// dependency), returns null when OPENAI_API_KEY is absent so callers can fall
// back cleanly. Never import this from a client component — it reads the key
// from server env and must not reach the browser.

// Cheap vision model for lightweight tasks (brand analysis, status reporting).
export const VISION_MODEL = "gpt-4o-mini";

// ── Reference-screenshot recreation ─────────────────────────────────────────
// Recreating a section's visual composition needs the strongest available
// vision model. Env-overridable so a newer model can be used without a code
// change. Default is a REAL, working model (gpt-4o) — set the env var to a
// stronger id (e.g. a future gpt-5.x) once it's available on your account.
export const REFERENCE_VISION_MODEL = process.env.REFERENCE_VISION_MODEL?.trim() || "gpt-4o";
export const REFERENCE_BLUEPRINT_MODEL = process.env.REFERENCE_BLUEPRINT_MODEL?.trim() || "gpt-4o";
export const REFERENCE_VISION_MAX_TOKENS = Number(process.env.REFERENCE_VISION_MAX_TOKENS) || 12000;
export const REFERENCE_BLUEPRINT_MAX_TOKENS = Number(process.env.REFERENCE_BLUEPRINT_MAX_TOKENS) || 12000;

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
