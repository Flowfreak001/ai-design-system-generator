"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover border border-accent/20 shadow-[0_1px_2px_rgba(8,9,10,0.08)]",
  secondary: "bg-surface text-ink border border-line hover:border-line-strong",
  ghost: "text-muted hover:text-ink hover:bg-panel",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium select-none " +
  "cursor-pointer transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function cls(variant: Variant, size: Size, extra = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

// Micro-interaction: barely-there scale; controlled, no bounce.
function useMotionProps() {
  const reduce = useReducedMotion();
  if (reduce) return {};
  return {
    whileHover: { scale: 1.015 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<
  ComponentProps<"button">,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>) {
  const m = useMotionProps();
  return (
    <motion.button className={cls(variant, size, className)} {...m} {...rest}>
      {children}
    </motion.button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ComponentProps<typeof Link>) {
  const m = useMotionProps();
  return (
    <motion.div className="inline-flex" {...m}>
      <Link className={cls(variant, size, className)} {...rest}>
        {children}
      </Link>
    </motion.div>
  );
}
