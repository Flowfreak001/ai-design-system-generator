"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

const FILES = [
  "BRAND.md",
  "DESIGN.md",
  "CREATIVE.md",
  "CONTENT.md",
  "COMPONENTS.md",
  "ANIMATION.md",
  "SEO.md",
  "PROMPT_CLAUDE_CODE.md",
];

export function LandingHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section className="relative overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div>
            <motion.div {...rise(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3 py-1 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Multi-agent design intelligence
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.08)}
              className="mt-6 font-bold tracking-tight text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02]"
            >
              Turn a brief into an{" "}
              <span className="text-gradient">AI-ready design system</span>.
            </motion.h1>

            <motion.p
              {...rise(0.16)}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              Not a website builder. A design intelligence system for agencies,
              designers, and developers — structured input in, production-ready
              brand, design, content, animation, SEO, and platform prompts out.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
              <LinkButton href="/projects/new" size="lg">
                Start a project
              </LinkButton>
              <LinkButton href="/#workflow" variant="secondary" size="lg">
                See how it works
              </LinkButton>
            </motion.div>

            <motion.p {...rise(0.32)} className="mt-6 font-mono text-xs text-faint">
              No credit card · Generates real markdown + prompts
            </motion.p>
          </div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-xs text-faint">design-system/</span>
            </div>
            <ul className="p-3">
              {FILES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.5 + i * 0.06 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-[13px] hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-brand">›</span>
                    <span className="text-ink/90">{f}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-success">ready</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
