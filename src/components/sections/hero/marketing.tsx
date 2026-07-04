// Marketing/SaaS hero variants (Elementor-grade): AI-platform hero and a
// split hero with a strong product visual.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline, cardRaised } from "../section-theme";

export function AIPlatformHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel, items }: SectionProps) {
  const t = resolveTheme(theme);
  const chips = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["AI-powered", "Export-ready", "No design skills needed"];
  return (
    <section className="px-8 pt-20 pb-0 text-center" style={{ background: t.backgroundColor }}>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11.5px] font-semibold" style={{ background: t.surfaceColor, color: t.accentColor }}>
        <span>✦</span> {eyebrow || "Introducing AI design generation"}
      </span>
      <h1 className="mx-auto mt-5 max-w-3xl text-[40px] font-bold leading-[1.1]" style={h(t)}>{title || "Design and ship websites with AI"}</h1>
      <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed" style={b(t)}>{subtitle || description || "Turn a brief into a complete, on-brand design system and production-ready code — in minutes."}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <span className="px-6 py-3 text-[13.5px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Start free"}</span>
        <span className="px-6 py-3 text-[13.5px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "See how it works"}</span>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[12px]" style={b(t)}>{chips.map((c) => <span key={c} className="rounded-full px-3 py-1" style={{ background: t.surfaceColor }}>{c}</span>)}</div>
      <div className="mx-auto mt-12 max-w-4xl rounded-t-2xl p-3" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}`, borderBottom: "none" }}>
        <div className="rounded-xl p-4" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}>
          <div className="mb-3 h-3 w-1/4 rounded" style={{ background: t.surfaceColor }} />
          <div className="grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg" style={{ background: t.surfaceColor }} />)}</div>
        </div>
      </div>
    </section>
  );
}

export function SplitVisualHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h1 className="mt-2 text-[34px] font-bold leading-tight" style={h(t)}>{title || "The fastest way to a polished site"}</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "A confident hero with a strong product visual and one clear primary action."}</p>
      <div className="mt-6 flex gap-3">
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get started free"}</span>
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "Book a demo"}</span>
      </div>
    </div>
  );
  const visual = (
    <div className="rounded-2xl p-4" style={cardRaised(t)}>
      <div className="mb-2 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: t.surfaceColor }} />)}</div>
      <div className="h-52 w-full rounded-lg" style={{ background: t.surfaceColor }} />
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-10 md:grid-cols-2`}>
        {assetSide === "left" ? <>{visual}{content}</> : <>{content}{visual}</>}
      </div>
    </section>
  );
}
