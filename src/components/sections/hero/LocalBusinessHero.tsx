import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function LocalBusinessHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, items, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const trust = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["📍 123 Main Street, Your City", "🕘 Mon–Sat · 8am–6pm", "📞 (555) 123-4567"];
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h1 className="mt-2 text-[30px] font-bold leading-tight" style={h(t)}>{title || "Trusted local experts near you"}</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "Serving the area for over 10 years with honest pricing and reliable service."}</p>
      <div className="mt-5 grid gap-2 text-[13px]" style={b(t)}>{trust.map((r) => <span key={r}>{r}</span>)}</div>
      <div className="mt-6 flex gap-3">
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Call now"}</span>
      </div>
    </div>
  );
  const asset = (
    <div className="flex min-h-56 w-full items-end p-4" style={{ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` }}>
      <div className="rounded-lg px-3 py-2 text-[12px] font-medium" style={{ background: t.backgroundColor, color: t.textColor, boxShadow: t.shadow }}>★★★★★ 4.9 · 240 reviews</div>
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-stretch gap-10 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{asset}{content}</> : <>{content}{asset}</>}
      </div>
    </section>
  );
}
