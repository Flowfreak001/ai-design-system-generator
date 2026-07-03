// Integrations / ecosystem — shows the tools the product connects with.

import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export function IntegrationLogoCloud({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const count = items?.length ? items.length : mobile ? 6 : 10;
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "Works with your favourite tools"}</h2>
        <p className="mt-2 text-[14px]" style={b(t)}>{subtitle || "Connect the stack you already use — no rip-and-replace."}</p>
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-4 ${mobile ? "grid-cols-3" : "grid-cols-5"}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="grid aspect-square place-items-center rounded-2xl" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }}>
            <div className="h-8 w-8 rounded-lg" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }} />
          </div>
        ))}
      </div>
    </section>
  );
}
