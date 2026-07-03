import type { SectionProps } from "../types";
import { resolveTheme, h, b, card } from "../section-theme";

export default function ServiceGrid6({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const services = (items?.length ? items : [
    { title: "Strategy", description: "Plan the right approach." },
    { title: "Design", description: "Craft a premium look." },
    { title: "Development", description: "Build fast and reliable." },
    { title: "Marketing", description: "Reach the right people." },
    { title: "Support", description: "Stay reliable long-term." },
    { title: "Analytics", description: "Measure what matters." },
  ]).slice(0, 6);
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "What we offer"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-5xl gap-4 ${mobile ? "grid-cols-2" : "grid-cols-3"}`}>
        {services.map((s, i) => (
          <div key={i} className="p-5" style={{ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
            <div className="h-9 w-9 rounded-lg" style={{ background: t.accentColor, opacity: 0.9 }} />
            <p className="mt-3 text-[14px] font-semibold" style={h(t)}>{s.title || `Service ${i + 1}`}</p>
            <p className="mt-1 text-[12.5px]" style={b(t)}>{s.description || "Short benefit line."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
