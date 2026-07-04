import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function GalleryGrid({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const count = items?.length ? items.length : mobile ? 4 : 8;
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      {(title || eyebrow) && (
        <div className="mx-auto mb-8 max-w-3xl text-center">
          {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
          <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Our work"}</h2>
          {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
        </div>
      )}
      <div className={`grid gap-3 grid-cols-2 md:grid-cols-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-square w-full" style={{ background: t.surfaceColor, borderRadius: t.radius }} />
        ))}
      </div>
    </section>
  );
}
