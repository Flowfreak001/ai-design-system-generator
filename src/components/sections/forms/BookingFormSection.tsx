import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function BookingFormSection({ theme, eyebrow, title, subtitle, fields, primaryButtonLabel, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const formFields = fields?.length ? fields.map((f) => f.label) : ["Service", "Date", "Time", "Full name", "Phone number"];
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
          <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Book an appointment"}</h2>
          <p className="mt-2 text-[14px]" style={b(t)}>{subtitle || "Choose a service and time that suits you — we'll confirm by message."}</p>
        </div>
        <div className="mt-8 rounded-2xl p-6" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
          <div className={`grid gap-4 ${mobile ? "grid-cols-1" : "grid-cols-2"}`}>
            {formFields.map((f) => (
              <div key={f}>
                <label className="text-[12.5px] font-medium" style={b(t)}>{f}</label>
                <div className="mt-1.5 h-11 w-full" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }} />
              </div>
            ))}
          </div>
          <span className="mt-5 inline-block w-full px-4 py-3 text-center text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Confirm booking"}</span>
        </div>
      </div>
    </section>
  );
}
