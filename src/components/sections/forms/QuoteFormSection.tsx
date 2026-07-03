import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

// Split quote request: value proposition on one side, request form on the other.
export default function QuoteFormSection({ theme, eyebrow, title, subtitle, description, fields, primaryButtonLabel, items, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const formFields = fields?.length ? fields.map((f) => f.label) : ["Name", "Email", "Project details", "Budget range"];
  const points = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Free, no-obligation quote", "Response within 24 hours", "Transparent, fixed pricing"];
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Request a free quote"}</h2>
      <p className="mt-3 text-[14px] leading-relaxed" style={b(t)}>{subtitle || description || "Tell us what you need and get a tailored quote — no pressure, no jargon."}</p>
      <ul className="mt-5 grid gap-2 text-[13px]" style={b(t)}>{points.map((p) => <li key={p} className="flex items-center gap-2"><span style={{ color: t.accentColor }}>✓</span>{p}</li>)}</ul>
    </div>
  );
  const form = (
    <div className="rounded-2xl p-6" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
      {formFields.map((f) => (
        <div key={f} className="mb-3">
          <label className="text-[12.5px] font-medium" style={b(t)}>{f}</label>
          <div className="mt-1.5 h-11 w-full" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }} />
        </div>
      ))}
      <span className="mt-2 inline-block w-full px-4 py-3 text-center text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get my quote"}</span>
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className={`grid items-center gap-10 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{form}{content}</> : <>{content}{form}</>}
      </div>
    </section>
  );
}
