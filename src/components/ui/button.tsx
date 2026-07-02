"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-brand-600 hover:bg-brand shadow-[0_8px_30px_-8px_rgba(124,108,247,0.6)] " +
    "border border-brand/40",
  secondary:
    "text-ink bg-white/[0.04] hover:bg-white/[0.08] border border-line-strong backdrop-blur",
  ghost: "text-muted hover:text-ink",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium select-none " +
  "cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function cls(variant: Variant, size: Size, extra = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

// Micro-interaction: gentle scale on hover/press — controlled, no bounce.
function useMotionProps() {
  const reduce = useReducedMotion();
  if (reduce) return {};
  return {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
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
