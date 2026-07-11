"use client";

// SectionRuntimeShell — the measured root every generated section renders in.
// Owns the single ResizeObserver, provides the runtime via context, and stamps
// the resolved breakpoint on the DOM so section CSS can target
// `[data-breakpoint="…"]` without JS conditions:
//
//   <div data-section-runtime data-breakpoint="tablet"
//        data-container-width="800" data-preview="true">
//
// Overlay strategy: when `isPreview`, a `data-preview-overlay-root` div is
// rendered as a portal target for section overlays (drawers, mega-menus).
// The full-page preview frame additionally uses `contain: layout paint`
// (full-section-preview.tsx) so position:fixed overlays are contained to the
// frame — containment is applied ONLY there, never globally, because it
// changes fixed/sticky behaviour and stacking contexts.

import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  SectionRuntimeContextProvider,
  useRuntimeValue,
  useSectionMeasurement,
} from "./section-runtime-context";

const ROOT_STYLE: CSSProperties = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  // NOTE: no overflow clipping here — overflow bugs must be fixed at the
  // source; decorative clipping is a per-element decision inside sections.
};

export function SectionRuntimeShell({
  children,
  isPreview = false,
  previewScale = 1,
  debug = false,
  className,
  style,
}: {
  children: ReactNode;
  /** True on preview surfaces (library cards, modals, editor canvas). */
  isPreview?: boolean;
  /** Visual scale the host applies to this section (informational). */
  previewScale?: number;
  /** Dev-only floating diagnostics readout. Never renders in production. */
  debug?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const size = useSectionMeasurement(rootRef);
  const runtime = useRuntimeValue(size, isPreview, previewScale);

  const showDebug = debug && process.env.NODE_ENV !== "production";

  return (
    <SectionRuntimeContextProvider value={runtime}>
      <div
        ref={rootRef}
        data-section-runtime=""
        data-breakpoint={runtime.breakpoint}
        data-container-width={Math.round(runtime.width)}
        data-preview={isPreview ? "true" : "false"}
        className={className}
        style={{ ...ROOT_STYLE, ...(showDebug ? { position: "relative" as const } : null), ...style }}
      >
        {isPreview && <div data-preview-overlay-root="" style={{ position: "relative", zIndex: 90 }} />}
        {children}
        {showDebug && (
          <div
            aria-hidden
            style={{
              position: "absolute", right: 8, top: 8, zIndex: 99,
              padding: "6px 10px", borderRadius: 8, background: "rgba(15,14,13,0.82)",
              color: "#fff", fontFamily: "ui-monospace, monospace", fontSize: 11, lineHeight: 1.5,
              pointerEvents: "none",
            }}
          >
            {Math.round(runtime.width)}×{Math.round(runtime.height)} · {runtime.breakpoint}
            {runtime.isPreview ? ` · preview ×${previewScale}` : ""}
            {runtime.hasMeasured ? "" : " · unmeasured"}
          </div>
        )}
      </div>
    </SectionRuntimeContextProvider>
  );
}
