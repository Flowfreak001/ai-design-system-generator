import { Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const PILLARS = [
  {
    t: "Project Workspace",
    d: "Every client project in one place — brief, inputs, generated files, notes, decisions, and activity.",
  },
  {
    t: "AI Brief Builder",
    d: "Turn client notes into scope, design direction, content plans, and build-ready prompts.",
  },
  {
    t: "Workflow Builder",
    d: "Design automation blueprints — triggers, AI steps, conditions, and actions your clients can read.",
  },
  {
    t: "Approval & Handoff",
    d: "AI drafts; humans approve customer-facing actions. Versioned files and a clean handoff package.",
  },
];

export function FeatureSection() {
  return (
    <section id="product" className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28 scroll-mt-20">
      <SectionHeading
        eyebrow="What the platform does"
        title="From brief to delivery, with AI doing the admin work."
        intro="Not a project-management clone and not another Zapier — a focused delivery system for agencies and the small businesses they serve."
      />
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((f) => (
          <StaggerItem key={f.t}>
            <HoverLift className="card h-full p-6">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel text-accent">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em]">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
