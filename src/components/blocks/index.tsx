"use client";

// Phase 1 BLOCKS (new batch) — reusable, theme-token-driven blocks that insert
// as bands via the "block" SectionType, alongside the originals in
// components/sections/blocks. Modern layouts adapted from shadcn / Magic UI /
// 21st.dev patterns (accelerators only), normalized to our rules: grey image
// placeholders, editable slots, no hardcoded brand content, subtle motion.

import type { SectionProps, SectionTheme } from "../sections/types";
import { resolveTheme, h, b, btnRadius } from "../sections/section-theme";
import { HiddenParts, useHidden } from "../sections/blocks/parts";

const tint = (t: SectionTheme, p = 12) => `color-mix(in srgb, ${t.accentColor} ${p}%, ${t.backgroundColor})`;
const grad = (t: SectionTheme) => `linear-gradient(135deg, ${t.accentColor}, color-mix(in srgb, ${t.accentColor} 55%, #0b0b12))`;
const dark = (t: SectionTheme) => `color-mix(in srgb, ${t.textColor} 90%, #000)`;
const Elev = (t: SectionTheme) => ({ background: t.backgroundColor, borderRadius: "20px", border: `1px solid ${t.borderColor}`, boxShadow: "0 1px 2px rgba(16,16,20,0.04), 0 12px 32px -12px rgba(16,16,20,0.12)" });
const Band: React.FC<{ t: SectionTheme; children: React.ReactNode; tone?: "bg" | "surface" | "tint" | "dark"; pad?: string }> = ({ t, children, tone = "bg", pad = "px-12 py-16" }) => (
  <section className={pad} style={{ background: tone === "surface" ? t.surfaceColor : tone === "tint" ? tint(t, 8) : tone === "dark" ? dark(t) : t.backgroundColor, fontFamily: t.bodyFont }}>{children}</section>
);
const Eyebrow: React.FC<{ t: SectionTheme; children: React.ReactNode; onDark?: boolean }> = ({ t, children, onDark }) => {
  if (useHidden("eyebrow")) return null;
  return <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: onDark ? "#fff" : t.accentColor, opacity: onDark ? 0.8 : 1 }}>{children}</span>;
};
const Head: React.FC<{ t: SectionTheme; eyebrow?: string; title?: string; sub?: string; center?: boolean; onDark?: boolean }> = ({ t, eyebrow, title, sub, center, onDark }) => (
  <div className={center ? "mx-auto mb-10 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
    {eyebrow && <Eyebrow t={t} onDark={onDark}>{eyebrow}</Eyebrow>}
    {title && <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em]" style={{ fontFamily: t.headingFont, color: onDark ? "#fff" : t.textColor }}>{title}</h2>}
    {sub && <p className="mt-3 text-[15px] leading-relaxed" style={{ color: onDark ? "#fff" : t.mutedTextColor, opacity: onDark ? 0.75 : 1 }}>{sub}</p>}
  </div>
);
const Chip: React.FC<{ t: SectionTheme; children?: React.ReactNode }> = ({ t, children }) => {
  if (useHidden("icon")) return null;
  return <span className="grid h-11 w-11 place-items-center rounded-2xl text-[15px] font-semibold" style={{ background: tint(t, 16), color: t.accentColor, border: `1px solid ${tint(t, 30)}` }}>{children ?? "◆"}</span>;
};
const Pill: React.FC<{ t: SectionTheme; children: React.ReactNode }> = ({ t, children }) => (
  <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium" style={{ background: t.surfaceColor, color: t.textColor, border: `1px solid ${t.borderColor}` }}>{children}</span>
);
const Ph: React.FC<{ t: SectionTheme; className?: string; label?: string; rounded?: string }> = ({ t, className = "", label, rounded = "rounded-2xl" }) => (
  <div className={`grid place-items-center overflow-hidden ${rounded} ${className}`} style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 6)})`, border: `1px dashed ${t.borderColor}` }}><span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: t.mutedTextColor, opacity: 0.6 }}>{label ?? "image"}</span></div>
);
const Btn: React.FC<{ t: SectionTheme; label: string; kind?: "fill" | "ghost" }> = ({ t, label, kind = "fill" }) => {
  if (useHidden("button")) return null;
  return <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13.5px] font-semibold" style={kind === "fill" ? { background: grad(t), color: "#fff", borderRadius: btnRadius(t) } : { color: t.accentColor, border: `1px solid ${tint(t, 40)}`, borderRadius: btnRadius(t) }}>{label}{kind === "fill" ? " →" : ""}</span>;
};

type BlockFC = React.FC<SectionProps>;
const make = (fn: (t: SectionTheme, p: SectionProps) => React.ReactNode): BlockFC => (p) => <HiddenParts.Provider value={new Set(p.hidden)}>{fn(resolveTheme(p.theme), p)}</HiddenParts.Provider>;

// 1 — Bento Grid: asymmetric feature mosaic.
export const BentoGrid = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Highlights" title={p.title ?? "A modular, flexible system"} sub={p.description} center />
    <div className="mx-auto grid max-w-5xl auto-rows-[130px] grid-cols-3 gap-4">
      {[["col-span-2 row-span-2", "Primary highlight"], ["", "Fast"], ["", "Secure"], ["col-span-2", "Scales with you"], ["", "Flexible"]].map(([cls, label], i) => (
        <div key={i} className={`flex flex-col justify-between p-5 ${cls}`} style={i === 0 ? { borderRadius: "20px", background: grad(t) } : Elev(t)}>
          <Chip t={t} /><div><h4 className="text-[15px] font-semibold" style={i === 0 ? { color: "#fff" } : h(t)}>{label}</h4>{i === 0 && <p className="mt-1 text-[13px]" style={{ color: "#fff", opacity: 0.8 }}>The standout capability, given the most visual weight.</p>}</div>
        </div>))}
    </div></Band>
));

// 2 — Stat Band: full-width gradient KPI strip.
export const StatBand = make((t, p) => (
  <Band t={t} pad="px-12 py-14"><div className="mx-auto max-w-5xl overflow-hidden p-10" style={{ borderRadius: "24px", background: grad(t) }}>
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">{[["98%", "Uptime"], ["10k+", "Users"], ["4.9", "Rating"], ["24/7", "Support"]].map(([n, l]) => (
      <div key={l}><div className="text-[34px] font-bold tracking-[-0.03em]" style={{ color: "#fff" }}>{n}</div><div className="mt-1 text-[13px]" style={{ color: "#fff", opacity: 0.8 }}>{l}</div></div>))}</div></div></Band>
));

// 3 — Feature Split: image + checklist, two columns.
export const FeatureSplit = make((t, p) => {
  const txt = <div><Eyebrow t={t}>Why us</Eyebrow><h2 className="text-[28px] font-semibold tracking-[-0.02em]" style={h(t)}>{p.title ?? "Built for the way you work"}</h2><p className="mt-3 text-[15px] leading-relaxed" style={b(t)}>{p.description ?? "A clear value statement, backed by a scannable list of concrete benefits."}</p>
    <ul className="mt-5 grid gap-2.5">{["No code required", "Brand-consistent output", "Export-ready handoff"].map((it) => (<li key={it} className="flex items-center gap-3 text-[14px] font-medium" style={h(t)}><span className="grid h-6 w-6 place-items-center rounded-full text-[12px]" style={{ background: t.accentColor, color: "#fff" }}>✓</span>{it}</li>))}</ul>
    <div className="mt-6"><Btn t={t} label="See how" /></div></div>;
  const img = <Ph t={t} className="h-72" rounded="rounded-3xl" />;
  const imgLeft = p.assetSide === "left";
  return <Band t={t}><div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-2">{imgLeft ? <>{img}{txt}</> : <>{txt}{img}</>}</div></Band>;
});

// 4 — Testimonial Spotlight: single large quote with avatar.
export const TestimonialSpotlight = make((t, p) => (
  <Band t={t} tone="tint"><figure className="mx-auto max-w-3xl text-center"><div className="mb-5 flex justify-center gap-1" style={{ color: t.accentColor }}>{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
    <blockquote className="text-[24px] font-medium leading-snug tracking-[-0.01em]" style={h(t)}>{p.description ?? "“A quote that captures the transformation — specific, credible and free of hype.”"}</blockquote>
    <figcaption className="mt-6 flex items-center justify-center gap-3"><span className="h-11 w-11 rounded-full" style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 12)})`, border: `1px dashed ${t.borderColor}` }} /><span className="text-left"><span className="block text-[14px] font-semibold" style={h(t)}>{p.title ?? "Full Name"}</span><span className="block text-[12.5px]" style={b(t)}>Role, Company</span></span></figcaption></figure></Band>
));

// 5 — Pricing Highlight: single featured plan.
export const PricingHighlight = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-sm overflow-hidden p-7" style={{ ...Elev(t), borderColor: t.accentColor }}>
    <div className="flex items-center justify-between"><span className="text-[15px] font-semibold" style={h(t)}>{p.title ?? "Pro"}</span><Pill t={t}>Most popular</Pill></div>
    <div className="mt-4 flex items-end gap-1"><span className="text-[40px] font-bold tracking-[-0.03em]" style={{ color: t.accentColor, fontFamily: t.headingFont }}>$29</span><span className="pb-2 text-[13px]" style={b(t)}>/mo</span></div>
    <ul className="mt-4 grid gap-2">{["Everything in Starter", "Unlimited projects", "Priority support"].map((it) => (<li key={it} className="flex items-center gap-2.5 text-[13.5px]" style={b(t)}><span style={{ color: t.accentColor }}>✓</span>{it}</li>))}</ul>
    <div className="mt-6"><Btn t={t} label="Start free trial" /></div></div></Band>
));

// 6 — Comparison Row: us vs. them.
export const ComparisonRow = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Comparison" title={p.title ?? "How we compare"} sub={p.description} center />
    <div className="mx-auto max-w-2xl overflow-hidden" style={Elev(t)}>{["Setup time", "No-code editing", "Export-ready handoff", "Brand tokens"].map((row, i) => (
      <div key={row} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5" style={{ borderTop: i ? `1px solid ${t.borderColor}` : "none" }}>
        <span className="text-[14px] font-medium" style={h(t)}>{row}</span>
        <span className="grid h-7 w-7 place-items-center rounded-full text-[13px]" style={{ background: tint(t, 16), color: t.accentColor }}>✓</span>
        <span className="grid h-7 w-7 place-items-center rounded-full text-[13px]" style={{ background: t.surfaceColor, color: t.mutedTextColor }}>—</span>
      </div>))}</div></Band>
));

// 7 — Newsletter Inline: compact signup band.
export const NewsletterInline = make((t, p) => (
  <Band t={t} tone="dark" pad="px-12 py-14"><div className="mx-auto max-w-3xl text-center"><h2 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: "#fff" }}>{p.title ?? "Stay in the loop"}</h2><p className="mx-auto mt-2 max-w-lg text-[14.5px]" style={{ color: "#fff", opacity: 0.7 }}>{p.description ?? "Occasional updates. No spam. Unsubscribe anytime."}</p>
    <div className="mx-auto mt-6 flex max-w-md gap-2"><span className="flex-1 rounded-xl px-4 py-2.5 text-left text-[13.5px]" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", opacity: 0.7 }}>you@email.com</span><Btn t={t} label="Subscribe" /></div></div></Band>
));

// 8 — Metric Cards: KPI cards grid.
export const MetricCards = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="By the numbers" title={p.title ?? "Impact you can measure"} sub={p.description} />
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">{[["+38%", "Conversion"], ["-52%", "Bounce rate"], ["3.2×", "Engagement"]].map(([n, l]) => (
      <div key={l} className="p-6" style={Elev(t)}><div className="text-[32px] font-bold tracking-[-0.03em]" style={{ color: t.accentColor, fontFamily: t.headingFont }}>{n}</div><p className="mt-1 text-[14px] font-medium" style={h(t)}>{l}</p><p className="mt-1 text-[12.5px]" style={b(t)}>vs. previous period</p></div>))}</div></Band>
));

// 9 — Logo Strip: understated partner/client logos.
export const LogoStrip = make((t, p) => (
  <Band t={t} tone="surface" pad="px-12 py-10"><p className="mb-6 text-center text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: t.mutedTextColor }}>{p.title ?? "Trusted by teams everywhere"}</p>
    <div className="mx-auto grid max-w-4xl grid-cols-2 items-center gap-6 sm:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => (<div key={i} className="h-8 rounded-md" style={{ background: t.borderColor, opacity: 0.7 }} />))}</div></Band>
));

// 11 — Marquee Testimonials: an auto-scrolling row of quote cards (Magic UI
// marquee pattern, normalized; pause on hover; reduced-motion renders static).
export const MarqueeTestimonials = make((t, p) => (
  <Band t={t} tone="surface" pad="px-0 py-16">
    <div className="px-12"><Head t={t} eyebrow="Loved by teams" title={p.title ?? "What people say"} sub={p.description} center /></div>
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max gap-4 pl-4 motion-safe:animate-[bmarquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...Array(8)].map((_, i) => (
          <figure key={i} className="w-[280px] shrink-0 p-5" style={Elev(t)}>
            <div className="mb-3 flex gap-1 text-[13px]" style={{ color: t.accentColor }}>{"★★★★★"}</div>
            <blockquote className="text-[14px] leading-relaxed" style={h(t)}>“A concise, credible testimonial slot — swap in real quotes at export.”</blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5"><span className="h-8 w-8 rounded-full" style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 12)})`, border: `1px dashed ${t.borderColor}` }} /><span className="text-[12.5px] font-medium" style={h(t)}>Name · Role</span></figcaption>
          </figure>
        ))}
      </div>
      <style>{"@keyframes bmarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}"}</style>
    </div>
  </Band>
));

// 10 — Capability Tags: pill cluster of skills/services.
export const CapabilityTags = make((t, p) => (
  <Band t={t} tone="dark"><Head t={t} eyebrow="What we do" title={p.title ?? "Capabilities that fit together"} sub={p.description} onDark />
    <div className="flex max-w-3xl flex-wrap gap-2.5">{["Brand Identity", "Design Systems", "Web Design", "Motion", "UX Research", "Development", "Campaigns", "Content"].map((tag, i) => (
      <span key={tag} className="rounded-full px-4 py-2 text-[13px] font-medium" style={i === 0 ? { background: t.accentColor, color: "#fff" } : { background: "rgba(255,255,255,0.08)", color: "#fff" }}>{tag}</span>))}</div></Band>
));
