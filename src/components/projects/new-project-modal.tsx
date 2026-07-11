"use client";

// "New project" as a modal: a trigger button that opens the chooser (Wix
// Headless Site vs Design Project) in a centered dialog.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NewProjectChooser } from "@/components/projects/new-project-chooser";

const EASE = [0.22, 1, 0.36, 1] as const;

export function NewProjectButton({
  clients,
  label = "New project",
  size = "md",
}: {
  clients: { id: string; name: string }[];
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>{label}</Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-modal="true" role="dialog"
          >
            <button aria-label="Close" className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <motion.div
              className="relative z-10 my-auto w-full max-w-3xl rounded-[10px] border border-line bg-canvas p-6 shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Start something new</h2>
                  <p className="mt-1 text-[13px] text-muted">Build a live Wix Headless site from a template, or plan a design project.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>

              <div className="mt-8">
                <NewProjectChooser clients={clients} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
