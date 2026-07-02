import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const WEBSITE = [
  { f: "PROJECT_BRIEF.md", d: "The structured client brief." },
  { f: "SCOPE.md", d: "In/out of scope, deliverables, assumptions." },
  { f: "DESIGN.md", d: "Design direction and rules." },
  { f: "CONTENT.md", d: "Voice, page content plan, CTAs." },
  { f: "BUILD_PROMPT.md", d: "Ready prompt for your AI build tool." },
  { f: "HANDOFF.md", d: "Delivery checklist and sign-off." },
];

const AUTOMATION = [
  { f: "WORKFLOW_AUDIT.md", d: "Current process and where leads leak." },
  { f: "AUTOMATION_BLUEPRINT.md", d: "The flow: trigger → AI → approval → action." },
  { f: "TOOLS_STACK.md", d: "What to use, what to skip." },
  { f: "CLIENT_PROPOSAL.md", d: "A proposal the client can say yes to." },
  { f: "BUILD_PLAN.md", d: "Phased rollout, week by week." },
  { f: "HANDOFF.md", d: "How the owner operates it after launch." },
];

function FileList({ title, items }: { title: string; items: { f: string; d: string }[] }) {
  return (
    <div className="card p-5">
      <p className="eyebrow mb-4">{title}</p>
      <Stagger className="grid gap-2">
        {items.map((o) => (
          <StaggerItem key={o.f}>
            <div className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5 transition-colors duration-200 hover:border-line-strong">
              <span className="shrink-0 rounded-md bg-brand/12 px-2 py-1 font-mono text-[11px] text-brand">
                {o.f}
              </span>
              <span className="truncate text-sm text-muted">{o.d}</span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export function OutputFilesSection() {
  return (
    <section id="output" className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32 scroll-mt-20">
      <SectionHeading
        eyebrow="Generated documents"
        title="Real files, versioned, ready to hand over."
        intro="Each project type generates its own delivery set — built from your actual brief, editable, with full version history."
        center
      />
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <FileList title="Website / App projects" items={WEBSITE} />
        <FileList title="Automation Workflow projects" items={AUTOMATION} />
      </div>
    </section>
  );
}
