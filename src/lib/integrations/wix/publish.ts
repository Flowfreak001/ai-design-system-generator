// Publishes a Flowfreak project's REAL content AND design (the section's TSX
// component code + resolved theme) into a Wix CMS collection, so a generated
// headless frontend can render the exact animated sections — not just the text.
// Idempotent: each section upserts by a stable id.
import { getProject } from "@/lib/projects";
import { SITEMAP_CANVAS_FILE, type SitemapCanvas } from "@/lib/canvas";
import { DEFAULT_SECTION_THEME } from "@/components/sections/section-theme";
import { ensureCollection, saveDataItem, queryItemIds, removeDataItem, type WixField, type WixAuth } from "./client";
import { getWixConnection } from "./connection-store";
import { mintAccessToken } from "./oauth";

// v2 collection carries the component code + theme + full content JSON.
const COLLECTION_ID = "FlowfreakSectionsV2";
const FIELDS: WixField[] = [
  { key: "projectId", displayName: "Project ID", type: "TEXT" },
  { key: "projectName", displayName: "Project", type: "TEXT" },
  { key: "page", displayName: "Page", type: "TEXT" },
  { key: "order", displayName: "Order", type: "NUMBER" },
  { key: "sectionType", displayName: "Section", type: "TEXT" },
  { key: "title", displayName: "Title", type: "TEXT" },
  { key: "subtitle", displayName: "Subtitle", type: "TEXT" },
  { key: "componentCode", displayName: "Component TSX", type: "TEXT" },
  { key: "theme", displayName: "Theme JSON", type: "TEXT" },
  { key: "content", displayName: "Content JSON", type: "TEXT" },
];

export type WixPublishSummary = { collectionId: string; sections: number; pages: number; removed: number };

export async function publishProjectToWix(projectId: string, agencyId: string): Promise<WixPublishSummary> {
  const project = await getProject(projectId, agencyId);
  if (!project) throw new Error("Project not found.");

  const raw = project.files.find((f) => f.name === SITEMAP_CANVAS_FILE)?.content;
  const pages = raw ? (JSON.parse(raw) as SitemapCanvas).pages ?? [] : [];

  const rows: { id: string; data: Record<string, unknown> }[] = [];
  let order = 0; // global running order across all pages
  for (const page of pages) {
    for (const s of page.sections ?? []) {
      const content = s.content ?? {};
      const theme = { ...DEFAULT_SECTION_THEME, ...(s.themeOverride ?? {}) };
      rows.push({
        id: `${projectId}-${page.id}-${s.id}`.slice(0, 128),
        data: {
          projectId,
          projectName: project.name,
          page: page.name,
          order: order++,
          sectionType: s.name || "section",
          title: content.title || s.note || s.name || "",
          subtitle: content.subtitle || "",
          componentCode: s.custom?.code || "",
          theme: JSON.stringify(theme),
          content: JSON.stringify(content),
        },
      });
    }
  }

  // Prefer the agency's own connected Wix account (OAuth app token); otherwise
  // fall back to the single-account env API key (auth = undefined).
  let auth: WixAuth | undefined;
  const conn = await getWixConnection(projectId);
  if (conn) auth = { token: await mintAccessToken(conn.instanceId), siteId: conn.siteId };

  await ensureCollection(COLLECTION_ID, "Flowfreak Sections", FIELDS, auth);
  for (const r of rows) await saveDataItem(COLLECTION_ID, r.id, r.data, auth);

  // Sync: delete any Wix rows for this project that are no longer in the canvas,
  // so removing a section in Flowfreak drops it from the live site on re-publish.
  const currentIds = new Set(rows.map((r) => r.id));
  let removed = 0;
  try {
    const existingIds = await queryItemIds(COLLECTION_ID, { projectId }, auth);
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        await removeDataItem(COLLECTION_ID, id, auth);
        removed++;
      }
    }
  } catch {
    /* best-effort cleanup — never fail the publish over stale-row removal */
  }

  return { collectionId: COLLECTION_ID, sections: rows.length, pages: pages.length, removed };
}
