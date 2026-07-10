// Publishes a Flowfreak project's REAL content (pages → sections) into a Wix
// CMS collection. Idempotent: each section maps to a stable item id and is
// upserted, so re-publishing updates in place instead of duplicating.
import { getProject } from "@/lib/projects";
import { SITEMAP_CANVAS_FILE, type SitemapCanvas } from "@/lib/canvas";
import { ensureCollection, saveDataItem, type WixField } from "./client";

const COLLECTION_ID = "FlowfreakSections";
const FIELDS: WixField[] = [
  { key: "projectId", displayName: "Project ID", type: "TEXT" },
  { key: "projectName", displayName: "Project", type: "TEXT" },
  { key: "page", displayName: "Page", type: "TEXT" },
  { key: "order", displayName: "Order", type: "NUMBER" },
  { key: "sectionType", displayName: "Section", type: "TEXT" },
  { key: "eyebrow", displayName: "Eyebrow", type: "TEXT" },
  { key: "title", displayName: "Title", type: "TEXT" },
  { key: "subtitle", displayName: "Subtitle", type: "TEXT" },
  { key: "description", displayName: "Description", type: "TEXT" },
  { key: "items", displayName: "Items (JSON)", type: "TEXT" },
];

export type WixPublishSummary = { collectionId: string; sections: number; pages: number };

export async function publishProjectToWix(projectId: string, agencyId: string): Promise<WixPublishSummary> {
  const project = await getProject(projectId, agencyId);
  if (!project) throw new Error("Project not found.");

  const raw = project.files.find((f) => f.name === SITEMAP_CANVAS_FILE)?.content;
  const pages = raw ? (JSON.parse(raw) as SitemapCanvas).pages ?? [] : [];

  // Flatten pages → sections into CMS rows with a stable id per section.
  const rows: { id: string; data: Record<string, unknown> }[] = [];
  for (const page of pages) {
    (page.sections ?? []).forEach((s, i) => {
      const c = s.content ?? {};
      rows.push({
        id: `${projectId}-${page.id}-${s.id}`.slice(0, 128),
        data: {
          projectId,
          projectName: project.name,
          page: page.name,
          order: i,
          sectionType: s.name || "section",
          eyebrow: c.eyebrow || "",
          title: c.title || s.note || s.name || "",
          subtitle: c.subtitle || "",
          description: c.description || "",
          items: JSON.stringify(c.items ?? []),
        },
      });
    });
  }

  await ensureCollection(COLLECTION_ID, "Flowfreak Sections", FIELDS);
  for (const r of rows) await saveDataItem(COLLECTION_ID, r.id, r.data);

  return { collectionId: COLLECTION_ID, sections: rows.length, pages: pages.length };
}
