"use client";

// Pipeline action with a confirm-first dialog: every action (analyze,
// generate, preview, export) opens a modal that explains what will happen
// and asks for confirmation. Progress streams INSIDE the dialog (polling the
// project's AgentRun), so the page layout never stretches while a run is
// live. Trigger renders as a uniform action card or a button.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Step = { id: string; title: string; status: string; detail: string | null };
type RunStatus = { id: string; name: string; status: string; steps: Step[] } | null;
type Phase = "confirm" | "running" | "done" | "failed";

export function ActionDialog({
  projectId,
  title,
  description,
  confirmText,
  runName,
  action,
  downloadHref,
  trigger = "card",
  triggerLabel,
  disabledNote,
}: {
  projectId: string;
  title: string;
  description: string;
  /** What the confirmation dialog says will happen. */
  confirmText: string;
  /** AgentRun name to poll for live steps (omit for download actions). */
  runName?: string;
  action?: () => Promise<void>;
  /** For export: a download URL triggered after confirmation. */
  downloadHref?: string;
  trigger?: "card" | "button";
  triggerLabel?: string;
  /** Renders the card disabled with this note instead of being clickable. */
  disabledNote?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("confirm");
  const [run, setRun] = useState<RunStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const startPolling = (since: string) => {
    stopPolling();
    if (!runName) return;
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

  const onOpenChange = (next: boolean) => {
    if (!next && phase === "running") return; // don't dismiss mid-run
    setOpen(next);
    if (next) {
      setPhase("confirm");
      setRun(null);
      setError(null);
    } else {
      stopPolling();
    }
  };

  const onConfirm = () => {
    if (downloadHref && !action) {
      window.location.href = downloadHref;
      setPhase("done");
      setTimeout(() => router.refresh(), 1500);
      return;
    }
    if (!action) return;
    setPhase("running");
    startPolling(new Date(Date.now() - 2000).toISOString());
    startTransition(async () => {
      try {
        await action();
        setPhase("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("failed");
      } finally {
        setTimeout(stopPolling, 3000);
        router.refresh();
      }
    });
  };

  const triggerEl =
    trigger === "card" ? (
      disabledNote ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 p-4 text-left">
          <p className="text-sm font-semibold text-faint">{title}</p>
          <p className="mt-1 text-xs text-muted">{disabledNote}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="w-full cursor-pointer rounded-2xl border border-line bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong"
        >
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </button>
      )
    ) : (
      <Button type="button" variant="primary" onClick={() => onOpenChange(true)} disabled={Boolean(disabledNote)}>
        {triggerLabel ?? title}
      </Button>
    );

  return (
    <>
      {triggerEl}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={phase !== "running"}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{phase === "confirm" ? confirmText : description}</DialogDescription>
          </DialogHeader>

          {phase === "confirm" && (
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={onConfirm}>
                {downloadHref && !action ? "Download" : "Run now"}
              </Button>
            </DialogFooter>
          )}

          {phase !== "confirm" && (
            <div aria-live="polite">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{runName ?? title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    phase === "done"
                      ? "bg-success-soft text-success"
                      : phase === "failed"
                        ? "bg-danger-soft text-danger"
                        : "bg-info-soft text-info"
                  }`}
                >
                  {phase === "running" ? (run?.status ?? "starting") : phase}
                </span>
              </div>

              <ol className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
                {(run?.steps ?? []).map((s) => (
                  <li key={s.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success-soft text-[10px] text-success">✓</span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink">{s.title}</p>
                      {s.detail && <p className="text-xs leading-relaxed text-muted">{s.detail}</p>}
                    </div>
                  </li>
                ))}
                {phase === "running" && (
                  <li className="flex items-center gap-2.5">
                    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-info border-t-transparent" aria-hidden="true" />
                    <p className="text-[13px] text-muted">Working…</p>
                  </li>
                )}
              </ol>

              {error && <p className="mt-3 text-sm text-danger">{error}</p>}
              {phase === "done" && (
                <p className="mt-3 text-[13px] text-success">
                  {downloadHref && !action ? "Download started." : "Done — results updated in the tabs."}
                </p>
              )}

              {phase !== "running" && (
                <DialogFooter className="mt-4">
                  <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
