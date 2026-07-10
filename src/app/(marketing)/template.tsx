"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Subtle route transition for marketing pages. A template re-mounts on every
 * navigation, so this fades/rises new page content in. Kept short and
 * transform/opacity-only so it never blocks routing or scroll restoration;
 * reduced-motion renders instantly.
 */
export default function MarketingTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
