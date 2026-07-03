// The design pipeline that runs after a project (workspace) is created.
// Brand Guideline is the foundation; every later stage is gated on the previous
// one so the design system is never generated before brand + structure + style.

import type { ProjectBrief } from "@/types";

export type StageId =
  | "brand"
  | "crawl"
  | "sitemap"
  | "wireframe"
  | "style"
  | "design"
  | "files"
  | "export";

export type StageStatus = "locked" | "ready" | "active" | "done";

export type Stage = {
  id: StageId;
  step: number;
  label: string;
  description: string;
};

export const STAGES: Stage[] = [
  { id: "brand", step: 1, label: "Brand Guideline", description: "The foundation — generated from your brief and reference evidence, then approved." },
  { id: "crawl", step: 2, label: "Crawl Reference Site", description: "Discover the important pages of the primary reference site automatically." },
  { id: "sitemap", step: 3, label: "Sitemap Canvas", description: "Confirm the page structure from discovered pages + selected page needs." },
  { id: "wireframe", step: 4, label: "Wireframe Canvas", description: "Confirm the sections per page from detected + reference-inspired structure." },
  { id: "style", step: 5, label: "Style Guide", description: "Colors, type, components, and motion from the approved brand + rendered styles." },
  { id: "design", step: 6, label: "Design Canvas", description: "Preview the composed design across desktop and mobile, then approve." },
  { id: "files", step: 7, label: "Generated Files", description: "Generate the MD design-system files from the approved canvases." },
  { id: "export", step: 8, label: "Export", description: "Download the full ZIP package for your build tool." },
];

export type PipelineInputs = {
  fileNames: Set<string>;
  brief: Pick<
    ProjectBrief,
    | "brandApproved"
    | "pagesConfirmed"
    | "sitemapApproved"
    | "wireframeApproved"
    | "styleApproved"
    | "designApproved"
  >;
  status: string;
  hasReference: boolean;
};

/** Whether each stage's own work is complete (independent of gating). */
function isComplete(id: StageId, i: PipelineInputs): boolean {
  const b = i.brief;
  switch (id) {
    case "brand":
      return Boolean(b.brandApproved) && i.fileNames.has("BRAND_GUIDELINES.md");
    case "crawl":
      return Boolean(b.pagesConfirmed);
    case "sitemap":
      return Boolean(b.sitemapApproved);
    case "wireframe":
      return Boolean(b.wireframeApproved);
    case "style":
      return Boolean(b.styleApproved);
    case "design":
      return Boolean(b.designApproved);
    case "files":
      return i.fileNames.has("DESIGN.md");
    case "export":
      return i.status === "DELIVERED";
  }
}

export type ComputedStage = Stage & { status: StageStatus; complete: boolean };

/** Compute each stage's status. A stage is `ready`/`active` only when every
 *  earlier stage is complete; otherwise it is `locked`. */
export function computePipeline(i: PipelineInputs): ComputedStage[] {
  let priorComplete = true;
  return STAGES.map((s) => {
    const complete = isComplete(s.id, i);
    let status: StageStatus;
    if (complete) status = "done";
    else if (!priorComplete) status = "locked";
    else status = "active";
    if (!complete) priorComplete = false;
    return { ...s, status, complete };
  });
}

/** The first stage that still needs the user's attention. */
export function currentStage(stages: ComputedStage[]): ComputedStage {
  return stages.find((s) => s.status === "active") ?? stages[stages.length - 1];
}
