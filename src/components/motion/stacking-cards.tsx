"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion-preference";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type StackCard = {
  eyebrow?: string;
  title: string;
  text: string;
  icon?: ReactNode;
};

/**
 * Scroll-driven stacking cards (GSAP ScrollTrigger flagship). Each card pins in
 * turn; as the next scrolls up to cover it, the outgoing card scales down and
 * dims — readable in both scroll directions because the timeline is scrubbed.
 *
 * Why GSAP: this needs several coordinated, precisely-scrubbed pins that Motion's
 * per-element `useScroll` can't sequence cleanly. All triggers live inside a
 * scoped `gsap.context()` (via `useGSAP`) and auto-revert on unmount / dep change.
 *
 * Gated: disabled under reduced-motion and below 1024px, where cards render as a
 * plain vertical list so touch scrolling stays natural.
 */
export function StackingCards({
  cards,
  className,
}: {
  cards: StackCard[];
  className?: string;
}) {
  const reduce = useReducedMotionPreference();
  const [isDesktop, setIsDesktop] = useState(false);
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const enabled = isDesktop && !reduce;

  useGSAP(
    () => {
      if (!enabled) return;
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        // Last card never shrinks (nothing covers it).
        if (i === cardEls.length - 1) return;
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 96px",
            // End when the following card has scrolled up to the pin line.
            endTrigger: cardEls[i + 1],
            end: "top 96px",
            scrub: true,
          },
        });
      });
      // Line everything up once all triggers exist.
      ScrollTrigger.refresh();
    },
    { scope, dependencies: [enabled, cards.length] },
  );

  return (
    <div ref={scope} className={className}>
      <div className={enabled ? "" : "flex flex-col gap-6"}>
        {cards.map((c, i) => (
          <div
            key={i}
            className="stack-card"
            style={
              enabled
                ? {
                    position: "sticky",
                    top: 96,
                    willChange: "transform",
                    zIndex: i + 1,
                    // Scroll runway between reveals (last card needs none).
                    marginBottom: i < cards.length - 1 ? "14vh" : 0,
                  }
                : undefined
            }
          >
            <div className="mx-auto max-w-4xl">
              <article className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] sm:p-10">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                    {c.icon ?? (
                      <span className="font-mono text-sm font-semibold">{String(i + 1).padStart(2, "0")}</span>
                    )}
                  </span>
                  {c.eyebrow && (
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {c.eyebrow}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-[30px]">{c.title}</h3>
                <p className="max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">{c.text}</p>
              </article>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll runway so the stack has room to sequence on desktop. */}
      {enabled && <div aria-hidden className="h-[40vh]" />}
    </div>
  );
}
