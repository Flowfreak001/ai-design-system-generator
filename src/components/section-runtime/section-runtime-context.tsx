"use client";

// Section Runtime context + provider — the single measurement system for
// generated sections. One ResizeObserver per section root; sections consume
// the value via useSectionRuntime() (exposed to sandboxed code through the
// dynamic renderer's `section-runtime` module).
//
// MEASUREMENT DECISION (do not change without re-testing the preview frames):
// Hosts scale sections with `transform: scale()` (library card thumbnails lay
// the section out at a 1440px BASE width and scale ~0.24; the preview modal
// scales to fit). `getBoundingClientRect()` returns the visually TRANSFORMED
// size there, which is wrong — a thumbnail laid out at 1440px must resolve as
// "wide", not "mobile". `offsetWidth/offsetHeight` and ResizeObserver's
// `contentRect` both return the untransformed LAYOUT size, which is what the
// section's own CSS actually works against. So we measure offsetWidth + RO
// contentRect and never getBoundingClientRect for breakpoint resolution.

import { createContext, useContext, useEffect, useMemo, useState, type RefObject } from "react";
import { resolveSectionBreakpoint } from "./section-breakpoints";
import type { SectionRuntimeValue } from "./types";

const DEFAULT_VALUE: SectionRuntimeValue = {
  width: 0,
  height: 0,
  breakpoint: "mobile", // mobile-first before the first measurement
  isPreview: false,
  previewScale: 1,
  hasMeasured: false,
};

const SectionRuntimeContext = createContext<SectionRuntimeValue>(DEFAULT_VALUE);

/**
 * Read the section runtime. Safe anywhere: outside a provider it returns the
 * mobile-first default and never throws (so sections also render standalone).
 */
export function useSectionRuntime(): SectionRuntimeValue {
  return useContext(SectionRuntimeContext);
}

export const SectionRuntimeContextProvider = SectionRuntimeContext.Provider;

/**
 * Measure a section root element. All browser APIs run inside useEffect (no
 * SSR access, no hydration mismatch — first client render matches the server's
 * mobile-first default). Updates only when the size meaningfully changes.
 */
export function useSectionMeasurement(ref: RefObject<HTMLElement | null>): {
  width: number;
  height: number;
  hasMeasured: boolean;
} {
  const [size, setSize] = useState({ width: 0, height: 0, hasMeasured: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (width: number, height: number) => {
      if (width <= 0 && height <= 0) return; // ignore hidden/zero measurements
      setSize((prev) =>
        prev.hasMeasured && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height, hasMeasured: true },
      );
    };

    // Immediate layout measurement — RO's initial callback is not guaranteed
    // to fire promptly inside scaled/containe(d) preview frames.
    apply(el.offsetWidth, el.offsetHeight);

    if (typeof ResizeObserver === "undefined") {
      // Very old environments: fall back to re-measuring on window resize.
      const remeasure = () => apply(el.offsetWidth, el.offsetHeight);
      window.addEventListener("resize", remeasure);
      return () => window.removeEventListener("resize", remeasure);
    }

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect; // layout size, unaffected by transforms
      if (rect) apply(rect.width, rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

/** Build the full runtime value from a measurement + host flags. */
export function buildRuntimeValue(
  size: { width: number; height: number; hasMeasured: boolean },
  isPreview: boolean,
  previewScale: number,
): SectionRuntimeValue {
  return {
    width: size.width,
    height: size.height,
    breakpoint: resolveSectionBreakpoint(size.width),
    isPreview,
    previewScale,
    hasMeasured: size.hasMeasured,
  };
}

/** Memo helper so the context value is referentially stable between renders. */
export function useRuntimeValue(
  size: { width: number; height: number; hasMeasured: boolean },
  isPreview: boolean,
  previewScale: number,
): SectionRuntimeValue {
  return useMemo(
    () => buildRuntimeValue(size, isPreview, previewScale),
    [size, isPreview, previewScale],
  );
}
