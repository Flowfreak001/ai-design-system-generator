import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export default function ServiceCards3({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const services = (items?.length ? items : [
    { title: "Consultation", description: "We assess your needs and map a clear plan forward." },
    { title: "Delivery", description: "Hands-on execution with regular, transparent updates." },
    { title: "Support", description: "Ongoing help so results keep compounding over time." },
  ]).slice(0, 3);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Our services"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
        {services.map((s, i) => (
          <div key={i} className="p-6" style={cardRaised(t)}>
            <div className="grid h-10 w-10 place-items-center rounded-lg text-[15px] font-bold text-white" style={{ background: t.accentColor }}>{i + 1}</div>
            <p className="mt-4 text-[15px] font-semibold" style={h(t)}>{s.title || `Service ${i + 1}`}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{s.description || "Describe the outcome the client gets."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
