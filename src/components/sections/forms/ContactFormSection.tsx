import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function ContactFormSection({ theme, eyebrow, title, subtitle, fields, primaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  const formFields = fields?.length ? fields : [
    { label: "Full name" }, { label: "Email address" }, { label: "Message", type: "textarea" },
  ];
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
          <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Get in touch"}</h2>
          <p className="mt-2 text-[14px]" style={b(t)}>{subtitle || "Tell us about your project and we'll reply within one business day."}</p>
        </div>
        <div className="mt-8 grid gap-4">
          {formFields.map((f) => (
            <div key={f.label}>
              <label className="text-[12.5px] font-medium" style={b(t)}>{f.label}</label>
              <div className={`mt-1.5 w-full ${f.type === "textarea" ? "h-28" : "h-11"}`} style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }} />
            </div>
          ))}
          <span className="mt-1 inline-block px-4 py-3 text-center text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Send message"}</span>
        </div>
      </div>
    </section>
  );
}
