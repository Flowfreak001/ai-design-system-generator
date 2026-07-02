const STYLES: Record<string, string> = {
  DRAFT: "bg-white/[0.06] text-muted border-line-strong",
  GENERATING: "bg-warning/12 text-warning border-warning/30",
  READY: "bg-success/12 text-success border-success/30",
  FAILED: "bg-danger/12 text-danger border-danger/30",
  QUEUED: "bg-white/[0.06] text-muted border-line-strong",
  RUNNING: "bg-brand/15 text-brand border-brand/30",
  COMPLETED: "bg-success/12 text-success border-success/30",
  PENDING: "bg-white/[0.04] text-faint border-line",
  STALE: "bg-warning/10 text-warning border-warning/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
        STYLES[status] ?? STYLES.DRAFT
      }`}
    >
      {status}
    </span>
  );
}
