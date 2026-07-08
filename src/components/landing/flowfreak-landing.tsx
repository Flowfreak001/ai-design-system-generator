import type { ReactNode } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/section";
import { FadeUp, Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { Hero, CanvasShowcase } from "@/components/landing/hero";

// Shared section wrapper — consistent rhythm + width across the page.
function Wrap({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mx-auto max-w-[1240px] px-5 sm:px-12 py-20 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

const StatusBadge = ({ status }: { status: "Beta" | "Live" | "Planned" }) => {
  const cls =
    status === "Live" ? "bg-success-soft text-success" : status === "Beta" ? "bg-accent-soft text-accent" : "bg-panel text-muted";
  return <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide ${cls}`}>{status}</span>;
};

/* ─────────────────────────── 2. Problem ─────────────────────────── */
const PROBLEMS = [
  { t: "Weak page planning", d: "AI often skips proper sitemap and section strategy." },
  { t: "Generic designs", d: "Outputs look similar because there's no curated design system." },
  { t: "Poor brand consistency", d: "Colors, typography, spacing and content tone aren't controlled." },
  { t: "Hard to use in real workflow", d: "Teams still rebuild everything in Claude, Cursor, Lovable, Replit or VS Code." },
];
function ProblemSection() {
  return (
    <Wrap>
      <SectionHeading eyebrow="The problem" title={<>AI websites are fast, but often too&nbsp;generic.</>}
        intro="Most AI website tools jump straight from prompt to design. That creates inconsistent layouts, weak content structure, and too much manual fixing before production." />
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((p) => (
          <StaggerItem key={p.t}>
            <div className="card h-full p-6">
              <span className="grid size-9 place-items-center rounded-lg bg-danger-soft text-danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">{p.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{p.d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Wrap>
  );
}

/* ─────────────────────────── 3. Solution flow ─────────────────────────── */
const STEPS = [
  { k: "1", t: "Add the brief", d: "Enter business type, goals, pages, services and reference sites." },
  { k: "2", t: "Generate brand direction", d: "Create colors, typography, tone, spacing and visual rules." },
  { k: "3", t: "Plan the structure", d: "Build sitemap and wireframes before jumping into design." },
  { k: "4", t: "Use the component library", d: "AI selects suitable sections from your curated design library." },
  { k: "5", t: "Export to build tools", d: "Generate structured prompts and files for your tools of choice." },
];
function SolutionSection() {
  return (
    <div className="bg-surface border-y border-line">
      <Wrap id="solution">
        <SectionHeading eyebrow="The solution" title="Flowfreak gives AI a system to design from."
          intro="Instead of generating random layouts from a blank prompt, Flowfreak uses your brief, brand rules, wireframes, industry patterns and reusable components to create better website drafts." />
        <div className="mt-10 flex flex-wrap items-center gap-2 font-mono text-[12.5px] text-muted">
          {["Brief", "Brand", "Sitemap", "Wireframe", "Components", "Export"].map((s, i, a) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-canvas px-3 py-1 text-ink">{s}</span>
              {i < a.length - 1 && <span className="text-faint">→</span>}
            </span>
          ))}
        </div>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((s) => (
            <StaggerItem key={s.k}>
              <div className="card h-full p-6">
                <span className="grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold text-white">{s.k}</span>
                <p className="mt-4 text-[14.5px] font-semibold text-ink">{s.t}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Wrap>
    </div>
  );
}

/* ─────────────────────────── 4. Product modules ─────────────────────────── */
const MODULES: { name: string; tagline: string; desc: string; status: "Beta" | "Live" | "Planned" }[] = [
  { name: "Flowfreak Studio", tagline: "Create websites from brief to wireframe.", desc: "Generate project intake, brand guidelines, sitemap, wireframes, page structure and design direction.", status: "Beta" },
  { name: "Flowfreak Library", tagline: "A 21st.dev-style library for website sections.", desc: "Browse reusable heroes, headers, service sections, pricing blocks, FAQs, booking forms, CTAs and footers.", status: "Live" },
  { name: "Flowfreak SEO", tagline: "Plan content that helps websites rank.", desc: "Generate local SEO pages, blog ideas, keyword clusters, metadata and content briefs for client sites.", status: "Planned" },
  { name: "Flowfreak Connect", tagline: "Export to your favourite build tools.", desc: "Send structured prompts, design files and component instructions to Claude, Cursor, Lovable, Replit and VS Code.", status: "Planned" },
  { name: "Flowfreak Automations", tagline: "Automate agency and small-business workflows.", desc: "Handle follow-ups, lead routing, support tasks, SEO checks, client updates and recurring agency work.", status: "Planned" },
];
function ModulesSection() {
  return (
    <Wrap id="product">
      <SectionHeading eyebrow="Product" title="One platform for AI website creation."
        intro="Plan, design, organize and export website projects from one workflow." />
      <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <StaggerItem key={m.name} className="h-full">
            <HoverLift className="h-full">
              <div className="card flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </span>
                  <StatusBadge status={m.status} />
                </div>
                <p className="mt-5 text-[17px] font-bold tracking-tight text-ink">{m.name}</p>
                <p className="mt-1 text-[14px] font-medium text-body">{m.tagline}</p>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{m.desc}</p>
              </div>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </Wrap>
  );
}

/* ─────────────────────────── 5. Component library ─────────────────────────── */
const CATEGORIES = ["Hero sections", "Headers & mega menus", "Service sections", "Feature grids", "Pricing sections", "Booking forms", "Contact sections", "Testimonials", "FAQs", "CTAs", "Footers", "Dashboards", "Blog layouts", "SEO landing pages"];
const LIB_FEATURES = [
  { t: "Industry-ready sections", d: "Patterns built for flooring, taxi, car rental, clinics, construction, SaaS, agencies, ecommerce and more." },
  { t: "Brand-token driven", d: "Components adapt to colors, fonts, spacing, radius and content tone." },
  { t: "Multiple variants", d: "Each section has layout variants for different website styles and goals." },
  { t: "AI-selectable", d: "The AI picks the best section based on business type, goal and page structure." },
];
function LibrarySection() {
  return (
    <div className="bg-surface border-y border-line">
      <Wrap id="library">
        <SectionHeading eyebrow="Component library" title="Design from proven sections, not empty prompts."
          intro="Flowfreak's library gives AI a high-quality design foundation. Each component is categorized by purpose, industry, layout and conversion goal." />
        <FadeUp className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-[13px] font-medium text-body">{c}</span>
          ))}
        </FadeUp>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LIB_FEATURES.map((f) => (
            <StaggerItem key={f.t}>
              <div className="card h-full p-6">
                <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="11" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" /><rect x="3" y="14" width="8" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" /></svg>
                </span>
                <p className="mt-4 text-[15px] font-semibold text-ink">{f.t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{f.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Wrap>
    </div>
  );
}

/* ─────────────────────────── 6. Workflow ─────────────────────────── */
const FLOW = [
  { t: "Business Basics", d: "Business name, industry, services, audience, location, goals." },
  { t: "Website Type", d: "Brochure, landing page, ecommerce, booking site, SaaS, directory or dashboard." },
  { t: "Goals & Features", d: "Leads, bookings, calls, payments, SEO, trust, portfolio, support." },
  { t: "Pages Needed", d: "Home, About, Services, Pricing, Contact, FAQs, Blog, location pages." },
  { t: "Reference Sources", d: "Existing site, inspiration links, screenshots, brand notes." },
  { t: "Review & Create", d: "Confirm the project before generation." },
];
function WorkflowSection() {
  return (
    <Wrap id="workflow">
      <SectionHeading eyebrow="Workflow" title="From client brief to export-ready website plan." />
      <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {FLOW.map((s, i) => (
          <li key={s.t} className="bg-surface p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-accent text-[12px] font-bold text-white">{i + 1}</span>
              <p className="text-[15px] font-semibold text-ink">{s.t}</p>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
      <FadeUp className="mt-8 rounded-2xl border border-line bg-panel/60 p-6">
        <p className="eyebrow mb-3">After you create</p>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[12.5px] text-muted">
          {["Brand Guideline", "Sitemap Canvas", "Wireframe Canvas", "Style Guide", "Design Canvas", "Export"].map((s, i, a) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-surface px-3 py-1 text-ink">{s}</span>
              {i < a.length - 1 && <span className="text-faint">→</span>}
            </span>
          ))}
        </div>
      </FadeUp>
    </Wrap>
  );
}

/* ─────────────────────────── 7. Use cases ─────────────────────────── */
const USE_CASES = [
  { t: "For web agencies", d: "Create first drafts, wireframes, page structures and client-ready concepts faster." },
  { t: "For freelancers", d: "Turn messy client briefs into organized website plans and reusable prompts." },
  { t: "For component teams", d: "Build and manage a reusable section library for consistent delivery." },
  { t: "For small-business projects", d: "Plan SEO pages, service pages, booking flows and conversion-focused layouts." },
  { t: "For AI builders", d: "Prepare better prompts and structured files for Claude, Cursor, Lovable and Replit." },
];
function UseCasesSection() {
  return (
    <div className="bg-surface border-y border-line">
      <Wrap id="use-cases">
        <SectionHeading eyebrow="Use cases" title="Built for agencies and fast-moving website teams." />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <StaggerItem key={u.t} className="h-full">
              <div className="card h-full p-6">
                <p className="text-[15.5px] font-semibold text-ink">{u.t}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{u.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Wrap>
    </div>
  );
}

/* ─────────────────────────── 8. Export files ─────────────────────────── */
const FILES = [
  { name: "BRAND.md", d: "Colors, typography, spacing, tone and design rules." },
  { name: "SITEMAP.md", d: "Pages, sections, goals and navigation structure." },
  { name: "WIREFRAME.md", d: "Page-by-page layout structure." },
  { name: "DESIGN.md", d: "Styled section direction and visual system." },
  { name: "COMPONENTS.md", d: "Selected components and layout variants." },
  { name: "PROMPT_CLAUDE.md", d: "Ready-to-use Claude build prompt." },
  { name: "PROMPT_LOVABLE.md", d: "Ready-to-use Lovable website prompt." },
  { name: "PROMPT_CURSOR.md", d: "Developer-focused implementation prompt." },
];
function ExportSection() {
  return (
    <Wrap id="export">
      <SectionHeading eyebrow="Export" title="Export structured files your tools can understand."
        intro="Flowfreak doesn't trap your project inside one builder. Export clear instructions for the tools you already use." />
      <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FILES.map((f) => (
          <StaggerItem key={f.name}>
            <div className="card h-full p-5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                <span className="font-mono text-[13px] font-semibold text-ink">{f.name}</span>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{f.d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Wrap>
  );
}

/* ─────────────────────────── 9. Industry packs ─────────────────────────── */
const PACKS = ["Taxi & transport", "Flooring & carpets", "Car rental", "Construction", "Cleaning services", "Clinics & healthcare", "Real estate", "Restaurants", "SaaS", "Agencies", "Photography", "Ecommerce"];
function IndustryPacksSection() {
  return (
    <div className="bg-surface border-y border-line">
      <Wrap id="packs">
        <SectionHeading eyebrow="Industry packs" title="Start faster with industry website packs."
          intro="Each pack includes suggested pages, common sections, CTA strategy, content direction and SEO ideas." />
        <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PACKS.map((p) => (
            <StaggerItem key={p}>
              <HoverLift>
                <div className="card p-5">
                  <p className="text-[15px] font-semibold text-ink">{p}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {["Sitemap", "Components", "SEO pages", "CTA pattern"].map((t) => (
                      <li key={t} className="rounded-full bg-panel px-2.5 py-0.5 text-[11.5px] font-medium text-muted">{t}</li>
                    ))}
                  </ul>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Wrap>
    </div>
  );
}

/* ─────────────────────────── 10. Comparison ─────────────────────────── */
const ROWS = [
  ["Prompt to random design", "Brief to structured workflow"],
  ["Generic sections", "Curated component library"],
  ["Weak sitemap planning", "Sitemap and wireframe first"],
  ["Inconsistent brand output", "Brand-token driven system"],
  ["Hard to reuse", "Component-based generation"],
  ["Locked inside one tool", "Export to Claude, Cursor, Lovable, Replit, VS Code"],
];
function ComparisonSection() {
  return (
    <Wrap>
      <SectionHeading eyebrow="Why Flowfreak" title="More controlled than a normal AI website builder." center />
      <FadeUp className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-2 bg-panel/60 text-[13px] font-semibold uppercase tracking-wide">
          <div className="px-5 py-3.5 text-muted">Normal AI builder</div>
          <div className="px-5 py-3.5 text-accent">Flowfreak</div>
        </div>
        {ROWS.map(([a, b], i) => (
          <div key={a} className={`grid grid-cols-2 text-[14px] ${i % 2 ? "bg-surface" : "bg-canvas"}`}>
            <div className="border-t border-line px-5 py-4 text-muted">{a}</div>
            <div className="border-t border-l border-line px-5 py-4 font-medium text-ink">{b}</div>
          </div>
        ))}
      </FadeUp>
    </Wrap>
  );
}

/* ─────────────────────────── 11. Pricing ─────────────────────────── */
const PLANS = [
  { name: "Free", desc: "For testing the workflow.", features: ["Limited projects", "Basic component browsing", "Basic exports"], featured: false, cta: "Start Free" },
  { name: "Studio", desc: "For freelancers and small agencies.", features: ["More projects", "Brand guideline generation", "Sitemap & wireframe tools", "Component selection", "Export files"], featured: true, cta: "Start Building" },
  { name: "Agency", desc: "For teams.", features: ["Client workspaces", "Custom component library", "Version history", "Approval workflow", "Team members", "Advanced exports"], featured: false, cta: "Contact us" },
];
function PricingSection() {
  return (
    <div className="bg-surface border-y border-line">
      <Wrap id="pricing">
        <SectionHeading eyebrow="Pricing" title="Simple plans for agencies and creators." center />
        <Stagger className="mt-12 grid items-start gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <StaggerItem key={p.name} className="h-full">
              <div className={`flex h-full flex-col rounded-2xl border p-7 ${p.featured ? "border-accent bg-canvas shadow-[0_20px_60px_-30px_rgba(233,75,111,0.5)]" : "border-line bg-canvas"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[17px] font-bold text-ink">{p.name}</p>
                  {p.featured && <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white">Popular</span>}
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{p.desc}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-body">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-accent"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <LinkButton href="/signup" size="md" variant={p.featured ? "primary" : "secondary"} className="mt-7 w-full">{p.cta}</LinkButton>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Wrap>
    </div>
  );
}

/* ─────────────────────────── 12. Final CTA ─────────────────────────── */
function FinalCTASection() {
  return (
    <Wrap>
      <FadeUp className="relative overflow-hidden rounded-3xl border border-line bg-ink px-6 py-16 text-center sm:px-16 sm:py-20">
        <h2 className="mx-auto max-w-2xl font-bold tracking-tight text-white text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.08]">
          Create your next website draft with structure, not guesswork.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/70">
          Use AI, wireframes, brand rules and reusable components to move from client brief to production-ready website direction faster.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/signup" size="lg">Start Building</LinkButton>
          <Link href="/#library" className="inline-flex h-12 items-center rounded-lg border border-white/20 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
            Explore Component Library
          </Link>
        </div>
      </FadeUp>
    </Wrap>
  );
}

export function FlowfreakLanding() {
  return (
    <>
      <Hero />
      <CanvasShowcase />
      <ProblemSection />
      <SolutionSection />
      <ModulesSection />
      <LibrarySection />
      <WorkflowSection />
      <UseCasesSection />
      <ExportSection />
      <IndustryPacksSection />
      <ComparisonSection />
      <PricingSection />
      <FinalCTASection />
    </>
  );
}
