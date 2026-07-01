import { z } from "zod";

// Input validation for project creation + editing. Keep these as the single
// source of truth for request shapes; route handlers parse with them.

export const businessBriefSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  clientName: z.string().optional(),
  industry: z.string().optional(),
  audience: z.string().optional(),
  goals: z.array(z.string()).default([]),
  tone: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const referenceUrlSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["PRIMARY", "REFERENCE"]).default("REFERENCE"),
  notes: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientName: z.string().optional(),
  brief: businessBriefSchema.optional(),
  referenceUrls: z.array(referenceUrlSchema).default([]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type BusinessBriefInput = z.infer<typeof businessBriefSchema>;
export type ReferenceUrlInput = z.infer<typeof referenceUrlSchema>;
