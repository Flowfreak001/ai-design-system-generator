// Motion export: turn a section's motion settings into build guidance.

import type { SectionMotion } from "@/lib/section-editor/types";

const BEHAVIOR: Record<string, string> = {
  "none": "No animation.",
  "hover-lift": "Cards translate up ~4px with a soft shadow on hover (pointer devices only).",
  "scroll-reveal": "Fade + 24px rise when entering the viewport (once, ~30% threshold).",
  "accordion": "Items expand/collapse; only one open at a time; animate height smoothly.",
  "tabs": "Content switches between tabs with a short fade.",
  "carousel": "Horizontal slider with prev/next controls; swipe on touch.",
  "marquee": "Infinite horizontal strip (duplicate track, translate -50%); pause on hover.",
  "hover-expand": "Panels grow on hover; siblings shrink slightly.",
  "sticky-scroll": "Media pins (position: sticky) while adjacent content scrolls.",
  "sticky-expanding-media": "Section pins; centered media grows from small to full-bleed driven by scroll progress.",
};

export function motionSpec(motion: SectionMotion) {
  const preset = motion.preset ?? "none";
  return {
    preset,
    intensity: motion.intensity ?? "subtle",
    behavior: BEHAVIOR[preset] ?? BEHAVIOR.none,
    reducedMotionFallback: preset === "none" ? "n/a" : "Render the final resting state with no animation when prefers-reduced-motion is set.",
  };
}

export const needsFramerMotion = (motion: SectionMotion): boolean =>
  !["none", "accordion", "tabs", undefined].includes(motion.preset);
