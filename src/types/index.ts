// Shared domain types for the Agency Project OS.

import type { ProjectType } from "@/generated/prisma/enums";

/** The structured brief captured on project creation (stored as ProjectInput). */
export type ProjectBrief = {
  businessType?: string;
  goal?: string;
  targetAudience?: string;
  keyItems: string[]; // pages / features / workflows needed
  brandRefs: string[]; // brand colors / reference links
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
