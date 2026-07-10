"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down";

/**
 * rAF-throttled scroll direction + past-threshold flag. No per-event state
 * churn: a single passive listener schedules one measurement per frame.
 *
 * @param threshold px from top before "down" is allowed to hide chrome.
 */
export function useScrollDirection(threshold = 12): {
  direction: ScrollDirection;
  atTop: boolean;
} {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      setAtTop(y <= threshold);
      // Ignore sub-pixel jitter and bounce near the top.
      if (Math.abs(y - lastY.current) > 6) {
        setDirection(y > lastY.current && y > threshold ? "down" : "up");
        lastY.current = y;
      }
      ticking.current = false;
    };
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, atTop };
}
