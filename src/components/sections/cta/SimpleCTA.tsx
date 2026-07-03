import type { SectionProps } from "../types";
import { resolveTheme, fill } from "../section-theme";

export default function SimpleCTA({ theme, title, subtitle, description, primaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-20 text-center" style={{ background: t.primaryColor }}>
      <h2 className="mx-auto max-w-2xl text-[28px] font-bold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Ready to get started?"}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px]" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.82)" }}>{subtitle || description || "Take the next step today — it only takes a minute to begin."}</p>
      <span className="mt-7 inline-block px-6 py-3 text-[13px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Get Started"}</span>
    </section>
  );
}
