"use client";

// Reusable BLOCK components — the mid-level of the 3-tier library (atomic →
// block → section). Each block is a real, theme-aware SectionComponent so it
// renders through the same pipeline as full sections (grey wireframe + brand
// design). Blocks compose the same primitives a section uses: heading, text,
// image placeholder, button, icon, card. IMAGE RULE: every image/media slot is
// a grey placeholder — never stock or copied imagery.

import type { SectionProps, SectionTheme } from "../types";
import { resolveTheme, h, b, fill, outline, card, cardRaised, btnRadius } from "../section-theme";

// ---- shared kit ----
const Band: React.FC<{ t: SectionTheme; children: React.ReactNode; tone?: "bg" | "surface"; pad?: string }> = ({ t, children, tone = "bg", pad = "px-10 py-12" }) => (
  <section className={pad} style={{ background: tone === "surface" ? t.surfaceColor : t.backgroundColor, fontFamily: t.bodyFont }}>{children}</section>
);
const Head: React.FC<{ t: SectionTheme; title?: string; sub?: string; center?: boolean }> = ({ t, title, sub, center }) =>
  title || sub ? (
    <div className={center ? "mx-auto mb-8 max-w-2xl text-center" : "mb-8 max-w-2xl"}>
      {title && <h2 className="text-[26px] font-semibold leading-tight" style={h(t)}>{title}</h2>}
      {sub && <p className="mt-2 text-[15px] leading-relaxed" style={b(t)}>{sub}</p>}
    </div>
  ) : null;
// Grey image/media placeholder (with an optional label).
const Ph: React.FC<{ t: SectionTheme; className?: string; label?: string; ratio?: string }> = ({ t, className = "", label, ratio }) => (
  <div className={`grid place-items-center overflow-hidden ${className}`} style={{ background: t.surfaceColor, border: `1px dashed ${t.borderColor}`, borderRadius: t.radius, aspectRatio: ratio }}>
    <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: t.mutedTextColor, opacity: 0.7 }}>{label ?? "image"}</span>
  </div>
);
const Btn: React.FC<{ t: SectionTheme; label: string; kind?: "fill" | "outline" }> = ({ t, label, kind = "fill" }) => (
  <span className="inline-block px-4 py-2 text-[13px] font-medium" style={{ ...(kind === "fill" ? fill(t) : outline(t)), borderRadius: btnRadius(t) }}>{label}</span>
);
const Dot: React.FC<{ t: SectionTheme; n?: string }> = ({ t, n }) => (
  <span className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold" style={{ background: t.accentColor, color: "#fff" }}>{n ?? "★"}</span>
);
const Line: React.FC<{ t: SectionTheme; w?: string }> = ({ t, w = "100%" }) => (
  <span className="block h-2 rounded" style={{ background: t.borderColor, width: w }} />
);

// A tiny factory to keep each block terse.
type BlockFC = React.FC<SectionProps>;
const make = (fn: (t: SectionTheme, p: SectionProps) => React.ReactNode): BlockFC => (p) => <>{fn(resolveTheme(p.theme), p)}</>;

// ── BASIC ──────────────────────────────────────────────────────────────────
export const ImageBox = make((t, p) => (
  <Band t={t}><div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-[200px_1fr] sm:items-center">
    <Ph t={t} className="h-32" /><div><h3 className="text-[18px] font-semibold" style={h(t)}>{p.title ?? "Image box heading"}</h3><p className="mt-1.5 text-[14px]" style={b(t)}>{p.description ?? "Supporting copy that explains this item, paired with a visual."}</p></div>
  </div></Band>
));
export const IconBox = make((t, p) => (
  <Band t={t}><div className="mx-auto max-w-md text-center"><div className="mb-3 flex justify-center"><Dot t={t} /></div><h3 className="text-[18px] font-semibold" style={h(t)}>{p.title ?? "Icon box heading"}</h3><p className="mt-1.5 text-[14px]" style={b(t)}>{p.description ?? "A short benefit statement paired with an icon."}</p></div></Band>
));
export const ButtonGroup = make((t, p) => (
  <Band t={t} pad="px-10 py-8"><div className="flex flex-wrap items-center justify-center gap-3"><Btn t={t} label={p.primaryButtonLabel ?? "Primary action"} /><Btn t={t} label={p.secondaryButtonLabel ?? "Secondary"} kind="outline" /></div></Band>
));
export const CardBlock = make((t, p) => (
  <Band t={t}><div className="mx-auto max-w-sm p-5" style={cardRaised(t)}><div className="mb-3"><Dot t={t} /></div><h3 className="text-[17px] font-semibold" style={h(t)}>{p.title ?? "Card title"}</h3><p className="mt-1.5 text-[13.5px]" style={b(t)}>{p.description ?? "Card body copy with a short supporting sentence."}</p><div className="mt-4"><Btn t={t} label="Learn more" kind="outline" /></div></div></Band>
));
export const CardGrid = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Card grid"} sub={p.description} center />
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => (
      <div key={i} className="p-4" style={card(t)}><div className="mb-2"><Dot t={t} /></div><h4 className="text-[15px] font-semibold" style={h(t)}>Card {i + 1}</h4><p className="mt-1 text-[13px]" style={b(t)}>Short description for this card.</p></div>))}</div></Band>
));
export const FeatureCard = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-sm p-5 text-center" style={cardRaised(t)}><div className="mb-3 flex justify-center"><Dot t={t} /></div><h3 className="text-[17px] font-semibold" style={h(t)}>{p.title ?? "Feature name"}</h3><p className="mt-1.5 text-[13.5px]" style={b(t)}>{p.description ?? "The benefit this feature delivers, in one clear line."}</p></div></Band>
));
export const ServiceCard = make((t, p) => (
  <Band t={t}><div className="mx-auto max-w-sm overflow-hidden" style={cardRaised(t)}><Ph t={t} className="h-32 rounded-none" label="service image" /><div className="p-4"><h3 className="text-[16px] font-semibold" style={h(t)}>{p.title ?? "Service name"}</h3><p className="mt-1 text-[13px]" style={b(t)}>{p.description ?? "What this service includes and who it's for."}</p><div className="mt-3"><Btn t={t} label="Get a quote" /></div></div></div></Band>
));
export const AlertBox = make((t, p) => (
  <Band t={t} pad="px-10 py-8"><div className="mx-auto max-w-2xl rounded-xl p-4" style={{ background: t.surfaceColor, borderLeft: `4px solid ${t.accentColor}`, borderRadius: t.radius }}><p className="text-[14px] font-semibold" style={h(t)}>{p.title ?? "Heads up"}</p><p className="mt-0.5 text-[13.5px]" style={b(t)}>{p.description ?? "An inline alert or callout for important information."}</p></div></Band>
));
export const Quote = make((t, p) => (
  <Band t={t} tone="surface"><figure className="mx-auto max-w-2xl text-center"><div className="text-[40px] leading-none" style={{ color: t.accentColor }}>&ldquo;</div><blockquote className="text-[20px] font-medium leading-snug" style={h(t)}>{p.description ?? "A concise, memorable quote that builds trust and credibility."}</blockquote><figcaption className="mt-3 text-[13px]" style={b(t)}>{p.title ?? "Name, Role"}</figcaption></figure></Band>
));
export const ProgressBar = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Progress"} sub={p.description} />
    <div className="mx-auto grid max-w-xl gap-3">{[80, 65, 45].map((v, i) => (
      <div key={i}><div className="mb-1 flex justify-between text-[12.5px]" style={b(t)}><span>Skill {i + 1}</span><span>{v}%</span></div><div className="h-2.5 rounded-full" style={{ background: t.borderColor }}><div className="h-2.5 rounded-full" style={{ width: `${v}%`, background: t.accentColor }} /></div></div>))}</div></Band>
));
export const Counter = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 text-center">{[["10k+", "Users"], ["4.9", "Rating"], ["120+", "Clients"]].map(([n, l]) => (
    <div key={l}><div className="text-[30px] font-bold" style={{ color: t.accentColor, fontFamily: t.headingFont }}>{n}</div><div className="mt-1 text-[13px]" style={b(t)}>{l}</div></div>))}</div></Band>
));
export const SocialIcons = make((t, p) => (
  <Band t={t} pad="px-10 py-8"><div className="flex items-center justify-center gap-3">{[0, 1, 2, 3].map((i) => (<span key={i} className="grid h-9 w-9 place-items-center rounded-full" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}`, color: t.mutedTextColor }}>◦</span>))}</div></Band>
));
export const IconList = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "What's included"} sub={p.description} />
    <ul className="mx-auto grid max-w-md gap-2.5">{[0, 1, 2, 3].map((i) => (<li key={i} className="flex items-center gap-2.5 text-[14px]" style={b(t)}><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px]" style={{ background: t.accentColor, color: "#fff" }}>✓</span> List item {i + 1}</li>))}</ul></Band>
));
export const ProcessStep = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "How it works"} sub={p.description} center />
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">{[1, 2, 3].map((n) => (<div key={n} className="text-center"><div className="mb-2 flex justify-center"><Dot t={t} n={String(n)} /></div><h4 className="text-[15px] font-semibold" style={h(t)}>Step {n}</h4><p className="mt-1 text-[13px]" style={b(t)}>Describe what happens in this step.</p></div>))}</div></Band>
));
export const TimelineItem = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Timeline"} sub={p.description} />
    <div className="mx-auto max-w-md">{[1, 2, 3].map((n) => (<div key={n} className="flex gap-3 pb-5"><div className="flex flex-col items-center"><Dot t={t} n={String(n)} />{n < 3 && <span className="mt-1 w-px flex-1" style={{ background: t.borderColor }} />}</div><div className="pt-1"><h4 className="text-[14.5px] font-semibold" style={h(t)}>Milestone {n}</h4><p className="text-[13px]" style={b(t)}>What happened at this point.</p></div></div>))}</div></Band>
));

// ── CONTENT ──────────────────────────────────────────────────────────────────
export const TeamCard = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Meet the team"} sub={p.description} center />
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="p-4 text-center" style={card(t)}><div className="mx-auto mb-3 h-16 w-16 rounded-full" style={{ background: t.surfaceColor, border: `1px dashed ${t.borderColor}` }} /><h4 className="text-[14.5px] font-semibold" style={h(t)}>Team Member</h4><p className="text-[12.5px]" style={b(t)}>Role / title</p></div>))}</div></Band>
));
export const BlogCard = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "From the blog"} sub={p.description} center />
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="overflow-hidden" style={cardRaised(t)}><Ph t={t} className="h-28 rounded-none" /><div className="p-3.5"><span className="text-[11px] font-medium" style={{ color: t.accentColor }}>Category</span><h4 className="mt-1 text-[14.5px] font-semibold leading-snug" style={h(t)}>Article title goes here</h4><p className="mt-1 text-[12.5px]" style={b(t)}>A short excerpt from the post.</p></div></div>))}</div></Band>
));
export const CaseStudyCard = make((t, p) => (
  <Band t={t} tone="surface"><Head t={t} title={p.title ?? "Results we've delivered"} sub={p.description} center />
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">{[["+38%", "Conversion lift"], ["3.2x", "Pipeline growth"]].map(([n, l]) => (<div key={l} className="p-5" style={cardRaised(t)}><div className="text-[28px] font-bold" style={{ color: t.accentColor, fontFamily: t.headingFont }}>{n}</div><p className="mt-1 text-[13.5px] font-medium" style={h(t)}>{l}</p><p className="mt-1 text-[12.5px]" style={b(t)}>Short context about how this result was achieved.</p></div>))}</div></Band>
));
export const FaqItem = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Frequently asked"} sub={p.description} />
    <div className="mx-auto grid max-w-2xl gap-2.5">{[0, 1, 2].map((i) => (<div key={i} className="p-4" style={card(t)}><div className="flex items-center justify-between"><span className="text-[14.5px] font-semibold" style={h(t)}>A common question {i + 1}?</span><span style={{ color: t.mutedTextColor }}>+</span></div><p className="mt-1.5 text-[13px]" style={b(t)}>A clear, concise answer to the question.</p></div>))}</div></Band>
));
export const ContactInfo = make((t, p) => (
  <Band t={t}><Head t={t} title={p.title ?? "Get in touch"} sub={p.description} />
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">{[["Address", "123 Example St"], ["Phone", "+1 (000) 000-0000"], ["Email", "hello@brand.com"]].map(([l, v]) => (<div key={l} className="p-4" style={card(t)}><div className="mb-1.5"><Dot t={t} /></div><p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: t.mutedTextColor }}>{l}</p><p className="text-[14px] font-medium" style={h(t)}>{v}</p></div>))}</div></Band>
));
export const LocationCard = make((t, p) => (
  <Band t={t}><div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 sm:items-center"><Ph t={t} className="h-40" label="map" /><div><h3 className="text-[18px] font-semibold" style={h(t)}>{p.title ?? "Visit us"}</h3><p className="mt-1.5 text-[14px]" style={b(t)}>{p.description ?? "123 Example Street, Suite 100\nCity, Country"}</p><div className="mt-3"><Btn t={t} label="Get directions" kind="outline" /></div></div></div></Band>
));

// ── MEDIA ──────────────────────────────────────────────────────────────────
export const ImagePlaceholder = make((t, p) => (<Band t={t}><Ph t={t} className="mx-auto h-64 max-w-4xl" label={p.title ?? "image placeholder"} /></Band>));
export const VideoBlock = make((t, p) => (
  <Band t={t}><div className="relative mx-auto h-64 max-w-4xl"><Ph t={t} className="h-full" label="video" /><span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: t.accentColor, color: "#fff" }}>▶</span></span></div></Band>
));
export const ProductMockup = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-4xl overflow-hidden" style={cardRaised(t)}><div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: t.borderColor }}>{[0, 1, 2].map((i) => (<span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: t.borderColor }} />))}</div><div className="grid gap-2 p-6"><Line t={t} w="40%" /><Line t={t} w="80%" /><Line t={t} w="60%" /><Ph t={t} className="mt-2 h-32" /></div></div></Band>
));
export const DashboardMockup = make((t, p) => (
  <Band t={t} tone="surface"><div className="mx-auto max-w-4xl overflow-hidden" style={cardRaised(t)}><div className="grid grid-cols-[140px_1fr]"><div className="grid gap-2 border-r p-4" style={{ borderColor: t.borderColor }}>{[0, 1, 2, 3].map((i) => <Line key={i} t={t} w="90%" />)}</div><div className="grid gap-3 p-4"><div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => (<div key={i} className="p-3" style={card(t)}><Line t={t} w="60%" /><div className="mt-2 text-[18px] font-bold" style={{ color: t.accentColor }}>00</div></div>))}</div><Ph t={t} className="h-28" label="chart" /></div></div></div></Band>
));
export const DeviceMockup = make((t, p) => (
  <Band t={t}><div className="mx-auto w-[220px] rounded-[28px] p-3" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }}><div className="rounded-[18px] p-4" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}><div className="mx-auto mb-3 h-1.5 w-10 rounded-full" style={{ background: t.borderColor }} /><Line t={t} w="70%" /><div className="mt-2" /><Ph t={t} className="h-40" /></div></div></Band>
));
