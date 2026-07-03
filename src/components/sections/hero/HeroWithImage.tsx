import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

// Full-width hero with a large background/feature image and overlaid copy.
export default function HeroWithImage({ theme, eyebrow, title, subtitle, description, primaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="relative overflow-hidden px-8 py-24" style={{ background: t.primaryColor }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.primaryColor}00 0%, ${t.primaryColor}cc 100%)`, opacity: 0.4 }} />
      <div className="relative mx-auto max-w-2xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#ffffff", opacity: 0.85 }}>{eyebrow}</span>}
        <h1 className="mt-3 text-[36px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Make a Strong First Impression"}</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.85)" }}>{subtitle || description || "A bold visual hero that sets the tone and focuses attention on one clear action."}</p>
        <span className="mt-7 inline-block px-6 py-3 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get Started"}</span>
      </div>
    </section>
  );
}
