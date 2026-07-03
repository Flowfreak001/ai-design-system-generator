import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline, card } from "../section-theme";

export default function SplitHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h1 className="mt-2 text-[32px] font-bold leading-tight" style={h(t)}>{title || "A clear, benefit-led headline"}</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "Explain the value in one or two sentences and speak to the audience."}</p>
      <div className="mt-6 flex gap-3">
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get Started"}</span>
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "Learn More"}</span>
      </div>
    </div>
  );
  const asset = <div className="h-64 w-full" style={card(t)} />;
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-10 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{asset}{content}</> : <>{content}{asset}</>}
      </div>
    </section>
  );
}
