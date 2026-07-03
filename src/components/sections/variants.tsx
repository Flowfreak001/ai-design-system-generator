"use client";

// Design variant registry. Our design quality comes from THIS library — a set
// of real, styled section variants per section kind, driven by Style Guide
// theme tokens. The Design Canvas renders the variant the user picks; the
// Section editor lists the variants available for a section's kind.

import type { SectionProps, SectionTheme } from "./theme";
import { SECTION_COMPONENTS } from "./registry";
import type { SectionKind } from "@/lib/sections";

const H = (t: SectionTheme) => ({ fontFamily: t.headingFont, color: t.ink });
const B = (t: SectionTheme) => ({ fontFamily: t.bodyFont, color: t.muted });
const fill = (t: SectionTheme) => ({ background: t.accent, color: "#fff", borderRadius: t.radius });
const outline = (t: SectionTheme) => ({ border: `1px solid ${t.accent}`, color: t.accent, borderRadius: t.radius });
const card = (t: SectionTheme) => ({ background: t.surface, borderRadius: t.radius });

export type SectionVariant = { id: string; label: string; Component: (p: SectionProps) => React.ReactElement };

// Two-column row that swaps the content/asset order based on assetSide.
function Row({ content, asset, side, mobile }: { content: React.ReactNode; asset: React.ReactNode; side?: "left" | "right"; mobile?: boolean }) {
  const assetLeft = side === "left";
  return (
    <div className={`grid items-center gap-8 ${mobile ? "" : "grid-cols-2"}`}>
      {assetLeft ? <>{asset}{content}</> : <>{content}{asset}</>}
    </div>
  );
}

// ------------------------------------------------------------------ HERO
function CenteredHero({ theme: t, title, note }: SectionProps) {
  return (
    <section className="px-8 py-16 text-center" style={{ background: t.bg }}>
      <h1 className="mx-auto max-w-2xl text-[32px] font-bold leading-tight" style={H(t)}>{title || "A clear, benefit-led headline"}</h1>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed" style={B(t)}>{note || "One or two sentences that explain the value and speak to the audience."}</p>
      <div className="mt-6 flex justify-center gap-3">
        <span className="px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Primary CTA</span>
        <span className="px-5 py-2.5 text-[13px] font-medium" style={outline(t)}>Secondary</span>
      </div>
    </section>
  );
}

function SplitHero({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <h1 className="text-[30px] font-bold leading-tight" style={H(t)}>{title || "A clear, benefit-led headline"}</h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={B(t)}>{note || "Explain the value in one or two sentences."}</p>
            <div className="mt-5 flex gap-3">
              <span className="px-4 py-2 text-[13px] font-medium" style={fill(t)}>Primary CTA</span>
              <span className="px-4 py-2 text-[13px] font-medium" style={outline(t)}>Secondary</span>
            </div>
          </div>
        }
        asset={<div className="h-52 w-full" style={card(t)} />}
      />
    </section>
  );
}

function ImageRightHero({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: t.bg, color: t.accent }}>New</span>
            <h1 className="mt-3 text-[30px] font-bold leading-tight" style={H(t)}>{title || "Headline paired with a strong visual"}</h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={B(t)}>{note || "Describe the outcome the visitor gets."}</p>
            <span className="mt-5 inline-block px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Get started</span>
          </div>
        }
        asset={<div className="h-64 w-full" style={{ background: t.bg, borderRadius: t.radius, border: `1px solid ${t.surface}` }} />}
      />
    </section>
  );
}

function BookingHero({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <h1 className="text-[30px] font-bold leading-tight" style={H(t)}>{title || "Book your appointment in minutes"}</h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={B(t)}>{note || "Fast, reliable, and available when you need us."}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[12px]" style={B(t)}>
              <span className="rounded-full px-3 py-1" style={card(t)}>★ 4.9 rated</span>
              <span className="rounded-full px-3 py-1" style={card(t)}>Same-day slots</span>
            </div>
          </div>
        }
        asset={
          <div className="p-5" style={{ background: t.surface, borderRadius: t.radius }}>
            <p className="text-[13px] font-semibold" style={H(t)}>Request a booking</p>
            {["Service", "Preferred date", "Phone"].map((f) => (
              <div key={f} className="mt-3"><label className="text-[11.5px]" style={B(t)}>{f}</label><div className="mt-1 h-9 w-full" style={{ background: t.bg, borderRadius: t.radius }} /></div>
            ))}
            <span className="mt-4 inline-block w-full px-4 py-2.5 text-center text-[13px] font-medium" style={fill(t)}>Check availability</span>
          </div>
        }
      />
    </section>
  );
}

function SaaSHero({ theme: t, title, note }: SectionProps) {
  return (
    <section className="px-8 pt-16 pb-0 text-center" style={{ background: t.bg }}>
      <h1 className="mx-auto max-w-2xl text-[34px] font-bold leading-tight" style={H(t)}>{title || "The platform that scales with you"}</h1>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed" style={B(t)}>{note || "Everything your team needs in one clean workspace."}</p>
      <div className="mt-6 flex justify-center gap-3">
        <span className="px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Start free trial</span>
        <span className="px-5 py-2.5 text-[13px] font-medium" style={outline(t)}>Book a demo</span>
      </div>
      <div className="mx-auto mt-10 h-40 max-w-3xl rounded-t-xl" style={{ background: t.surface, borderTop: `1px solid ${t.surface}`, borderLeft: `1px solid ${t.surface}`, borderRight: `1px solid ${t.surface}` }} />
    </section>
  );
}

function LocalBusinessHero({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <h1 className="text-[28px] font-bold leading-tight" style={H(t)}>{title || "Trusted local experts near you"}</h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={B(t)}>{note || "Serving the area for over 10 years with honest pricing."}</p>
            <div className="mt-5 grid gap-2 text-[12.5px]" style={B(t)}>
              <span>📍 123 Main Street, Your City</span>
              <span>🕘 Mon–Sat · 8am – 6pm</span>
              <span>📞 (555) 123-4567</span>
            </div>
            <span className="mt-5 inline-block px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Call now</span>
          </div>
        }
        asset={<div className="min-h-44 w-full self-stretch" style={{ background: t.surface, borderRadius: t.radius }} />}
      />
    </section>
  );
}

// -------------------------------------------------------------- SERVICES
function ServiceCards3({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Our services"}</h2>
      <div className={`mt-6 grid gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5" style={{ background: t.bg, borderRadius: t.radius, border: `1px solid ${t.surface}` }}>
            <div className="h-9 w-9 rounded-full" style={{ background: t.accent }} />
            <p className="mt-3 text-[14px] font-semibold" style={H(t)}>Service {i + 1}</p>
            <p className="mt-1 text-[12.5px]" style={B(t)}>Describe what the client gets and why it matters.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceGrid6({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <h2 className="text-center text-[22px] font-bold" style={H(t)}>{title || "What we offer"}</h2>
      <div className={`mx-auto mt-8 grid max-w-4xl gap-4 ${mobile ? "grid-cols-2" : "grid-cols-3"}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4" style={card(t)}>
            <div className="h-8 w-8 rounded-lg" style={{ background: t.accent, opacity: 0.85 }} />
            <p className="mt-2 text-[13px] font-semibold" style={H(t)}>Service {i + 1}</p>
            <p className="mt-1 text-[12px]" style={B(t)}>Short benefit line.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceImageCards({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Our services"}</h2>
      <div className={`mt-6 grid gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.bg, borderRadius: t.radius, border: `1px solid ${t.surface}` }}>
            <div className="h-28 w-full" style={{ background: t.surface }} />
            <div className="p-4">
              <p className="text-[14px] font-semibold" style={H(t)}>Service {i + 1}</p>
              <p className="mt-1 text-[12.5px]" style={B(t)}>What the client gets and why it matters.</p>
              <span className="mt-3 inline-block text-[12px] font-medium" style={{ color: t.accent }}>Learn more →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceSplitList({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <h2 className="text-[24px] font-bold leading-tight" style={H(t)}>{title || "Everything we do"}</h2>
            <p className="mt-3 text-[13.5px]" style={B(t)}>{note || "A focused set of services, done well."}</p>
            <span className="mt-4 inline-block px-4 py-2 text-[13px] font-medium" style={outline(t)}>See all</span>
          </div>
        }
        asset={
          <div className="grid gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4" style={card(t)}>
                <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full" style={{ background: t.accent }} />
                <div>
                  <p className="text-[13.5px] font-semibold" style={H(t)}>Service {i + 1}</p>
                  <p className="mt-0.5 text-[12.5px]" style={B(t)}>One line describing this specific service.</p>
                </div>
              </div>
            ))}
          </div>
        }
      />
    </section>
  );
}

// ------------------------------------------------------------------- FAQ
function FAQAccordion({ theme: t, title }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <h2 className="text-center text-[22px] font-bold" style={H(t)}>{title || "Frequently asked questions"}</h2>
      <div className="mx-auto mt-6 grid max-w-2xl gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5" style={card(t)}>
            <span className="text-[13.5px] font-medium" style={H(t)}>A common question {i + 1}?</span>
            <span style={{ color: t.accent }}>＋</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQTwoColumn({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Questions & answers"}</h2>
      <div className={`mt-6 grid gap-x-10 gap-y-6 ${mobile ? "grid-cols-1" : "grid-cols-2"}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <p className="text-[13.5px] font-semibold" style={H(t)}>A common question {i + 1}?</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed" style={B(t)}>A concise, helpful answer that removes the objection.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQWithCTA({ theme: t, title, note, mobile, assetSide }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <Row
        mobile={mobile}
        side={assetSide}
        content={
          <div>
            <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Frequently asked questions"}</h2>
            <div className="mt-5 grid gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3" style={card(t)}>
                  <span className="text-[13px] font-medium" style={H(t)}>A common question {i + 1}?</span>
                  <span style={{ color: t.accent }}>＋</span>
                </div>
              ))}
            </div>
          </div>
        }
        asset={
          <div className="flex flex-col justify-center p-6 text-center" style={{ background: t.primary, borderRadius: t.radius }}>
            <p className="text-[16px] font-bold" style={{ color: "#fff", fontFamily: t.headingFont }}>Still have questions?</p>
            <p className="mt-1.5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.8)" }}>{note || "Our team is happy to help."}</p>
            <span className="mt-4 inline-block px-4 py-2.5 text-[13px] font-medium" style={fill(t)}>Contact us</span>
          </div>
        }
      />
    </section>
  );
}

// ------------------------------------------------------------------- CTA
function SimpleCTA({ theme: t, title, note }: SectionProps) {
  return (
    <section className="px-8 py-16 text-center" style={{ background: t.primary }}>
      <h2 className="text-[24px] font-bold" style={{ fontFamily: t.headingFont, color: "#fff" }}>{title || "Ready to get started?"}</h2>
      <p className="mx-auto mt-2 max-w-xl text-[14px]" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.8)" }}>{note || "A short line that nudges the visitor to act."}</p>
      <span className="mt-5 inline-block px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Get started</span>
    </section>
  );
}

function SplitCTA({ theme: t, title, note, mobile }: SectionProps) {
  return (
    <section className={`flex items-center gap-6 px-8 py-12 ${mobile ? "flex-col text-center" : "justify-between"}`} style={{ background: t.surface }}>
      <div>
        <h2 className="text-[20px] font-bold" style={H(t)}>{title || "Let’s build something great"}</h2>
        <p className="mt-1.5 text-[13px]" style={B(t)}>{note || "Start today — no credit card required."}</p>
      </div>
      <div className="flex shrink-0 gap-3">
        <span className="px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>Get started</span>
        <span className="px-5 py-2.5 text-[13px] font-medium" style={outline(t)}>Learn more</span>
      </div>
    </section>
  );
}

function BannerCTA({ theme: t, title }: SectionProps) {
  return (
    <section className="px-8 py-7" style={{ background: t.accent }}>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
        <p className="text-[16px] font-semibold" style={{ color: "#fff", fontFamily: t.headingFont }}>{title || "Limited-time offer — act now"}</p>
        <span className="px-5 py-2.5 text-[13px] font-semibold" style={{ background: "#fff", color: t.accent, borderRadius: t.radius }}>Claim offer</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- FOOTER
function SimpleFooter({ theme: t }: SectionProps) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-8 py-8" style={{ background: t.ink }}>
      <span className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: t.headingFont }}>Logo</span>
      <div className="flex flex-wrap gap-5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.65)" }}>
        <span>Home</span><span>Services</span><span>About</span><span>Contact</span><span>Privacy</span>
      </div>
    </footer>
  );
}

function MultiColumnFooter({ theme: t, mobile }: SectionProps) {
  return (
    <footer className="px-8 py-12" style={{ background: t.ink }}>
      <div className={`grid gap-8 ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
        {["Product", "Company", "Resources", "Contact"].map((col) => (
          <div key={col}>
            <p className="text-[12.5px] font-semibold" style={{ color: "#fff", fontFamily: t.headingFont }}>{col}</p>
            <div className="mt-2 grid gap-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}><span>Link</span><span>Link</span><span>Link</span></div>
          </div>
        ))}
      </div>
    </footer>
  );
}

function NewsletterFooter({ theme: t, mobile }: SectionProps) {
  return (
    <footer className="px-8 py-12" style={{ background: t.ink }}>
      <div className={`grid gap-8 ${mobile ? "grid-cols-1" : "grid-cols-[2fr_1fr_1fr]"}`}>
        <div>
          <p className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: t.headingFont }}>Stay in the loop</p>
          <p className="mt-1.5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>Get product updates, no spam.</p>
          <div className="mt-3 flex gap-2">
            <div className="h-9 flex-1" style={{ background: "rgba(255,255,255,0.1)", borderRadius: t.radius }} />
            <span className="px-4 py-2 text-[12.5px] font-medium" style={fill(t)}>Subscribe</span>
          </div>
        </div>
        {["Company", "Resources"].map((col) => (
          <div key={col}>
            <p className="text-[12.5px] font-semibold" style={{ color: "#fff", fontFamily: t.headingFont }}>{col}</p>
            <div className="mt-2 grid gap-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}><span>Link</span><span>Link</span><span>Link</span></div>
          </div>
        ))}
      </div>
    </footer>
  );
}

// -------------------------------------------------------------- REGISTRY
export const SECTION_VARIANTS: Partial<Record<SectionKind, SectionVariant[]>> = {
  hero: [
    { id: "centered", label: "Centered", Component: CenteredHero },
    { id: "split", label: "Split", Component: SplitHero },
    { id: "image-right", label: "Image Right", Component: ImageRightHero },
    { id: "booking", label: "Booking", Component: BookingHero },
    { id: "saas", label: "SaaS", Component: SaaSHero },
    { id: "local", label: "Local Business", Component: LocalBusinessHero },
  ],
  services: [
    { id: "cards-3", label: "3 Cards", Component: ServiceCards3 },
    { id: "grid-6", label: "6 Grid", Component: ServiceGrid6 },
    { id: "image-cards", label: "Image Cards", Component: ServiceImageCards },
    { id: "split-list", label: "Split List", Component: ServiceSplitList },
  ],
  faq: [
    { id: "accordion", label: "Accordion", Component: FAQAccordion },
    { id: "two-column", label: "Two Column", Component: FAQTwoColumn },
    { id: "with-cta", label: "With CTA", Component: FAQWithCTA },
  ],
  cta: [
    { id: "simple", label: "Simple", Component: SimpleCTA },
    { id: "split", label: "Split", Component: SplitCTA },
    { id: "banner", label: "Banner", Component: BannerCTA },
  ],
  footer: [
    { id: "simple", label: "Simple", Component: SimpleFooter },
    { id: "multi-column", label: "Multi Column", Component: MultiColumnFooter },
    { id: "newsletter", label: "Newsletter", Component: NewsletterFooter },
  ],
};

/** Variants available for a section kind (falls back to the base component). */
export function variantsForKind(kind: SectionKind): SectionVariant[] {
  return SECTION_VARIANTS[kind] ?? [{ id: "default", label: "Default", Component: SECTION_COMPONENTS[kind] }];
}

/** Render the chosen design variant for a kind (first variant if unset). */
export function renderSectionVariant(kind: SectionKind, variantId: string | undefined, props: SectionProps & { name: string }) {
  const variants = variantsForKind(kind);
  const v = variants.find((x) => x.id === variantId) ?? variants[0];
  const { name, ...rest } = props;
  return <v.Component title={name} {...rest} />;
}
