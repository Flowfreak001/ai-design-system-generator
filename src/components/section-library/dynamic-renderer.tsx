"use client";

// Dynamic section renderer — the component engine for the section library.
//
// Admins author sections as real React/TSX component code. This compiles that
// code in the browser (sucrase, lazy-loaded) and renders it live with a fixed
// props contract. Only admin-authored, reviewed code reaches the catalog, so
// this is first-party trusted content — but imports are still restricted to a
// small allow-list and every render is wrapped in an error boundary.
//
//   Props contract passed to the authored component:
//     content : { eyebrow, title, subtitle, description,
//                 primaryButtonLabel, secondaryButtonLabel, items[] }
//     theme   : SectionTheme brand tokens (colors, fonts, radius…)
//     items   : content.items (convenience alias)

import { Component, useEffect, useId, useRef, useState, type ReactNode } from "react";
import * as React from "react";
import * as FramerMotion from "framer-motion";
import { SectionRuntimeShell } from "@/components/section-runtime";
import { SECTION_BREAKPOINTS, isCompactBreakpoint, resolveSectionBreakpoint } from "@/components/section-runtime/section-breakpoints";
import { useSectionRuntime } from "@/components/section-runtime/section-runtime-context";
import type { SectionTheme } from "@/components/sections/types";
import type { LibraryDefaultContent } from "@/lib/section-library/manual-sections";

export type SectionCodeMode = "react" | "html";

type CompiledComponent = (props: { content: LibraryDefaultContent; theme: SectionTheme; items?: LibraryDefaultContent["items"] }) => ReactNode;

// The shared responsive runtime handed to sandboxed sections. Context crosses
// the sandbox because compiled code runs against OUR React instance.
const SECTION_RUNTIME_MODULE = Object.freeze({
  useSectionRuntime,
  SECTION_BREAKPOINTS,
  resolveSectionBreakpoint,
  isCompactBreakpoint,
});

// Restricted module resolver for authored code (`import X from '...'`).
function sandboxRequire(name: string): unknown {
  if (name === "react") return React;
  if (name === "framer-motion" || name === "motion/react") return FramerMotion;
  if (name === "section-runtime" || name === "@flowfreak/section-runtime") return SECTION_RUNTIME_MODULE;
  throw new Error(`Import not allowed: "${name}". Only react, framer-motion and section-runtime are available.`);
}

/** Compile TSX source into a renderable component (throws on error). */
async function compileReact(src: string): Promise<CompiledComponent> {
  const { transform } = await import("sucrase");
  const { code } = transform(src, { transforms: ["jsx", "typescript", "imports"], production: true });
  const mod: { exports: Record<string, unknown> } = { exports: {} };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function("require", "module", "exports", "React", code);
  fn(sandboxRequire, mod, mod.exports, React);
  const Comp = (mod.exports.default ?? mod.exports.Section) as CompiledComponent | undefined;
  if (typeof Comp !== "function") {
    throw new Error("Your code must `export default` a React component (or export a `Section` component).");
  }
  return Comp;
}

// ── Error boundary: isolates runtime render failures in authored code. ──
class RenderBoundary extends Component<{ children: ReactNode; onError: (m: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: Error) { this.props.onError(err.message); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Notice({ tone, title, body }: { tone: "error" | "muted"; title: string; body?: string }) {
  const err = tone === "error";
  return (
    <div className={`grid min-h-[200px] place-items-center px-6 text-center ${err ? "bg-danger-soft/30" : "bg-panel"}`}>
      <div>
        <p className={`text-[13px] font-semibold ${err ? "text-danger" : "text-ink"}`}>{title}</p>
        {body && <pre className="mt-2 max-w-lg overflow-auto whitespace-pre-wrap text-left text-[11.5px] text-muted">{body}</pre>}
      </div>
    </div>
  );
}

export type SectionRenderStatus = { state: "compiling" | "ok" | "error"; message?: string };

export function DynamicSectionRenderer({
  code, mode = "react", content, theme, onStatus, isPreview = true, previewScale = 1, debug = false,
}: {
  code: string;
  mode?: SectionCodeMode;
  content: LibraryDefaultContent;
  theme: SectionTheme;
  /** Reports compile/runtime status so a host (e.g. the Studio) can show it. */
  onStatus?: (s: SectionRenderStatus) => void;
  /** False only on real published surfaces (hosted storefront); previews default true. */
  isPreview?: boolean;
  /** Visual scale the host applies (thumbnails/modal); informational. */
  previewScale?: number;
  /** Dev-only diagnostics overlay (width/breakpoint) on the section root. */
  debug?: boolean;
}) {
  const [Comp, setComp] = useState<CompiledComponent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runtimeErr = useRef<string | null>(null);
  const status = useRef(onStatus);
  status.current = onStatus;
  // Scoped, accessible focus rings for every link/button in the section, tinted
  // with the section's accent — a shadcn-grade a11y baseline applied to ALL
  // sections without editing each one.
  const cls = "sk-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ringAccent = theme?.accentColor || "#2563eb";

  useEffect(() => {
    let alive = true;
    setError(null); setComp(null); runtimeErr.current = null;
    if (mode === "html") {
      // Secondary/simple mode: render authored HTML with {{token}} substitution.
      setComp(() => htmlComponent(code));
      status.current?.({ state: "ok" });
      return;
    }
    status.current?.({ state: "compiling" });
    compileReact(code)
      .then((C) => { if (alive) { setComp(() => C); status.current?.({ state: "ok" }); } })
      .catch((e: unknown) => { if (alive) { const m = e instanceof Error ? e.message : String(e); setError(m); status.current?.({ state: "error", message: m }); } });
    return () => { alive = false; };
  }, [code, mode]);

  if (error) return <Notice tone="error" title="Could not compile this section" body={error} />;
  if (!Comp) return <Notice tone="muted" title="Compiling…" />;

  return (
    <RenderBoundary onError={(m) => { runtimeErr.current = m; setError(m); status.current?.({ state: "error", message: m }); }}>
      {/* SectionRuntimeShell = the ONE responsive system for sections: it
          measures this root, resolves the container breakpoint, provides
          useSectionRuntime() and stamps data-breakpoint for CSS targeting. */}
      <SectionRuntimeShell isPreview={isPreview} previewScale={previewScale} debug={debug}
        className={cls} style={{ WebkitTapHighlightColor: "transparent" }}>
        <style>{`.${cls} :focus-visible{outline:2px solid ${ringAccent};outline-offset:2px;border-radius:5px}`}</style>
        <Comp content={content} theme={theme} items={content.items} />
      </SectionRuntimeShell>
    </RenderBoundary>
  );
}

// ── HTML mode (secondary): {{title}} / {{items}} token substitution. ──
function htmlComponent(src: string): CompiledComponent {
  return function HtmlSection({ content }: { content: LibraryDefaultContent }) {
    const itemsHtml = (content.items ?? [])
      .map((it) => `<div class="item"><strong>${esc(it.title)}</strong><p>${esc(it.text)}</p></div>`)
      .join("");
    const html = src
      .replace(/\{\{\s*eyebrow\s*\}\}/g, esc(content.eyebrow))
      .replace(/\{\{\s*title\s*\}\}/g, esc(content.title))
      .replace(/\{\{\s*subtitle\s*\}\}/g, esc(content.subtitle))
      .replace(/\{\{\s*description\s*\}\}/g, esc(content.description))
      .replace(/\{\{\s*primaryButton\s*\}\}/g, esc(content.primaryButtonLabel))
      .replace(/\{\{\s*secondaryButton\s*\}\}/g, esc(content.secondaryButtonLabel))
      .replace(/\{\{\s*items\s*\}\}/g, itemsHtml);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
}

const esc = (v?: string) =>
  (v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
