// Shared domain types. These describe the inputs to and outputs of generation,
// independent of persistence (Prisma models) or transport (queue).

/** Flattened project brief passed to generators — Project + ProjectInput. */
export type GenerationInput = {
  projectName: string;
  clientName?: string | null;
  businessName?: string | null;
  businessType?: string | null;
  websiteGoal?: string | null;
  targetAudience?: string | null;
  existingWebsiteUrl?: string | null;
  referenceUrls: string[];
  competitorUrls: string[];
  brandColors: string[];
  requiredPages: string[];
  servicesProducts?: string | null;
  seoKeywords: string[];
  platformTarget?: string | null;
  animationPreference?: string | null;
  notes?: string | null;
};

/** The output files the mock pipeline currently produces. */
export type OutputFileName =
  | "BRAND.md"
  | "DESIGN.md"
  | "CREATIVE.md"
  | "PROMPT_CLAUDE_CODE.md";

export type GeneratedArtifact = {
  fileName: OutputFileName;
  fileType: "MARKDOWN" | "JSON" | "CSS" | "HTML" | "PROMPT";
  content: string;
};

/** The agents in the (mock) multi-agent pipeline, in order. */
export const AGENT_NAMES = [
  "Brand Strategist",
  "Design Systems",
  "Creative Director",
  "Prompt Engineer",
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];
