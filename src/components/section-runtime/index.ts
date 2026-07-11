// Section Runtime — public surface. Generated (sandboxed) sections receive
// this module as `import { useSectionRuntime } from "section-runtime"` via the
// dynamic renderer's sandbox require. App code imports it normally.

export { SECTION_BREAKPOINTS, resolveSectionBreakpoint, isCompactBreakpoint } from "./section-breakpoints";
export { useSectionRuntime } from "./section-runtime-context";
export { SectionRuntimeShell } from "./section-runtime-shell";
export { validateSectionRoot } from "./validate-section";
export type { SectionBreakpoint, SectionRuntimeValue, SectionValidationResult, SectionValidationIssue } from "./types";
