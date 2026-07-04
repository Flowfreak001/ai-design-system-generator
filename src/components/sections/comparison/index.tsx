// Comparison sections — feature comparison table + "why choose us" grid.
// Handles the "why you vs the alternatives" objection near the decision point.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export function ComparisonTable({ theme, eyebrow, title, subtitle, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const rows = ["On-brand design system", "Section variant library", "One-click code export", "Works with your builder", "No design skills needed"];
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Why teams choose us"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden" style={{ borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
        <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center px-5 py-3 text-[12.5px] font-semibold" style={{ background: t.surfaceColor, color: t.textColor }}>
          <span>Capability</span><span className="text-center" style={{ color: t.accentColor }}>Us</span><span className="text-center" style={{ color: t.mutedTextColor }}>Others</span>
        </div>
        {rows.map((r, i) => (
          <div key={r} className={`grid grid-cols-[1.6fr_1fr_1fr] items-center px-5 py-3 text-[13px] ${i ? "border-t" : ""}`} style={{ borderColor: t.borderColor }}>
            <span style={b(t)}>{r}</span>
            <span className="text-center text-[15px] font-bold" style={{ color: t.accentColor }}>✓</span>
            <span className="text-center text-[15px]" style={{ color: t.mutedTextColor }}>{i % 2 ? "—" : "✓"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyChooseUsGrid({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const reasons = (items?.length ? items : [
    { title: "Faster to launch", description: "Go from brief to shippable design in minutes." },
    { title: "Consistently on-brand", description: "Every section respects your tokens and voice." },
    { title: "Truly export-ready", description: "Clean, structured output your builder understands." },
    { title: "Conversion-focused", description: "Layouts chosen to move visitors toward action." },
  ]).slice(0, 4);
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Why choose us"}</h2>
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-5 grid-cols-1 md:grid-cols-2`}>
        {reasons.map((r, i) => (
          <div key={i} className="p-6" style={cardRaised(t)}>
            <div className="grid h-10 w-10 place-items-center rounded-lg text-white" style={{ background: t.accentColor }}>✓</div>
            <p className="mt-3 text-[15px] font-semibold" style={h(t)}>{r.title || `Reason ${i + 1}`}</p>
            <p className="mt-1 text-[13px] leading-relaxed" style={b(t)}>{r.description || "A concrete reason to choose you."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
