import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";

export default function SplitCTA({ theme, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-14" style={{ background: t.surfaceColor }}>
      <div className={`mx-auto flex max-w-5xl items-center gap-6 rounded-2xl p-8 ${mobile ? "flex-col text-center" : "justify-between"}`} style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
        <div>
          <h2 className="text-[22px] font-bold" style={h(t)}>{title || "Let's build something great together"}</h2>
          <p className="mt-1.5 text-[14px]" style={b(t)}>{subtitle || description || "Start today — no credit card required."}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <span className="px-5 py-2.5 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get Started"}</span>
          <span className="px-5 py-2.5 text-[13px] font-semibold" style={outline(t)}>{secondaryButtonLabel || "Learn More"}</span>
        </div>
      </div>
    </section>
  );
}
