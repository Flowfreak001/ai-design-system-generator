// Prompt templates for the per-tool build prompts (PROMPT_*.md) and for the AI
// agents themselves. Kept separate from generators so prompt copy can be edited
// without touching generation logic. Bodies are elaborated as agents come online.

export type PromptTool =
  | "codex"
  | "claude-code"
  | "replit"
  | "lovable"
  | "bolt"
  | "cursor"
  | "v0"
  | "webflow"
  | "wix"
  | "wordpress";

/** Short, tool-specific framing prepended to a generated build prompt. */
export const toolPreamble: Record<PromptTool, string> = {
  codex: "You are Codex. Generate production code from this design system.",
  "claude-code": "You are Claude Code. Scaffold and build from this design system.",
  replit: "In Replit, build and run this project from the design system.",
  lovable: "In Lovable, generate this app UI from the design system.",
  bolt: "In Bolt, scaffold this full-stack app from the design system.",
  cursor: "In Cursor, implement this project following the design system.",
  v0: "In v0, generate React components matching this design system.",
  webflow: "Recreate this design system as Webflow classes and components.",
  wix: "Recreate this design system in Wix Studio.",
  wordpress: "Implement this design system as a WordPress theme.",
};
