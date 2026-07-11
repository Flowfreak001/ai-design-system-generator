// Shared types for the Section Runtime — the ONE responsive system for
// generated library sections (Context B in SECTION_RUNTIME_RULES.md).

export type SectionBreakpoint =
  | "mobile"
  | "largeMobile"
  | "tablet"
  | "desktop"
  | "wide";

export type SectionRuntimeValue = {
  /** Measured LAYOUT width of the section container in px (untransformed). */
  width: number;
  /** Measured LAYOUT height of the section container in px (untransformed). */
  height: number;
  /** Standard container breakpoint resolved from `width`. */
  breakpoint: SectionBreakpoint;
  /** True when rendered inside a preview surface (library card, modal, canvas). */
  isPreview: boolean;
  /** Visual scale applied by the host preview frame (1 = unscaled). */
  previewScale: number;
  /** False until the first real measurement lands (mobile-first before that). */
  hasMeasured: boolean;
};

export type SectionValidationIssue = {
  type:
    | "horizontal-overflow"
    | "child-overflow"
    | "zero-width"
    | "invalid-dimensions"
    | "missing-runtime"
    | "wide-fixed-element";
  selector?: string;
  message: string;
};

export type SectionValidationResult = {
  passed: boolean;
  containerWidth: number;
  breakpoint: SectionBreakpoint;
  issues: SectionValidationIssue[];
};
