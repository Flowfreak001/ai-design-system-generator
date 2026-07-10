import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem, AnimatedHeading } from "@/components/ui/motion";
import { StackingCards, type StackCard } from "@/components/motion/stacking-cards";
import { Hero, CanvasShowcase } from "@/components/landing/hero";
import { PlatformPillars, ComponentCarousel, ControlSection, DarkSpotlight, FaqSection, UseCasesScroll, TestimonialsSection } from "@/components/landing/home-sections";

/* ─────────────────────────── How it works (GSAP stacking cards) ─────────────────────────── */
const WORKFLOW: StackCard[] = [
  { eyebrow: "Step 01", title: "Capture the client brief", text: "Turn messy notes, calls and guided answers into a structured brief — goals, pages, features, SEO and the gaps flagged before any design starts." },
  { eyebrow: "Step 02", title: "Plan the site structure", text: "Generate the sitemap, page goals, CTAs and wireframe sections from the approved brief, so every page has a purpose before a pixel is styled." },
  { eyebrow: "Step 03", title: "Design from real sections", text: "Assemble pages from a curated, brand-driven component library instead of prompting from a blank canvas each time." },
  { eyebrow: "Step 04", title: "Export to your stack", text: "Ship structured prompts and files to Claude, Cursor, Lovable, Figma and Webflow — clean handoff, no rebuilding required." },
];
function WorkflowStack() {
  return (
    <section id="workflow" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">How it works</p>
        <AnimatedHeading
          text="From first brief to build-ready, in four steps."
          className="font-bold tracking-tight text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05]"
        />
      </div>
      <StackingCards cards={WORKFLOW} />
    </section>
  );
}

/* ─────────────────────────── Pricing ─────────────────────────── */
const PLANS = [
  { name: "Free", price: "$0", period: "forever", desc: "For testing the workflow.", features: ["Limited projects", "Basic component browsing", "Basic exports"], featured: false, cta: "Start Free" },
  { name: "Studio", price: "$29", period: "/mo", desc: "For freelancers and small agencies.", features: ["More projects", "Brand guideline generation", "Sitemap & wireframe tools", "Component selection", "Export files"], featured: true, cta: "Start Building" },
  { name: "Agency", price: "Custom", period: "", desc: "For teams.", features: ["Client workspaces", "Custom component library", "Version history", "Approval workflow", "Team members", "Advanced exports"], featured: false, cta: "Contact us" },
];
function PricingSection() {
  return (
    <div className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(50% 55% at 50% 0%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 65%)" }} />
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-20 sm:px-12 sm:py-28" id="pricing">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Pricing</p>
          <FadeUp><h2 className="font-bold tracking-tight text-white text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04]">Simple plans for agencies and creators.</h2></FadeUp>
          <FadeUp delay={0.06}><p className="mt-4 text-[16px] leading-relaxed text-white/60">Start free, upgrade when you&apos;re ready. No credit card required.</p></FadeUp>
        </div>

        <Stagger className="mt-14 grid items-stretch gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <StaggerItem key={p.name} className="h-full">
              <div className={`flex h-full flex-col rounded-[20px] border p-7 transition-transform duration-300 hover:-translate-y-1 ${p.featured ? "border-accent bg-white/[0.06] shadow-[0_40px_90px_-40px_rgba(233,75,111,0.6)]" : "border-white/12 bg-white/[0.03]"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-semibold text-white">{p.name}</p>
                  {p.featured && <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Popular</span>}
                </div>
                <div className="mt-4 flex items-end gap-1.5">
                  <span className="text-[38px] font-bold leading-none tracking-tight text-white">{p.price}</span>
                  {p.period && <span className="pb-1 text-[13px] text-white/50">{p.period}</span>}
                </div>
                <p className="mt-2 text-[13.5px] text-white/55">{p.desc}</p>
                <div className="my-6 h-px bg-white/10" />
                <ul className="flex flex-1 flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-white/80">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent/20 text-accent"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                      {f}
                    </li>
                  ))}
                </ul>
                {p.featured ? (
                  <LinkButton href="/signup" size="md" className="mt-8 w-full">{p.cta}</LinkButton>
                ) : (
                  <Link href="/signup" className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-white/20 text-[14px] font-medium text-white transition-colors hover:bg-white/10">{p.cta}</Link>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

/* ─────────────────────────── Final CTA ─────────────────────────── */
function FinalCTASection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink px-6 py-20 text-center sm:px-16 sm:py-28">
      {/* rose glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(48% 80% at 50% -10%, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent 70%)" }} />
      {/* dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", maskImage: "radial-gradient(60% 65% at 50% 35%, #000, transparent)", WebkitMaskImage: "radial-gradient(60% 65% at 50% 35%, #000, transparent)" }} />
      <FadeUp className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/80">
            <span className="size-1.5 rounded-full bg-accent" /> Get started free
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl font-bold tracking-tight text-white text-[clamp(2rem,3.8vw,3rem)] leading-[1.06]">
            Create your next website draft with structure, not guesswork.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/65">
            Move from a client brief to production-ready website direction faster — with AI, wireframes, brand rules and reusable components.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/signup" size="lg">Start building</LinkButton>
            <Link href="/components" className="inline-flex h-12 items-center rounded-[6px] border border-white/20 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
              Explore the library
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-white/45">No credit card required · Free plan available</p>
      </FadeUp>
    </section>
  );
}

export function FlowfreakLanding() {
  return (
    <>
      <Hero />
      <CanvasShowcase />
      <PlatformPillars />
      <ComponentCarousel />
      <DarkSpotlight />
      <ControlSection />
      <WorkflowStack />
      <UseCasesScroll />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCTASection />
    </>
  );
}
