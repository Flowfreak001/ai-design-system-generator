import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";

// Centered SaaS hero with a product screenshot mockup below the copy.
export default function SaaSHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 pt-20 pb-0 text-center" style={{ background: t.backgroundColor }}>
      {eyebrow && <span className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: t.surfaceColor, color: t.accentColor }}>{eyebrow}</span>}
      <h1 className="mx-auto mt-4 max-w-2xl text-[38px] font-bold leading-tight" style={h(t)}>{title || "The platform that scales with your team"}</h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "Everything your team needs to plan, build and ship — in one clean workspace."}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Start free trial"}</span>
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "Book a demo"}</span>
      </div>
      <div className="mx-auto mt-12 h-48 max-w-3xl rounded-t-2xl p-3" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}`, borderBottom: "none" }}>
        <div className="flex h-full w-full flex-col gap-2 rounded-xl p-4" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}>
          <div className="h-3 w-1/3 rounded" style={{ background: t.surfaceColor }} />
          <div className="grid flex-1 grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="rounded" style={{ background: t.surfaceColor }} />)}</div>
        </div>
      </div>
    </section>
  );
}
