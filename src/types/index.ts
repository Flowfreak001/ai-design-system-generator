// Shared domain types for the Agency Project OS / Design System Generator.

import type { ProjectType } from "@/generated/prisma/enums";

/** The structured brief captured by the project wizard (stored as ProjectInput). */
export type ProjectBrief = {
  // Step 1 — basics
  businessType?: string;
  goal?: string;
  targetAudience?: string;
  // Step 2 — design references (all optional)
  referenceUrls: string[];
  existingWebsiteUrl?: string;
  /** Extra pages of the client's own site to analyze (about, services, faq,
   *  pricing, contact/booking, blog, portfolio…). More pages = a truer
   *  section/component inventory. Page type is auto-classified, not labeled. */
  pageUrls: string[];
  competitorUrls: string[];
  stylePreference?: string;
  // Step 3 — brand inputs (all optional)
  primaryColor?: string;
  secondaryColor?: string;
  fontPreference?: string;
  brandPersonality?: string;
  toneOfVoice?: string;
  // Step 4 — website structure
  keyItems: string[]; // required pages / workflows
  services?: string;
  ctaGoal?: string;
  seoKeywords: string[];
  platformTarget?: string;
  animationPreference?: string;
  // Misc / legacy
  brandRefs: string[]; // legacy free-form refs (colors/URLs mixed)
  currentTools: string[];
  notes?: string;
};

/** Extra fields captured only for automation-workflow projects. */
export type AutomationBrief = {
  currentProcess?: string;
  mainPainPoint?: string;
  triggerSource?: string;
  aiShouldDo?: string;
  needsHumanApproval?: string;
};

/** Everything the generators receive. */
export type GenerationInput = {
  projectName: string;
  clientName?: string | null;
  type: ProjectType;
  brief: ProjectBrief;
  automation?: AutomationBrief;
};

export type GeneratedArtifact = {
  name: string;
  type: "markdown" | "prompt";
  content: string;
};

export const WEBSITE_FILES = [
  "PROJECT_BRIEF.md",
  "SCOPE.md",
  "DESIGN.md",
  "CONTENT.md",
  "BUILD_PROMPT.md",
  "HANDOFF.md",
] as const;

export const AUTOMATION_FILES = [
  "WORKFLOW_AUDIT.md",
  "AUTOMATION_BLUEPRINT.md",
  "TOOLS_STACK.md",
  "CLIENT_PROPOSAL.md",
  "BUILD_PLAN.md",
  "HANDOFF.md",
] as const;

/** Derived, human-friendly project status for the dashboard/workspace. */
export type DerivedStatus =
  | "Draft"
  | "Ready to Generate"
  | "Files Generated"
  | "Preview Ready"
  | "Exported";
