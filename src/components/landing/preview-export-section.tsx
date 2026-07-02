"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "./section";
import { LinkButton } from "@/components/ui/button";

const TABS = [
  {
    id: "BRAND.md",
    body: `# BRAND — Aurora
## Positioning
For freelancers, Aurora delivers effortless invoicing with a premium, trustworthy feel.
## Tone of voice
Confident, clear, credible. Short sentences. Concrete benefits.
## Conversion message
Lead with the outcome. Primary CTA: Start free.`,
  },
  {
    id: "DESIGN.md",
    body: `# DESIGN — Aurora
## Color usage
- Primary: #6D5EF6 (accent, CTAs)
- Neutral base, WCAG AA contrast
## Typography
Strong sans for display + body; mono for data.
## Cards
Soft border + subtle shadow; lift on hover — never bounce.`,
  },
  {
    id: "preview.html",
    body: `<!doctype html>
<html>
  <!-- Rendered preview of the generated design system -->
  <body class="bg-canvas">
    <h1>Aurora — invoicing, handled.</h1>
    <button class="btn-primary">Start free</button>
  </body>
</html>`,
  },
];

export function PreviewExportSection() {
  const [active, setActive] = useState(TABS[0].id);
  const reduce = useReducedMotion();
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="preview" className="border-y border-line bg-surface/40 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32">
        <SectionHeading
          eyebrow="Preview & export"
          title="See the system before you ship it."
          intro="Preview each generated file and the rendered design, then export the full package for your platform."
          center
        />

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="card overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-line px-3 py-2" role="tablist">
              {TABS.map((t) => {
                const on = t.id === active;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(t.id)}
                    className={`relative rounded-lg px-3 py-1.5 font-mono text-xs transition-colors duration-200 ${
                      on ? "text-ink" : "text-faint hover:text-muted"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06]"
                        transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    {t.id}
                  </button>
                );
              })}
            </div>

            {/* Panel */}
            <div className="relative min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={current.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-auto p-5 font-mono text-[13px] leading-relaxed text-muted"
                >
                  {current.body}
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <LinkButton href="/projects/new" size="lg">
              Generate your own
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
