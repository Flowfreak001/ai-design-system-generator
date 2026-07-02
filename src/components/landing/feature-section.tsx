import { Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const PILLARS = [
  {
    t: "Project Workspace",
    d: "Every client project in one place — brief, inputs, files, notes, decisions, and activity history.",
  },
  {
    t: "AI Brief Builder",
    d: "Structured client input becomes real documents: scope, design direction, content plan, and build prompts.",
  },
  {
    t: "Workflow Builder",
    d: "Plan small-business automations — triggers, AI steps, conditions, and actions — as clear blueprints.",
  },
  {
    t: "Approval & Handoff",
    d: "Human approval points where they matter, versioned files, and a clean handoff package at delivery.",
  },
];

const USE_CASES = [
  { t: "Agencies", d: "Scope and deliver client builds faster." },
  { t: "Freelancers", d: "Look like a team of five, alone." },
  { t: "Plumbers & trades", d: "Emergency triage, quotes, follow-ups." },
  { t: "Restaurants", d: "Bookings, catering enquiries, reviews." },
  { t: "Real estate", d: "Viewings, maintenance, vendor routing." },
  { t: "Taxi & car rental", d: "Bookings, estimates, documents." },
];

function Dot() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong bg-white/[0.03] text-brand">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function FeatureSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32 scroll-mt-20">
      <SectionHeading
        eyebrow="Product pillars"
        title="One workspace from first brief to final handoff."
        intro="Not a project-management clone and not another Zapier — a focused delivery system for agencies and the businesses they serve."
      />
      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((f) => (
          <StaggerItem key={f.t}>
            <HoverLift className="card h-full p-6">
              <Dot />
              <h3 className="mt-5 text-[15px] font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-20">
        <SectionHeading
          eyebrow="Who it's for"
          title="Built for the people doing the work."
        />
        <Stagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <StaggerItem key={u.t}>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3.5 transition-colors duration-200 hover:border-line-strong">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-sm font-semibold">{u.t}</p>
                  <p className="text-xs text-muted">{u.d}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
