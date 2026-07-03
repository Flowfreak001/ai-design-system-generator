// Shared types for the OpenAI Vision analysis flow. Server-side only.

export type VisionInput = {
  projectId: string;
  pageType: string;
  sectionType: string;
  sourceUrl?: string;
  /** Data URL of the screenshot (image/png or image/jpeg). */
  screenshotDataUrl: string;
  /** Factual computed styles from the rendered probe — NEVER contradicted. */
  computedStyles?: Record<string, unknown> | null;
  sectionHtml?: string;
  userNotes?: string;
};

export type VisionAnalysis = {
  source: "openai_vision" | "fallback";
  sectionType: string;
  pageType: string;
  visualLayout: string;
  typographyObservations: string[];
  colorUsage: string[];
  spacingObservations: string[];
  componentStructure: string[];
  buttonStyles: string[];
  cardStyles: string[];
  formStyles: string[];
  imageTreatment: string[];
  responsiveNotes: string[];
  animationClues: string[];
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  warnings: string[];
  /** Which screenshot this came from (name/note), for traceability. */
  label?: string;
};

export type AiScreenshotAnalysis = {
  source: "openai_vision" | "fallback";
  model: string | null;
  generatedAt: string;
  keyPresent: boolean;
  sectionsAnalyzed: number;
  sections: VisionAnalysis[];
  warnings: string[];
};
