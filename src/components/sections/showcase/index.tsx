// Showcase sections — template galleries, case-study cards. Prove quality and
// range with real-looking work (Elementor's template/showcase pattern).

import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export function TemplateGallery({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const count = items?.length ? items.length : 6;
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Start from a beautiful template"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-5xl gap-4 ${mobile ? "grid-cols-2" : "grid-cols-3"}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="overflow-hidden" style={{ borderRadius: t.radius, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
            <div className="aspect-[4/3] w-full" style={{ background: t.surfaceColor }} />
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[12.5px] font-medium" style={h(t)}>Template {i + 1}</span>
              <span className="text-[11.5px] font-medium" style={{ color: t.accentColor }}>Use →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CaseStudyCards({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const cases = (items?.length ? items : [
    { title: "How Acme grew signups 3×", tag: "SaaS", description: "A focused redesign that clarified the offer and lifted conversion." },
    { title: "Bright Studio's rebrand", tag: "Agency", description: "A confident new identity and a site that finally reflects the work." },
    { title: "City Clinic goes digital", tag: "Healthcare", description: "Online booking that patients actually complete." },
  ]).slice(0, 3);
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Results our clients are proud of"}</h2>
      </div>
      <div className={`mx-auto mt-8 grid max-w-5xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {cases.map((c, i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
            <div className="h-40 w-full" style={{ background: t.surfaceColor }} />
            <div className="p-5">
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: t.surfaceColor, color: t.accentColor }}>{c.tag || "Case study"}</span>
              <p className="mt-2.5 text-[15px] font-semibold leading-snug" style={h(t)}>{c.title || `Case study ${i + 1}`}</p>
              <p className="mt-1.5 text-[13px]" style={b(t)}>{c.description || "A short summary of the outcome."}</p>
              <span className="mt-3 inline-block text-[12.5px] font-semibold" style={{ color: t.accentColor }}>Read case study →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
