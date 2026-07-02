"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "./section";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { n: "01", agent: "Intake", t: "Define the project", d: "Business, audience, brand, pages, platform, and references — captured as structured input." },
  { n: "02", agent: "Research", t: "Analyze context", d: "Reference sites, competitors, and brand data are read to ground every decision." },
  { n: "03", agent: "Design agents", t: "Run the pipeline", d: "Brand, design, creative, content, animation, and SEO agents work in sequence." },
  { n: "04", agent: "Generate", t: "Produce the files", d: "Structured markdown, tokens, and platform prompts — using your real inputs." },
  { n: "05", agent: "Deliver", t: "Preview & export", d: "Preview the system and export the package for your build tool of choice." },
];

export function WorkflowSection() {
  const reduce = useReducedMotion();
  return (
    <section id="workflow" className="border-y border-line bg-surface/40 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 md:py-32">
        <SectionHeading
          eyebrow="How it works"
          title="A multi-agent pipeline, not a template."
          intro="Specialized agents each own a slice of the design system, running in sequence so the output is coherent end to end."
        />

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-brand/10 via-brand/50 to-accent/30 lg:block" />

          <motion.ol
            className="grid gap-8 lg:grid-cols-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            {STEPS.map((s) => (
              <motion.li
                key={s.n}
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                className="relative"
              >
                <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-canvas font-mono text-sm text-brand">
                  {s.n}
                </span>
                <p className="mt-5 eyebrow">{s.agent}</p>
                <h3 className="mt-2 text-[15px] font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
