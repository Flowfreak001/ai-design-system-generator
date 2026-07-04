// Feature variants (Elementor-grade): icon cards and a tabbed feature section.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export function FeatureCardsWithIcons({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const feats = (items?.length ? items : [
    { title: "On-brand by default", description: "Every section respects your tokens automatically." },
    { title: "Smart variant picking", description: "The right layout is chosen for each goal." },
    { title: "Export anywhere", description: "Clean output for Claude Code, Replit, Lovable and more." },
    { title: "Fully responsive", description: "Mobile-first structure out of the box." },
    { title: "Real content guidance", description: "Copy direction, not lorem ipsum." },
    { title: "Version history", description: "Iterate safely with saved revisions." },
  ]).slice(0, 6);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[27px] font-bold" style={h(t)}>{title || "Everything you need to ship"}</h2>
        {subtitle && <p className="mx-auto mt-2 max-w-xl text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-5xl gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
        {feats.map((f, i) => (
          <div key={i} className="p-6" style={cardRaised(t)}>
            <div className="grid h-11 w-11 place-items-center rounded-xl text-[17px]" style={{ background: t.surfaceColor, color: t.accentColor }}>◆</div>
            <p className="mt-4 text-[15px] font-semibold" style={h(t)}>{f.title || `Feature ${i + 1}`}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{f.description || "A short, benefit-led description."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeatureTabs({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const tabs = (items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Design", "Generate", "Export"]).slice(0, 5);
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "One platform, many capabilities"}</h2>
      </div>
      <div className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
        {tabs.map((tab, i) => (
          <span key={`${tab}-${i}`} className="rounded-full px-4 py-2 text-[13px] font-medium" style={i === 0 ? { background: t.accentColor, color: "#fff" } : { background: t.backgroundColor, color: t.textColor, border: `1px solid ${t.borderColor}` }}>{tab}</span>
        ))}
      </div>
      <div className={`mx-auto mt-8 grid max-w-4xl items-center gap-8 md:grid-cols-2`}>
        <div>
          <h3 className="text-[19px] font-bold" style={h(t)}>{tabs[0] || "Design"}</h3>
          <p className="mt-2 text-[14px] leading-relaxed" style={b(t)}>Deep-dive copy for the selected tab — explain the capability and its benefit.</p>
          <ul className="mt-4 grid gap-2 text-[13px]" style={b(t)}>{["Point one", "Point two", "Point three"].map((p) => <li key={p} className="flex items-center gap-2"><span style={{ color: t.accentColor }}>✓</span>{p}</li>)}</ul>
        </div>
        <div className="h-52 w-full rounded-2xl" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }} />
      </div>
    </section>
  );
}
