import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";

export default function CenteredHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-20 text-center" style={{ background: t.backgroundColor }}>
      {(eyebrow ?? "Professional Service") && (
        <span className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ background: t.surfaceColor, color: t.accentColor }}>
          {eyebrow || "Professional Service"}
        </span>
      )}
      <h1 className="mx-auto mt-4 max-w-2xl text-[34px] font-bold leading-tight sm:text-[40px]" style={h(t)}>
        {title || "Build a Better Online Experience"}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={b(t)}>
        {subtitle || description || "A clear, conversion-focused section designed around your business goals."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get Started"}</span>
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "Learn More"}</span>
      </div>
    </section>
  );
}
