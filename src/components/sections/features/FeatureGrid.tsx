import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function FeatureGrid({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const features = (items?.length ? items : [
    { title: "Fast setup", description: "Get up and running in minutes, not weeks." },
    { title: "Secure by default", description: "Best-practice security built into every layer." },
    { title: "Scales with you", description: "From first customer to enterprise scale." },
    { title: "Clear reporting", description: "Understand performance at a glance." },
  ]).slice(0, 6);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Everything you need"}</h2>
        {subtitle && <p className="mx-auto mt-2 max-w-xl text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-x-8 gap-y-7 grid-cols-1 md:grid-cols-2`}>
        {features.map((f, i) => (
          <div key={i} className="flex gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: t.surfaceColor, color: t.accentColor }}>◆</div>
            <div>
              <p className="text-[15px] font-semibold" style={h(t)}>{f.title || `Feature ${i + 1}`}</p>
              <p className="mt-1 text-[13px] leading-relaxed" style={b(t)}>{f.description || "A short line describing the benefit clearly."}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
