import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function HeroWithBookingForm({ theme, eyebrow, title, subtitle, description, fields, primaryButtonLabel, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const formFields = fields?.length ? fields.map((f) => f.label) : ["Service", "Preferred date & time", "Phone number"];
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h1 className="mt-2 text-[32px] font-bold leading-tight" style={h(t)}>{title || "Book your appointment in minutes"}</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "Fast, reliable, and available when you need us — reserve your slot online."}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-[12px]" style={b(t)}>
        <span className="rounded-full px-3 py-1" style={{ background: t.surfaceColor }}>★ 4.9 rated</span>
        <span className="rounded-full px-3 py-1" style={{ background: t.surfaceColor }}>Same-day slots</span>
      </div>
    </div>
  );
  const form = (
    <div className="p-6" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
      <p className="text-[14px] font-semibold" style={h(t)}>Request a booking</p>
      {formFields.map((f) => (
        <div key={f} className="mt-3">
          <label className="text-[12px]" style={b(t)}>{f}</label>
          <div className="mt-1 h-10 w-full" style={{ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }} />
        </div>
      ))}
      <span className="mt-4 inline-block w-full px-4 py-2.5 text-center text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Check availability"}</span>
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-10 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{form}{content}</> : <>{content}{form}</>}
      </div>
    </section>
  );
}
