"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

const PIPELINE = [
  { label: "Client brief captured", tag: "input" },
  { label: "PROJECT_BRIEF.md · SCOPE.md generated", tag: "files" },
  { label: "Enquiry workflow drafted", tag: "workflow" },
  { label: "Reply awaiting owner approval", tag: "approval" },
  { label: "HANDOFF.md ready for delivery", tag: "handoff" },
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
          <div>
            <motion.div {...rise(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3 py-1 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Agency Project OS + Automation Builder
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.08)}
              className="mt-6 font-bold tracking-tight text-[clamp(2.4rem,5.4vw,4rem)] leading-[1.05]"
            >
              Run client projects and{" "}
              <span className="text-gradient">small-business automations</span>{" "}
              from one AI-powered workspace.
            </motion.h1>

            <motion.p
              {...rise(0.16)}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              For freelancers and agencies: capture the client brief, generate
              scope, design, and build files, plan automation workflows with
              human approval points, and hand off with versioned documents —
              from first call to final delivery.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
              <LinkButton href="/projects/new" size="lg">
                Create Project
              </LinkButton>
              <LinkButton href="/#how" variant="secondary" size="lg">
                How it works
              </LinkButton>
            </motion.div>

            <motion.p {...rise(0.32)} className="mt-6 font-mono text-xs text-faint">
              Websites &amp; apps · Automation workflows · Approvals · Handoff
            </motion.p>
          </div>

          {/* Live-workspace card */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-mono text-xs text-faint">acme-plumbing · project activity</span>
              <span className="rounded-full bg-success/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-success">
                on track
              </span>
            </div>
            <ul className="p-3">
              {PIPELINE.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.5 + i * 0.08 }}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2.5 text-[13px] text-ink/90">
                    <span className="text-brand">›</span>
                    {item.label}
                  </span>
                  <span className="shrink-0 rounded-md bg-brand/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
                    {item.tag}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
