import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  visionBlock,
  bullets,
  who,
  analysisConfidenceNote,
} from "./context";
import type { AnimationFinding } from "@/lib/analysis/animation-extractor";

const findings = (list: AnimationFinding[] | undefined, fallback: string) =>
  list?.length
    ? list.map((f) => `- **${f.pattern}** (${f.confidence}) — e.g. \`${f.evidence[0] ?? ""}\``).join("\n")
    : `- ${fallback}`;

export function generateAnimationMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const anim = ctx.animation;
  if (!anim) a.add("No ANIMATION_ANALYSIS available — rules below are the recommended premium baseline.");
  if (anim?.meta.confidence === "low")
    a.add("Animation analysis confidence is low — findings are assumptions until the Playwright probe runs.");

  const content = `# ANIMATION — ${who(ctx)}

${analysisConfidenceNote(ctx)}

## Detected animation libraries
${anim?.detectedLibraries.length ? anim.detectedLibraries.map((l) => `- ${l}`).join("\n") : "- None detected in static source."}

## Global motion style
${anim?.globalMotionStyle ?? "Unknown — propose a minimal premium baseline (subtle, purposeful, never decorative)."}

## Scroll reveal rules
${findings(anim?.scrollAnimations, "No scroll animation detected — add fade-up reveals: 16–24px rise, 500–700ms, ease-out, once per section.")}

Implementation: trigger once when a section enters the viewport (-80px margin); stagger grouped cards by 60–100ms.

## Entrance animation rules
${findings(anim?.entranceAnimations, "No entrance animation detected — add a hero entrance: badge → headline → copy → CTAs staggered fade-up, 600–800ms total.")}

## Hover interaction rules
${findings(anim?.hoverInteractions, "No hover transitions detected — standardize: 150–300ms color/shadow, ≤4px card lift, buttons scale ≤1.03.")}

## Parallax / sticky notes
${findings(anim?.parallaxEffects, "No parallax detected — only add it deliberately (≤10% translate) and disable under reduced motion.")}
${findings(anim?.stickyPinnedSections, "No sticky/pinned sections detected — use sticky only for navigation.")}

## Timing and easing
${bullets(
    anim?.timingAndEasing?.length
      ? anim.timingAndEasing.map((t) => `Site value: \`${t}\``)
      : ["Micro-interactions 150–300ms", "Section reveals 500–700ms", "Ease-out entering, ease-in exiting; cubic-bezier(0.22, 1, 0.36, 1) as default"],
  )}

## Reduced motion accessibility
${anim?.reducedMotionSupport ?? "Unknown for the current site."}
Rebuild rule: wrap all non-essential motion behind \`prefers-reduced-motion\`; content must be fully readable with animation disabled.

## Animation do's and don'ts
**Do:** one orchestrated moment per view, motion that explains hierarchy, interruptible animations.
**Don't:** bounce/spin/flash, animate width/height/top/left (use transform/opacity), per-character body text animation, motion that blocks input.

## Recommended animation system
${bullets(anim?.recommendedAnimationRules ?? [
    "Hero entrance stagger (600–800ms, ease-out)",
    "Fade-up sections, once per view",
    "Card hover lift ≤4px, 200–300ms",
    "Button micro-interactions only",
    "Honor prefers-reduced-motion everywhere",
  ])}

${visionBlock(ctx, ["animationClues"])}
${a.section()}
`;
  return { name: "ANIMATION.md", content };
}
