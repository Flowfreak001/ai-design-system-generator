"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParallax } from "react-scroll-parallax";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion-preference";

/**
 * Subtle vertical parallax for decorative background layers (full-bleed
 * `absolute inset-0` children). Mount it as a positioned, full-bleed box; the
 * inner track fills it, is over-sized, and clips so no gap shows as it travels.
 *
 * Movement stays in the 5–15% range. Parallax is disabled under reduced-motion
 * and below `minWidth` (mobile) — children render statically so document
 * scrolling stays natural on touch.
 */
export function ParallaxMedia({
  children,
  className,
  speed = -10,
  minWidth = 768,
}: {
  children: ReactNode;
  className?: string;
  /** RSP speed. Negative = moves up as you scroll down. Keep |speed| ≤ 15. */
  speed?: number;
  minWidth?: number;
}) {
  const reduce = useReducedMotionPreference();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [minWidth]);

  const active = enabled && !reduce;
  // The ref must ALWAYS be attached to a rendered element or RSP throws — so we
  // keep the same structure and just neutralise speed/scale when inactive.
  const { ref } = useParallax<HTMLDivElement>({ speed: active ? speed : 0 });

  return (
    <div className={className} style={active ? { overflow: "hidden" } : undefined}>
      {/* Over-sized track absorbs the travel so edges never reveal a gap. */}
      <div
        ref={ref}
        style={
          active
            ? { position: "absolute", inset: 0, transform: "scale(1.12)", willChange: "transform" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
