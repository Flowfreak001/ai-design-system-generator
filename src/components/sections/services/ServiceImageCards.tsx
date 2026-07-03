import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function ServiceImageCards({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const services = (items?.length ? items : [
    { title: "Residential", description: "Tailored service for homes and families." },
    { title: "Commercial", description: "Scalable solutions for businesses." },
    { title: "Emergency", description: "Fast response when it matters most." },
  ]).slice(0, 3);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Our services"}</h2>
      </div>
      <div className={`mx-auto mt-8 grid max-w-5xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {services.map((s, i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
            <div className="h-36 w-full" style={{ background: t.surfaceColor }} />
            <div className="p-5">
              <p className="text-[15px] font-semibold" style={h(t)}>{s.title || `Service ${i + 1}`}</p>
              <p className="mt-1.5 text-[13px]" style={b(t)}>{s.description || "What the client gets and why it matters."}</p>
              <span className="mt-3 inline-block text-[12.5px] font-semibold" style={{ color: t.accentColor }}>Learn more →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
