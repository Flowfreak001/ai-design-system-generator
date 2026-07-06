import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, Placeholder } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { AUTOMATIONS } from "@/data/flowfreak";

export const metadata: Metadata = { title: "Flowfreak Automations" };

const CAT: Record<string, string> = {
  website: "text-brand-blue", lead: "text-brand-pink", support: "text-brand-orange", agency: "text-brand-purple",
};
const STATE: Record<string, string> = {
  active: "border-success/25 bg-success-soft text-success",
  paused: "border-warning/25 bg-warning-soft text-warning",
  draft: "border-line bg-panel text-muted",
};

// Phase 6 will add the real trigger→action workflow builder.
export default async function AutomationsPage() {
  await requireUser();
  const recent = AUTOMATIONS.filter((a) => a.lastRun).slice(0, 4);
  return (
    <PageContainer>
      <PageHeader
        title="Flowfreak Automations"
        description="Automate website, lead, support, and agency workflows with triggers and actions."
        action={<Button disabled>Create workflow</Button>}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Workflow cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {AUTOMATIONS.map((w) => (
            <div key={w.id} className="card flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-ink">{w.name}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-medium capitalize ${STATE[w.status]}`}>{w.status}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted">{w.description}</p>
              <p className={`mt-2 text-[11px] font-medium uppercase tracking-wide ${CAT[w.category]}`}>{w.category}</p>

              {/* trigger → actions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                <span className="rounded-md border border-line bg-panel px-2 py-1 text-body">{w.trigger.label}</span>
                {w.actions.map((a) => (
                  <span key={a.type} className="flex items-center gap-1.5 text-faint">
                    <span aria-hidden>→</span>
                    <span className="rounded-md border border-line bg-surface px-2 py-1 text-body">{a.label}</span>
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[11.5px] text-faint">
                <span>{w.runs} runs</span>
                <span>{w.lastRun ? `Last run ${w.lastRun}` : "Never run"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5">
          <Panel title="Recent runs">
            <ul className="grid gap-3">
              {recent.map((w) => (
                <li key={w.id} className="flex items-center justify-between text-[13px]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{w.name}</span>
                    <span className="block text-[12px] text-muted">{w.runs} total runs</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11.5px] text-faint">{w.lastRun}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Builder" subtitle="Drag triggers and actions to compose a flow.">
            <Placeholder label="Visual workflow builder" hint="Trigger → condition → action canvas (Phase 6)." className="min-h-[220px]" />
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
