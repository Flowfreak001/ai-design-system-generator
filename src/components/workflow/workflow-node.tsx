// Workflow node card — shared by the homepage canvas preview and the app's
// blueprint view. Node visual rules per the design direction: color explains
// node type; content shows type, title, one-liner, status chip.

export type NodeKind =
  | "TRIGGER"
  | "AI_CLASSIFY"
  | "AI_AGENT"
  | "CONDITION"
  | "CREATE_LEAD"
  | "CREATE_TASK"
  | "SEND_EMAIL"
  | "ACTION"
  | "HUMAN_APPROVAL"
  | "END";

const KIND_STYLE: Record<
  string,
  { label: string; border: string; chip: string; icon: string }
> = {
  TRIGGER: { label: "Trigger", border: "border-l-ink", chip: "bg-panel text-ink", icon: "⚡" },
  AI_CLASSIFY: { label: "AI Agent", border: "border-l-accent", chip: "bg-accent-soft text-accent", icon: "✦" },
  AI_AGENT: { label: "AI Agent", border: "border-l-accent", chip: "bg-accent-soft text-accent", icon: "✦" },
  CONDITION: { label: "Condition", border: "border-l-info", chip: "bg-info-soft text-info", icon: "⑃" },
  CREATE_LEAD: { label: "Action", border: "border-l-line-strong", chip: "bg-panel text-muted", icon: "▸" },
  CREATE_TASK: { label: "Action", border: "border-l-line-strong", chip: "bg-panel text-muted", icon: "▸" },
  SEND_EMAIL: { label: "Action", border: "border-l-line-strong", chip: "bg-panel text-muted", icon: "▸" },
  ACTION: { label: "Action", border: "border-l-line-strong", chip: "bg-panel text-muted", icon: "▸" },
  HUMAN_APPROVAL: { label: "Approval", border: "border-l-warning", chip: "bg-warning-soft text-warning", icon: "✓" },
  END: { label: "End", border: "border-l-line", chip: "bg-panel text-faint", icon: "◼" },
};

export function WorkflowNodeCard({
  kind,
  title,
  description,
  status = "Ready",
  compact = false,
}: {
  kind: NodeKind | string;
  title: string;
  description?: string;
  status?: string;
  compact?: boolean;
}) {
  const s = KIND_STYLE[kind] ?? KIND_STYLE.ACTION;
  return (
    <div
      className={`card w-full border-l-[3px] ${s.border} ${compact ? "px-3.5 py-2.5" : "px-4 py-3"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${s.chip}`}>
          <span aria-hidden="true">{s.icon}</span>
          {s.label}
        </span>
        <span className="rounded-full bg-success-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-success">
          {status}
        </span>
      </div>
      <p className={`mt-1.5 font-medium text-ink ${compact ? "text-[13px]" : "text-sm"}`}>{title}</p>
      {description && !compact && (
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
      )}
    </div>
  );
}

export function NodeConnector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-0.5 text-line-strong">
      {label && (
        <span className="mb-0.5 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
          {label}
        </span>
      )}
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
        <path d="M6 0v10m0 0l-3.5-3.5M6 10l3.5-3.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
