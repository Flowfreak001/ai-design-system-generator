"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem, AnimatedHeading } from "@/components/ui/motion";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

const EASE = [0.22, 1, 0.36, 1] as const;

function Wrap({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`mx-auto max-w-[1240px] px-5 py-20 sm:px-12 sm:py-28 ${className}`}>{children}</section>;
}

const gridPaper = (ink = "0,0,0", op = 0.06) => ({
  backgroundImage: `linear-gradient(rgba(${ink},${op}) 1px, transparent 1px), linear-gradient(90deg, rgba(${ink},${op}) 1px, transparent 1px)`,
  backgroundSize: "22px 22px",
});

/* ───────────── 1 · Platform pillars (colorful tiles) ───────────── */
const PILLARS = [
  {
    title: "Studio",
    href: "/#workflow",
    desc: "Turn a client brief into brand, sitemap and wireframes.",
    bg: "#E7F8EC", ink: "#14532D", stroke: "#16A34A",
    art: (
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="18" y="20" width="52" height="66" rx="4" />
        <path d="M30 38h28M30 50h28M30 62h18" strokeWidth="4" />
        <rect x="66" y="52" width="34" height="40" rx="4" fill="#fff" />
        <path d="M74 70l7 7 14-14" />
      </g>
    ),
  },
  {
    title: "Section Library",
    href: "/#library",
    desc: "Reusable, brand-driven components for every page.",
    bg: "#FFE8E3", ink: "#9F1239", stroke: "#EF4444",
    art: (
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <rect x="16" y="18" width="40" height="24" rx="4" />
        <rect x="64" y="18" width="36" height="24" rx="4" />
        <rect x="16" y="50" width="36" height="40" rx="4" />
        <rect x="60" y="50" width="40" height="40" rx="4" fill="#fff" />
        <path d="M68 62h24M68 72h16" strokeWidth="4" strokeLinecap="round" />
      </g>
    ),
  },
  {
    title: "Export & Connect",
    href: "/#export",
    desc: "Hand off to Claude, Cursor, Lovable, Figma & Webflow.",
    bg: "#E4EEFF", ink: "#1E3A8A", stroke: "#3B82F6",
    art: (
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="14" y="30" width="40" height="30" rx="4" />
        <path d="M54 45h24m0 0-9-9m9 9-9 9" />
        <rect x="74" y="30" width="24" height="24" rx="6" fill="#fff" />
        <circle cx="30" cy="72" r="7" /><circle cx="54" cy="80" r="7" /><circle cx="82" cy="72" r="7" />
        <path d="M36 70l12 6M60 78l16-4" strokeWidth="3" />
      </g>
    ),
  },
];

export function PlatformPillars() {
  return (
    <Wrap id="product">
      <div className="mx-auto max-w-3xl text-center">
        <AnimatedHeading
          text="One platform, from brief to build-ready."
          className="font-bold tracking-tight text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05]"
        />
        <FadeUp delay={0.06}>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Flowfreak is the agency workspace that turns a short client brief into brand guidelines,
            sitemaps, wireframes, component-based page designs and export-ready prompts — one connected
            workflow from first note to final handoff.
          </p>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/#workflow" size="lg">Explore the platform</LinkButton>
          </div>
        </FadeUp>
      </div>

      <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
        {PILLARS.map((p) => (
          <StaggerItem key={p.title}>
            <a href={p.href} className="group block overflow-hidden rounded-[24px] transition-transform duration-300 hover:-translate-y-1" style={{ backgroundColor: p.bg }}>
              <div className="px-7 pt-7">
                <h3 className="text-[26px] font-bold tracking-tight" style={{ color: p.ink }}>{p.title}</h3>
              </div>
              <div className="relative mx-4 mt-4 aspect-[16/11] overflow-hidden rounded-2xl" style={{ backgroundColor: "color-mix(in srgb, " + p.bg + " 55%, #fff)", ...gridPaper(p.stroke === "#16A34A" ? "22,101,52" : p.stroke === "#EF4444" ? "159,18,57" : "30,58,138", 0.1) }}>
                <svg viewBox="0 0 116 108" className="absolute inset-0 h-full w-full p-6" style={{ color: p.stroke }}>{p.art}</svg>
              </div>
              <div className="flex items-end justify-between gap-4 px-7 pb-7 pt-6">
                <p className="text-[15px] font-medium leading-snug" style={{ color: p.ink }}>{p.desc}</p>
                <span className="grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1" style={{ color: p.ink }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </Wrap>
  );
}

/* ───────────── 2 · On-scroll component carousel (real section previews) ───────────── */
const bar = (w: string, c = "bg-panel") => <div className={`h-1.5 rounded ${c}`} style={{ width: w }} />;

const SEC_HERO = (
  <div className="rounded-lg bg-surface p-3">
    <p className="text-[11px] font-bold leading-tight text-ink">Grow your business with confidence.</p>
    <p className="mt-1 text-[8px] leading-snug text-muted">A modern website that turns visitors into booked clients.</p>
    <div className="mt-2 flex items-center gap-1.5"><span className="rounded bg-accent px-2 py-1 text-[8px] font-semibold text-white">Get started</span><span className="rounded border border-line px-2 py-1 text-[8px] font-semibold text-body">Learn more</span></div>
    <div className="mt-2.5 grid aspect-[16/7] place-items-center rounded bg-panel"><div className="size-5 rounded-full bg-line" /></div>
  </div>
);
const SEC_HEADER = (
  <div className="rounded-lg bg-surface p-3">
    <div className="flex items-center gap-2 border-b border-line pb-2">
      <div className="flex items-center gap-1"><span className="size-2.5 rounded bg-accent" /><span className="text-[9px] font-bold text-ink">Brand</span></div>
      <div className="ml-1 flex gap-2 text-[7.5px] text-muted"><span>Product</span><span>Pricing</span><span>About</span></div>
      <span className="ml-auto rounded bg-accent px-1.5 py-0.5 text-[7.5px] font-semibold text-white">Sign up</span>
    </div>
    <div className="mt-2.5 grid grid-cols-3 gap-1.5">{[0,1,2].map(k=><div key={k} className="rounded bg-panel/70 p-1.5">{bar("70%","bg-line")}<div className="mt-1">{bar("90%","bg-line")}</div></div>)}</div>
  </div>
);
const SEC_SERVICE = (
  <div className="rounded-lg bg-surface p-3">
    <p className="mb-2 text-[10px] font-bold text-ink">What we do</p>
    <div className="grid grid-cols-3 gap-1.5">{["Design","Build","Grow"].map((s)=>(
      <div key={s} className="rounded-md border border-line p-2"><span className="grid size-4 place-items-center rounded bg-accent-soft"><span className="size-1.5 rounded-full bg-accent" /></span><p className="mt-1.5 text-[8px] font-semibold text-ink">{s}</p><div className="mt-1">{bar("100%")}</div></div>
    ))}</div>
  </div>
);
const SEC_PRICING = (
  <div className="rounded-lg bg-surface p-3">
    <div className="grid grid-cols-2 gap-1.5">
      <div className="rounded-md border border-line p-2"><p className="text-[7px] font-semibold uppercase text-faint">Starter</p><p className="text-[13px] font-bold text-ink">$0</p><div className="mt-1 space-y-1">{bar("90%")}{bar("70%")}</div></div>
      <div className="rounded-md border-2 border-accent p-2"><p className="text-[7px] font-semibold uppercase text-accent">Pro</p><p className="text-[13px] font-bold text-ink">$29</p><div className="mt-1 space-y-1">{bar("90%")}{bar("80%")}</div><div className="mt-1.5 rounded bg-accent py-0.5 text-center text-[7.5px] font-semibold text-white">Choose</div></div>
    </div>
  </div>
);
const SEC_BOOKING = (
  <div className="rounded-lg bg-surface p-3">
    <p className="mb-2 text-[10px] font-bold text-ink">Book a call</p>
    <div className="space-y-1.5">
      <div className="rounded border border-line px-2 py-1 text-[8px] text-faint">Full name</div>
      <div className="rounded border border-line px-2 py-1 text-[8px] text-faint">you@email.com</div>
      <div className="grid grid-cols-2 gap-1.5"><div className="rounded border border-line px-2 py-1 text-[8px] text-faint">Date</div><div className="rounded border border-line px-2 py-1 text-[8px] text-faint">Time</div></div>
      <div className="rounded bg-accent py-1 text-center text-[8px] font-semibold text-white">Request booking</div>
    </div>
  </div>
);
const SEC_TESTI = (
  <div className="rounded-lg bg-surface p-3">
    <div className="flex gap-0.5 text-accent">{[0,1,2,3,4].map(k=><svg key={k} width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6L21 9.3l-4.5 4.2 1.1 6.2L12 16.9 6.4 19.7l1.1-6.2L3 9.3l6.4-.7L12 3Z" /></svg>)}</div>
    <p className="mt-2 text-[9px] font-medium leading-snug text-body">“Flowfreak turns a messy brief into a real plan in minutes.”</p>
    <div className="mt-2.5 flex items-center gap-1.5"><span className="size-5 rounded-full bg-panel" /><div>{bar("40px","bg-line")}<div className="mt-1">{bar("28px","bg-line")}</div></div></div>
  </div>
);
const SEC_FAQ = (
  <div className="rounded-lg bg-surface p-3">
    <p className="mb-2 text-[10px] font-bold text-ink">FAQ</p>
    {["How does pricing work?","Can I export my site?","Do you offer support?"].map((q,i)=>(
      <div key={q} className={`flex items-center justify-between border-t border-line py-1.5 ${i===0?"border-t-0":""}`}><span className="text-[8.5px] font-medium text-body">{q}</span><svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="text-faint"><path d={i===0?"M6 12h12":"M12 6v12M6 12h12"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>
    ))}
  </div>
);
const SEC_FOOTER = (
  <div className="rounded-lg bg-ink p-3 text-white">
    <div className="flex items-center gap-1"><span className="size-2.5 rounded bg-accent" /><span className="text-[9px] font-bold">Brand</span></div>
    <div className="mt-2 grid grid-cols-3 gap-2">{[0,1,2].map(k=><div key={k} className="space-y-1">{bar("70%","bg-white/20")}{bar("90%","bg-white/10")}{bar("60%","bg-white/10")}</div>)}</div>
  </div>
);

type SecItem = { label: string; tag: string; el: ReactNode };
const CAROUSEL: SecItem[] = [
  { label: "Hero sections", tag: "Live", el: SEC_HERO },
  { label: "Headers & mega menus", tag: "Live", el: SEC_HEADER },
  { label: "Service grids", tag: "Live", el: SEC_SERVICE },
  { label: "Pricing tables", tag: "Live", el: SEC_PRICING },
  { label: "Booking forms", tag: "Live", el: SEC_BOOKING },
  { label: "Testimonials", tag: "Live", el: SEC_TESTI },
  { label: "FAQs", tag: "Live", el: SEC_FAQ },
  { label: "Footers", tag: "Live", el: SEC_FOOTER },
];

function SectionCard({ c }: { c: SecItem }) {
  return (
    <div className="w-[300px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface sm:w-[340px]">
      <div className="rounded-t-2xl border-b border-line bg-panel/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-line" /><span className="size-2 rounded-full bg-line" /><span className="size-2 rounded-full bg-line" /></div>
      </div>
      <div className="p-4"><div className="min-h-[128px]">{c.el}</div></div>
      <div className="flex items-center justify-between px-4 pb-4">
        <p className="text-[14px] font-semibold text-ink">{c.label}</p>
        <span className="rounded-full bg-success-soft px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-success">{c.tag}</span>
      </div>
    </div>
  );
}

function MarqueeRow({ items, dir, reduce }: { items: SecItem[]; dir: "rtl" | "ltr"; reduce: boolean }) {
  const loop = [...items, ...items]; // duplicate for a seamless wrap
  const x = dir === "rtl" ? ["0%", "-50%"] : ["-50%", "0%"];
  return (
    <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)" }}>
      <motion.div
        className="flex w-max gap-5"
        animate={reduce ? undefined : { x }}
        transition={reduce ? undefined : { duration: 44, ease: "linear", repeat: Infinity }}
      >
        {loop.map((c, i) => <SectionCard key={i} c={c} />)}
      </motion.div>
    </div>
  );
}

export function ComponentCarousel() {
  const reduce = useReducedMotion();
  const top = CAROUSEL.filter((_, i) => i % 2 === 0);
  const bottom = CAROUSEL.filter((_, i) => i % 2 === 1);
  return (
    <div className="overflow-hidden bg-canvas py-20 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-12">
        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-14">
          <div>
            <p className="eyebrow mb-2">Section library</p>
            <FadeUp><h2 className="font-bold tracking-tight text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.05]">Design from proven sections, not empty prompts.</h2></FadeUp>
          </div>
          <FadeUp delay={0.06}>
            <p className="text-lg leading-relaxed text-muted">
              A curated, brand-driven library of heroes, headers, service grids, pricing, booking forms,
              testimonials, FAQs and footers — so every page starts closer to done.
            </p>
            <div className="mt-6"><LinkButton href="/components" size="lg">Explore the library</LinkButton></div>
          </FadeUp>
        </div>
      </div>

      <div className="mt-12 grid gap-5 sm:mt-16">
        <MarqueeRow items={top} dir="rtl" reduce={!!reduce} />
        <MarqueeRow items={bottom} dir="ltr" reduce={!!reduce} />
      </div>
    </div>
  );
}

/* ───────────── 3 · Design with complete control (accordion) ───────────── */
const CONTROL = [
  { t: "Plan before you design", d: "AI builds the sitemap and wireframe first, so every page has a clear goal and CTA before a single pixel is styled." },
  { t: "Brand tokens everywhere", d: "Colors, typography, spacing and tone flow from the brief into every generated section — consistent by default." },
  { t: "Reusable sections", d: "Assemble pages from a curated component library instead of prompting from a blank canvas each time." },
  { t: "Export-ready prompts", d: "Ship structured prompts and files to Claude, Cursor, Lovable, Figma and Webflow — no rebuilding required." },
];
// Reference-style composition: an accent panel on the left with floating chips,
// and a white content card on the right — recreated per accordion item.
function Field({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-ink">{label}</p>
      <div className="mt-1 space-y-1">{lines.map((w, i) => <div key={i} className="h-1.5 rounded bg-panel" style={{ width: w }} />)}</div>
    </div>
  );
}
const Sparkle = ({ c = "var(--color-accent)" }: { c?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z" /></svg>
);

function ControlVisual({ step }: { step: number }) {
  // Right-hand content card per step
  const content = [
    // 0 · Plan → Brief Summary (matches the reference)
    <div key="0" className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-bold text-ink">Brief Summary</p>
        <div className="text-right"><p className="text-[9px] font-medium text-muted">Strong brief</p><div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-panel"><div className="h-full w-[88%] rounded-full bg-accent" /></div></div>
      </div>
      <div className="mt-4 space-y-3">
        <Field label="Industry" lines={["55%"]} />
        <Field label="Goals" lines={["80%", "60%"]} />
        <Field label="Main features" lines={["70%", "50%"]} />
        <Field label="Services" lines={["90%", "75%"]} />
        <Field label="Tone & voice" lines={["45%"]} />
      </div>
      <div className="mt-4 inline-flex rounded-[6px] bg-accent px-4 py-2 text-[12px] font-semibold text-white">Use brief</div>
    </div>,
    // 1 · Brand tokens
    <div key="1" className="p-4">
      <p className="text-[14px] font-bold text-ink">Brand tokens</p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Accent</span><span className="flex items-center gap-1.5"><span className="size-4 rounded bg-accent" /><span className="font-mono text-[11px] text-body">#E94B6F</span></span></div>
        <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Radius</span><span className="font-mono text-[11px] text-body">6px</span></div>
        <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Type</span><span className="text-[11px] font-medium text-body">Inter</span></div>
        <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Spacing</span><span className="font-mono text-[11px] text-body">8pt</span></div>
      </div>
      <div className="mt-4 rounded-lg border border-line p-2.5"><div className="space-y-1.5">{bar("70%")}{bar("50%")}</div><div className="mt-2 inline-flex rounded-[6px] bg-accent px-3 py-1 text-[11px] font-semibold text-white">Book now</div></div>
    </div>,
    // 2 · Reusable sections
    <div key="2" className="p-4">
      <p className="text-[14px] font-bold text-ink">Section library</p>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {["Hero", "Pricing", "FAQ", "Footer"].map((s) => (
          <div key={s} className="rounded-lg border border-line p-2.5"><div className="space-y-1.5">{bar("65%")}<div className="h-4 w-1/2 rounded bg-accent/60" /></div><p className="mt-2 text-[10px] font-semibold text-ink">{s}</p></div>
        ))}
      </div>
    </div>,
    // 3 · Export
    <div key="3" className="p-4">
      <p className="text-[14px] font-bold text-ink">Export to your stack</p>
      <div className="mt-3.5 space-y-2">
        {[["Claude", "#E94B6F"], ["Cursor", "#111827"], ["Figma", "#8B5CF6"], ["Webflow", "#3B82F6"]].map(([t, c]) => (
          <div key={t} className="flex items-center gap-2 border-b border-line pb-2 last:border-0"><span className="size-2.5 rounded-[3px]" style={{ backgroundColor: c }} /><span className="text-[11px] font-medium text-body">{t}</span><span className="ml-auto font-mono text-[9px] text-faint">.md</span></div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">{["Prompt", "JSON", "Sitemap"].map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent"><span className="size-1.5 rounded-full bg-accent" />{t}</span>)}</div>
    </div>,
  ][step];

  // Floating chip per step (over the accent panel), like the reference
  const chip = [
    <div key="0" className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.4)]"><Sparkle /><span className="text-[10.5px] font-medium text-black/75">What kind of website are you creating?</span></div>,
    <div key="1" className="rounded-xl bg-white p-2.5 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.4)]"><p className="text-[8px] font-semibold uppercase tracking-wide text-black/40">Primary color</p><div className="mt-1 flex items-center gap-1.5"><span className="size-4 rounded bg-accent" /><span className="font-mono text-[10px] text-black/70">#E94B6F</span></div></div>,
    <div key="2" className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.4)]"><span className="grid size-5 place-items-center rounded-md bg-accent text-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></span><span className="text-[10.5px] font-medium text-black/75">Add section</span></div>,
    <div key="3" className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.4)]"><span className="size-2 rounded-full bg-success" /><span className="text-[10.5px] font-medium text-black/75">Export ready</span></div>,
  ][step];

  return (
    <div className="grid grid-cols-[0.82fr_1.18fr] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_44px_100px_-45px_rgba(15,23,42,0.5)]">
      {/* left accent panel with floating chip + avatar bubble */}
      <div className="relative bg-accent p-3">
        <div className="h-full min-h-[210px] rounded-lg bg-black/10" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent)" }} />
        <div className="absolute left-3 right-2 top-1/3">{chip}</div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]">
          <span className="size-6 rounded-full bg-gradient-to-br from-accent to-accent-hover" />
          <span className="flex gap-0.5">{[0, 1, 2].map((k) => <span key={k} className="size-1.5 rounded-full bg-black/40" />)}</span>
        </div>
      </div>
      {/* right content card */}
      {content}
    </div>
  );
}

export function ControlSection() {
  const [open, setOpen] = useState(0);
  return (
    <Wrap>
      <div className="mb-12 max-w-2xl">
        <FadeUp><h2 className="font-bold tracking-tight text-[clamp(2rem,calc(3.125vw+8px),2.8125rem)] leading-[1.05]">Design production-ready sites with complete control.</h2></FadeUp>
        <FadeUp delay={0.06}><p className="mt-5 text-lg leading-relaxed text-muted">Plan the structure, keep the brand consistent, and hand off clean outputs — a workflow built to reduce rework and scale across clients.</p></FadeUp>
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Reference-style mockup — reflects the open accordion item */}
        <FadeUp className="order-2 lg:order-1">
          <img src="/use-cases/control.png" alt="Brief Summary — auto-generated from your client brief" className="mx-auto w-full rounded-[26px] md:max-w-[520px] lg:max-w-none" loading="lazy" />
        </FadeUp>

        {/* Accordion */}
        <div className="order-1 lg:order-2">
          {CONTROL.map((c, i) => (
            <div key={c.t} className="border-b border-line">
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className={`text-[18px] font-semibold transition-colors ${open === i ? "text-ink" : "text-body"}`}>{c.t}</span>
                <span className="grid size-6 shrink-0 place-items-center text-muted">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={open === i ? "M6 12h12" : "M12 6v12M6 12h12"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
              </button>
              <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                <p className="pb-5 text-[15px] leading-relaxed text-muted">{c.d}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* ───────────── Use cases (sticky scroll) ───────────── */
function ScoreRingMini({ v }: { v: number }) {
  const c = 2 * Math.PI * 12;
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" className="shrink-0">
      <circle cx="15" cy="15" r="12" fill="none" stroke="var(--color-panel)" strokeWidth="3" />
      <circle cx="15" cy="15" r="12" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform="rotate(-90 15 15)" />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-ink font-bold" style={{ fontSize: 9 }}>{v}</text>
    </svg>
  );
}
const UC_AGENCY = (
  <div className="rounded-[18px] border border-line bg-surface p-5 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.4)]">
    <div className="flex items-center justify-between"><p className="text-[14px] font-bold text-ink">Client projects</p><span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">3 active</span></div>
    <div className="mt-4 space-y-2.5">
      {[["Riverside Dental", "Ready", 89], ["CityLink Cabs", "In review", 76], ["Reid Flooring", "Draft", 61]].map(([n, s, v]) => (
        <div key={n as string} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/50 px-3.5 py-2.5">
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-ink">{n}</p><p className="text-[11px] text-muted">{s}</p></div>
          <ScoreRingMini v={v as number} />
        </div>
      ))}
    </div>
  </div>
);
const UC_FREELANCER = (
  <div className="rounded-[18px] border border-line bg-surface p-5 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.4)]">
    <div className="flex items-start justify-between">
      <p className="text-[14px] font-bold text-ink">Brief Summary</p>
      <div className="text-right"><p className="text-[9px] font-medium text-muted">Strong brief</p><div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-panel"><div className="h-full w-[88%] rounded-full bg-accent" /></div></div>
    </div>
    <div className="mt-4 space-y-3">
      <Field label="Industry" lines={["55%"]} />
      <Field label="Goals" lines={["80%", "60%"]} />
      <Field label="Services" lines={["90%", "70%"]} />
    </div>
    <div className="mt-4 inline-flex rounded-[6px] bg-accent px-4 py-2 text-[12px] font-semibold text-white">Use brief</div>
  </div>
);
const UC_AI = (
  <div className="rounded-[18px] border border-line bg-surface p-5 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.4)]">
    <p className="text-[14px] font-bold text-ink">Export to your stack</p>
    <div className="mt-3.5 space-y-2">
      {[["Claude", "#E94B6F"], ["Cursor", "#111827"], ["Figma", "#8B5CF6"], ["Replit", "#F97316"]].map(([t, c]) => (
        <div key={t} className="flex items-center gap-2 border-b border-line pb-2 last:border-0"><span className="size-2.5 rounded-[3px]" style={{ backgroundColor: c }} /><span className="text-[11px] font-medium text-body">{t}</span><span className="ml-auto font-mono text-[9px] text-faint">.md</span></div>
      ))}
    </div>
    <div className="mt-3 rounded-lg bg-ink p-2.5 font-mono text-[9px] leading-relaxed text-white/85"><div><span className="text-accent">const</span> site = build(brief)</div><div className="text-white/45">// tokens · sitemap · sections</div></div>
  </div>
);

const UcImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="mx-auto w-full rounded-2xl md:max-w-[520px] lg:max-w-none" loading="lazy" />
);

const USE_CASES_SCROLL = [
  { title: "For web agencies", text: "Create first drafts, wireframes, page structures and client-ready concepts faster — and manage every project from one workspace.", bullets: ["Client brief intake in minutes", "Sitemap & wireframe first", "Component-based page drafts", "Export-ready client handoff"], art: <UcImage src="/use-cases/agencies.png" alt="Client projects dashboard" /> },
  { title: "For freelancers", text: "Turn messy client briefs into organized website plans and reusable prompts, so you look bigger than you are and win work faster.", bullets: ["Notes & transcripts → structured brief", "Clear scope and page plan", "Reusable prompts across clients", "Faster, more confident proposals"], art: <UcImage src="/use-cases/freelancers.png" alt="Auto-generated brief summary" /> },
  { title: "For AI builders", text: "Prepare better prompts and structured files for Claude, Cursor, Lovable and Replit — with real context instead of a blank prompt.", bullets: ["Structured, context-rich prompts", "Sitemap + wireframe as context", "Component mapping for builders", "Clean JSON & Markdown exports"], art: <UcImage src="/use-cases/ai-builders.png" alt="Export to your stack" /> },
];
export function UseCasesScroll() {
  const reduce = useReducedMotion();
  return (
    <section id="use-cases" className="bg-white">
      {/* Section header — big heading left, copy + CTA right */}
      <div className="grid gap-8 px-5 pb-0 pt-24 sm:px-12 sm:pt-28 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-20">
        <FadeUp><h2 className="font-bold tracking-tight text-[clamp(2rem,calc(3.125vw+8px),2.8125rem)] leading-[1.05]">Built for how modern<br className="hidden lg:block" /> teams work.</h2></FadeUp>
        <FadeUp delay={0.06}>
          <p className="text-[18px] leading-relaxed text-muted">Design without limits and deliver client-ready websites with full control over every detail — from first brief to final handoff.</p>
          <div className="mt-6"><LinkButton href="/#pricing" size="lg">See plans</LinkButton></div>
        </FadeUp>
      </div>

      {/* Sticky feature panels */}
      {USE_CASES_SCROLL.map((s, i) => (
        <div key={i} className="sticky top-[70px] flex items-start bg-white">
          <div className={`grid w-full items-center gap-10 px-5 sm:px-12 lg:grid-cols-2 lg:gap-16 lg:px-20 ${i === 0 ? "pt-[100px]" : "pt-[40px]"} ${i === USE_CASES_SCROLL.length - 1 ? "pb-20 sm:pb-24" : "pb-[40px]"}`}>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE }}
            >
              <h3 className="font-bold tracking-tight text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.05] text-ink">{s.title}</h3>
              <p className="mt-4 max-w-[42ch] text-[16.5px] leading-relaxed text-muted">{s.text}</p>
              <ul className="mt-6 space-y-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-baseline gap-3 text-[15px] text-body"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />{b}</li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE, delay: 0.08 }}
              className="order-first lg:order-last"
            >
              {s.art}
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ───────────── FAQ ───────────── */
const FAQS: [string, string][] = [
  ["What is Flowfreak?", "Flowfreak is an agency workspace that turns a short client brief into brand guidelines, sitemaps, wireframes, component-based page designs and export-ready prompts — one connected workflow from first note to final handoff."],
  ["Do I need to know how to code?", "No. Flowfreak generates the structure, brand direction and page plan for you. When you're ready to build, export structured prompts and files to the tools you already use."],
  ["How is Flowfreak different from a normal AI website builder?", "Instead of prompting straight to a random design, Flowfreak plans the sitemap and wireframe first, pulls from a curated component library, and keeps everything brand-token driven — so drafts are consistent and closer to done."],
  ["Can I turn meeting notes into a brief?", "Yes. Flowfreak Brief extracts a structured website brief from messy meeting notes, call transcripts or guided answers — with goals, pages, features, SEO and missing information flagged."],
  ["What can I export?", "A structured client brief, sitemap, wireframe plan and scope of work, plus ready-to-use prompts and files for Claude, Cursor, Lovable, Figma and Webflow."],
  ["Does it keep my brand consistent?", "Yes. Colours, typography, spacing and tone flow from the brief into every generated section through brand tokens, so pages stay consistent across a project."],
  ["Can I reuse sections across projects?", "Yes. Build and manage a reusable, brand-driven section library — heroes, headers, service grids, pricing, booking forms, testimonials, FAQs and footers — for faster, consistent delivery."],
  ["Who is Flowfreak for?", "Web agencies, freelancers, component teams, small-business projects and AI builders who want structure and reuse instead of starting every project from a blank prompt."],
  ["Is there a free plan?", "Yes. Start free to test the workflow. Paid plans add more projects, client workspaces, version history and team features."],
  ["Does Flowfreak build the final website for me?", "Flowfreak produces the plan and design direction — brief, sitemap, wireframe, brand and components. You then export structured prompts and files to build in your tool of choice, no rebuilding required."],
];
export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <Wrap id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <h2 className="font-bold tracking-tight text-[clamp(2.6rem,6vw,4.5rem)] leading-[0.95]">FAQ</h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            Have more questions?{" "}
            <a href="/signup" className="font-medium text-ink underline underline-offset-2 hover:text-accent">Start free</a>{" "}or{" "}
            <a href="mailto:hello@flowfreak.io" className="font-medium text-ink underline underline-offset-2 hover:text-accent">contact us</a>.
          </p>
        </div>
        <div>
          {FAQS.map(([q, a], i) => (
            <div key={q} className="border-b border-line first:border-t">
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left">
                <span className={`text-[17px] font-semibold transition-colors ${open === i ? "text-ink" : "text-body"}`}>{q}</span>
                <span className="grid size-6 shrink-0 place-items-center text-muted">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={open === i ? "M6 12h12" : "M12 6v12M6 12h12"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
              </button>
              <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.32, ease: EASE }} className="overflow-hidden">
                <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-muted">{a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* ───────────── 4 · Dark spotlight (3 product mockup cards) ───────────── */
function SpotPlan() {
  return (
    <div className="w-[88%] rounded-xl border border-black/5 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
      <span className="mb-2.5 inline-flex items-center gap-1 rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-black/50">Sitemap</span>
      <div className="mx-auto mb-1.5 w-1/3 rounded-md bg-black/[0.06] py-1 text-center text-[9px] font-semibold text-black/60">Home</div>
      <div className="mb-3 flex justify-center gap-1">{["About", "Services", "Contact"].map((p) => <span key={p} className="rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[8px] font-medium text-black/55">{p}</span>)}</div>
      <div className="space-y-1.5 rounded-lg bg-black/[0.03] p-2">
        <div className="h-1.5 w-full rounded bg-black/10" />
        <div className="grid aspect-[16/5] place-items-center rounded bg-black/[0.06]"><div className="h-1.5 w-1/3 rounded bg-black/15" /></div>
        <div className="flex gap-1.5"><div className="h-6 flex-1 rounded bg-black/[0.06]" /><div className="h-6 flex-1 rounded bg-black/[0.06]" /><div className="h-6 flex-1 rounded bg-black/[0.06]" /></div>
      </div>
    </div>
  );
}
function SpotSections() {
  return (
    <div className="relative w-[88%]">
      <div className="rounded-xl border border-black/5 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-black/70">Hero section</span><span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[8px] font-semibold text-accent">Live</span></div>
        <div className="mt-3 space-y-1.5"><div className="h-2 w-2/3 rounded bg-black/10" /><div className="h-1.5 w-full rounded bg-black/[0.06]" /><div className="h-1.5 w-4/5 rounded bg-black/[0.06]" /><div className="mt-1 h-5 w-20 rounded bg-accent" /></div>
      </div>
      <div className="absolute -bottom-4 -right-3 w-32 rounded-lg border border-black/5 bg-white p-2.5 shadow-[0_16px_36px_-14px_rgba(0,0,0,0.4)]">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-black/40">Primary color</p>
        <div className="mt-1.5 flex items-center gap-1.5"><span className="size-4 rounded bg-accent" /><span className="font-mono text-[9px] text-black/70">#E94B6F</span></div>
      </div>
    </div>
  );
}
function SpotBrief() {
  return (
    <div className="w-[88%] rounded-xl border border-black/5 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-black/50">Client Brief</span>
        <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[8px] font-semibold text-success">Ready</span>
      </div>
      <div className="mt-2.5 space-y-1.5">{bar("100%", "bg-black/10")}{bar("88%", "bg-black/[0.07]")}{bar("72%", "bg-black/[0.07]")}</div>
      <div className="mt-3 flex flex-wrap gap-1">{["Goals", "Pages", "Features", "SEO"].map((t) => <span key={t} className="rounded-[4px] bg-black/[0.06] px-1.5 py-0.5 text-[7.5px] font-semibold text-black/55">{t}</span>)}</div>
      <div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10"><div className="h-full w-[87%] rounded-full bg-accent" /></div><span className="font-mono text-[8px] font-semibold text-black/60">87%</span></div>
    </div>
  );
}
const SPOT = [
  { t: "Capture the client brief", d: "Extract business goals, audience, pages, features, content needs, SEO locations, design direction and missing info — before any design starts.", img: "/use-cases/spot-brief.png" },
  { t: "Plan the website structure", d: "Generate the sitemap, page goals, CTAs and wireframe sections from the approved brief — every page with a clear purpose before design.", img: "/use-cases/spot-plan.png" },
  { t: "Build with reusable components", d: "Match each wireframe section with proven components — heroes, services, FAQs, testimonials, booking forms, CTAs and footers, adapted to the client's brand.", img: "/use-cases/spot-build.png" },
];
export function DarkSpotlight() {
  return (
    <div className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(50% 55% at 18% 0%, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent 65%)" }} />
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-20 sm:px-12 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <FadeUp>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Why Flowfreak</p>
            <h2 className="font-bold tracking-tight text-white text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.03]">Built for how agencies actually work.</h2>
          </FadeUp>
          <FadeUp delay={0.06}>
            <div>
              <p className="text-[16px] leading-relaxed text-white/70">Stop rebuilding every project from a blank prompt. Flowfreak gives AI a system to design from — your brief, your brand, your components — so drafts are closer to done and easier to hand off.</p>
              <div className="mt-6"><LinkButton href="/signup" size="lg">Start building</LinkButton></div>
            </div>
          </FadeUp>
        </div>

        <Stagger className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-3">
          {SPOT.map((s) => (
            <StaggerItem key={s.t}>
              <div>
                <img src={s.img} alt={s.t} className="w-full rounded-2xl" loading="lazy" />
                <h3 className="mt-6 text-[22px] font-bold tracking-tight text-white">{s.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/60">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

const TESTIMONIALS: Testimonial[] = [
  { text: "Flowfreak turned a messy discovery call into a structured brief and sitemap in minutes. My first drafts now land far closer to what the client actually wants.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces", name: "Briana Patton", role: "Agency Founder" },
  { text: "We plan the whole site — pages, goals, CTAs — before touching design. Rework across client projects dropped massively.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces", name: "Bilal Ahmed", role: "Design Lead" },
  { text: "The export gives Claude and Cursor real context instead of a blank prompt. It's the missing layer between brief and build.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces", name: "Saman Malik", role: "Freelance Developer" },
  { text: "As a freelancer I look far bigger than I am. Clients get a polished brief summary and clear scope on day one.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces", name: "Omar Raza", role: "Independent Designer" },
  { text: "Reusable components mean every project starts 60% done. Our delivery timelines shrank without cutting quality.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces", name: "Zainab Hussain", role: "Studio Operations" },
  { text: "Brand tokens stay consistent everywhere, so handoff to the client is clean and revisions are minimal.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces", name: "Aliza Khan", role: "Brand Strategist" },
  { text: "The sitemap and wireframe step alone paid for itself. Stakeholders sign off before a single pixel is styled.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces", name: "Farhan Siddiqui", role: "Product Manager" },
  { text: "Clean JSON and Markdown exports drop straight into our build pipeline. No more copy-pasting from docs.", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=faces", name: "Sana Sheikh", role: "Engineering Lead" },
  { text: "Onboarding new clients used to take a week. With Flowfreak's guided brief, it's a single focused session.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces", name: "Hassan Ali", role: "Web Agency Owner" },
];

const firstColumn = TESTIMONIALS.slice(0, 3);
const secondColumn = TESTIMONIALS.slice(3, 6);
const thirdColumn = TESTIMONIALS.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-12">
        <FadeUp className="mx-auto flex max-w-[600px] flex-col items-center text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Testimonials</p>
          <h2 className="font-bold tracking-tight text-[clamp(2rem,calc(3.125vw+8px),2.8125rem)] leading-[1.05]">Loved by agencies, freelancers and builders.</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">See how teams ship client-ready websites faster with Flowfreak.</p>
        </FadeUp>

        <div className="mt-12 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={17} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={21} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={19} />
        </div>
      </div>
    </section>
  );
}
