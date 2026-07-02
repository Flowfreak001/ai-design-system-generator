import { z } from "zod";

export const PROJECT_TYPES = [
  { value: "WEBSITE_APP", label: "Website / App Project" },
  { value: "AUTOMATION_WORKFLOW", label: "Automation Workflow Project" },
] as const;

// Comma/newline separated textarea → trimmed string array.
const listField = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  businessId: optionalText,
  clientName: optionalText,
  type: z.enum(["WEBSITE_APP", "AUTOMATION_WORKFLOW"]).default("WEBSITE_APP"),
  businessType: optionalText,
  goal: optionalText,
  targetAudience: optionalText,
  keyItems: listField,
  brandRefs: listField,
  currentTools: listField,
  notes: optionalText,
  // Automation-only helper fields (ignored for website projects).
  currentProcess: optionalText,
  mainPainPoint: optionalText,
  triggerSource: optionalText,
  aiShouldDo: optionalText,
  needsHumanApproval: optionalText,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createNoteSchema = z.object({
  projectId: z.string().min(1),
  title: optionalText,
  content: z.string().min(1, "Note content is required"),
});
