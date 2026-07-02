const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-panel text-muted border-line",
  IN_PROGRESS: "bg-info-soft text-info border-info/25",
  REVIEW: "bg-warning-soft text-warning border-warning/25",
  DELIVERED: "bg-success-soft text-success border-success/25",
  ARCHIVED: "bg-panel text-faint border-line",
  // step/run statuses
  completed: "bg-success-soft text-success border-success/25",
  running: "bg-info-soft text-info border-info/25",
  failed: "bg-danger-soft text-danger border-danger/25",
  pending: "bg-panel text-muted border-line",
};

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
        STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT
      }`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

const TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  WEBSITE_APP: { label: "Website / App", cls: "bg-accent-soft text-accent border-accent/25" },
  AUTOMATION_WORKFLOW: { label: "Automation", cls: "bg-info-soft text-info border-info/25" },
};

export function TypeBadge({ type }: { type: string }) {
  const t = TYPE_STYLES[type] ?? TYPE_STYLES.WEBSITE_APP;
  return (
    <Badge
      className={`rounded-full font-mono text-[11px] uppercase tracking-wide ${t.cls}`}
    >
      {t.label}
    </Badge>
  );
}
