"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const; // premium, controlled — no overshoot

/** Shared motion language tokens — one source for the whole site. */
export const MOTION = {
  ease: EASE,
  reveal: 0.6, // 0.5–0.8s
  stagger: 0.08, // 0.06–0.12s
  distSmall: 24, // 20–40px
  distEditorial: 56, // ≤60px
  micro: 0.24, // 150–300ms
} as const;

/** Fade + rise on scroll into view. One orchestrated moment, reduced-motion safe. */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span" | "header";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Stagger container — pair with StaggerItem children. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Subtle hover-lift wrapper for cards. */
export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Reveal — one reusable scroll-into-view primitive with named variants.
   Every section uses this instead of hand-rolled initial/whileInView tweens.
   ────────────────────────────────────────────────────────────────────────── */

export type RevealVariant =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "mask";

function hiddenFor(variant: RevealVariant, dist: number): Record<string, number> {
  switch (variant) {
    case "fade-in":
      return { opacity: 0 };
    case "slide-left":
      return { opacity: 0, x: dist };
    case "slide-right":
      return { opacity: 0, x: -dist };
    case "scale-in":
      return { opacity: 0, scale: 0.96 };
    case "mask": // reveal is provided by a clip wrapper; content just rises
    case "fade-up":
    default:
      return { opacity: 0, y: dist };
  }
}

/**
 * Scroll-into-view reveal. `variant` picks the entrance; reduced-motion collapses
 * every transform to a plain opacity fade. `mask` wraps children in an
 * overflow-hidden clip so the content wipes up from a masked edge.
 */
export function Reveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = MOTION.reveal,
  distance = MOTION.distSmall,
  amount = 0.3,
  once = true,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  distance?: number;
  amount?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span" | "header" | "article";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const hidden = reduce ? { opacity: 0 } : hiddenFor(variant, distance);
  const shown = { opacity: 1, x: 0, y: 0, scale: 1 };

  const inner = (
    <Tag
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once, amount }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );

  if (variant === "mask" && !reduce) {
    return <span className="block overflow-hidden">{inner}</span>;
  }
  return inner;
}

/* StaggerContainer / StaggerItem — expressive aliases over Stagger. */
export { Stagger as StaggerContainer };

/* ──────────────────────────────────────────────────────────────────────────
   AnimatedHeading — masked, word- or line-by-line heading reveal on scroll.
   Reduced-motion renders plain text immediately.
   ────────────────────────────────────────────────────────────────────────── */

export function AnimatedHeading({
  text,
  className,
  as = "h2",
  per = "word",
  stagger = 0.06,
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  per?: "word" | "line";
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parts = per === "word" ? text.split(" ") : text.split("\n");
  return (
    <Tag className={className}>
      <motion.span
        style={{ display: "inline" }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {parts.map((part, i) => (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <motion.span
              style={{ display: "inline-block", willChange: "transform" }}
              variants={{
                hidden: { y: "110%" },
                show: { y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
            >
              {part}
              {per === "word" && i < parts.length - 1 ? " " : null}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ScrollProgress — thin top bar tracking page scroll. Transform-only (scaleX).
   ────────────────────────────────────────────────────────────────────────── */

export function ScrollProgress({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      className={className ?? "fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent"}
      style={{ scaleX }}
    />
  );
}

export { EASE };
