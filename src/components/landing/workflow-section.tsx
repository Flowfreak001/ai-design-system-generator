"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "./section";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { n: "01", t: "Create project", d: "Website/app build or automation workflow — pick the type, name the client." },
  { n: "02", t: "Add the brief", d: "Goals, audience, pages or processes, pain points, and what needs human approval." },
  { n: "03", t: "Generate files & workflow", d: "Scope, design, content, proposals, build prompts — plus a workflow blueprint for automation projects." },
  { n: "04", t: "Track versions & approvals", d: "Every file versioned, every AI run logged, approval points where they matter." },
  { n: "05", t: "Deliver the handoff", d: "A clean HANDOFF.md and delivery package the client can actually use." },
];

export function WorkflowSection() {
  const reduce = useReducedMotion();
  return (
    <section id="how" className="border-y border-line bg-surface/40 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32">
        <SectionHeading
          eyebrow="How it works"
          title="From first client call to final handoff."
          intro="A structured path through delivery — the AI does the drafting, you make the decisions."
        />

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-brand/10 via-brand/50 to-accent/30 lg:block" />
          <motion.ol
            className="grid gap-8 lg:grid-cols-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {STEPS.map((s) => (
              <motion.li
                key={s.n}
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                }}
                className="relative"
              >
                <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-canvas font-mono text-sm text-brand">
                  {s.n}
                </span>
                <h3 className="mt-5 text-[15px] font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
