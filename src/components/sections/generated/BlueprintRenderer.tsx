// Generic, dynamic renderer for a SectionBlueprint. Draws whatever blocks the
// blueprint contains — so a reference-inspired section follows the uploaded
// design's structure/colours without any per-type template. Media is always a
// grey placeholder (never the uploaded image); all copy is editable later.

import { resolveTheme } from "../section-theme";
import type { SectionTheme } from "../types";
import type { SectionBlueprint, BlueprintBlock } from "@/lib/references/types";

function readable(bg: string) {
  let x = bg.replace("#", "");
  if (x.length === 3) x = x.split("").map((c) => c + c).join("");
  const r = parseInt(x.slice(0, 2), 16), g = parseInt(x.slice(2, 4), 16), bl = parseInt(x.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
  return l < 0.6
    ? { fg: "#fff", muted: "rgba(255,255,255,0.72)", card: "rgba(255,255,255,0.06)", cardBorder: "rgba(255,255,255,0.14)" }
    : { fg: "#111827", muted: "rgba(17,24,39,0.6)", card: "#ffffff", cardBorder: "rgba(0,0,0,0.08)" };
}

export function BlueprintRenderer({ blueprint, theme }: { blueprint: SectionBlueprint; theme?: SectionTheme }) {
  const t = resolveTheme(theme);
  const bg = blueprint.background ?? t.backgroundColor;
  const accent = blueprint.accent ?? t.accentColor;
  const r = blueprint.background ? readable(bg) : { fg: t.textColor, muted: t.mutedTextColor, card: t.surfaceColor, cardBorder: t.borderColor };
  const align = blueprint.align ?? "center";
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";

  const Placeholder = ({ label, ratio, className = "" }: { label?: string; ratio?: string; className?: string }) => (
    <div className={`grid place-items-center rounded-2xl ${className}`} style={{ background: r.card, border: `1px dashed ${r.cardBorder}`, aspectRatio: ratio }}>
      <span className="text-[11px] font-medium" style={{ color: r.muted }}>{label ?? "Image placeholder"}</span>
    </div>
  );

  const renderBlock = (block: BlueprintBlock, i: number) => {
    switch (block.type) {
      case "eyebrow":
        return <span key={i} className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: accent }}>{block.text}</span>;
      case "heading":
        return <h2 key={i} className="text-[28px] font-bold leading-tight sm:text-[34px]" style={{ fontFamily: t.headingFont, color: r.fg }}>{block.text}</h2>;
      case "subheading":
        return <h3 key={i} className="text-[18px] font-semibold" style={{ fontFamily: t.headingFont, color: r.fg }}>{block.text}</h3>;
      case "paragraph":
        return <p key={i} className="max-w-xl text-[15px] leading-relaxed" style={{ color: r.muted }}>{block.text}</p>;
      case "buttons":
        return (
          <div key={i} className={`flex flex-wrap gap-2.5 ${align === "center" ? "justify-center" : ""}`}>
            {block.items.map((btn, j) => (
              <span key={j} className="rounded-lg px-5 py-2.5 text-[13px] font-medium"
                style={btn.variant === "secondary" ? { border: `1px solid ${accent}`, color: accent } : { background: accent, color: "#fff" }}>{btn.label}</span>
            ))}
          </div>
        );
      case "chips":
        return (
          <div key={i} className={`flex flex-wrap gap-2 ${align === "center" ? "justify-center" : ""}`}>
            {block.items.map((c, j) => <span key={j} className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: r.card, border: `1px solid ${r.cardBorder}`, color: r.fg }}>{c}</span>)}
          </div>
        );
      case "cardGrid": {
        const n = Math.min(4, Math.max(1, block.columns ?? Math.min(3, block.cards.length)));
        const cols = n >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : n === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : n === 2 ? "sm:grid-cols-2" : "";
        return (
          <div key={i} className={`grid w-full max-w-6xl gap-5 ${cols}`}>
            {block.cards.map((card, j) => (
              <div key={j} className="rounded-2xl p-6 text-left" style={{ background: r.card, border: `1px solid ${r.cardBorder}`, boxShadow: t.shadow }}>
                {card.image ? <Placeholder ratio="4/3" className="mb-4 w-full" /> : card.icon !== false ? (
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${accent}1a` }}><span className="h-4 w-4 rounded" style={{ background: accent }} /></div>
                ) : null}
                <p className="text-[15px] font-semibold" style={{ fontFamily: t.headingFont, color: r.fg }}>{card.title}</p>
                {card.body && <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: r.muted }}>{card.body}</p>}
              </div>
            ))}
          </div>
        );
      }
      case "media":
        return <Placeholder key={i} ratio={block.ratio ?? "16/10"} label={block.label} className="w-full max-w-4xl" />;
      case "stats":
        return (
          <div key={i} className="grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {block.items.map((s, j) => <div key={j} className="text-center"><div className="text-[30px] font-bold" style={{ color: r.fg }}>{s.value}</div><div className="mt-1 text-[13px]" style={{ color: r.muted }}>{s.label}</div></div>)}
          </div>
        );
      case "logos":
        return <div key={i} className="flex flex-wrap items-center justify-center gap-8">{Array.from({ length: block.count ?? 5 }).map((_, j) => <div key={j} className="h-7 w-24 rounded" style={{ background: r.card, border: `1px solid ${r.cardBorder}` }} />)}</div>;
      case "accordion":
        return (
          <div key={i} className="grid w-full max-w-3xl gap-3 text-left">
            {block.items.map((it, j) => (
              <div key={j} className="rounded-xl p-4" style={{ background: r.card, border: `1px solid ${r.cardBorder}` }}>
                <p className="flex items-center justify-between text-[14.5px] font-semibold" style={{ color: r.fg }}>{it.question}<span style={{ color: r.muted }}>+</span></p>
                {it.answer && <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: r.muted }}>{it.answer}</p>}
              </div>
            ))}
          </div>
        );
      case "linkColumns":
        return (
          <div key={i} className="grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {block.columns.map((col, j) => (
              <div key={j}><p className="text-[13px] font-semibold" style={{ color: r.fg }}>{col.heading}</p><ul className="mt-3 grid gap-2 text-[12.5px]" style={{ color: r.muted }}>{col.links.map((l, k) => <li key={k}>{l}</li>)}</ul></div>
            ))}
          </div>
        );
      case "splitIntro": {
        const headingEl = block.heading ? <h2 className="text-[30px] font-bold leading-tight sm:text-[40px]" style={{ fontFamily: t.headingFont, color: r.fg }}>{block.heading}</h2> : null;
        const rightEl = (
          <div className="flex flex-col gap-4">
            {block.paragraph && <p className="text-[15px] leading-relaxed" style={{ color: r.muted }}>{block.paragraph}</p>}
            {block.buttons?.length ? (
              <div className="flex flex-wrap gap-2.5">
                {block.buttons.map((btn, j) => (
                  <span key={j} className="rounded-lg px-5 py-2.5 text-[13px] font-medium" style={btn.variant === "secondary" ? { border: `1px solid ${accent}`, color: accent } : { background: accent, color: "#fff" }}>{btn.label}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
        return (
          <div key={i} className="grid w-full max-w-6xl items-start gap-8 text-left md:grid-cols-2">
            {block.headingSide === "right" ? <>{rightEl}{headingEl}</> : <>{headingEl}{rightEl}</>}
          </div>
        );
      }
      case "spacer":
        return <div key={i} aria-hidden="true" style={{ height: block.size === "large" ? 72 : block.size === "small" ? 24 : 44 }} />;
      default:
        return null;
    }
  };

  const column = <div className={`flex flex-col gap-4 ${alignCls}`}>{blueprint.blocks.map(renderBlock)}</div>;

  if (blueprint.layout === "split") {
    const media = <Placeholder label="Visual" ratio="4/5" className="w-full" />;
    return (
      <section className="px-6 py-14 sm:px-10 sm:py-16" style={{ background: bg }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          {blueprint.mediaSide === "left" ? <>{media}{column}</> : <>{column}{media}</>}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-14 sm:px-10 sm:py-16" style={{ background: bg }}>
      <div className={`mx-auto flex max-w-6xl flex-col gap-6 ${align === "center" ? "items-center" : "items-start"}`}>{blueprint.blocks.map(renderBlock)}</div>
    </section>
  );
}
