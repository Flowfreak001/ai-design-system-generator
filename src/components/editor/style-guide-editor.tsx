"use client";

// Semantic Style Guide editor — turns extracted colours into a real website
// theme: theme overview, grouped semantic colours, typography scale, live button
// + surface previews, spacing/radius/shadow scales. Backed by @/lib/style-guide.

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { StyleGuideCanvas } from "@/lib/canvas";
import {
  COLOR_TOKENS, COLOR_GROUPS, TYPE_TOKENS, SPACING_STEPS, RADIUS_STEPS, SHADOW_STEPS,
  buildSemanticTokens, tokensOf, contrastWarnings, type SemanticTokens, type TypographyToken,
} from "@/lib/style-guide/tokens";

const NAME_OF = Object.fromEntries(COLOR_TOKENS.map((c) => [c.key, c.name]));

export function StyleGuideEditor({
  style, setStyle, approved, onApprove, busy, onApplyToAll,
}: {
  style: StyleGuideCanvas;
  setStyle: (fn: (s: StyleGuideCanvas) => StyleGuideCanvas) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
  onApplyToAll?: () => void;
}) {
  const t = useMemo(() => tokensOf(style), [style]);

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

      <div className="grid gap-5">
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
