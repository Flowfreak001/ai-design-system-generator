"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlowfreakWordmark } from "@/components/layout/logo";

const EASE = [0.22, 1, 0.36, 1] as const;

// Modern auth input: taller, soft filled surface, subtle accent focus ring.
export const AUTH_INPUT =
  "h-12 w-full rounded-[6px] border border-line bg-white px-4 text-[15px] text-ink " +
  "placeholder:text-faint transition-[border-color,box-shadow] duration-150 " +
  "hover:border-line/80 focus:border-accent focus:outline-none " +
  "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]";

/** Tinted full-screen backdrop + top nav + centered card — shared by every auth page. */
export function AuthShell({
  children,
  nav,
}: {
  children: ReactNode;
  /** Top-right link (e.g. Sign up / Sign in). */
  nav?: { href: string; label: string };
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 7%, var(--color-canvas)), var(--color-canvas))" }}
    >
      <header className="flex items-center justify-between border-b border-line bg-white px-5 py-2 sm:px-8">
        <Link href="/" aria-label="Flowfreak home" className="flex items-center">
          <FlowfreakWordmark height={56} />
        </Link>
        {nav && (
          <Link href={nav.href} className="rounded-[6px] border border-ink/70 bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-panel">
            {nav.label}
          </Link>
        )}
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pt-14 pb-8 sm:items-center sm:px-4 sm:py-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[440px] border-line bg-transparent sm:max-w-[460px] sm:rounded-3xl sm:border sm:bg-surface sm:p-9 sm:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
