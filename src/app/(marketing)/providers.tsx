"use client";

import { MotionConfig } from "framer-motion";
import { ParallaxProvider } from "react-scroll-parallax";
import type { ReactNode } from "react";
import { EASE } from "@/components/ui/motion";

/**
 * Client providers for the marketing surface only (the dashboard `(app)` group
 * is intentionally untouched).
 *
 * - MotionConfig `reducedMotion="user"` makes every framer-motion animation
 *   honour the OS preference by default.
 * - ParallaxProvider powers `react-scroll-parallax` decorative depth.
 */
export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: EASE }}>
      <ParallaxProvider>{children}</ParallaxProvider>
    </MotionConfig>
  );
}
