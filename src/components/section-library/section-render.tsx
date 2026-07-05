"use client";

// Shared rendering helpers for the section library: a render function that
// picks the right engine (component code vs catalog) and an error boundary.
// Used by the grid thumbnails, the preview, and the full-page editor.

import { Component, type ReactNode } from "react";
import { renderSectionByKind } from "@/components/sections/render-section";
import { DynamicSectionRenderer } from "@/components/section-library/dynamic-renderer";
import type { SectionTheme } from "@/components/sections/types";
import type { LibrarySection } from "@/lib/section-library/manual-sections";

/** Isolates render failures (missing component / bad code) with a clean state. */
export class SectionErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid min-h-[220px] place-items-center bg-panel px-6 text-center">
          <div>
            <p className="text-[13px] font-semibold text-ink">Preview unavailable</p>
            <p className="mt-1 text-[12px] text-muted">This section&apos;s component could not be rendered.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Render a library section — via the component engine (admin-authored code)
 *  or the shared catalog renderer (built-ins). */
export function renderLibrarySection(section: LibrarySection, theme: SectionTheme, mobile: boolean) {
  const dc = section.defaultContent;
  if (section.componentCode) {
    return <DynamicSectionRenderer code={section.componentCode} mode={section.codeMode ?? "react"} content={dc} theme={theme} />;
  }
  return renderSectionByKind(section.kind, section.variant, {
    name: section.canvasName,
    theme,
    mobile,
    content: {
      eyebrow: dc.eyebrow, title: dc.title, subtitle: dc.subtitle, description: dc.description,
      primaryButtonLabel: dc.primaryButtonLabel, secondaryButtonLabel: dc.secondaryButtonLabel,
    },
    contentItems: dc.items?.map((it) => ({ title: it.title, text: it.text, href: it.href, icon: it.icon })),
  });
}
