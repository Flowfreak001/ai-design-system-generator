import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";

export default function PricingCards({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const tiers = items?.length ? items : [
    { title: "Starter", price: "$29", period: "/mo" },
    { title: "Pro", price: "$79", period: "/mo", featured: true },
    { title: "Business", price: "$149", period: "/mo" },
  ];
  return (
    <section className="px-8 py-16 text-center" style={{ background: t.surfaceColor }}>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Simple, transparent pricing"}</h2>
      {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      <div className={`mx-auto mt-10 grid max-w-4xl gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
        {tiers.map((tier, i) => (
          <div key={i} className="p-6 text-left" style={{ background: t.backgroundColor, borderRadius: t.radius, border: tier.featured ? `2px solid ${t.accentColor}` : `1px solid ${t.borderColor}`, boxShadow: tier.featured ? t.shadow : "none" }}>
            <p className="text-[13px] font-semibold" style={{ color: t.accentColor }}>{tier.title || `Plan ${i + 1}`}</p>
            <p className="mt-1 text-[28px] font-bold" style={h(t)}>{tier.price || "$—"}<span className="text-[12px] font-normal" style={b(t)}>{tier.period || "/mo"}</span></p>
            <div className="mt-4 grid gap-1.5 text-[12.5px]" style={b(t)}>{["Included feature", "Included feature", "Included feature"].map((f, j) => <span key={j}>✓ {f}</span>)}</div>
            <span className="mt-5 inline-block w-full px-3 py-2.5 text-center text-[13px] font-semibold" style={tier.featured ? fill(t) : outline(t)}>Choose plan</span>
          </div>
        ))}
      </div>
    </section>
  );
}
