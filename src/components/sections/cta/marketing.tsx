// Marketing CTA variants (Elementor-grade): gradient CTA and a trial-signup CTA.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export function GradientCTA({ theme, title, subtitle, description, primaryButtonLabel, secondaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-20 text-center" style={{ background: `linear-gradient(135deg, ${t.primaryColor} 0%, ${t.accentColor} 100%)` }}>
      <h2 className="mx-auto max-w-2xl text-[30px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Start building better websites today"}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px]" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.9)" }}>{subtitle || description || "Join thousands of teams shipping polished sites faster."}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <span className="px-6 py-3 text-[13.5px] font-semibold" style={{ background: "#ffffff", color: t.accentColor, borderRadius: t.radius }}>{primaryButtonLabel || "Get started free"}</span>
        {(secondaryButtonLabel ?? "Talk to sales") && <span className="px-6 py-3 text-[13.5px] font-semibold" style={{ border: "1px solid rgba(255,255,255,0.6)", color: "#fff", borderRadius: t.radius }}>{secondaryButtonLabel || "Talk to sales"}</span>}
      </div>
    </section>
  );
}

export function TrialSignupCTA({ theme, eyebrow, title, subtitle, primaryButtonLabel, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const perks = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["No credit card required", "14-day free trial", "Cancel anytime"];
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl rounded-3xl px-8 py-12 text-center" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[27px] font-bold" style={h(t)}>{title || "Try it free for 14 days"}</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px]" style={b(t)}>{subtitle || "Sign up in seconds and see your first design system generated."}</p>
        <div className={`mx-auto mt-6 flex max-w-md gap-2 flex-col sm:flex-row`}>
          <div className="h-12 flex-1 rounded-lg" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }} />
          <span className="grid place-items-center px-6 py-3 text-[13.5px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Start free"}</span>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[12px]" style={b(t)}>{perks.map((p) => <span key={p} className="flex items-center gap-1.5"><span style={{ color: t.accentColor }}>✓</span>{p}</span>)}</div>
      </div>
    </section>
  );
}
