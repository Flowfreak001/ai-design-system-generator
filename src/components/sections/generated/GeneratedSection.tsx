// A NEW, original section — rendered dynamically from a structured blueprint
// (Vision's when available, else derived from the extracted pattern). One
// generic BlueprintRenderer draws whatever the blueprint says, so the created
// section follows the uploaded reference's layout/colours without per-type
// templates. Grey placeholders only; never the uploaded screenshot.

import type { SectionTheme } from "../types";
import type { GeneratedSectionSpec, SectionPattern, SectionBlueprint, BlueprintBlock } from "@/lib/references/types";
import { buildBlueprintFromPattern } from "@/lib/references/blueprint";
import { BlueprintRenderer } from "./BlueprintRenderer";

type Content = NonNullable<GeneratedSectionSpec["previewContent"]>;

/** Apply Design-Canvas content edits ONTO the blueprint blocks, so the drawer
 *  edits exactly what renders. The blueprint stays the layout source of truth;
 *  previewContent only overrides text/items — it never changes composition. */
function applyContent(bp: SectionBlueprint, c?: Content): SectionBlueprint {
  if (!c) return bp;
  let itemsUsed = false;
  const blocks: BlueprintBlock[] = bp.blocks.map((b) => {
    switch (b.type) {
      case "eyebrow":
        return c.eyebrow !== undefined ? { ...b, text: c.eyebrow } : b;
      case "heading":
        return c.title !== undefined ? { ...b, text: c.title } : b;
      case "paragraph":
        return c.description !== undefined ? { ...b, text: c.description } : b;
      case "splitIntro":
        return {
          ...b,
          ...(c.eyebrow !== undefined ? { eyebrow: c.eyebrow } : {}),
          ...(c.title !== undefined ? { heading: c.title } : {}),
          ...(c.description !== undefined ? { paragraph: c.description } : {}),
          buttons: b.buttons?.map((btn, i) =>
            i === 0 && c.primaryButtonLabel !== undefined ? { ...btn, label: c.primaryButtonLabel }
            : i === 1 && c.secondaryButtonLabel !== undefined ? { ...btn, label: c.secondaryButtonLabel }
            : btn),
        };
      case "buttons":
        return {
          ...b,
          items: b.items.map((btn, i) =>
            i === 0 && c.primaryButtonLabel !== undefined ? { ...btn, label: c.primaryButtonLabel }
            : i === 1 && c.secondaryButtonLabel !== undefined ? { ...btn, label: c.secondaryButtonLabel }
            : btn),
        };
      case "cardGrid":
        if (c.items?.length && !itemsUsed) {
          itemsUsed = true;
          const proto = b.cards[0];
          return { ...b, cards: c.items.map((it) => ({ title: it.title ?? "", body: it.text, icon: proto?.icon, image: proto?.image })) };
        }
        return b;
      case "accordion":
        if (c.items?.length && !itemsUsed) {
          itemsUsed = true;
          return { ...b, items: c.items.map((it) => ({ question: it.title ?? "", answer: it.text })) };
        }
        return b;
      case "pricing":
        if (c.items?.length && !itemsUsed) {
          itemsUsed = true;
          return { ...b, plans: c.items.map((it, i) => ({ name: it.title ?? `Plan ${i + 1}`, price: b.plans[i]?.price ?? "$—", features: b.plans[i]?.features ?? [], featured: b.plans[i]?.featured })) };
        }
        return b;
      default:
        return b;
    }
  });
  return { ...bp, blocks };
}

export function GeneratedSection({ spec, pattern, theme }: { spec: GeneratedSectionSpec; pattern: SectionPattern; theme?: SectionTheme }) {
  // Prefer a Vision-produced blueprint; otherwise derive one from the analysis
  // + starter content so the layout still reflects the reference dynamically.
  const blueprint = spec.blueprint ?? pattern.blueprint ?? buildBlueprintFromPattern(pattern, spec.previewContent ?? {});
  return <BlueprintRenderer blueprint={applyContent(blueprint, spec.previewContent)} theme={theme} />;
}
