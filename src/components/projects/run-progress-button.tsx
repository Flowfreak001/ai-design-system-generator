"use client";

// Button that runs a long server action while showing LIVE pipeline progress:
// it polls the project's AgentRun (written step-by-step by the pipeline) and
// renders each step as it completes. Used for Analyze References and
// Generate MD Files.

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Step = { id: string; title: string; status: string; detail: string | null };
type RunStatus = { id: string; name: string; status: string; steps: Step[] } | null;

export function RunProgressButton({
  projectId,
  runName,
  label,
  pendingLabel,
  action,
  variant = "secondary",
}: {
  projectId: string;
  runName: string;
  label: string;
  pendingLabel: string;
  action: () => Promise<void>;
  variant?: "primary" | "secondary";
}) {
  const [isPending, startTransition] = useTransition();
  const [run, setRun] = useState<RunStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = (since: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/projects/${projectId}/run-status?name=${encodeURIComponent(runName)}&since=${encodeURIComponent(since)}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = (await res.json()) as RunStatus;
          if (data) setRun(data);
          if (data && data.status !== "running") stopPolling();
        }
      } catch {
        /* transient poll failure — keep polling */
      }
    }, 1200);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const onClick = () => {
    if (isPending) return;
    setError(null);
    setRun(null);
    const since = new Date(Date.now() - 2000).toISOString();
    startPolling(since);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        // one last fetch to capture the final state
        setTimeout(stopPolling, 3000);
      }
    });
  };

  const showPanel = isPending || (run && run.status === "running");

  return (
    <div className="grid gap-3">
      <div>
        <Button type="button" variant={variant} onClick={onClick} disabled={isPending} className="disabled:opacity-60">
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {pendingLabel}
            </span>
          ) : (
            label
          )}
        </Button>
      </div>

      <AnimatePresence>
        {(showPanel || (run && !isPending)) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-4"
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">{runName}</p>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  run?.status === "completed"
                    ? "bg-success-soft text-success"
                    : run?.status === "failed"
                      ? "bg-danger-soft text-danger"
                      : "bg-info-soft text-info"
                }`}
              >
                {run?.status ?? "starting"}
              </span>
            </div>

            <ol className="mt-3 grid gap-2">
              {(run?.steps ?? []).map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success-soft text-[10px] text-success">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{s.title}</p>
                    {s.detail && <p className="text-xs leading-relaxed text-muted">{s.detail}</p>}
                  </div>
                </motion.li>
              ))}
              {(isPending || run?.status === "running") && (
                <li className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-info border-t-transparent" aria-hidden="true" />
                  <p className="text-[13px] text-muted">Working…</p>
                </li>
              )}
            </ol>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            {run?.status === "completed" && !isPending && (
              <p className="mt-3 text-[13px] text-success">Done — results updated below.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
