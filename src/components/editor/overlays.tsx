"use client";

// Lightweight in-canvas overlays for the design editor: a right-side Drawer and
// an anchored Popover. Everything opens over the persistent canvas — no page
// navigation. Escape closes; a faint backdrop keeps the canvas visible behind.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = 340,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Faint backdrop — canvas stays visible behind it. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-ink/10"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ width }}
            className="absolute right-0 top-0 flex h-full max-w-[92vw] flex-col border-l border-line bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{title}</p>
                {subtitle && <p className="truncate text-[11.5px] text-muted">{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-md px-1.5 text-body hover:bg-panel">✕</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Anchored popover. `trigger` opens it; children get a `close` callback. */
export function Popover({
  trigger,
  children,
  align = "left",
  width = 220,
}: {
  trigger: (open: boolean) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex">
        {trigger(open)}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            style={{ width }}
            className={`absolute top-full z-50 mt-1 rounded-xl border border-line bg-surface p-1.5 shadow-xl ${align === "right" ? "right-0" : "left-0"}`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
