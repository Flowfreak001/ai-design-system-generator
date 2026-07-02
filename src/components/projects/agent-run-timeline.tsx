import { StatusBadge } from "./status-badge";

export type TimelineRun = {
  id: string;
  name: string;
  status: string;
  createdAt: Date | string;
  steps: { id: string; title: string; status: string; detail: string | null }[];
};

export function AgentRunTimeline({ runs }: { runs: TimelineRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No agent runs yet. Generate files to start the first run.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {runs.map((run) => (
        <div key={run.id} className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">{run.name}</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-faint">
                {new Date(run.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <StatusBadge status={run.status} />
            </div>
          </div>

          <ol className="mt-5 relative flex flex-col gap-0 border-l border-line pl-6">
            {run.steps.map((s, i) => (
              <li key={s.id} className={i < run.steps.length - 1 ? "pb-5" : ""}>
                <span
                  className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border ${
                    s.status === "completed"
                      ? "border-success bg-success/40"
                      : s.status === "failed"
                        ? "border-danger bg-danger/40"
                        : "border-line-strong bg-canvas"
                  }`}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">{s.title}</p>
                {s.detail && <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
