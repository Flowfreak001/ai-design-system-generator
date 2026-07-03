"use client";

// Real, styled website section components. Each renders a genuine (if generic)
// section using the Style Guide theme tokens — used by the Design Canvas to
// assemble a page section-by-section, and export-ready as named React
// components. Content is placeholder copy driven by the section note/title.

import type { SectionProps, SectionTheme } from "./theme";
import { componentNameForKind, sectionKind, type SectionKind } from "@/lib/sections";

const H = (t: SectionTheme) => ({ fontFamily: t.headingFont, color: t.ink });
const B = (t: SectionTheme) => ({ fontFamily: t.bodyFont, color: t.muted });
const btn = (t: SectionTheme, filled = true) =>
  filled
    ? { background: t.accent, color: "#fff", borderRadius: t.radius }
    : { border: `1px solid ${t.accent}`, color: t.accent, borderRadius: t.radius };

export function NavbarSection({ theme: t, title }: SectionProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4" style={{ background: t.bg, borderBottom: `1px solid ${t.surface}` }}>
      <span className="text-[15px] font-bold" style={H(t)}>{title || "Logo"}</span>
      <div className="hidden items-center gap-5 text-[13px] sm:flex" style={B(t)}>
        <span>Home</span><span>Services</span><span>About</span><span>Contact</span>
      </div>
      <span className="px-3 py-1.5 text-[12px] font-medium" style={btn(t)}>Get started</span>
    </nav>
  );
}

export function HeroSection({ theme: t, title, note, mobile }: SectionProps) {
  return (
    <section className={`grid items-center gap-8 px-8 py-14 ${mobile ? "" : "grid-cols-2"}`} style={{ background: t.bg }}>
      <div>
        <h1 className="text-[30px] font-bold leading-tight" style={H(t)}>{title || "A clear, benefit-led headline"}</h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={B(t)}>{note || "One or two sentences that explain the value and speak to the audience."}</p>
        <div className="mt-5 flex gap-3">
          <span className="px-4 py-2 text-[13px] font-medium" style={btn(t)}>Primary CTA</span>
          <span className="px-4 py-2 text-[13px] font-medium" style={btn(t, false)}>Secondary</span>
        </div>
      </div>
      <div className="h-52 w-full" style={{ background: t.surface, borderRadius: t.radius }} />
    </section>
  );
}

export function FeatureGridSection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <h2 className="text-center text-[22px] font-bold" style={H(t)}>{title || "Features"}</h2>
      <div className={`mx-auto mt-8 grid max-w-4xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5" style={{ background: t.surface, borderRadius: t.radius }}>
            <div className="h-9 w-9 rounded-full" style={{ background: t.accent, opacity: 0.85 }} />
            <p className="mt-3 text-[14px] font-semibold" style={H(t)}>Feature {i + 1}</p>
            <p className="mt-1 text-[12.5px]" style={B(t)}>A short line describing the benefit clearly.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServiceCardsSection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Our services"}</h2>
      <div className={`mt-6 grid gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.bg, borderRadius: t.radius, border: `1px solid ${t.surface}` }}>
            <div className="h-28 w-full" style={{ background: t.surface }} />
            <div className="p-4">
              <p className="text-[14px] font-semibold" style={H(t)}>Service {i + 1}</p>
              <p className="mt-1 text-[12.5px]" style={B(t)}>Describe what the client gets and why it matters.</p>
              <span className="mt-3 inline-block text-[12px] font-medium" style={{ color: t.accent }}>Learn more →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FormShell({ t, title, submit, fields }: { t: SectionTheme; title: string; submit: string; fields: string[] }) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <div className="mx-auto max-w-md">
        <h2 className="text-[22px] font-bold" style={H(t)}>{title}</h2>
        <div className="mt-5 grid gap-3">
          {fields.map((f) => (
            <div key={f}>
              <label className="text-[12px]" style={B(t)}>{f}</label>
              <div className="mt-1 h-10 w-full" style={{ background: t.surface, borderRadius: t.radius, border: `1px solid ${t.surface}` }} />
            </div>
          ))}
          <span className="mt-1 inline-block px-4 py-2.5 text-center text-[13px] font-medium" style={btn(t)}>{submit}</span>
        </div>
      </div>
    </section>
  );
}

export function ContactFormSection({ theme: t, title }: SectionProps) {
  return <FormShell t={t} title={title || "Get in touch"} submit="Send message" fields={["Name", "Email", "Message"]} />;
}

export function BookingFormSection({ theme: t, title }: SectionProps) {
  return <FormShell t={t} title={title || "Book a slot"} submit="Request booking" fields={["Service", "Date & time", "Contact details"]} />;
}

export function PricingSection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14 text-center" style={{ background: t.surface }}>
      <h2 className="text-[22px] font-bold" style={H(t)}>{title || "Pricing"}</h2>
      <div className={`mx-auto mt-8 grid max-w-4xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {["Starter", "Pro", "Business"].map((tier, i) => (
          <div key={tier} className="p-6 text-left" style={{ background: t.bg, borderRadius: t.radius, border: i === 1 ? `2px solid ${t.accent}` : `1px solid ${t.surface}` }}>
            <p className="text-[13px] font-semibold" style={{ color: t.accent }}>{tier}</p>
            <p className="mt-1 text-[26px] font-bold" style={H(t)}>${(i + 1) * 29}<span className="text-[12px] font-normal" style={B(t)}>/mo</span></p>
            <div className="mt-4 grid gap-1.5 text-[12.5px]" style={B(t)}><span>Included feature</span><span>Included feature</span><span>Included feature</span></div>
            <span className="mt-5 inline-block w-full px-3 py-2 text-center text-[13px] font-medium" style={btn(t, i !== 1)}>Choose</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQSection({ theme: t, title }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      <h2 className="text-center text-[22px] font-bold" style={H(t)}>{title || "Frequently asked questions"}</h2>
      <div className="mx-auto mt-6 grid max-w-2xl gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5" style={{ background: t.surface, borderRadius: t.radius }}>
            <span className="text-[13.5px] font-medium" style={H(t)}>A common question {i + 1}?</span>
            <span style={{ color: t.accent }}>＋</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.surface }}>
      <h2 className="text-center text-[22px] font-bold" style={H(t)}>{title || "What clients say"}</h2>
      <div className={`mx-auto mt-8 grid max-w-4xl gap-5 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5" style={{ background: t.bg, borderRadius: t.radius }}>
            <p className="text-[13px] italic leading-relaxed" style={B(t)}>“A short, specific quote about the result the customer got.”</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full" style={{ background: t.surface }} />
              <span className="text-[12.5px] font-medium" style={H(t)}>Client name</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GallerySection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-14" style={{ background: t.bg }}>
      {title && <h2 className="mb-6 text-[22px] font-bold" style={H(t)}>{title}</h2>}
      <div className={`grid gap-3 ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
        {Array.from({ length: mobile ? 4 : 8 }).map((_, i) => (
          <div key={i} className="aspect-square w-full" style={{ background: t.surface, borderRadius: t.radius }} />
        ))}
      </div>
    </section>
  );
}

export function CTASection({ theme: t, title, note }: SectionProps) {
  return (
    <section className="px-8 py-16 text-center" style={{ background: t.primary }}>
      <h2 className="text-[24px] font-bold" style={{ fontFamily: t.headingFont, color: "#fff" }}>{title || "Ready to get started?"}</h2>
      <p className="mx-auto mt-2 max-w-xl text-[14px]" style={{ fontFamily: t.bodyFont, color: "rgba(255,255,255,0.8)" }}>{note || "A short line that nudges the visitor to act."}</p>
      <span className="mt-5 inline-block px-5 py-2.5 text-[13px] font-medium" style={{ background: t.accent, color: "#fff", borderRadius: t.radius }}>Get started</span>
    </section>
  );
}

export function FooterSection({ theme: t, mobile }: SectionProps) {
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

export function DirectoryListingSection({ theme: t, title, mobile }: SectionProps) {
  return (
    <section className="px-8 py-12" style={{ background: t.bg }}>
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold" style={H(t)}>{title || "Listings"}</h2>
        <div className="flex gap-2">{["Filter", "Sort", "Map"].map((f) => <span key={f} className="px-2.5 py-1 text-[11.5px]" style={{ background: t.surface, borderRadius: t.radius, color: t.muted }}>{f}</span>)}</div>
      </div>
      <div className={`mt-5 grid gap-4 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden" style={{ background: t.surface, borderRadius: t.radius }}>
            <div className="h-24 w-full" style={{ background: t.bg, opacity: 0.6 }} />
            <div className="p-3"><p className="text-[13px] font-semibold" style={H(t)}>Listing {i + 1}</p><p className="text-[12px]" style={B(t)}>Location · detail</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardSection({ theme: t, title }: SectionProps) {
  return (
    <section className="px-6 py-8" style={{ background: t.surface }}>
      <h2 className="mb-4 text-[18px] font-bold" style={H(t)}>{title || "Dashboard"}</h2>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-4" style={{ background: t.bg, borderRadius: t.radius }}>
            <p className="text-[11px]" style={B(t)}>Metric {i + 1}</p>
            <p className="text-[22px] font-bold" style={H(t)}>{(i + 1) * 128}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-40 w-full" style={{ background: t.bg, borderRadius: t.radius }} />
    </section>
  );
}

export function GenericSection({ theme: t, title, note }: SectionProps) {
  return (
    <section className="px-8 py-12" style={{ background: t.bg }}>
      <h2 className="text-[20px] font-bold" style={H(t)}>{title || "Section"}</h2>
      <p className="mt-2 max-w-2xl text-[13.5px]" style={B(t)}>{note || "Content for this section."}</p>
      <div className="mt-5 h-32 w-full" style={{ background: t.surface, borderRadius: t.radius }} />
    </section>
  );
}

export const SECTION_COMPONENTS: Record<SectionKind, (p: SectionProps) => React.ReactElement> = {
  navbar: NavbarSection,
  hero: HeroSection,
  features: FeatureGridSection,
  services: ServiceCardsSection,
  form: ContactFormSection,
  booking: BookingFormSection,
  pricing: PricingSection,
  faq: FAQSection,
  testimonials: TestimonialsSection,
  gallery: GallerySection,
  cta: CTASection,
  footer: FooterSection,
  directory: DirectoryListingSection,
  dashboard: DashboardSection,
  generic: GenericSection,
};

/** Render the right styled section for a given section name. */
export function RenderSection({ name, ...props }: SectionProps & { name: string }) {
  const Comp = SECTION_COMPONENTS[sectionKind(name)];
  return <Comp title={name} {...props} />;
}

export { componentNameForKind, sectionKind };
