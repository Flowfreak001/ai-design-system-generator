// Feature section with a large product visual on one side and an expandable
// accordion feature list on the other (first item open). Matches the modern
// SaaS/builder marketing pattern. Static preview — the builder wires the real
// accordion. Theme-token driven; supports asset-side swap.

import type { SectionProps, SectionTheme } from "../types";
import { resolveTheme, h, b, btnRadius } from "../section-theme";

function VisualCard({ t }: { t: SectionTheme }) {
  return (
    <div className="relative overflow-hidden" style={{ borderRadius: `calc(${t.radius} + 8px)`, background: t.primaryColor, minHeight: 420 }}>
      {/* Faint display heading, like a hero screenshot behind the panel. */}
      <div className="px-10 pt-16">
        <p className="text-[46px] font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: t.headingFont, color: "rgba(255,255,255,0.14)" }}>BUILT<br />FROM<br />WHAT IS</p>
      </div>
      {/* Highlighted CTA with a selection ring (like the reference). */}
      <div className="absolute bottom-8 left-10">
        <span className="inline-block px-6 py-3 text-[13px] font-semibold" style={{ background: t.backgroundColor, color: t.textColor, borderRadius: btnRadius(t), outline: `2px solid ${t.accentColor}`, outlineOffset: 3 }}>Learn more</span>
      </div>
      {/* Floating edit panel overlay. */}
      <div className="absolute right-6 top-8 w-56 rounded-xl p-3 shadow-2xl" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold" style={{ color: t.textColor }}>▾ Edit Button</span>
          <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-medium text-white">Variables</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: t.mutedTextColor }}>Text color</span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded" style={{ background: t.primaryColor }} />
            <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: t.surfaceColor, color: t.textColor }}>#361320</span>
          </span>
        </div>
        <div className="mt-3 rounded-lg p-2.5" style={{ background: t.surfaceColor }}>
          <span className="text-[11px] font-medium" style={{ color: t.textColor }}>⌘ New Variable</span>
          {["Name", "Value"].map((f) => (
            <div key={f} className="mt-2">
              <span className="text-[9px] font-semibold" style={{ color: t.mutedTextColor }}>{f}*</span>
              <div className="mt-1 h-6 w-full rounded" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }} />
            </div>
          ))}
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="text-[10px]" style={{ color: t.mutedTextColor }}>Cancel</span>
            <span className="rounded px-2.5 py-1 text-[10px] font-semibold text-white" style={{ background: t.accentColor }}>Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureSplitAccordion({ theme, eyebrow, title, subtitle, items, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const feats = (items?.length ? items : [
    { title: "Designs with total freedom", description: "Deliver brand-consistent, engaging websites clients love, without needing to write code. Drag and drop every element, apply motion effects, and set global variables." },
    { title: "Marketing built right in" },
    { title: "Dynamic sites that scale" },
    { title: "Online stores that win sales" },
  ]).slice(0, 6);

  const accordion = (
    <div className="flex flex-col justify-center">
      {(eyebrow || title) && (
        <div className="mb-6">
          {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
          {title && <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title}</h2>}
          {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
        </div>
      )}
      <div>
        {feats.map((f, i) => (
          <div key={i} className="border-t py-5 first:border-t-0" style={{ borderColor: t.borderColor }}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[19px] font-bold" style={h(t)}>{f.title || `Feature ${i + 1}`}</p>
              <span className="text-[20px] leading-none" style={{ color: i === 0 ? t.mutedTextColor : t.textColor }}>{i === 0 ? "–" : "+"}</span>
            </div>
            {i === 0 && (f.description || "") && (
              <p className="mt-3 max-w-md text-[14px] leading-relaxed" style={b(t)}>{f.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const visual = <VisualCard t={t} />;

  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-12 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "right" ? <>{accordion}{visual}</> : <>{visual}{accordion}</>}
      </div>
    </section>
  );
}
