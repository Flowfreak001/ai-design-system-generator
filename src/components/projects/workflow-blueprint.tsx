// Workflow blueprint view — the project's automation flow drawn on a light
// canvas grid using the shared node cards. Server component.

import { WorkflowNodeCard, NodeConnector } from "@/components/workflow/workflow-node";

export type BlueprintWorkflow = {
  id: string;
  name: string;
  description: string | null;
  nodes: { id: string; type: string; title: string }[];
  edges: { id: string; sourceId: string; targetId: string; label: string | null }[];
};

export function WorkflowBlueprint({ workflow }: { workflow: BlueprintWorkflow }) {
  const branchLabels = (nodeId: string) =>
    workflow.edges
      .filter((e) => e.sourceId === nodeId && e.label)
      .map((e) => e.label)
      .join(" / ");

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-3.5">
        <p className="text-sm font-semibold text-ink">{workflow.name}</p>
        <p className="text-xs text-muted">{workflow.description}</p>
      </div>

      <div className="canvas-grid rounded-none border-0 p-5 sm:p-8">
        <ol className="mx-auto flex max-w-sm flex-col items-center">
          {workflow.nodes.map((node, i) => (
            <li key={node.id} className="flex w-full flex-col items-center">
              <WorkflowNodeCard kind={node.type} title={node.title} />
              {i < workflow.nodes.length - 1 && (
                <NodeConnector label={branchLabels(node.id) || undefined} />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
