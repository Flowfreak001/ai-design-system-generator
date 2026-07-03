"use client";

// Editorial scroll-story section: the block stays sticky while a centered
// media element expands from small → full-bleed as you scroll, evolving through
// a few stages, over a large serif statement. Scroll-linked via a rAF listener
// on the nearest scroll container (works in the editor canvas and in export).

import { useEffect, useRef } from "react";
import type { SectionProps } from "../types";
import { resolveTheme, h } from "../section-theme";

export default function ScrollExpandMedia({ theme, eyebrow, title, subtitle }: SectionProps) {
  const t = resolveTheme(theme);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // Three "clips" — placeholder gradients that stand in for real video/imagery.
  const stages = [
    `linear-gradient(160deg, ${t.accentColor}, ${t.primaryColor})`,
    `linear-gradient(160deg, #b9a17a, #5c4a2c)`,
    `linear-gradient(160deg, ${t.primaryColor}, ${t.accentColor})`,
  ];

  useEffect(() => {
    const wrap = wrapRef.current;
    const media = mediaRef.current;
    if (!wrap || !media) return;

    // Reduced motion: skip the scroll effect and show the media full-bleed.
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      media.style.width = "100%";
      media.style.height = "80vh";
      media.style.borderRadius = "0px";
      if (stageRefs[2].current) { stageRefs[0].current!.style.opacity = "0"; stageRefs[1].current!.style.opacity = "0"; stageRefs[2].current.style.opacity = "1"; }
      return;
    }

    const scrollParent = (() => {
      let p: HTMLElement | null = wrap.parentElement;
      while (p) {
        const s = getComputedStyle(p);
        if (/(auto|scroll)/.test(s.overflowY)) return p;
        p = p.parentElement;
      }
      return null;
    })();
    const target: HTMLElement | Window = scrollParent ?? window;

    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const update = () => {
      const wr = wrap.getBoundingClientRect();
      const vh = scrollParent ? scrollParent.clientHeight : window.innerHeight;
      const topRef = scrollParent ? scrollParent.getBoundingClientRect().top : 0;
      const total = wrap.offsetHeight - vh;
      const p = total > 0 ? clamp((topRef - wr.top) / total) : 0;
      // Grow the media: 26% → 100% wide, 30vh → 100vh tall; corners flatten.
      media.style.width = `${26 + 74 * p}%`;
      media.style.height = `${30 + 70 * p}vh`;
      media.style.borderRadius = `${(1 - p) * 10}px`;
      // Cross-fade the three stages across the scroll.
      const active = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      stageRefs.forEach((s, i) => { if (s.current) s.current.style.opacity = i === active ? "1" : "0"; });
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { target.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={wrapRef} className="relative" style={{ background: t.backgroundColor, height: "260vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <span className="absolute left-6 top-6 text-[11px] font-medium tracking-[0.2em]" style={{ color: t.textColor }}>[ {eyebrow || "JOURNEY"} ]</span>
        <p className="pointer-events-none absolute inset-x-0 px-[8%] text-center font-semibold leading-[1.18]" style={{ fontFamily: t.headingFont, color: t.textColor, fontSize: "clamp(26px, 4.6vw, 62px)" }}>
          {title || "From glaciers in Austria to rooftops in New York & ten-foot swells in Nias. Every brief: a global playground where presence becomes story."}
          {subtitle ? ` ${subtitle}` : ""}
        </p>
        <div ref={mediaRef} className="relative z-10 overflow-hidden shadow-2xl" style={{ width: "26%", height: "30vh", borderRadius: 10 }}>
          {stages.map((g, i) => (
            <div key={i} ref={stageRefs[i]} className="absolute inset-0 transition-opacity duration-500" style={{ background: g, opacity: i === 0 ? 1 : 0 }} />
          ))}
          <span className="absolute inset-0 grid place-items-center text-[15px] font-bold tracking-widest text-white/90">❚❚</span>
        </div>
      </div>
    </section>
  );
}
