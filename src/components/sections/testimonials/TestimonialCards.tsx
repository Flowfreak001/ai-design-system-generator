import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export default function TestimonialCards({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const reviews = (items?.length ? items : [
    { quote: "They delivered exactly what we needed, on time and on budget.", author: "Sarah Mitchell", role: "Operations Lead" },
    { quote: "The whole process was smooth and genuinely stress-free.", author: "James Carter", role: "Founder" },
    { quote: "Our booking rate doubled within the first two months.", author: "Aisha Khan", role: "Owner" },
  ]).slice(0, 3);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "What our clients say"}</h2>
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {reviews.map((r, i) => (
          <div key={i} className="p-6" style={cardRaised(t)}>
            <div className="text-[13px]" style={{ color: t.accentColor }}>★★★★★</div>
            <p className="mt-3 text-[13.5px] italic leading-relaxed" style={b(t)}>“{r.quote}”</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full" style={{ background: t.surfaceColor }} />
              <div>
                <p className="text-[12.5px] font-semibold" style={h(t)}>{r.author || "Client name"}</p>
                <p className="text-[11.5px]" style={b(t)}>{r.role || "Customer"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
