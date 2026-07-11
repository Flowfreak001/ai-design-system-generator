// Standard CONTAINER breakpoints for generated sections. These are resolved
// from the section's measured container width — never the browser viewport.
// No generated section may define its own breakpoint numbers.

import type { SectionBreakpoint } from "./types";

export const SECTION_BREAKPOINTS = {
  mobile: 0,
  largeMobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

/**
 * Resolve a container width (px) to the standard breakpoint.
 *   0–479 → mobile · 480–767 → largeMobile · 768–1023 → tablet
 *   1024–1279 → desktop · 1280+ → wide
 */
export function resolveSectionBreakpoint(width: number): SectionBreakpoint {
  if (!Number.isFinite(width) || width < SECTION_BREAKPOINTS.largeMobile) return "mobile";
  if (width < SECTION_BREAKPOINTS.tablet) return "largeMobile";
  if (width < SECTION_BREAKPOINTS.desktop) return "tablet";
  if (width < SECTION_BREAKPOINTS.wide) return "desktop";
  return "wide";
}

/** Convenience: breakpoints that should get the compact "mobile" treatment. */
export function isCompactBreakpoint(bp: SectionBreakpoint): boolean {
  return bp === "mobile" || bp === "largeMobile";
}
