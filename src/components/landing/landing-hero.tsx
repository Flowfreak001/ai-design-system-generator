"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";
import { ProductMockup } from "./product-mockup";

const EASE = [0.22, 1, 0.36, 1] as const;

const BADGES = [
  "Project briefs",
  "Workflow blueprints",
  "AI-generated files",
  "Approval queues",
  "Client handoff docs",
];

export function LandingHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-12 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <motion.div {...rise(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Human-in-the-loop by default
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.07)}
              className="mt-5 font-semibold tracking-[-0.03em] text-[clamp(2.4rem,4.6vw,3.9rem)] leading-[1.06]"
            >
              AI project workspace and{" "}
              <span className="text-accent">workflow builder</span> for agencies.
            </motion.h1>

            <motion.p {...rise(0.14)} className="mt-5 max-w-lg text-lg leading-relaxed">
              Organize client projects from first brief to final handoff, then
              build simple AI-powered workflows for leads, bookings, support,
              approvals, and follow-ups.
            </motion.p>

            <motion.div {...rise(0.21)} className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/projects/new" size="lg">
                Create your first project
              </LinkButton>
              <LinkButton href="/#workflow" variant="secondary" size="lg">
                View workflow examples
              </LinkButton>
            </motion.div>

            <motion.ul {...rise(0.28)} className="mt-8 flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <li
                  key={b}
                  className="rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] text-muted"
                >
                  {b}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.18 }}
          >
            <ProductMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
