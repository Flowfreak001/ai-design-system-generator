// Generator registry.
// - Delivery generators (type-specific project docs) live in delivery-generator.ts.
// - MD design-system generators (below) consume project input + analysis JSON.

export { generateForProject } from "./delivery-generator";
export type { GeneratorContext, MdArtifact } from "./context";

import type { GeneratorContext, MdArtifact } from "./context";
import { generateBrandMd } from "./brand-generator";
import { generateDesignMd } from "./design-generator";
import { generateCreativeMd } from "./creative-generator";
import { generateContentMd } from "./content-generator";
import { generateComponentsMd } from "./components-generator";
import { generateAnimationMd } from "./animation-generator";
import { generateSeoMd } from "./seo-generator";
import { generatePromptMd } from "./prompt-generator";

export const MD_GENERATORS: { agent: string; run: (ctx: GeneratorContext) => MdArtifact }[] = [
  { agent: "Brand Strategist", run: generateBrandMd },
  { agent: "Design Systems", run: generateDesignMd },
  { agent: "Creative Director", run: generateCreativeMd },
  { agent: "Content Strategist", run: generateContentMd },
  { agent: "Component Architect", run: generateComponentsMd },
  { agent: "Motion Designer", run: generateAnimationMd },
  { agent: "SEO Specialist", run: generateSeoMd },
  { agent: "Prompt Engineer", run: generatePromptMd },
];

export function generateAllMd(ctx: GeneratorContext): MdArtifact[] {
  return MD_GENERATORS.map((g) => g.run(ctx));
}
