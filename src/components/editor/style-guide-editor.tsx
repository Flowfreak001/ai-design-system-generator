"use client";

// Semantic Style Guide editor — turns extracted colours into a real website
// theme: theme overview, grouped semantic colours, typography scale, live button
// + surface previews, spacing/radius/shadow scales. Backed by @/lib/style-guide.

import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import type { StyleGuideCanvas, CanvasPage, CanvasSection } from "@/lib/canvas";
import { createSectionTheme } from "@/components/sections/section-theme";
import { renderSectionByKind } from "@/components/sections/render-section";
import { GeneratedSection } from "@/components/sections/generated/GeneratedSection";
import { DynamicSectionRenderer } from "@/components/section-library/dynamic-renderer";
import { SectionErrorBoundary } from "@/components/section-library/section-render";
import { sectionKind } from "@/lib/sections";
import type { SectionTheme } from "@/components/sections/types";
import {
  COLOR_TOKENS, COLOR_GROUPS, TYPE_TOKENS, SPACING_STEPS, RADIUS_STEPS, SHADOW_STEPS,
  buildSemanticTokens, tokensOf, contrastWarnings, type SemanticTokens, type TypographyToken,
} from "@/lib/style-guide/tokens";

const NAME_OF = Object.fromEntries(COLOR_TOKENS.map((c) => [c.key, c.name]));

export function StyleGuideEditor({
  style, setStyle, approved, onApprove, busy, onApplyToAll, pages,
}: {
  style: StyleGuideCanvas;
  setStyle: (fn: (s: StyleGuideCanvas) => StyleGuideCanvas) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
  onApplyToAll?: () => void;
  pages?: CanvasPage[];
}) {
  const t = useMemo(() => tokensOf(style), [style]);
  const homePage = useMemo(() => (pages ?? []).find((p) => /^home/i.test(p.name)) ?? (pages ?? [])[0], [pages]);

  // Convert a legacy (raw-colours) guide to the semantic token system on open.
  useEffect(() => {
    if (!style.tokens) setStyle((s) => ({ ...s, tokens: buildSemanticTokens(s) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (fn: (t: SemanticTokens) => SemanticTokens) => setStyle((s) => ({ ...s, tokens: fn(tokensOf(s)) }));
  const setColor = (key: string, value: string) => patch((tk) => ({ ...tk, colors: { ...tk.colors, [key]: value } }));
  const setType = (key: string, p: Partial<TypographyToken>) => patch((tk) => ({ ...tk, typography: { ...tk.typography, [key]: { ...tk.typography[key], ...p } } }));
  const setFont = (which: "heading" | "body", v: string) => patch((tk) => ({ ...tk, fonts: { ...tk.fonts, [which]: v } }));
  const setUsage = (k: keyof SemanticTokens["spacingUsage"], v: number) => patch((tk) => ({ ...tk, spacingUsage: { ...tk.spacingUsage, [k]: v } }));
  const reset = () => setStyle((s) => ({ ...s, tokens: buildSemanticTokens(s) }));

  const c = t.colors;
  const fontFor = (key: string) => t.typography[key]?.fontFamily || (["h1", "h2", "h3"].includes(key) ? t.fonts.heading : t.fonts.body);
  const warnings = contrastWarnings(t);
  const radius = (k: string) => `${t.radius[k] ?? 12}px`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Style Guide</h2>
          <p className="text-[12.5px] text-muted">Your website theme — semantic colours, typography, spacing and components.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={reset}>Reset extraction</Button>
          {onApplyToAll && <Button size="sm" variant="secondary" onClick={onApplyToAll}>Apply to all sections</Button>}
          <div className="flex items-center gap-2">
            {approved && <span className="text-[12px] font-medium text-success">✓ Approved</span>}
            <Button size="sm" onClick={onApprove} disabled={busy}>{approved ? "Re-approve style guide" : "Approve style guide"}</Button>
          </div>
        </div>
      </div>

      {/* Contrast warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft/40 p-3 text-[12.5px] text-warning">
          <p className="font-semibold">Contrast check</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((w) => <li key={w.label}>{w.label}: {w.ratio.toFixed(1)}:1 — below 4.5:1, may be hard to read.</li>)}
          </ul>
        </div>
      )}

      {/* Two columns: controls (left) + sticky live website preview (right).
          Side-by-side on lg+, stacked (preview on top) on narrow screens. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <div className="order-2 grid min-w-0 gap-5 lg:order-1">
        {/* 1. Theme Overview */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Theme Overview</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["color.action.primary", "Primary Accent"], ["color.text.primary", "Primary Text"],
              ["color.background.page", "Page Background"], ["color.background.surface", "Surface Background"],
              ["color.border.default", "Border Default"],
            ].map(([key, name]) => (
              <div key={key} className="rounded-xl border border-line p-2.5">
                <div className="h-12 w-full rounded-lg border border-line" style={{ background: c[key] }} />
                <p className="mt-2 text-[12px] font-semibold text-ink">{name}</p>
                <p className="font-mono text-[10.5px] text-faint">{c[key]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Colors (grouped, semantic) */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Colors</p>
          <div className="mt-3 grid gap-5">
            {COLOR_GROUPS.map((group) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">{group}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {COLOR_TOKENS.filter((ct) => ct.group === group).map((ct) => (
                    <div key={ct.key} className="flex flex-col rounded-xl border border-line p-3">
                      <div className="h-14 w-full rounded-lg border border-line" style={{ background: c[ct.key] }} />
                      <p className="mt-2 truncate text-[12.5px] font-semibold text-ink">{ct.name}</p>
                      <p className="truncate font-mono text-[10px] text-faint">{ct.key}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input value={c[ct.key] ?? ""} onChange={(e) => setColor(ct.key, e.target.value)} className="w-full rounded-md border border-line px-2 py-1 font-mono text-[11px]" />
                        <input type="color" value={/^#([0-9a-f]{6})$/i.test(c[ct.key] ?? "") ? c[ct.key] : "#666666"} onChange={(e) => setColor(ct.key, e.target.value)} className="h-7 w-7 shrink-0 cursor-pointer rounded border border-line" aria-label={`Pick ${ct.name}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Typography */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Typography</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Heading font
              <input value={t.fonts.heading} onChange={(e) => setFont("heading", e.target.value)} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px] font-normal normal-case text-ink" />
            </label>
            <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Body font
              <input value={t.fonts.body} onChange={(e) => setFont("body", e.target.value)} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px] font-normal normal-case text-ink" />
            </label>
          </div>
          <div className="mt-4 grid gap-3">
            {TYPE_TOKENS.map(({ key, name }) => {
              const ty = t.typography[key];
              if (!ty) return null;
              return (
                <div key={key} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold text-ink">{name}</span>
                    <span className="font-mono text-[10.5px] text-faint">type.{key}</span>
                  </div>
                  <p className="mt-1 truncate text-ink" style={{ fontFamily: fontFor(key), fontSize: Math.min(ty.fontSize, 34), lineHeight: ty.lineHeight, fontWeight: ty.fontWeight, letterSpacing: ty.letterSpacing }}>
                    The quick brown fox
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    <NumField label="Size" value={ty.fontSize} onChange={(v) => setType(key, { fontSize: v })} />
                    <NumField label="Line" value={ty.lineHeight} step={0.05} onChange={(v) => setType(key, { lineHeight: v })} />
                    <NumField label="Weight" value={ty.fontWeight} step={100} onChange={(v) => setType(key, { fontWeight: v })} />
                    <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Spacing
                      <input value={ty.letterSpacing} onChange={(e) => setType(key, { letterSpacing: e.target.value })} className="mt-0.5 w-full rounded border border-line px-1.5 py-1 text-[11px] font-normal normal-case" />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Buttons */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Buttons</p>
          <div className="mt-3 flex flex-wrap items-center gap-3" style={{ fontFamily: t.fonts.body }}>
            {(() => { const b = t.typography.button; const base = { fontSize: b?.fontSize ?? 15, fontWeight: b?.fontWeight ?? 600, letterSpacing: b?.letterSpacing ?? "0", borderRadius: radius("radius.md"), padding: "11px 22px", cursor: "default", border: "1px solid transparent" } as const;
              return (<>
                <span style={{ ...base, background: c["color.action.primary"], color: c["color.text.inverse"] }}>Primary Button</span>
                <span style={{ ...base, background: c["color.background.surface"], color: c["color.text.primary"], border: `1px solid ${c["color.border.default"]}` }}>Secondary Button</span>
                <span style={{ ...base, background: "transparent", color: c["color.text.primary"] }}>Ghost Button</span>
                <span style={{ ...base, background: "transparent", color: c["color.action.primary"], textDecoration: "underline", padding: "11px 6px" }}>Link Button</span>
                <span style={{ ...base, background: c["color.background.surface"], color: c["color.text.muted"], opacity: 0.6 }}>Disabled Button</span>
              </>); })()}
          </div>
        </section>

        {/* 5. Surfaces */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Surfaces</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ fontFamily: t.fonts.body }}>
            <Surface label="Card" style={{ background: c["color.background.card"], border: `1px solid ${c["color.border.default"]}`, borderRadius: radius("radius.lg"), boxShadow: t.shadows["shadow.sm"], color: c["color.text.primary"] }} />
            <Surface label="Feature Card" style={{ background: c["color.background.surface"], border: `1px solid ${c["color.border.subtle"]}`, borderRadius: radius("radius.lg"), color: c["color.text.primary"] }} />
            <Surface label="Dark Section" style={{ background: c["color.background.inverse"], borderRadius: radius("radius.lg"), color: c["color.text.inverse"] }} />
            <div className="rounded-xl border border-line p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Input Field</p>
              <div style={{ border: `1px solid ${c["color.border.default"]}`, borderRadius: radius("radius.md"), padding: "10px 12px", color: c["color.text.muted"], fontSize: 13 }}>Placeholder text…</div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Section Container</p>
              <div style={{ background: c["color.background.page"], border: `1px dashed ${c["color.border.default"]}`, borderRadius: radius("radius.md"), padding: `${Math.min(t.spacingUsage.sectionDesktop / 3, 28)}px 16px`, textAlign: "center", color: c["color.text.muted"], fontSize: 12 }}>{t.spacingUsage.sectionDesktop}px section padding</div>
            </div>
          </div>
        </section>

        {/* 6. Spacing */}
        <section className="card p-5">
          <p className="text-sm font-semibold text-ink">Spacing</p>
          <div className="mt-3 grid gap-1.5">
            {SPACING_STEPS.map(([key]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-16 font-mono text-[11px] text-faint">{key}</span>
                <span className="h-3 rounded bg-accent-soft" style={{ width: (t.spacing[key] ?? 0) * 1.6 }} />
                <span className="text-[11px] text-muted">{t.spacing[key]}px</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumField label="Section pad (desktop)" value={t.spacingUsage.sectionDesktop} onChange={(v) => setUsage("sectionDesktop", v)} />
            <NumField label="Section pad (mobile)" value={t.spacingUsage.sectionMobile} onChange={(v) => setUsage("sectionMobile", v)} />
            <NumField label="Card padding" value={t.spacingUsage.cardPadding} onChange={(v) => setUsage("cardPadding", v)} />
            <NumField label="Grid gap" value={t.spacingUsage.gridGap} onChange={(v) => setUsage("gridGap", v)} />
          </div>
        </section>

        {/* 7. Radius + 8. Shadows */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink">Radius</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {RADIUS_STEPS.map(([key]) => (
                <div key={key} className="text-center">
                  <div className="h-14 w-14 border border-line bg-panel" style={{ borderRadius: Math.min(t.radius[key] ?? 0, 28) }} />
                  <p className="mt-1 font-mono text-[10px] text-faint">{key.replace("radius.", "")}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink">Shadows</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {SHADOW_STEPS.map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className="h-14 w-14 rounded-lg bg-surface" style={{ boxShadow: val }} />
                  <p className="mt-1.5 font-mono text-[10px] text-faint">{key.replace("shadow.", "")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

        {/* Live website preview — reflects the tokens in real time. */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Live preview{homePage ? ` · ${homePage.name}` : ""}</p>
            {homePage && homePage.sections.length > 0
              ? <HomePreview page={homePage} style={style} />
              : <ThemePreview t={t} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Renders one canvas section with the live theme — mirrors the Design canvas.
function renderCanvasSection(s: CanvasSection, theme: SectionTheme) {
  if (s.custom) {
    return <DynamicSectionRenderer code={s.custom.code} mode={s.custom.mode} theme={theme} content={{
      eyebrow: s.content?.eyebrow, title: s.content?.title, subtitle: s.content?.subtitle, description: s.content?.description,
      primaryButtonLabel: s.content?.primaryButtonLabel, secondaryButtonLabel: s.content?.secondaryButtonLabel,
      items: s.content?.items?.map((it) => ({ title: it.title, text: it.text })),
    }} />;
  }
  if (s.generated) {
    return <GeneratedSection pattern={s.generated.pattern} theme={theme} spec={s.generated.spec} />;
  }
  return renderSectionByKind(sectionKind(s.name), s.variant, {
    name: s.name, note: s.note, theme, mobile: false,
    assetSide: s.asset === "left" ? "left" : "right", hidden: s.hidden,
    iconKey: s.icon, imageUrl: s.image, contentItems: s.content?.items, content: s.content,
  });
}

// The actual home page, rendered at page width and scaled to fit the panel — so
// the preview is the real design with the live Style Guide tokens applied.
function HomePreview({ page, style }: { page: CanvasPage; style: StyleGuideCanvas }) {
  const BASE = 1100;
  const theme = useMemo(() => createSectionTheme(style), [style]);
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);
  const [height, setHeight] = useState(600);
  useLayoutEffect(() => {
    const box = boxRef.current, content = contentRef.current;
    if (!box || !content) return;
    const measure = () => { const s = box.clientWidth / BASE; setScale(s); setHeight(content.offsetHeight * s); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box); ro.observe(content);
    return () => ro.disconnect();
  }, [page, theme]);
  return (
    <div ref={boxRef} className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg" style={{ height }}>
      <div ref={contentRef} style={{ width: BASE, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {page.sections.map((s) => (
          <SectionErrorBoundary key={s.id}>{renderCanvasSection(s, theme)}</SectionErrorBoundary>
        ))}
      </div>
    </div>
  );
}

function ThemePreview({ t }: { t: SemanticTokens }) {
  const c = t.colors;
  const heading = t.fonts.heading || "Inter";
  const body = t.fonts.body || "Inter";
  const rl = (k: string) => `${t.radius[k] ?? 12}px`;
  const btn = { borderRadius: rl("radius.md"), padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "default", border: "1px solid transparent", fontFamily: body } as const;
  return (
    <div style={{ border: `1px solid ${c["color.border.default"]}`, borderRadius: rl("radius.lg"), overflow: "hidden", background: c["color.background.page"], boxShadow: t.shadows["shadow.lg"], fontFamily: body }}>
      {/* Navbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${c["color.border.subtle"]}` }}>
        <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 15, color: c["color.text.primary"] }}>Logo</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: c["color.text.muted"] }}>
          <span>Services</span><span>About</span>
          <span style={{ ...btn, background: c["color.action.primary"], color: c["color.text.inverse"], padding: "6px 12px", fontSize: 11 }}>Sign up</span>
        </div>
      </div>
      {/* Hero */}
      <div style={{ background: c["color.background.surface"], padding: "34px 20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em", color: c["color.text.primary"], margin: 0 }}>Your headline goes right here</h1>
        <p style={{ color: c["color.text.muted"], fontSize: 12.5, lineHeight: 1.6, margin: "10px auto 0", maxWidth: 300 }}>Supporting copy that explains the value of the product in a line or two.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
          <span style={{ ...btn, background: c["color.action.primary"], color: c["color.text.inverse"] }}>Get started</span>
          <span style={{ ...btn, background: c["color.background.card"], color: c["color.text.primary"], border: `1px solid ${c["color.border.default"]}` }}>Learn more</span>
        </div>
      </div>
      {/* Feature cards */}
      <div style={{ padding: 20 }}>
        <h2 style={{ fontFamily: heading, fontWeight: 800, fontSize: 17, color: c["color.text.primary"], margin: 0 }}>What you get</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: c["color.background.card"], border: `1px solid ${c["color.border.default"]}`, borderRadius: rl("radius.md"), boxShadow: t.shadows["shadow.sm"], padding: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: c["color.action.primary"], opacity: 0.9 }} />
              <p style={{ fontFamily: heading, fontWeight: 700, fontSize: 11.5, color: c["color.text.primary"], margin: "8px 0 3px" }}>Feature {i + 1}</p>
              <p style={{ fontSize: 10, lineHeight: 1.5, color: c["color.text.muted"], margin: 0 }}>Short benefit copy.</p>
            </div>
          ))}
        </div>
      </div>
      {/* Dark strip */}
      <div style={{ background: c["color.background.inverse"], color: c["color.text.inverse"], padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 13 }}>Ready to start?</span>
        <span style={{ ...btn, background: c["color.action.primary"], color: c["color.text.inverse"] }}>Contact us</span>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="mt-0.5 w-full rounded border border-line px-1.5 py-1 text-[12px] font-normal normal-case text-ink" />
    </label>
  );
}

function Surface({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div style={{ ...style, minHeight: 84, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Heading</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Supporting copy sits here.</span>
      </div>
    </div>
  );
}
