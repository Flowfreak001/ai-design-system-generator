// Export package builder — arranges a project's GeneratedFiles into the
// canonical folder structure and produces a ZIP archive.
//
//   {project}-design-system/
//     00_PROJECT_BRIEF/PROJECT_BRIEF.json
//     01_ANALYSIS/…json
//     02_DESIGN_SYSTEM/…md
//     03_PROMPTS/PROMPT_*.md
//     04_PREVIEW/*.html
//     05_DELIVERY/ (any remaining project docs)

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { buildZip } from "./zip";

const ANALYSIS = new Set([
  "WEBSITE_ANALYSIS.json",
  "VISUAL_ANALYSIS.json",
  "DESIGN_TOKENS.json",
  "ANIMATION_ANALYSIS.json",
]);
const DESIGN_SYSTEM = new Set([
  "BRAND.md",
  "DESIGN.md",
  "CREATIVE.md",
  "CONTENT.md",
  "COMPONENTS.md",
  "ANIMATION.md",
  "SEO.md",
]);

function folderFor(name: string): string {
  if (ANALYSIS.has(name)) return "01_ANALYSIS";
  if (DESIGN_SYSTEM.has(name)) return "02_DESIGN_SYSTEM";
  if (name.startsWith("PROMPT_")) return "03_PROMPTS";
  if (name.endsWith(".html")) return "04_PREVIEW";
  return "05_DELIVERY";
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "project";

export async function buildExportPackage(
  projectId: string,
): Promise<{ filename: string; zip: Uint8Array; fileCount: number }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true, files: { orderBy: { name: "asc" } } },
  });
  if (!project) throw new Error("Project not found");

  const root = `${slug(project.name)}-design-system`;
  const input = toGenerationInput(project);

  const entries: { name: string; content: string }[] = [
    {
      name: `${root}/00_PROJECT_BRIEF/PROJECT_BRIEF.json`,
      content: JSON.stringify(
        { project: project.name, client: project.clientName, type: project.type, ...input.brief, automation: input.automation ?? null },
        null,
        2,
      ),
    },
    ...project.files.map((f) => ({
      name: `${root}/${folderFor(f.name)}/${f.name}`,
      content: f.content,
    })),
  ];

  return {
    filename: `${root}.zip`,
    zip: buildZip(entries),
    fileCount: entries.length,
  };
}
