"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `prefers-reduced-motion` reader. Starts `false` on the server and
 * first client paint (so markup matches), then syncs to the real preference and
 * live-updates if the user toggles it. Use for imperative libraries (GSAP, RSP)
 * where framer-motion's `useReducedMotion` isn't in play.
 */
export function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
