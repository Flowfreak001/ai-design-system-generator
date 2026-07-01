// Shared domain types for the AI Design System Generator.
// These describe the *contents* of the generated artifacts, independent of how
// they're persisted (GeneratedFile rows) or produced (agents/generators).

export type BusinessBrief = {
  businessName: string;
  clientName?: string;
  industry?: string;
  audience?: string;
  goals?: string[];
  tone?: string[];
  notes?: string;
};

/** Structured design tokens — the heart of DESIGN_TOKENS.json / tokens.css. */
export type DesignTokens = {
  color: Record<string, string>; // e.g. { "brand-500": "#AD8A4E" }
  typography: {
    fontFamilies: Record<string, string>;
    scale: Record<string, string>; // e.g. { h1: "clamp(40px,5vw,76px)" }
    weights?: Record<string, number>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow?: Record<string, string>;
  motion?: Record<string, string>;
};

/** The canonical set of output artifacts a completed project produces. */
export type OutputFileName =
  | "PROJECT_BRIEF.json"
  | "RESEARCH_REPORT.md"
  | "WEBSITE_ANALYSIS.md"
  | "VISUAL_ANALYSIS.md"
  | "DESIGN_TOKENS.json"
  | "tokens.css"
  | "tailwind.theme.json"
  | "BRAND.md"
  | "DESIGN.md"
  | "CREATIVE.md"
  | "UX.md"
  | "CONTENT.md"
  | "COPY_GUIDE.md"
  | "COMPONENTS.md"
  | "ANIMATION.md"
  | "SEO.md"
  | "ACCESSIBILITY.md"
  | "PROMPT_CODEX.md"
  | "PROMPT_CLAUDE_CODE.md"
  | "PROMPT_REPLIT.md"
  | "PROMPT_LOVABLE.md"
  | "PROMPT_BOLT.md"
  | "PROMPT_CURSOR.md"
  | "PROMPT_V0.md"
  | "PROMPT_WEBFLOW.md"
  | "PROMPT_WIX.md"
  | "PROMPT_WORDPRESS.md"
  | "preview.html"
  | "component-preview.html";

/** Everything a generator receives to produce its file(s). */
export type GenerationContext = {
  projectId: string;
  brief: BusinessBrief;
  tokens?: DesignTokens;
  // Raw analysis text keyed by source, filled in by earlier pipeline stages.
  research?: string;
  websiteAnalysis?: string;
  visualAnalysis?: string;
};

/** A produced artifact, ready to persist as a GeneratedFile. */
export type GeneratedArtifact = {
  name: OutputFileName;
  content: string;
  mimeType: string;
};
