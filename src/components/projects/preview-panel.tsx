"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Renders the generated preview HTML in a sandboxed iframe with a tab switch
// between the page preview and the component sheet.
export function PreviewPanel({
  previewHtml,
  componentHtml,
}: {
  previewHtml: string | null;
  componentHtml: string | null;
}) {
  const tabs = [
    { id: "page", label: "Design preview", html: previewHtml },
    { id: "components", label: "Components", html: componentHtml },
  ].filter((t) => t.html);
  const [active, setActive] = useState(tabs[0]?.id ?? "page");
  const reduce = useReducedMotion();
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!tabs.length) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-panel text-muted">▦</span>
        <p className="mt-4 text-sm font-medium text-ink">No preview yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Click <span className="text-ink">Generate Preview</span> to render the
          design system visually from the generated files and tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1 border-b border-line px-3 py-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
              t.id === active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <iframe
            title={`${current.label} — generated preview`}
            srcDoc={current.html ?? ""}
            sandbox=""
            className="h-[640px] w-full border-0 bg-white"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
