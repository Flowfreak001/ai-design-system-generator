"use server";

// Server actions for the Shopify Builder. All mutations funnel through here with
// zod validation; the isolated src/modules/shopify module does generation/validation.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import {
  getOrCreateShopifyProject,
  updateShopifyBrand,
  updateShopifyPages,
  toProjectInput,
  type ShopifyBuilderState,
} from "@/lib/shopify-builder/store";
import {
  DEFAULT_BRAND_TOKENS,
  generateShopifyTheme,
  validateProjectInput,
  validateShopifyTheme,
  createThemeZip,
  isValidSectionId,
  type BrandTokens,
  type ShopifyPage,
} from "@/modules/shopify";

async function ownedProject(projectId: string): Promise<{ id: string; name: string }> {
  const user = await requireUser();
  if (!user.agencyId) throw new Error("Not authorised");
  const project = await prisma.project.findUnique({
    where: { id: projectId, agencyId: user.agencyId },
    select: { id: true, name: true, type: true },
  });
  if (!project) throw new Error("Project not found");
  if (project.type !== "SHOPIFY") throw new Error("Not a Shopify project");
  return { id: project.id, name: project.name };
}

/** Ensure the builder row exists (called by the page loader). */
export async function ensureShopifyProject(projectId: string): Promise<ShopifyBuilderState> {
  const project = await ownedProject(projectId);
  return getOrCreateShopifyProject(projectId, project.name);
}

const brandSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required").max(80),
  themeName: z.string().trim().max(60).optional().default(""),
  industry: z.string().trim().max(60).optional().default(""),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour"),
  secondaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour"),
  backgroundColor: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour"),
  textColor: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour"),
  headingFont: z.string().trim().min(1).max(120),
  bodyFont: z.string().trim().min(1).max(120),
  borderRadius: z.string().trim().max(8),
  spacingScale: z.string().trim().max(6),
});

export type BrandActionState = { ok?: boolean; error?: string };

export async function saveBrandAction(
  projectId: string,
  _prev: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  await ownedProject(projectId);
  const parsed = brandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const brand: BrandTokens = {
    ...DEFAULT_BRAND_TOKENS,
    primaryColor: d.primaryColor,
    secondaryColor: d.secondaryColor,
    backgroundColor: d.backgroundColor,
    textColor: d.textColor,
    headingFont: d.headingFont,
    bodyFont: d.bodyFont,
    borderRadius: d.borderRadius,
    spacingScale: d.spacingScale,
  };
  await updateShopifyBrand(projectId, d.storeName, d.themeName || d.storeName, d.industry, brand);
  revalidatePath(`/projects/${projectId}/shopify`);
  return { ok: true };
}

export type PagesActionState = { ok?: boolean; error?: string; issues?: string[] };

/** Persist the full page/section tree (validated against the section registry). */
export async function savePagesAction(
  projectId: string,
  pagesJson: string,
): Promise<PagesActionState> {
  await ownedProject(projectId);
  let pages: ShopifyPage[];
  try {
    pages = JSON.parse(pagesJson) as ShopifyPage[];
  } catch {
    return { error: "Could not read the page layout" };
  }
  if (!Array.isArray(pages)) return { error: "Invalid page layout" };
  // Reject any unknown section id before persisting.
  for (const page of pages) {
    for (const inst of page.sections ?? []) {
      if (!isValidSectionId(inst.sectionId)) {
        return { error: `Unknown section "${inst.sectionId}"` };
      }
    }
  }
  const state = await getOrCreateShopifyProject(projectId, "");
  const check = validateProjectInput(toProjectInput({ ...state, pages }));
  const errors = check.issues.filter((i) => i.level === "error").map((i) => i.message);
  if (errors.length) return { error: errors[0], issues: errors };
  await updateShopifyPages(projectId, pages);
  revalidatePath(`/projects/${projectId}/shopify`);
  return { ok: true };
}

export type ExportResult =
  | { ok: true; fileName: string; base64: string; fileCount: number }
  | { ok: false; error: string; issues?: string[] };

/** Generate + validate the theme, return a downloadable ZIP as base64. */
export async function exportThemeAction(projectId: string): Promise<ExportResult> {
  await ownedProject(projectId);
  const state = await getOrCreateShopifyProject(projectId, "");
  const input = toProjectInput(state);

  const inputCheck = validateProjectInput(input);
  const inputErrors = inputCheck.issues.filter((i) => i.level === "error").map((i) => i.message);
  if (inputErrors.length) return { ok: false, error: "Store settings are invalid", issues: inputErrors };

  const files = generateShopifyTheme(input);
  const themeCheck = validateShopifyTheme(files);
  const themeErrors = themeCheck.issues.filter((i) => i.level === "error").map((i) => `${i.path ?? ""} ${i.message}`.trim());
  if (themeErrors.length) return { ok: false, error: "Generated theme failed validation", issues: themeErrors };

  const zip = createThemeZip(files);
  const slug = (state.themeName || state.storeName || "shopify-theme")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shopify-theme";
  return { ok: true, fileName: `${slug}-theme.zip`, base64: zip.toString("base64"), fileCount: files.length };
}
