// A NEW, original section — rendered dynamically from a structured blueprint
// (Vision's when available, else derived from the extracted pattern). One
// generic BlueprintRenderer draws whatever the blueprint says, so the created
// section follows the uploaded reference's layout/colours without per-type
// templates. Grey placeholders only; never the uploaded screenshot.

import type { SectionTheme } from "../types";
import type { GeneratedSectionSpec, SectionPattern } from "@/lib/references/types";
import { buildBlueprintFromPattern } from "@/lib/references/blueprint";
import { BlueprintRenderer } from "./BlueprintRenderer";

export function GeneratedSection({ spec, pattern, theme }: { spec: GeneratedSectionSpec; pattern: SectionPattern; theme?: SectionTheme }) {
  // Prefer a Vision-produced blueprint; otherwise derive one from the analysis
  // + starter content so the layout still reflects the reference dynamically.
  const blueprint = spec.blueprint ?? pattern.blueprint ?? buildBlueprintFromPattern(pattern, spec.previewContent ?? {});
  return <BlueprintRenderer blueprint={blueprint} theme={theme} />;
}
