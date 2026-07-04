// A NEW, original section composed at runtime from a reference ANALYSIS — not a
// prebuilt library component. It follows the extracted *layout* (split / grid /
// centered), *structure* (slots → columns/cards/chips) and *colour direction*
// so the result reflects the uploaded reference — with grey placeholders only
// (never the uploaded screenshot). Library components are inspiration only.

import { resolveTheme, h, b, fill, outline, cardRaised } from "../section-theme";
import type { SectionTheme } from "../types";
import type { GeneratedSectionSpec, SectionPattern } from "@/lib/references/types";

/** First hex colour found in the extracted colour-direction notes, if any. */
function firstHex(arr: string[]): string | undefined {
  for (const s of arr) {
    const m = s.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})/i);
    if (m) return m[0];
  }
  return undefined;
}

/** Relative luminance → pick readable text colours over a background. */
function readable(bg: string): { fg: string; muted: string; onCard: string } {
  let hex = bg.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), bl = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
  return lum < 0.6
    ? { fg: "#ffffff", muted: "rgba(255,255,255,0.75)", onCard: "rgba(255,255,255,0.10)" }
    : { fg: "#111827", muted: "rgba(17,24,39,0.62)", onCard: "rgba(0,0,0,0.04)" };
}

function slotLabel(s: string): string {
  const c = s.replace(/\bslot[s]?\b/gi, "").replace(/\s+/g, " ").trim();
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : "";
}

type Comp = "split" | "grid" | "centered" | "footer" | "testimonials" | "pricing" | "faq";

/** Choose the composition from the extracted layout — not just the section type. */
function composition(spec: GeneratedSectionSpec, pattern: SectionPattern): Comp {
  const type = spec.type;
  if (type === "footer") return "footer";
  if (type === "testimonials") return "testimonials";
  if (type === "pricing") return "pricing";
  if (type === "faq") return "faq";
  const sig = `${pattern.layoutPattern} ${pattern.layoutTags.join(" ")} ${spec.layoutPattern}`.toLowerCase();
  const hasImage = pattern.componentStructure.concat(pattern.contentSlots).some((s) => /image|photo|visual|media|screenshot|mockup/i.test(s));
  if (/split|two.?col|side.?by.?side|image and text|text and image/.test(sig) || (hasImage && /hero|services|features|cta/.test(type))) return "split";
  if (/grid|cards|columns|masonry/.test(sig)) return "grid";
  if (type === "features" || type === "services" || type === "showcase") return "grid";
  return "centered";
}

export function GeneratedSection({ spec, pattern, theme }: { spec: GeneratedSectionSpec; pattern: SectionPattern; theme?: SectionTheme }) {
  const t = resolveTheme(theme);
  const c = spec.previewContent ?? {};
  const items = c.items ?? [];
  const side = spec.assetPlacement === "left" ? "left" : "right";
  const comp = composition(spec, pattern);

  // Reflect the reference's colour direction on hero-like compositions.
  const refHex = firstHex(pattern.colorDirection);
  const useRefBg = refHex && (comp === "split" || comp === "centered");
  const bg = useRefBg ? refHex! : t.backgroundColor;
  const r = useRefBg ? readable(bg) : { fg: t.textColor, muted: t.mutedTextColor, onCard: t.surfaceColor };

  const wrap = "px-6 py-14 sm:px-10 sm:py-16";
  const H = (extra = "") => ({ fontFamily: t.headingFont, color: r.fg, ...(extra ? {} : {}) });
  const eyebrowEl = c.eyebrow ? <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: useRefBg ? r.fg : t.accentColor, opacity: useRefBg ? 0.9 : 1 }}>{c.eyebrow}</span> : null;
  const buttons = (
    <div className="flex flex-wrap gap-2.5">
      {c.primaryButtonLabel && <span className="px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>{c.primaryButtonLabel}</span>}
      {c.secondaryButtonLabel && <span className="px-5 py-2.5 text-[13px] font-medium" style={useRefBg ? { border: `1px solid ${r.fg}`, color: r.fg, borderRadius: 8 } : outline(t)}>{c.secondaryButtonLabel}</span>}
    </div>
  );
  const Placeholder = ({ label, ratio, className = "" }: { label?: string; ratio?: string; className?: string }) => (
    <div className={`grid place-items-center rounded-xl ${className}`} style={{ background: r.onCard, border: `1px dashed ${useRefBg ? "rgba(255,255,255,0.25)" : t.borderColor}`, aspectRatio: ratio }}>
      <span className="text-[11px] font-medium" style={{ color: r.muted }}>{label ?? "Image placeholder"}</span>
    </div>
  );

  // ── SPLIT: headline + supporting + category chips + CTA, with a media side. ──
  if (comp === "split") {
    const chips = items.slice(0, 5).map((it) => it.title).filter(Boolean);
    const copy = (
      <div className="grid gap-4">
        {eyebrowEl}
        <h2 className="text-[30px] font-bold leading-tight sm:text-[38px]" style={H()}>{c.title ?? spec.name}</h2>
        {c.description && <p className="max-w-lg text-[15px] leading-relaxed" style={{ color: r.muted }}>{c.description}</p>}
        {chips.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {chips.map((ch, i) => <span key={i} className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: r.onCard, color: r.fg }}>{ch}</span>)}
          </div>
        )}
        <div className="mt-2">{buttons}</div>
      </div>
    );
    const media = <Placeholder label="Visual" ratio="4/5" className="w-full" />;
    return (
      <section className={wrap} style={{ background: bg }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          {side === "left" ? <>{media}{copy}</> : <>{copy}{media}</>}
        </div>
      </section>
    );
  }

  // ── GRID: heading + card grid from the repeated content slots. ──
  if (comp === "grid") {
    const cards = items.length ? items : Array.from({ length: 3 }, (_, i) => ({ title: `Item ${i + 1}`, text: "Short supporting line." }));
    return (
      <section className={wrap} style={{ background: bg }}>
        <div className="mx-auto max-w-2xl text-center">
          {eyebrowEl}
          <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={H()}>{c.title ?? spec.name}</h2>
          {c.description && <p className="mt-2 text-[14px]" style={{ color: r.muted }}>{c.description}</p>}
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((it, i) => (
            <div key={i} className="p-6" style={cardRaised(t)}>
              <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }}>
                <span className="h-4 w-4 rounded" style={{ background: t.accentColor, opacity: 0.5 }} />
              </div>
              <p className="mt-4 text-[15px] font-semibold" style={h(t)}>{it.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{it.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (comp === "testimonials") {
    return (
      <section className={wrap} style={{ background: t.backgroundColor }}>
        <div className="mx-auto max-w-2xl text-center">{eyebrowEl}<h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{c.title ?? "What our clients say"}</h2></div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="p-6" style={cardRaised(t)}>
              <div className="text-[13px]" style={{ color: t.accentColor }}>★★★★★</div>
              <p className="mt-3 text-[13.5px] italic leading-relaxed" style={b(t)}>“{it.text}”</p>
              <div className="mt-5 flex items-center gap-3"><span className="h-9 w-9 rounded-full" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }} /><p className="text-[12.5px] font-semibold" style={h(t)}>{it.title}</p></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (comp === "pricing") {
    const plans = items.length ? items : [{ title: "Starter", text: "For getting going" }, { title: "Growth", text: "For scaling teams" }, { title: "Scale", text: "For large orgs" }];
    return (
      <section className={wrap} style={{ background: t.backgroundColor }}>
        <div className="mx-auto max-w-2xl text-center">{eyebrowEl}<h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{c.title ?? "Pricing"}</h2>{c.description && <p className="mt-2 text-[14px]" style={b(t)}>{c.description}</p>}</div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.slice(0, 3).map((p, i) => (
            <div key={i} className="flex flex-col gap-3 p-6" style={cardRaised(t)}>
              <p className="text-[15px] font-semibold" style={h(t)}>{p.title}</p>
              <p className="text-[26px] font-bold" style={h(t)}>$—<span className="text-[13px] font-normal" style={b(t)}>/mo</span></p>
              <p className="text-[13px]" style={b(t)}>{p.text}</p>
              <span className="mt-2 py-2 text-center text-[13px] font-medium" style={i === 1 ? fill(t) : outline(t)}>{c.primaryButtonLabel ?? "Choose plan"}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (comp === "faq") {
    return (
      <section className={wrap} style={{ background: t.backgroundColor }}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">{eyebrowEl}<h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{c.title ?? "FAQ"}</h2></div>
          <div className="mt-8 grid gap-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${t.borderColor}`, background: t.surfaceColor }}>
                <p className="flex items-center justify-between text-[14.5px] font-semibold" style={h(t)}>{it.title}<span style={{ color: t.mutedTextColor }}>+</span></p>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={b(t)}>{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (comp === "footer") {
    const slots = (pattern.componentStructure.length ? pattern.componentStructure : pattern.contentSlots)
      .map(slotLabel)
      .filter((s) => s && !/newsletter|subscribe|cta|call.?to.?action|contact detail|logo|search|social/i.test(s));
    const cols = ([...new Set(slots)].slice(0, 4).length ? [...new Set(slots)].slice(0, 4) : ["Product", "Company", "Resources", "Legal"]).map((head) => ({ head, links: ["Overview", "Details", "More"] }));
    const dark = /dark/i.test(pattern.styleTags.join(" "));
    const fb = dark ? t.primaryColor : t.backgroundColor, ff = dark ? "#fff" : t.textColor, fm = dark ? "rgba(255,255,255,0.6)" : t.mutedTextColor;
    return (
      <footer className="px-6 py-14 sm:px-10" style={{ background: fb, borderTop: dark ? undefined : `1px solid ${t.borderColor}` }}>
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="text-[16px] font-bold" style={{ color: ff }}>{c.title ?? "Company"}</p>
            {c.description && <p className="mt-2 max-w-xs text-[12.5px]" style={{ color: fm }}>{c.description}</p>}
            <div className="mt-4 flex max-w-sm gap-2"><div className="h-9 flex-1 rounded-lg" style={{ background: dark ? "rgba(255,255,255,0.08)" : t.surfaceColor, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : t.borderColor}` }} /><span className="rounded-lg px-4 py-2 text-[13px] font-medium" style={fill(t)}>{c.primaryButtonLabel ?? "Subscribe"}</span></div>
          </div>
          {cols.map((col) => (
            <div key={col.head}><p className="text-[13px] font-semibold" style={{ color: ff }}>{col.head}</p><ul className="mt-3 grid gap-2 text-[12.5px]" style={{ color: fm }}>{col.links.map((l) => <li key={l}>{l}</li>)}</ul></div>
          ))}
        </div>
      </footer>
    );
  }

  // ── CENTERED (default hero/cta-style). ──
  return (
    <section className={wrap} style={{ background: bg }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        {eyebrowEl}
        <h2 className="text-[30px] font-bold leading-tight sm:text-[38px]" style={H()}>{c.title ?? spec.name}</h2>
        {c.description && <p className="max-w-xl text-[15px] leading-relaxed" style={{ color: r.muted }}>{c.description}</p>}
        <div className="mt-2">{buttons}</div>
      </div>
    </section>
  );
}
