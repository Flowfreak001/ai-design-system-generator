// Creative editorial gallery that moves horizontally — two rows auto-scrolling
// in opposite directions (pause on hover). Card treatments vary (shot / display
// type / product / form) for a premium, showreel feel. Theme-token driven.

import type { SectionProps, SectionTheme } from "../types";
import { resolveTheme, h, b } from "../section-theme";

type Card = { kind: "shot" | "type" | "product" | "form"; w: number; label?: string; word?: string };

const ROW: Card[] = [
  { kind: "type", w: 340, word: "FORM" },
  { kind: "shot", w: 420, label: "Sip à Juice" },
  { kind: "product", w: 260, label: "The Shaker" },
  { kind: "shot", w: 380, label: "Numa Studio" },
  { kind: "form", w: 300, label: "Work with us" },
  { kind: "shot", w: 400, label: "Sten — Landscape" },
  { kind: "product", w: 260, label: "Velvet Gin" },
  { kind: "type", w: 320, word: "FLOW" },
];

function GalleryCard({ card, t }: { card: Card; t: SectionTheme }) {
  const common = "relative shrink-0 overflow-hidden";
  const style = { width: card.w, borderRadius: t.radius, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow } as React.CSSProperties;
  if (card.kind === "type") {
    return (
      <div className={`${common} grid place-items-center px-8`} style={{ ...style, height: 300, background: t.surfaceColor }}>
        <span className="text-[46px] font-extrabold leading-none tracking-tight" style={{ fontFamily: t.headingFont, color: t.textColor }}>{card.word}</span>
      </div>
    );
  }
  if (card.kind === "form") {
    return (
      <div className={`${common} p-6`} style={{ ...style, height: 300, background: t.surfaceColor }}>
        <div className="grid gap-4">
          {["First name", "Last name", "Email"].map((f) => (
            <div key={f}><span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: t.mutedTextColor }}>{f}</span><div className="mt-1.5 h-px w-full" style={{ background: t.borderColor }} /></div>
          ))}
          <span className="mt-2 inline-block rounded-md px-4 py-2 text-center text-[12px] font-semibold text-white" style={{ background: t.primaryColor }}>{card.label || "Get in touch"}</span>
        </div>
      </div>
    );
  }
  if (card.kind === "product") {
    return (
      <div className={common} style={{ ...style, height: 300, background: `linear-gradient(160deg, ${t.surfaceColor}, ${t.accentColor}22)` }}>
        <div className="grid h-full place-items-center p-6"><div className="h-40 w-24 rounded-xl" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }} /></div>
        {card.label && <span className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[11px] font-medium" style={{ background: t.backgroundColor, color: t.textColor }}>{card.label}</span>}
      </div>
    );
  }
  // "shot" — mimics a website screenshot with a browser bar.
  return (
    <div className={common} style={{ ...style, height: 300, background: t.backgroundColor }}>
      <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: t.borderColor }}>
        {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full" style={{ background: t.surfaceColor }} />)}
      </div>
      <div className="h-[calc(100%-33px)] w-full" style={{ background: `linear-gradient(135deg, ${t.accentColor}, ${t.primaryColor})` }}>
        {card.label && <span className="absolute bottom-3 left-3 text-[15px] font-bold" style={{ color: "#fff", fontFamily: t.headingFont }}>{card.label}</span>}
      </div>
    </div>
  );
}

function MarqueeRow({ cards, t, dir, seconds }: { cards: Card[]; t: SectionTheme; dir: "left" | "right"; seconds: number }) {
  const loop = [...cards, ...cards]; // duplicate for a seamless loop
  return (
    <div className="gxm-mask flex w-max gap-4" style={{ animation: `${dir === "left" ? "gxmLeft" : "gxmRight"} ${seconds}s linear infinite` }}>
      {loop.map((c, i) => <GalleryCard key={i} card={c} t={t} />)}
    </div>
  );
}

export default function GalleryMarquee({ theme, eyebrow, title, subtitle }: SectionProps) {
  const t = resolveTheme(theme);
  const rowB = [...ROW].reverse();
  return (
    <section className="overflow-hidden py-16" style={{ background: t.backgroundColor }}>
      <style>{`
        @keyframes gxmLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes gxmRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .gxm-track:hover .gxm-mask { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .gxm-mask { animation: none !important; } }
      `}</style>
      {(eyebrow || title) && (
        <div className="mx-auto mb-8 max-w-3xl px-8 text-center">
          {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span>}
          <h2 className="mt-2 text-[28px] font-bold" style={h(t)}>{title || "Selected work"}</h2>
          {subtitle && <p className="mt-2 text-[14px]" style={b(t)}>{subtitle}</p>}
        </div>
      )}
      <div className="gxm-track grid gap-4">
        <MarqueeRow cards={ROW} t={t} dir="left" seconds={38} />
        <MarqueeRow cards={rowB} t={t} dir="right" seconds={46} />
      </div>
    </section>
  );
}
