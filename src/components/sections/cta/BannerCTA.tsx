import type { SectionProps } from "../types";
import { resolveTheme } from "../section-theme";

export default function BannerCTA({ theme, title, primaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-8" style={{ background: t.accentColor }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <p className="text-[18px] font-semibold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Book today and get priority scheduling"}</p>
        <span className="px-6 py-3 text-[13px] font-bold" style={{ background: "#ffffff", color: t.accentColor, borderRadius: t.radius }}>{primaryButtonLabel || "Book now"}</span>
      </div>
    </section>
  );
}
