"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SectionProps, SectionItem } from "../types";
import { resolveTheme, h, b } from "../section-theme";
import type { SectionTheme } from "../types";

const FALLBACK: SectionItem[] = [
  { quote: "Flowfreak turned a messy discovery call into a structured brief and sitemap in minutes.", author: "Briana Patton", role: "Agency Founder" },
  { quote: "We plan the whole site before touching design. Rework across client projects dropped massively.", author: "Bilal Ahmed", role: "Design Lead" },
  { quote: "The export gives AI real context instead of a blank prompt.", author: "Saman Malik", role: "Freelance Developer" },
  { quote: "As a freelancer I look far bigger than I am — clients get a polished brief on day one.", author: "Omar Raza", role: "Independent Designer" },
  { quote: "Reusable components mean every project starts 60% done.", author: "Zainab Hussain", role: "Studio Operations" },
  { quote: "Brand tokens stay consistent everywhere, so handoff is clean.", author: "Aliza Khan", role: "Brand Strategist" },
  { quote: "The sitemap and wireframe step alone paid for itself.", author: "Farhan Siddiqui", role: "Product Manager" },
  { quote: "Clean JSON and Markdown exports drop straight into our build pipeline.", author: "Sana Sheikh", role: "Engineering Lead" },
  { quote: "Onboarding new clients is now a single focused session.", author: "Hassan Ali", role: "Web Agency Owner" },
];

function Column({ items, duration, t, reduce, className }: { items: SectionItem[]; duration: number; t: SectionTheme; reduce: boolean; className?: string }) {
  return (
    <div className={className}>
      <motion.div
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-5 pb-5"
      >
        {[...new Array(2)].map((_, dup) => (
          <React.Fragment key={dup}>
            {items.map((r, i) => (
              <div key={i} className="w-full max-w-xs rounded-2xl p-6" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow }}>
                <p className="text-[13.5px] leading-relaxed" style={b(t)}>{r.quote || ""}</p>
                <div className="mt-4 flex items-center gap-3">
                  {r.image
                    ? <img src={r.image} alt={r.author || ""} width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
                    : <div className="h-9 w-9 rounded-full" style={{ background: t.surfaceColor }} />}
                  <div>
                    <p className="text-[12.5px] font-semibold" style={h(t)}>{r.author || "Client name"}</p>
                    <p className="text-[11.5px]" style={b(t)}>{r.role || "Customer"}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialColumns({ theme, eyebrow, title, items }: SectionProps) {
  const t = resolveTheme(theme);
  const reduce = useReducedMotion() ?? false;
  const data = items?.length ? items : FALLBACK;
  const col1 = data.filter((_, i) => i % 3 === 0);
  const col2 = data.filter((_, i) => i % 3 === 1);
  const col3 = data.filter((_, i) => i % 3 === 2);

  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className="mx-auto max-w-[560px] text-center">
        {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
        <h2 className="mt-2 text-[26px] font-bold" style={h(t)}>{title || "What our clients say"}</h2>
      </div>
      <div className="mx-auto mt-10 flex max-h-[560px] justify-center gap-5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <Column items={col1} duration={17} t={t} reduce={reduce} />
        <Column items={col2} duration={21} t={t} reduce={reduce} className="hidden md:block" />
        <Column items={col3} duration={19} t={t} reduce={reduce} className="hidden lg:block" />
      </div>
    </section>
  );
}
