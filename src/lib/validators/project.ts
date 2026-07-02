import { z } from "zod";

export const PLATFORM_TARGETS = [
  "Claude Code",
  "Codex",
  "Replit",
  "Lovable",
  "Bolt",
  "Cursor",
  "v0",
  "Webflow",
  "Wix Studio",
  "WordPress",
  "React/Next.js",
  "Other",
] as const;

export const ANIMATION_PREFERENCES = ["None", "Minimal", "Premium", "Bold"] as const;

// Accepts comma/newline separated strings from textareas → trimmed arrays.
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
  clientName: optionalText,
  businessName: optionalText,
  businessType: optionalText,
  websiteGoal: optionalText,
  targetAudience: optionalText,
  existingWebsiteUrl: optionalText,
  referenceUrls: listField,
  competitorUrls: listField,
  brandColors: listField,
  requiredPages: listField,
  servicesProducts: optionalText,
  seoKeywords: listField,
  platformTarget: optionalText,
  animationPreference: optionalText,
  notes: optionalText,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
