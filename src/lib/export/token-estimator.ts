// Rough token estimation for prompt-size guidance (~4 chars/token heuristic).
// Used to warn when a prompt may exceed an AI builder's context window.

/** Prompts above this estimate should recommend the Prompt Pack instead. */
export const LARGE_PROMPT_TOKENS = 24_000;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatTokens(tokens: number): string {
  return tokens >= 1000 ? `~${(tokens / 1000).toFixed(1)}k tokens` : `~${tokens} tokens`;
}

export function isLargePrompt(text: string): boolean {
  return estimateTokens(text) > LARGE_PROMPT_TOKENS;
}
