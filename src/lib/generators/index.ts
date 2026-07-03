// Generator registry.
// - Delivery generators (type-specific project docs) live in delivery-generator.ts.
// - MD design-system generators (below) consume project input + analysis JSON.

export { generateForProject } from "./delivery-generator";
export type { GeneratorContext, MdArtifact } from "./context";

import type { GeneratorContext, MdArtifact } from "./context";
import { generateBrandMd } from "./brand-generator";
import { generateBrandGuidelinesMd } from "./brand-guidelines-generator";
import { generateStyleDirectionMd } from "./style-direction-generator";
import { generateCodexPromptMd } from "./codex-prompt-generator";
import { generateReactExportPlanMd } from "./react-export-plan-generator";
import { generateReplitPromptMd, generateLovablePromptMd } from "./builder-prompt-generators";
import { generateDesignMd } from "./design-generator";
import { generateCreativeMd } from "./creative-generator";
import { generateContentMd } from "./content-generator";
import { generateComponentsMd } from "./components-generator";
import { generateAnimationMd } from "./animation-generator";
import { generateUxMd } from "./ux-generator";
import { generateSeoMd } from "./seo-generator";
import { generatePromptMd } from "./prompt-generator";

type Gen = { agent: string; run: (ctx: GeneratorContext) => MdArtifact };

// Phase 1 — Brand foundation (generated first, approved before design).
export const BRAND_GENERATORS: Gen[] = [
  { agent: "Brand Strategist", run: generateBrandMd },
  { agent: "Brand Guidelines", run: generateBrandGuidelinesMd },
  { agent: "Creative Director", run: generateCreativeMd },
  { agent: "Style Director", run: generateStyleDirectionMd },
];

// Phase 2 — Design system (generated only after brand approval + design type).
export const DESIGN_GENERATORS: Gen[] = [
  { agent: "Design Systems", run: generateDesignMd },
  { agent: "Component Architect", run: generateComponentsMd },
  { agent: "Content Strategist", run: generateContentMd },
  { agent: "Motion Designer", run: generateAnimationMd },
  { agent: "UX Architect", run: generateUxMd },
  { agent: "SEO Specialist", run: generateSeoMd },
  { agent: "Prompt Engineer", run: generatePromptMd },
  { agent: "Codex Prompt Engineer", run: generateCodexPromptMd },
  { agent: "Replit Prompt Engineer", run: generateReplitPromptMd },
  { agent: "Lovable Prompt Engineer", run: generateLovablePromptMd },
  { agent: "Export Planner", run: generateReactExportPlanMd },
];

/** All generators (both phases) — used where the split doesn't matter. */
export const MD_GENERATORS: Gen[] = [...BRAND_GENERATORS, ...DESIGN_GENERATORS];

export function generateAllMd(ctx: GeneratorContext): MdArtifact[] {
  return MD_GENERATORS.map((g) => g.run(ctx));
}
