// Dev QA helper — structural checks on a rendered section root. Used from the
// browser console / automated tooling (future Playwright) to distinguish
// measurement bugs from section-CSS bugs from host-clipping bugs.

import { resolveSectionBreakpoint } from "./section-breakpoints";
import type { SectionValidationIssue, SectionValidationResult } from "./types";

function describe(el: Element): string {
  const id = el.id ? `#${el.id}` : "";
  const cls = typeof el.className === "string" && el.className ? `.${el.className.split(/\s+/)[0]}` : "";
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

/**
 * Validate a section root (the element carrying `data-section-runtime`, or any
 * container). Detects horizontal overflow, children escaping the root, zero
 * width, invalid dimensions, missing runtime wrapper, and over-wide fixed
 * elements. Read-only; safe to run in production consoles.
 */
export function validateSectionRoot(root: HTMLElement): SectionValidationResult {
  const issues: SectionValidationIssue[] = [];
  const containerWidth = root.offsetWidth; // layout width (see runtime context notes)
  const rootRect = root.getBoundingClientRect();

  if (!root.hasAttribute("data-section-runtime") && !root.querySelector("[data-section-runtime]")) {
    issues.push({ type: "missing-runtime", message: "No data-section-runtime wrapper found — section is not mounted through SectionRuntimeShell." });
  }
  if (containerWidth === 0) {
    issues.push({ type: "zero-width", message: "Section root has zero layout width." });
  }
  if (!Number.isFinite(containerWidth) || containerWidth < 0) {
    issues.push({ type: "invalid-dimensions", message: `Invalid measured width: ${containerWidth}.` });
  }
  if (root.scrollWidth > root.clientWidth + 1) {
    issues.push({
      type: "horizontal-overflow",
      message: `Root scrollWidth ${root.scrollWidth}px exceeds clientWidth ${root.clientWidth}px — horizontal overflow.`,
    });
  }

  const tolerance = 1.5;
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    if (cs.position === "fixed") {
      // Fixed elements are legitimate (drawers) but must not exceed the root width.
      if (rect.width > rootRect.width + tolerance) {
        issues.push({ type: "wide-fixed-element", selector: describe(el), message: `Fixed element is ${Math.round(rect.width)}px wide; root is ${Math.round(rootRect.width)}px.` });
      }
      continue; // fixed elements are positioned outside normal flow; skip the flow check
    }
    if (rect.right > rootRect.right + tolerance || rect.left < rootRect.left - tolerance) {
      issues.push({
        type: "child-overflow",
        selector: describe(el),
        message: `Element extends ${Math.round(Math.max(rect.right - rootRect.right, rootRect.left - rect.left))}px beyond the section root.`,
      });
      if (issues.length > 25) break; // cap noise
    }
  }

  return {
    passed: issues.length === 0,
    containerWidth,
    breakpoint: resolveSectionBreakpoint(containerWidth),
    issues,
  };
}
