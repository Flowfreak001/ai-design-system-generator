// Product-workflow sections — how it works, step-by-step process, AI workflow.
// Explains the product/service flow in a scannable, conversion-focused way.

import type { SectionProps } from "../types";
import { resolveTheme, h, b, cardRaised } from "../section-theme";

export function StepByStepProcess({ theme, eyebrow, title, subtitle, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const steps = (items?.length ? items : [
    { title: "Tell us your goals", description: "Answer a few questions about your business and audience." },
    { title: "Generate your design", description: "Get a complete, on-brand design system in minutes." },
    { title: "Ship your site", description: "Export production-ready code and launch with confidence." },
  ]).slice(0, 4);
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "How it works"}</h2>
        {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
      </div>
      <div className={`mx-auto mt-10 grid max-w-4xl gap-6 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {steps.map((s, i) => (
          <div key={i} className="relative">
            <div className="grid h-11 w-11 place-items-center rounded-full text-[16px] font-bold text-white" style={{ background: t.accentColor }}>{i + 1}</div>
            <p className="mt-4 text-[15px] font-semibold" style={h(t)}>{s.title || `Step ${i + 1}`}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{s.description || "A short, clear description of this step."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksCards({ theme, eyebrow, title, items, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const steps = (items?.length ? items : [
    { title: "Connect", description: "Bring in your brand and references." },
    { title: "Generate", description: "AI builds your design system." },
    { title: "Refine", description: "Tweak sections and variants visually." },
    { title: "Export", description: "Ship code to your builder of choice." },
  ]).slice(0, 4);
  return (
    <section className="px-8 py-16" style={{ background: t.surfaceColor }}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "A simple, powerful workflow"}</h2>
      </div>
      <div className={`mx-auto mt-10 grid max-w-5xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-4"}`}>
        {steps.map((s, i) => (
          <div key={i} className="p-5" style={cardRaised(t)}>
            <span className="text-[13px] font-bold" style={{ color: t.accentColor }}>0{i + 1}</span>
            <p className="mt-2 text-[14px] font-semibold" style={h(t)}>{s.title || `Step ${i + 1}`}</p>
            <p className="mt-1 text-[12.5px]" style={b(t)}>{s.description || "Short benefit line."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AIWorkflowSection({ theme, eyebrow, title, subtitle, description, items, mobile, assetSide }: SectionProps) {
  const t = resolveTheme(theme);
  const points = items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Understands your brand", "Generates on-brand sections", "Suggests the best layout per goal", "Exports clean, ready code"];
  const content = (
    <div>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
      <h2 className="mt-2 text-[26px] font-bold leading-tight" style={h(t)}>{title || "AI that designs with intent"}</h2>
      <p className="mt-3 text-[14px] leading-relaxed" style={b(t)}>{subtitle || description || "Not random layouts — every section is chosen to move your visitors toward action."}</p>
      <ul className="mt-5 grid gap-2.5 text-[13.5px]" style={b(t)}>{points.map((p) => <li key={p} className="flex items-center gap-2"><span style={{ color: t.accentColor }}>✦</span>{p}</li>)}</ul>
    </div>
  );
  const visual = (
    <div className="min-h-56 rounded-2xl p-4" style={cardRaised(t)}>
      <div className="mb-2 h-3 w-1/3 rounded" style={{ background: t.surfaceColor }} />
      <div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg" style={{ background: t.surfaceColor }} />)}</div>
    </div>
  );
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-10 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{visual}{content}</> : <>{content}{visual}</>}
      </div>
    </section>
  );
}
