"use client";

// Scroll-progress "sticky expanding media" section. A normal section sits
// above/below it; when it enters the viewport the media sticks and expands from
// a small centered card to full-screen as the user scrolls through the (tall)
// section, then releases so the next section scrolls normally.
//
// Progress is derived entirely from getBoundingClientRect() of the section vs
// the scroll container (window OR the editor's canvas), so it is zoom-agnostic
// and works in the Design preview AND in a real exported page. Honours reduced
// motion and uses a lighter mobile mapping. No horizontal overflow (widths are
// % of the full-bleed sticky container, not vw).

import { useEffect, useRef } from "react";
import type { SectionProps } from "../types";
import { resolveTheme } from "../section-theme";

export default function ScrollExpandMedia({ theme, eyebrow, title, subtitle }: SectionProps) {
  const t = resolveTheme(theme);
  const wrapRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const stages = [
    `linear-gradient(160deg, ${t.accentColor}, ${t.primaryColor})`,
    `linear-gradient(160deg, #b9a17a, #5c4a2c)`,
    `linear-gradient(160deg, ${t.primaryColor}, ${t.accentColor})`,
  ];

  useEffect(() => {
    const wrap = wrapRef.current;
    const media = mediaRef.current;
    if (!wrap || !media) return;

    const apply = (p: number, minW: number, minH: number) => {
      media.style.width = `${minW + (100 - minW) * p}%`;
      media.style.height = `${minH + (100 - minH) * p}vh`;
      media.style.borderRadius = `${(1 - p) * 28}px`;
      media.style.transform = `scale(${0.9 + 0.1 * p})`;
      const active = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      stageRefs.forEach((s, i) => { if (s.current) s.current.style.opacity = i === active ? "1" : "0"; });
    };

    // Reduced motion: show the media large and static; skip the scroll listener.
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1, 100, 80);
      return;
    }

    // Nearest scrollable ancestor (the editor canvas) or the window.
    const scrollParent = (() => {
      let el: HTMLElement | null = wrap.parentElement;
      while (el) {
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
        el = el.parentElement;
      }
      return null;
    })();
    const target: HTMLElement | Window = scrollParent ?? window;

    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const update = () => {
      // Measure section + container in the SAME (post-zoom) coordinate space so
      // CSS `zoom` on the editor canvas doesn't break the ratio.
      const wr = wrap.getBoundingClientRect();
      const cr = scrollParent ? scrollParent.getBoundingClientRect() : null;
      const cTop = cr ? cr.top : 0;
      const cH = cr ? cr.height : window.innerHeight;
      const total = wr.height - cH; // scroll distance while the section is pinned
      const p = total > 0 ? clamp((cTop - wr.top) / total) : 0;
      const mobile = (scrollParent ? scrollParent.clientWidth : window.innerWidth) < 640;
      apply(p, mobile ? 82 : 56, mobile ? 44 : 55);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { target.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={wrapRef} className="relative" style={{ background: t.backgroundColor, height: "200vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <span className="absolute left-6 top-6 z-20 text-[11px] font-medium tracking-[0.2em]" style={{ color: t.textColor }}>[ {eyebrow || "JOURNEY"} ]</span>
        <p className="pointer-events-none absolute inset-x-0 z-0 px-[8%] text-center font-semibold leading-[1.18]" style={{ fontFamily: t.headingFont, color: t.textColor, fontSize: "clamp(24px, 4.4vw, 60px)" }}>
          {title || "From glaciers in Austria to rooftops in New York & ten-foot swells in Nias. Every brief: a global playground where presence becomes story."}
          {subtitle ? ` ${subtitle}` : ""}
        </p>
        <div ref={mediaRef} className="relative z-10 overflow-hidden shadow-2xl" style={{ width: "56%", height: "55vh", borderRadius: 28, willChange: "width, height" }}>
          {stages.map((g, i) => (
            <div key={i} ref={stageRefs[i]} className="absolute inset-0 transition-opacity duration-500" style={{ background: g, opacity: i === 0 ? 1 : 0 }} />
          ))}
          <span className="absolute inset-0 grid place-items-center text-[15px] font-bold tracking-widest text-white/90">❚❚</span>
        </div>
      </div>
    </section>
  );
}
