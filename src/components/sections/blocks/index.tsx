"use client";

// Reusable BLOCK components — the mid-level of the 3-tier library (atomic →
// block → section). Each block is a real, theme-aware SectionComponent so it
// renders through the same pipeline as full sections (grey wireframe + brand
// design). These are MODERN, editorial layouts (accent gradients, dark panels,
// pill chips, elevated bento cards) — all driven by brand tokens, so nothing is
// hardcoded. IMAGE RULE: every image/media slot is a grey placeholder — never
// stock or copied imagery.

import type { SectionProps, SectionTheme } from "../types";
import { resolveTheme, h, b, btnRadius } from "../section-theme";
import { HiddenParts, useHidden } from "./parts";

// ---- modern theme helpers (all derived from brand tokens) ----
const tint = (t: SectionTheme, pct = 12) => `color-mix(in srgb, ${t.accentColor} ${pct}%, ${t.backgroundColor})`;
const grad = (t: SectionTheme) => `linear-gradient(135deg, ${t.accentColor}, color-mix(in srgb, ${t.accentColor} 55%, #0b0b12))`;
const darkBg = (t: SectionTheme) => `color-mix(in srgb, ${t.textColor} 90%, #000)`;

// ---- shared kit ----
const Band: React.FC<{ t: SectionTheme; children: React.ReactNode; tone?: "bg" | "surface" | "tint" | "dark" | "grad"; pad?: string }> = ({ t, children, tone = "bg", pad = "px-12 py-16" }) => {
  const bg = tone === "surface" ? t.surfaceColor : tone === "tint" ? tint(t, 8) : tone === "dark" ? darkBg(t) : tone === "grad" ? grad(t) : t.backgroundColor;
  return <section className={pad} style={{ background: bg, fontFamily: t.bodyFont }}>{children}</section>;
};
const Eyebrow: React.FC<{ t: SectionTheme; children: React.ReactNode; onDark?: boolean }> = ({ t, children, onDark }) => {
  if (useHidden("eyebrow")) return null;
  return <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: onDark ? "#fff" : t.accentColor, opacity: onDark ? 0.8 : 1 }}>{children}</span>;
};
const Head: React.FC<{ t: SectionTheme; title?: string; sub?: string; center?: boolean; eyebrow?: string; onDark?: boolean }> = ({ t, title, sub, center, eyebrow, onDark }) =>
  title || sub || eyebrow ? (
    <div className={center ? "mx-auto mb-10 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
      {eyebrow && <Eyebrow t={t} onDark={onDark}>{eyebrow}</Eyebrow>}
      {title && <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em]" style={{ fontFamily: t.headingFont, color: onDark ? "#fff" : t.textColor }}>{title}</h2>}
      {sub && <p className="mt-3 text-[15px] leading-relaxed" style={{ color: onDark ? "#fff" : t.mutedTextColor, opacity: onDark ? 0.75 : 1 }}>{sub}</p>}
    </div>
  ) : null;
// Accent icon chip (rounded square).
const Chip: React.FC<{ t: SectionTheme; children?: React.ReactNode; solid?: boolean }> = ({ t, children, solid }) => {
  if (useHidden("icon")) return null;
  return <span className="grid h-11 w-11 place-items-center rounded-2xl text-[15px] font-semibold" style={solid ? { background: t.accentColor, color: "#fff" } : { background: tint(t, 16), color: t.accentColor, border: `1px solid ${tint(t, 30)}` }}>{children ?? "◆"}</span>;
};
const Pill: React.FC<{ t: SectionTheme; children: React.ReactNode; onDark?: boolean }> = ({ t, children, onDark }) => (
  <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium" style={onDark ? { background: "rgba(255,255,255,0.1)", color: "#fff" } : { background: t.surfaceColor, color: t.textColor, border: `1px solid ${t.borderColor}` }}>{children}</span>
);
// Grey media placeholder with a soft tint + optional label.
const Ph: React.FC<{ t: SectionTheme; className?: string; label?: string; rounded?: string }> = ({ t, className = "", label, rounded = "rounded-2xl" }) => (
  <div className={`grid place-items-center overflow-hidden ${rounded} ${className}`} style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 6)})`, border: `1px dashed ${t.borderColor}` }}>
    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: t.mutedTextColor, opacity: 0.6 }}>{label ?? "image"}</span>
  </div>
);
const Btn: React.FC<{ t: SectionTheme; label: string; kind?: "fill" | "ghost" }> = ({ t, label, kind = "fill" }) => {
  if (useHidden("button")) return null;
  return <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13.5px] font-semibold" style={kind === "fill" ? { background: grad(t), color: "#fff", borderRadius: btnRadius(t) } : { color: t.accentColor, border: `1px solid ${tint(t, 40)}`, borderRadius: btnRadius(t) }}>{label}{kind === "fill" ? " →" : ""}</span>;
};
const Elev = (t: SectionTheme) => ({ background: t.backgroundColor, borderRadius: "20px", border: `1px solid ${t.borderColor}`, boxShadow: "0 1px 2px rgba(16,16,20,0.04), 0 12px 32px -12px rgba(16,16,20,0.12)" });

type BlockFC = React.FC<SectionProps>;
const make = (fn: (t: SectionTheme, p: SectionProps) => React.ReactNode): BlockFC => (p) => <HiddenParts.Provider value={new Set(p.hidden)}>{fn(resolveTheme(p.theme), p)}</HiddenParts.Provider>;

// ── BASIC ──────────────────────────────────────────────────────────────────
export const ImageBox = make((t, p) => {
  const img = <Ph t={t} className="h-56" />;
  const txt = <div><Chip t={t} /><h3 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]" style={h(t)}>{p.title ?? "Image box heading"}</h3><p className="mt-2 text-[15px] leading-relaxed" style={b(t)}>{p.description ?? "Pair a strong visual with a clear, benefit-led message and a subtle link."}</p><div className="mt-4 text-[13.5px] font-semibold" style={{ color: t.accentColor }}>Learn more →</div></div>;
  const imgRight = p.assetSide === "right";
  return <Band t={t}><div className="mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-2">{imgRight ? <>{txt}{img}</> : <>{img}{txt}</>}</div></Band>;
});
export const IconBox = make((t, p) => (
  <Band t={t} tone="tint"><div className="mx-auto max-w-md text-center"><div className="mb-4 flex justify-center"><Chip t={t} solid /></div><h3 className="text-[22px] font-semibold tracking-[-0.02em]" style={h(t)}>{p.title ?? "Icon box heading"}</h3><p className="mt-2 text-[15px] leading-relaxed" style={b(t)}>{p.description ?? "A concise benefit statement anchored by a bold accent icon."}</p></div></Band>
));
export const ButtonGroup = make((t, p) => (
  <Band t={t} pad="px-12 py-10"><div className="flex flex-wrap items-center justify-center gap-3"><Btn t={t} label={p.primaryButtonLabel ?? "Get started"} /><Btn t={t} label={p.secondaryButtonLabel ?? "Learn more"} kind="ghost" /></div></Band>
));
export const CardBlock = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-sm p-6" style={Elev(t)}><Chip t={t} /><h3 className="mt-4 text-[19px] font-semibold" style={h(t)}>{p.title ?? "Card title"}</h3><p className="mt-2 text-[14px] leading-relaxed" style={b(t)}>{p.description ?? "A refined card with an accent icon, tight heading and a clear action."}</p><div className="mt-5"><Btn t={t} label="Explore" kind="ghost" /></div></div></Band>
));
export const CardGrid = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="What you get" title={p.title ?? "Everything, in one place"} sub={p.description} center />
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">{["Fast setup", "Scales with you", "Secure by default"].map((title, i) => (
      <div key={i} className="p-6" style={Elev(t)}><Chip t={t} /><h4 className="mt-4 text-[17px] font-semibold" style={h(t)}>{title}</h4><p className="mt-1.5 text-[13.5px] leading-relaxed" style={b(t)}>A crisp supporting line that explains the value clearly.</p></div>))}</div></Band>
));
export const FeatureCard = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-sm overflow-hidden p-6" style={Elev(t)}><div className="mb-4"><Chip t={t} solid /></div><h3 className="text-[19px] font-semibold" style={h(t)}>{p.title ?? "Feature name"}</h3><p className="mt-2 text-[14px] leading-relaxed" style={b(t)}>{p.description ?? "The outcome this feature unlocks, written as a single confident line."}</p><div className="mt-4 flex flex-wrap gap-2"><Pill t={t}>Fast</Pill><Pill t={t}>Reliable</Pill></div></div></Band>
));
export const ServiceCard = make((t, p) => (
  <Band t={t}><div className="mx-auto max-w-sm overflow-hidden" style={Elev(t)}><Ph t={t} className="h-40" rounded="rounded-none" label="service image" /><div className="p-6"><Pill t={t}>Service</Pill><h3 className="mt-3 text-[19px] font-semibold" style={h(t)}>{p.title ?? "Service name"}</h3><p className="mt-1.5 text-[14px] leading-relaxed" style={b(t)}>{p.description ?? "What's included and who it's for, in one clear sentence."}</p><div className="mt-4"><Btn t={t} label="Get a quote" /></div></div></div></Band>
));
export const AlertBox = make((t, p) => (
  <Band t={t} pad="px-12 py-10"><div className="mx-auto flex max-w-2xl items-start gap-4 rounded-2xl p-5" style={{ background: tint(t, 10), border: `1px solid ${tint(t, 28)}` }}><Chip t={t} solid>!</Chip><div><p className="text-[15px] font-semibold" style={h(t)}>{p.title ?? "Heads up"}</p><p className="mt-0.5 text-[14px] leading-relaxed" style={b(t)}>{p.description ?? "An accent-tinted callout for important, can't-miss information."}</p></div></div></Band>
));
export const Quote = make((t, p) => (
  <Band t={t} tone="dark"><figure className="mx-auto max-w-3xl text-center"><div className="text-[64px] leading-[0.4]" style={{ color: t.accentColor }}>&ldquo;</div><blockquote className="mt-4 text-[26px] font-medium leading-snug tracking-[-0.01em]" style={{ color: "#fff", fontFamily: t.headingFont }}>{p.description ?? "A memorable, high-trust quote set large on a dramatic dark panel."}</blockquote><figcaption className="mt-6 text-[13.5px]" style={{ color: "#fff", opacity: 0.65 }}>{p.title ?? "Name — Role, Company"}</figcaption></figure></Band>
));
export const ProgressBar = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Capabilities" title={p.title ?? "Where we excel"} sub={p.description} />
    <div className="mx-auto grid max-w-xl gap-5">{[["Strategy", 88], ["Design", 74], ["Delivery", 92]].map(([l, v]) => (
      <div key={l as string}><div className="mb-2 flex justify-between text-[13px] font-medium" style={h(t)}><span>{l}</span><span style={{ color: t.accentColor }}>{v}%</span></div><div className="h-2.5 rounded-full" style={{ background: t.surfaceColor }}><div className="h-2.5 rounded-full" style={{ width: `${v}%`, background: grad(t) }} /></div></div>))}</div></Band>
));
export const Counter = make((t, p) => (
  <Band t={t} tone="tint"><div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 text-center">{[["10k+", "Active users"], ["4.9/5", "Avg. rating"], ["120+", "Happy clients"]].map(([n, l], i) => (
    <div key={l} className={i > 0 ? "border-l" : ""} style={{ borderColor: t.borderColor }}><div className="text-[42px] font-bold tracking-[-0.03em]" style={{ color: t.accentColor, fontFamily: t.headingFont }}>{n}</div><div className="mt-1 text-[13.5px] font-medium" style={b(t)}>{l}</div></div>))}</div></Band>
));
export const SocialIcons = make((t, p) => (
  <Band t={t} pad="px-12 py-10"><div className="flex items-center justify-center gap-3">{["in", "X", "f", "◦"].map((s, i) => (<span key={i} className="grid h-11 w-11 place-items-center rounded-full text-[13px] font-semibold transition-transform" style={{ background: tint(t, 12), border: `1px solid ${tint(t, 26)}`, color: t.accentColor }}>{s}</span>))}</div></Band>
));
export const IconList = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Included" title={p.title ?? "Everything you need"} sub={p.description} />
    <ul className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">{["Unlimited projects", "Priority support", "Custom domains", "Team access"].map((it) => (<li key={it} className="flex items-center gap-3 rounded-xl p-3" style={{ background: t.surfaceColor }}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px]" style={{ background: t.accentColor, color: "#fff" }}>✓</span><span className="text-[14px] font-medium" style={h(t)}>{it}</span></li>))}</ul></Band>
));
export const ProcessStep = make((t, p) => (
  <Band t={t} tone="surface"><Head t={t} eyebrow="How it works" title={p.title ?? "Three simple steps"} sub={p.description} center />
    <div className="relative mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
      <div className="pointer-events-none absolute left-[16%] right-[16%] top-6 hidden h-px sm:block" style={{ background: t.borderColor }} />
      {["Brief", "Build", "Launch"].map((title, i) => (<div key={title} className="relative text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl text-[16px] font-bold" style={{ background: grad(t), color: "#fff" }}>{i + 1}</div><h4 className="text-[16px] font-semibold" style={h(t)}>{title}</h4><p className="mt-1 text-[13.5px] leading-relaxed" style={b(t)}>A clear line describing what happens in this step.</p></div>))}</div></Band>
));
export const TimelineItem = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Journey" title={p.title ?? "Our timeline"} sub={p.description} />
    <div className="mx-auto max-w-lg">{["Kickoff", "Design sprint", "Handoff"].map((title, i, a) => (<div key={title} className="flex gap-4 pb-6"><div className="flex flex-col items-center"><span className="grid h-10 w-10 place-items-center rounded-2xl text-[14px] font-bold" style={{ background: grad(t), color: "#fff" }}>{i + 1}</span>{i < a.length - 1 && <span className="mt-1 w-px flex-1" style={{ background: t.borderColor }} />}</div><div className="pt-1.5"><h4 className="text-[16px] font-semibold" style={h(t)}>{title}</h4><p className="text-[13.5px] leading-relaxed" style={b(t)}>What happens at this milestone, described briefly.</p></div></div>))}</div></Band>
));

// ── CONTENT ──────────────────────────────────────────────────────────────────
export const TeamCard = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="The team" title={p.title ?? "The people behind it"} sub={p.description} center />
    <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="p-6 text-center" style={Elev(t)}><div className="mx-auto mb-4 h-20 w-20 rounded-full" style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 10)})`, border: `1px dashed ${t.borderColor}` }} /><h4 className="text-[16px] font-semibold" style={h(t)}>Team Member</h4><p className="text-[13px]" style={{ color: t.accentColor }}>Role / title</p></div>))}</div></Band>
));
export const BlogCard = make((t, p) => (
  <Band t={t} tone="surface"><Head t={t} eyebrow="Insights" title={p.title ?? "From the blog"} sub={p.description} center />
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="overflow-hidden" style={Elev(t)}><Ph t={t} className="h-36" rounded="rounded-none" /><div className="p-5"><Pill t={t}>Category</Pill><h4 className="mt-3 text-[16px] font-semibold leading-snug" style={h(t)}>An article title that draws the reader in</h4><p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>A short excerpt from the post.</p></div></div>))}</div></Band>
));
export const CaseStudyCard = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="Results" title={p.title ?? "Outcomes we've delivered"} sub={p.description} center />
    <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">{[["+38%", "Conversion lift"], ["3.2×", "Pipeline growth"]].map(([n, l], i) => (<div key={l} className="overflow-hidden p-7" style={{ borderRadius: "22px", background: i === 0 ? grad(t) : darkBg(t) }}><div className="text-[46px] font-bold tracking-[-0.03em]" style={{ color: "#fff" }}>{n}</div><p className="mt-1 text-[15px] font-semibold" style={{ color: "#fff" }}>{l}</p><p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#fff", opacity: 0.7 }}>Short context on how this result was achieved.</p></div>))}</div></Band>
));
export const FaqItem = make((t, p) => (
  <Band t={t}><Head t={t} eyebrow="FAQ" title={p.title ?? "Frequently asked"} sub={p.description} />
    <div className="mx-auto grid max-w-2xl gap-3">{["A common question people ask?", "How does pricing work?", "Can I cancel anytime?"].map((q, i) => (<div key={i} className="p-5" style={Elev(t)}><div className="flex items-center justify-between gap-3"><span className="text-[15px] font-semibold" style={h(t)}>{q}</span><span className="grid h-6 w-6 place-items-center rounded-full text-[13px]" style={{ background: tint(t, 14), color: t.accentColor }}>{i === 0 ? "–" : "+"}</span></div>{i === 0 && <p className="mt-2 text-[13.5px] leading-relaxed" style={b(t)}>A clear, concise answer to the question.</p>}</div>))}</div></Band>
));
export const ContactInfo = make((t, p) => (
  <Band t={t} tone="surface"><Head t={t} eyebrow="Contact" title={p.title ?? "Get in touch"} sub={p.description} />
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">{[["Address", "123 Example St"], ["Phone", "+1 (000) 000-0000"], ["Email", "hello@brand.com"]].map(([l, v]) => (<div key={l} className="p-5" style={Elev(t)}><Chip t={t} /><p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: t.accentColor }}>{l}</p><p className="mt-0.5 text-[14.5px] font-medium" style={h(t)}>{v}</p></div>))}</div></Band>
));
export const LocationCard = make((t, p) => {
  const map = <Ph t={t} className="h-52" label="map" />;
  const info = <div><Eyebrow t={t}>Find us</Eyebrow><h3 className="text-[24px] font-semibold tracking-[-0.02em]" style={h(t)}>{p.title ?? "Visit our studio"}</h3><p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed" style={b(t)}>{p.description ?? "123 Example Street, Suite 100\nCity, Country"}</p><div className="mt-4"><Btn t={t} label="Get directions" kind="ghost" /></div></div>;
  const mapRight = p.assetSide === "right";
  return <Band t={t}><div className="mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-2">{mapRight ? <>{info}{map}</> : <>{map}{info}</>}</div></Band>;
});

// ── MEDIA ──────────────────────────────────────────────────────────────────
export const ImagePlaceholder = make((t, p) => (<Band t={t}><Ph t={t} className="mx-auto h-72 max-w-5xl" rounded="rounded-3xl" label={p.title ?? "image placeholder"} /></Band>));
export const VideoBlock = make((t, p) => (
  <Band t={t}><div className="relative mx-auto h-72 max-w-5xl overflow-hidden rounded-3xl" style={{ border: `1px dashed ${t.borderColor}` }}><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.surfaceColor}, ${tint(t, 10)})` }} /><span className="absolute inset-0 grid place-items-center"><span className="grid h-16 w-16 place-items-center rounded-full text-[18px]" style={{ background: grad(t), color: "#fff", boxShadow: "0 12px 32px -8px rgba(16,16,20,0.4)" }}>▶</span></span></div></Band>
));
export const ProductMockup = make((t, p) => (
  <Band t={t} tone="tint"><div className="mx-auto max-w-4xl overflow-hidden" style={{ ...Elev(t), borderRadius: "20px" }}><div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: t.borderColor, background: t.surfaceColor }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => (<span key={c} className="h-3 w-3 rounded-full" style={{ background: c, opacity: 0.5 }} />))}<span className="ml-3 h-5 flex-1 rounded-md" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }} /></div><div className="grid gap-3 p-8"><div className="h-3 w-2/5 rounded" style={{ background: t.borderColor }} /><div className="h-3 w-4/5 rounded" style={{ background: t.borderColor }} /><Ph t={t} className="mt-2 h-40" /></div></div></Band>
));
export const DashboardMockup = make((t, p) => (
  <Band t={t} tone="tint"><div className="mx-auto max-w-4xl overflow-hidden" style={{ ...Elev(t), borderRadius: "20px" }}><div className="grid grid-cols-[160px_1fr]"><div className="grid content-start gap-3 border-r p-5" style={{ borderColor: t.borderColor, background: t.surfaceColor }}><div className="h-8 w-8 rounded-lg" style={{ background: grad(t) }} />{[0, 1, 2, 3].map((i) => <div key={i} className="h-2.5 rounded" style={{ background: t.borderColor, width: `${80 - i * 8}%` }} />)}</div><div className="grid gap-4 p-6"><div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => (<div key={i} className="p-4" style={{ borderRadius: "14px", border: `1px solid ${t.borderColor}` }}><div className="h-2 w-1/2 rounded" style={{ background: t.borderColor }} /><div className="mt-2 text-[22px] font-bold" style={{ color: t.accentColor }}>0{i + 1}</div></div>))}</div><Ph t={t} className="h-32" label="chart" /></div></div></div></Band>
));
export const DeviceMockup = make((t, p) => (
  <Band t={t}><div className="mx-auto w-[240px] rounded-[36px] p-3" style={{ background: darkBg(t), boxShadow: "0 24px 60px -20px rgba(16,16,20,0.5)" }}><div className="overflow-hidden rounded-[26px] p-5" style={{ background: t.backgroundColor }}><div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: t.borderColor }} /><div className="h-3 w-3/5 rounded" style={{ background: t.borderColor }} /><Ph t={t} className="mt-3 h-44" /><div className="mt-3"><Btn t={t} label="Open" /></div></div></div></Band>
));
