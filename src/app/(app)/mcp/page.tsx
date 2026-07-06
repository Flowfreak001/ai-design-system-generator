import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, Placeholder } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { MCP_TOOLS, MCP_CLIENTS } from "@/data/flowfreak";

export const metadata: Metadata = { title: "Flowfreak MCP" };

const TOOL_STATE: Record<string, string> = {
  available: "border-success/25 bg-success-soft text-success",
  beta: "border-brand-purple/25 bg-accent-soft text-brand-purple",
  planned: "border-line bg-panel text-muted",
};

// Phase 7 will ship the real MCP server + tool handlers.
export default async function MCPPage() {
  await requireUser();
  return (
    <PageContainer>
      <PageHeader
        title="Flowfreak MCP"
        description="Expose Flowfreak intelligence to Claude, Cursor, Lovable, and VS Code over the Model Context Protocol."
        action={<Button disabled>Copy connection URL</Button>}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          {/* Server status */}
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-panel">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">Flowfreak MCP Server</p>
                  <p className="text-[12.5px] text-muted">Local preview · not yet live</p>
                </div>
              </div>
              <span className="rounded-full border border-warning/25 bg-warning-soft px-2.5 py-1 text-[11.5px] font-medium text-warning">Planned</span>
            </div>
          </Panel>

          {/* Tools list */}
          <Panel title="Tools" subtitle="Capabilities other AI tools can call.">
            <div className="grid gap-3">
              {MCP_TOOLS.map((t) => (
                <div key={t.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-[13px] font-semibold text-ink">{t.name}</code>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-medium capitalize ${TOOL_STATE[t.status]}`}>{t.status}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted">{t.description}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">Input</p>
                      <pre className="overflow-x-auto rounded-lg bg-panel px-3 py-2 text-[11.5px] text-body">{t.inputExample}</pre>
                    </div>
                    <div>
                      <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">Output</p>
                      <pre className="overflow-x-auto rounded-lg bg-panel px-3 py-2 text-[11.5px] text-body">{t.outputExample}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-5">
          <Panel title="Connected tools">
            <ul className="grid gap-2.5">
              {MCP_CLIENTS.map((c) => (
                <li key={c.name} className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px]">
                  <span className="font-medium text-ink">{c.name}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[12px] ${c.connected ? "text-success" : "text-faint"}`}>
                    <span className={`h-2 w-2 rounded-full ${c.connected ? "bg-success" : "bg-line-strong"}`} />
                    {c.connected ? "Connected" : "Not connected"}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Example workflow">
            <ol className="grid gap-2 text-[12.5px] text-body">
              <li>1. Ask Claude: “Plan a car rental website.”</li>
              <li>2. Claude calls <code className="text-ink">generate_wireframe</code>.</li>
              <li>3. Flowfreak returns the page/section blueprint.</li>
              <li>4. Claude calls <code className="text-ink">search_library</code> to fill sections.</li>
            </ol>
          </Panel>
          <Panel title="Setup">
            <Placeholder label="Connection instructions" hint="mcp.json snippet + auth token (Phase 7)." />
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
