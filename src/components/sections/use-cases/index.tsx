// Use-case sections — who it's for, by role or industry. Helps visitors
// self-identify and see the product applied to their situation.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export function UseCaseCards({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const cases = (items?.length ? items : [
    { title: "Freelancers", description: "Launch client sites in a fraction of the time." },
    { title: "Agencies", description: "Standardise quality across every project." },
    { title: "Startups", description: "Ship a polished marketing site fast." },
    { title: "Small business", description: "Look professional without a design team." },
  ]).slice(0, 6);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Built for the way you work"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-5xl gap-5 grid-cols-1 md:grid-cols-2`}>
        {cases.map((c, i) => (
          <div key={i} className="flex items-start gap-4 p-6" style={cardRaised(t)}>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[16px]" style={{ background: t.surfaceColor, color: t.accentColor }}>◆</div>
            <div>
              <p className="text-[15px] font-semibold" style={h(t)}>{c.title || `Use case ${i + 1}`}</p>
              <p className="mt-1 text-[13px] leading-relaxed" style={b(t)}>{c.description || "How this audience benefits."}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndustryGrid({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const industries = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["SaaS", "Agency", "Ecommerce", "Healthcare", "Real estate", "Hospitality", "Fitness", "Education"];
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Trusted across industries"}</h2>
      </div>
      <div className={`mx-auto mt-8 grid max-w-4xl gap-3 grid-cols-2 md:grid-cols-4`}>
        {industries.map((name) => (
          <div key={name} className="grid place-items-center rounded-xl py-6 text-[13px] font-medium" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, color: t.textColor }}>{name}</div>
        ))}
      </div>
    </section>
  );
}
