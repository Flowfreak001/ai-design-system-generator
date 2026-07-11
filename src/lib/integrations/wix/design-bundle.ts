// Builds a "design file" — a self-contained Markdown bundle of an assembled Wix
// Headless site: every page's sections (component TSX + resolved content + theme
// tokens) plus a Wix wiring appendix (which business solution each dynamic
// section binds to, and the redirect flow for interactive steps). Handed to the
// user to feed their own AI/dev tool. Server-only; pure string building.
import { prisma } from "@/lib/db/client";
import { SITEMAP_CANVAS_FILE, STYLE_GUIDE_CANVAS_FILE, type SitemapCanvas, type StyleGuideCanvas } from "@/lib/canvas";
import { DEFAULT_SECTION_THEME } from "@/components/sections/section-theme";
import { getSiteTemplate } from "@/lib/site-templates";

const WIRING: Record<string, string> = {
  "ecommerce-product-grid":
    "Binds to **Wix Stores** — `POST /stores/v3/products/query`. Each card links to a product page. " +
    "Buy → create an eCommerce checkout (`POST /ecom/v1/checkouts` with a Stores `catalogReference` " +
    "{ appId: 215238eb-22a5-4c36-9e7b-e7c08025e04e, catalogItemId: <productId> }`), then a headless " +
    "redirect session (`POST /headless/v1/redirect-session`, visitor token) → Wix-hosted checkout.",
};

function parse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export type DesignBundle = { filename: string; markdown: string; pages: number; sections: number };

export async function buildDesignBundle(projectId: string): Promise<DesignBundle | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true, siteTemplate: true } });
  if (!project) return null;

  const [canvasFile, styleFile] = await Promise.all([
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name: SITEMAP_CANVAS_FILE } } }),
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name: STYLE_GUIDE_CANVAS_FILE } } }),
  ]);
  const canvas = parse<SitemapCanvas>(canvasFile?.content);
  if (!canvas) return null;
  const style = parse<StyleGuideCanvas>(styleFile?.content);
  const template = project.siteTemplate ? getSiteTemplate(project.siteTemplate) : undefined;

  const solutions = template ? [...new Set(template.requiredSolutions)].join(", ") : "—";
  const out: string[] = [];
  out.push(`# ${project.name} — Wix Headless design file\n`);
  out.push(`Template: **${template?.name ?? project.siteTemplate ?? "custom"}** · Wix solutions: **${solutions}**\n`);
  out.push(
    `This bundle describes a full multi-page site built from prebuilt sections. Each section is a React ` +
    `component (imports limited to \`react\` + \`framer-motion\`) that receives \`{ content, theme }\`. Wire the ` +
    `dynamic sections to the Wix APIs noted in the **Wix wiring** appendix. Theme tokens are below; apply them ` +
    `as the \`theme\` prop (or map to your own design tokens).\n`,
  );

  // Theme tokens
  const theme = { ...DEFAULT_SECTION_THEME, ...(style ? {} : {}) };
  out.push(`## Theme tokens\n\n\`\`\`json\n${JSON.stringify(theme, null, 2)}\n\`\`\`\n`);

  let sectionCount = 0;
  const usedWiring = new Set<string>();
  for (const page of canvas.pages) {
    out.push(`## Page: ${page.name}  \`(/${page.id === "home" ? "" : page.id})\`\n`);
    for (const s of page.sections ?? []) {
      sectionCount++;
      const rawId = s.sourceLibrarySectionId?.replace(/^.*?-(?=[a-z])/, "") ?? "";
      const wiringKey = Object.keys(WIRING).find((k) => s.sourceLibrarySectionId?.endsWith(k));
      if (wiringKey) usedWiring.add(wiringKey);
      out.push(`### ${s.note || s.name}${wiringKey ? "  _(dynamic — see Wix wiring)_" : ""}\n`);
      out.push(`**Content**\n\n\`\`\`json\n${JSON.stringify(s.content ?? {}, null, 2)}\n\`\`\`\n`);
      if (s.custom?.code) {
        out.push(`**Component (${s.custom.mode})**\n\n\`\`\`tsx\n${s.custom.code}\`\`\`\n`);
      }
      void rawId;
    }
  }

  if (usedWiring.size) {
    out.push(`## Wix wiring\n`);
    for (const k of usedWiring) out.push(`- **${k}** — ${WIRING[k]}\n`);
  }

  const filename = `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") || "site"}-design.md`;
  return { filename, markdown: out.join("\n"), pages: canvas.pages.length, sections: sectionCount };
}
