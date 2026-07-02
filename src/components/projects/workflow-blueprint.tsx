// Simple vertical flow display of a workflow's nodes + edges — the visual
// foundation the future drag-and-drop builder replaces. Server component.

const NODE_STYLE: Record<string, { label: string; cls: string }> = {
  TRIGGER: { label: "Trigger", cls: "text-accent border-accent/30 bg-accent/10" },
  AI_CLASSIFY: { label: "AI", cls: "text-brand border-brand/30 bg-brand/10" },
  CONDITION: { label: "Condition", cls: "text-warning border-warning/30 bg-warning/10" },
  CREATE_LEAD: { label: "Action", cls: "text-ink border-line-strong bg-white/[0.05]" },
  CREATE_TASK: { label: "Action", cls: "text-ink border-line-strong bg-white/[0.05]" },
  SEND_EMAIL: { label: "Action", cls: "text-ink border-line-strong bg-white/[0.05]" },
  HUMAN_APPROVAL: { label: "Approval", cls: "text-success border-success/30 bg-success/10" },
  END: { label: "End", cls: "text-faint border-line bg-white/[0.02]" },
};

export type BlueprintWorkflow = {
  id: string;
  name: string;
  description: string | null;
  nodes: { id: string; type: string; title: string }[];
  edges: { id: string; sourceId: string; targetId: string; label: string | null }[];
};

export function WorkflowBlueprint({ workflow }: { workflow: BlueprintWorkflow }) {
  const branchLabels = (nodeId: string) =>
    workflow.edges.filter((e) => e.sourceId === nodeId && e.label).map((e) => e.label);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{workflow.name}</p>
        <p className="text-xs text-muted">{workflow.description}</p>
      </div>

      <ol className="mt-6 flex flex-col items-stretch gap-0 sm:mx-auto sm:max-w-md">
        {workflow.nodes.map((node, i) => {
          const style = NODE_STYLE[node.type] ?? NODE_STYLE.CREATE_TASK;
          const branches = branchLabels(node.id);
          return (
            <li key={node.id} className="flex flex-col items-center">
              <div className={`w-full rounded-xl border px-4 py-3 ${style.cls}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{node.title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider opacity-80">
                    {style.label}
                  </span>
                </div>
              </div>

              {i < workflow.nodes.length - 1 && (
                <div className="flex flex-col items-center py-1 text-faint">
                  {branches.length > 0 && (
                    <span className="mb-0.5 font-mono text-[10px] text-warning">
                      {branches.join(" / ")}
                    </span>
                  )}
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
                    <path d="M6 0v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
