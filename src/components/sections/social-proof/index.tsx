// Social-proof sections — logo clouds, review stats, trust badges. Placed near
// the fold on SaaS/marketing pages to build credibility fast (Elementor-grade).

import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export function LogoCloud({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const count = items?.length ? items.length : 6;
  return (
    <section className="px-8 py-12" style={{ background: t.backgroundColor }}>
      <p className="text-center text-[12.5px] font-medium uppercase tracking-wide" style={{ color: t.mutedTextColor }}>
        {eyebrow || title || "Trusted by teams at leading companies"}
      </p>
      <div className={`mx-auto mt-6 grid max-w-4xl items-center gap-6 ${mobile ? "grid-cols-3" : "grid-cols-6"}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-7 w-full rounded" style={{ background: t.surfaceColor }} />
        ))}
      </div>
    </section>
  );
}

export function ReviewStats({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const stats = items?.length ? items : [
    { value: "4.9/5", label: "Average rating" },
    { value: "10k+", label: "Happy customers" },
    { value: "50M+", label: "Sites built" },
    { value: "99.9%", label: "Uptime" },
  ];
  return (
    <section className="px-8 py-14" style={{ background: t.surfaceColor }}>
      {(eyebrow || title) && <p className="mb-8 text-center text-[13px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow || title}</p>}
      <div className={`mx-auto grid max-w-4xl gap-6 text-center ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-[32px] font-bold" style={h(t)}>{s.value || "—"}</p>
            <p className="mt-1 text-[13px]" style={b(t)}>{s.label || `Metric ${i + 1}`}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrustBadgeStrip({ theme, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const badges = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["★ 4.9 rated", "SOC2 compliant", "GDPR ready", "24/7 support"];
  return (
    <section className="px-8 py-8" style={{ background: t.backgroundColor, borderTop: `1px solid ${t.borderColor}`, borderBottom: `1px solid ${t.borderColor}` }}>
      <div className={`mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 ${mobile ? "" : ""}`}>
        {title && <span className="text-[13px] font-medium" style={b(t)}>{title}</span>}
        {badges.map((badge) => (
          <span key={badge} className="rounded-full px-4 py-2 text-[12.5px] font-medium" style={cardRaised(t)}>{badge}</span>
        ))}
      </div>
    </section>
  );
}
