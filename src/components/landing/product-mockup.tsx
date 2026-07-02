// Hero product mockup — a composite of the real product surfaces: workspace
// sidebar, workflow canvas, generated files, and an approval item.

import { WorkflowNodeCard, NodeConnector } from "@/components/workflow/workflow-node";

const NAV = ["Dashboard", "Projects", "Workflows", "Approvals", "Leads", "Templates"];
const FILES = ["PROJECT_BRIEF.md", "SCOPE.md", "AUTOMATION_BLUEPRINT.md", "CLIENT_PROPOSAL.md", "HANDOFF.md"];

export function ProductMockup() {
  return (
    <div className="card overflow-hidden shadow-[0_16px_48px_-24px_rgba(8,9,10,0.18)]">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-panel/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 font-mono text-[11px] text-muted">projectos — acme-plumbing</span>
      </div>

      <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[124px_1fr_156px]">
        {/* sidebar */}
        <aside className="flex flex-col border-r border-line bg-surface p-2.5">
          {NAV.map((n, i) => (
            <div
              key={n}
              className={`mb-0.5 truncate rounded-md px-2 py-1.5 text-[11px] ${
                i === 2 ? "bg-accent-soft font-medium text-accent" : "text-muted"
              }`}
            >
              {n}
            </div>
          ))}
          <div className="mt-auto rounded-md bg-panel px-2 py-1.5 font-mono text-[9px] text-faint">
            demo@agency.dev
          </div>
        </aside>

        {/* workflow canvas */}
        <div className="canvas-grid p-4 sm:p-5">
          <div className="mx-auto flex max-w-[250px] flex-col items-center">
            <WorkflowNodeCard compact kind="TRIGGER" title="Website form submitted" />
            <NodeConnector />
            <WorkflowNodeCard compact kind="AI_CLASSIFY" title="Classify enquiry urgency" />
            <NodeConnector label="Urgent" />
            <WorkflowNodeCard compact kind="CREATE_LEAD" title="Save lead & alert owner" />
            <NodeConnector />
            <WorkflowNodeCard compact kind="HUMAN_APPROVAL" title="Owner approves reply" status="Waiting" />
            <NodeConnector />
            <WorkflowNodeCard compact kind="SEND_EMAIL" title="Send response" />
          </div>
        </div>

        {/* files + activity */}
        <aside className="hidden flex-col border-l border-line bg-surface p-2.5 sm:flex">
          <p className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-faint">
            Generated files
          </p>
          {FILES.map((f) => (
            <div key={f} className="mb-0.5 truncate rounded-md px-2 py-1 font-mono text-[10px] text-body">
              {f}
            </div>
          ))}
          <p className="px-1 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-wider text-faint">
            Activity
          </p>
          <div className="rounded-md bg-warning-soft px-2 py-1.5 text-[10px] leading-snug text-warning">
            1 reply awaiting approval
          </div>
          <div className="mt-1 rounded-md bg-success-soft px-2 py-1.5 text-[10px] leading-snug text-success">
            6 files generated
          </div>
          <div className="mt-1 rounded-md bg-info-soft px-2 py-1.5 text-[10px] leading-snug text-info">
            Workflow run completed
          </div>
        </aside>
      </div>
    </div>
  );
}
