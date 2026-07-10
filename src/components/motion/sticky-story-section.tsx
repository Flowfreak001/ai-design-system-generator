"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

export type Story = {
  title: string;
  text: string;
  /** Rendered in the sticky media pane when this step is active. */
  media?: ReactNode;
};

/**
 * Sticky storytelling section: a media pane pins on the left while step copy
 * scrolls on the right; the active step's media cross-fades in and an indicator
 * rail tracks progress. Element-scoped `useScroll` (no window listeners).
 *
 * Degrades gracefully: under reduced-motion or on mobile (<lg) it renders a
 * plain stacked list with all content visible.
 */
export function StickyStorySection({
  steps,
  className,
  eyebrow,
  heading,
}: {
  steps: Story[];
  className?: string;
  eyebrow?: string;
  heading?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = steps.length;

  return (
    <div ref={ref} className={className}>
      {(eyebrow || heading) && (
        <div className="mx-auto mb-10 max-w-3xl px-5 sm:px-8">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          {heading}
        </div>
      )}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Sticky media pane (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-24 h-[60vh] overflow-hidden rounded-2xl border border-line bg-panel">
            {steps.map((s, i) => (
              <StepMedia key={i} index={i} n={n} progress={scrollYProgress} reduce={!!reduce}>
                {s.media}
              </StepMedia>
            ))}
            {/* progress rail */}
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line">
              <motion.div className="h-full origin-left bg-accent" style={{ scaleX: reduce ? 1 : scrollYProgress }} />
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-8 lg:gap-0">
          {steps.map((s, i) => (
            <li
              key={i}
              className="flex flex-col justify-center lg:min-h-[60vh]"
            >
              {/* Mobile media */}
              {s.media && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-line bg-panel lg:hidden">
                  {s.media}
                </div>
              )}
              <span className="font-mono text-[13px] font-semibold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{s.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StepMedia({
  index,
  n,
  progress,
  reduce,
  children,
}: {
  index: number;
  n: number;
  progress: MotionValue<number>;
  reduce: boolean;
  children: ReactNode;
}) {
  const start = index / n;
  const end = (index + 1) / n;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  // Stops kept strictly inside [0,1] and ascending for safe interpolation.
  const a = clamp(start - 0.05);
  const b = clamp(start + 0.03);
  const c = clamp(end - 0.03);
  const d = clamp(end + 0.05);
  const opacity = useTransform(
    progress,
    [a, b, c, d],
    index === 0 ? [1, 1, 1, 0] : [0, 1, 1, index === n - 1 ? 1 : 0],
  );
  return (
    <motion.div
      className="absolute inset-0 grid place-items-center p-6"
      style={{ opacity: reduce ? (index === 0 ? 1 : 0) : opacity }}
    >
      {children}
    </motion.div>
  );
}
