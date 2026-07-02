const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-white/[0.06] text-muted border-line-strong",
  IN_PROGRESS: "bg-brand/15 text-brand border-brand/30",
  REVIEW: "bg-warning/12 text-warning border-warning/30",
  DELIVERED: "bg-success/12 text-success border-success/30",
  ARCHIVED: "bg-white/[0.04] text-faint border-line",
  // step/run statuses
  completed: "bg-success/12 text-success border-success/30",
  running: "bg-brand/15 text-brand border-brand/30",
  failed: "bg-danger/12 text-danger border-danger/30",
  pending: "bg-white/[0.04] text-faint border-line",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
        STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  WEBSITE_APP: { label: "Website / App", cls: "bg-brand/12 text-brand border-brand/25" },
  AUTOMATION_WORKFLOW: { label: "Automation", cls: "bg-accent/12 text-accent border-accent/25" },
};

export function TypeBadge({ type }: { type: string }) {
  const t = TYPE_STYLES[type] ?? TYPE_STYLES.WEBSITE_APP;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${t.cls}`}
    >
      {t.label}
    </span>
  );
}
