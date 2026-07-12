import { z } from "zod";

export const PROJECT_TYPES = [
  { value: "WEBSITE_APP", label: "Website / App Project" },
  { value: "AUTOMATION_WORKFLOW", label: "Automation Workflow Project" },
] as const;

export const PLATFORM_TARGETS = [
  "Claude Code",
  "Cursor",
  "v0",
  "Bolt",
  "Lovable",
  "Replit",
  "Webflow",
  "Wix Studio",
  "WordPress",
  "React/Next.js",
  "Other",
] as const;

export const ANIMATION_PREFERENCES = ["None", "Minimal", "Premium", "Bold"] as const;

/** What the user wants to design — chosen after the brand guideline is approved. */
export const DESIGN_TYPES = [
  "Marketing Website",
  "SaaS Platform",
  "Directory Platform",
  "Marketplace",
  "Booking Platform",
  "Client Portal",
  "Dashboard",
  "Mobile App",
  "Ecommerce",
  "Landing Page",
  "Custom Platform",
] as const;

export const STYLE_PREFERENCES = [
  "Clean & minimal",
  "Bold & expressive",
  "Warm & friendly",
  "Corporate & trustworthy",
  "Editorial & premium",
  "Not sure — recommend one",
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
  // Required (per product flow):
  name: z.string().min(1, "Project name is required"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  // Goal is now derived from selected goal cards; kept optional for
  // programmatic/legacy callers (seed) and defaulted to "".
  goal: optionalText.transform((v) => v ?? ""),
  // Smart onboarding selections (all optional server-side; the wizard enforces
  // the "at least one" rules client-side so seed/API creation stays flexible).
  industry: optionalText,
  websiteType: optionalText,
  goals: listField,
  features: listField,
  referenceLearn: listField,
  pageCount: optionalText,
  pageNotes: optionalText,
  mainReferenceUrl: optionalText,
  // Optional everything else (the scan detects real pages/sections):
  keyItems: listField,
  platformTarget: optionalText.transform((v) => v ?? ""),
  businessId: optionalText,
  clientName: optionalText,
  type: z.enum(["WEBSITE_APP", "AUTOMATION_WORKFLOW", "SHOPIFY", "WEBFLOW_CLOUD"]).default("WEBSITE_APP"),
  targetAudience: optionalText,
  referenceUrls: listField,
  existingWebsiteUrl: optionalText,
  pageUrls: listField,
  competitorUrls: listField,
  stylePreference: optionalText,
  primaryColor: optionalText,
  secondaryColor: optionalText,
  logoDataUrl: optionalText,
  fontPreference: optionalText,
  brandPersonality: optionalText,
  toneOfVoice: optionalText,
  services: optionalText,
  ctaGoal: optionalText,
  seoKeywords: listField,
  animationPreference: optionalText,
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
