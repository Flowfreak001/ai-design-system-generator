"use client";

// Project workspace tabs — client shell that switches server-rendered panels.
// Panels are passed as ReactNode so all data loading stays on the server.

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type WorkspacePanel = { id: string; label: string; badge?: string | number; content: ReactNode };

export function WorkspaceTabs({ panels, initial }: { panels: WorkspacePanel[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? panels[0]?.id);
  const reduce = useReducedMotion();
  const current = panels.find((p) => p.id === active) ?? panels[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project sections"
        className="sticky top-16 z-30 -mx-5 flex gap-1 overflow-x-auto border-b border-line bg-canvas/90 px-5 py-2 backdrop-blur sm:-mx-8 sm:px-8"
      >
        {panels.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(p.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
                on ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-panel hover:text-ink"
              }`}
            >
              {p.label}
              {p.badge !== undefined && p.badge !== 0 && (
                <span className={`rounded-full px-1.5 font-mono text-[10px] ${on ? "bg-accent/15" : "bg-panel"}`}>
                  {p.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          role="tabpanel"
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="pt-6"
        >
          {current.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
