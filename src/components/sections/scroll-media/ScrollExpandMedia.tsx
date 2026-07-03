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
  const innerRef = useRef<HTMLDivElement>(null);
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

    const inner = innerRef.current;
    const setStage = (p: number) => {
      const active = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      stageRefs.forEach((s, i) => { if (s.current) s.current.style.opacity = i === active ? "1" : "0"; });
    };

    // Nearest scrollable ancestor (the editor canvas) or the window.
    const scrollParent = (() => {
      let el: HTMLElement | null = wrap.parentElement;
      while (el) {
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
        el = el.parentElement;
      }
      return null;
    })();
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A nested scroll container = we're in the editor's stacked, zoomed canvas
    // (a planning board, not a single scroll viewport). There, render a tidy
    // STATIC card (no runway/gap). A real page scrolls the window → animate.
    if (scrollParent || reduce) {
      wrap.style.height = "auto";
      if (inner) { inner.style.position = "static"; inner.style.height = "auto"; inner.style.paddingTop = "72px"; inner.style.paddingBottom = "72px"; }
      media.style.width = reduce ? "92%" : "62%";
      media.style.height = reduce ? "78vh" : "440px";
      media.style.borderRadius = reduce ? "12px" : "20px";
      media.style.transform = "none";
      setStage(reduce ? 1 : 0);
      return;
    }

    // Real page: window scroll. Media starts small (~100px) and zooms to fill the
    // whole viewport (width×height) as the section is scrolled through.
    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const update = () => {
      const wr = wrap.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const total = wr.height - vh; // pinned scroll distance
      const p = total > 0 ? clamp(-wr.top / total) : 0;
      const minW = vw < 640 ? 180 : 100; // small starting card
      const minH = vw < 640 ? 180 : 100;
      media.style.width = `${Math.round(minW + (vw - minW) * p)}px`;
      media.style.height = `${Math.round(minH + (vh - minH) * p)}px`;
      media.style.borderRadius = `${(1 - p) * 24}px`;
      media.style.transform = "none";
      setStage(p);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={wrapRef} className="relative" style={{ background: t.backgroundColor, height: "170vh" }}>
      <div ref={innerRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <span className="absolute left-6 top-6 z-20 text-[11px] font-medium tracking-[0.2em]" style={{ color: t.textColor }}>[ {eyebrow || "JOURNEY"} ]</span>
        <p className="pointer-events-none absolute inset-x-0 z-0 px-[8%] text-center font-semibold leading-[1.18]" style={{ fontFamily: t.headingFont, color: t.textColor, fontSize: "clamp(24px, 4.4vw, 60px)" }}>
          {title || "From glaciers in Austria to rooftops in New York & ten-foot swells in Nias. Every brief: a global playground where presence becomes story."}
          {subtitle ? ` ${subtitle}` : ""}
        </p>
        <div ref={mediaRef} className="relative z-10 overflow-hidden shadow-2xl" style={{ width: 100, height: 100, borderRadius: 24, willChange: "width, height" }}>
          {stages.map((g, i) => (
            <div key={i} ref={stageRefs[i]} className="absolute inset-0 transition-opacity duration-500" style={{ background: g, opacity: i === 0 ? 1 : 0 }} />
          ))}
          <span className="absolute inset-0 grid place-items-center text-[15px] font-bold tracking-widest text-white/90">❚❚</span>
        </div>
      </div>
    </section>
  );
}
