// A NEW, original section composed at runtime from a reference analysis — not a
// prebuilt library component. It reads the extracted pattern (section type +
// content slots + layout direction) and builds a fresh, responsive, themed
// layout with grey placeholders only (never the uploaded screenshot). Existing
// library components are used purely as inspiration for code quality here.

import { resolveTheme, h, b, fill, outline, cardRaised } from "../section-theme";
import type { SectionTheme } from "../types";
import type { GeneratedSectionSpec, SectionPattern } from "@/lib/references/types";

/** Grey media placeholder — never a real/reference image. */
function Placeholder({ t, label, className = "", ratio }: { t: SectionTheme; label?: string; className?: string; ratio?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-xl ${className}`}
      style={{ background: t.surfaceColor, border: `1px dashed ${t.borderColor}`, aspectRatio: ratio }}
    >
      <span className="text-[11px] font-medium" style={{ color: t.mutedTextColor }}>{label ?? "Image placeholder"}</span>
    </div>
  );
}

/** Title-case an extracted slot label like "company info slot" → "Company info". */
function slotLabel(s: string): string {
  const cleaned = s.replace(/\bslot\b/gi, "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
}

/** Footer link columns derived from the reference's extracted structure. */
function footerColumns(pattern: SectionPattern): { head: string; links: string[] }[] {
  const slots = (pattern.componentStructure.length ? pattern.componentStructure : pattern.contentSlots)
    .map(slotLabel)
    .filter((s) => s && !/newsletter|subscribe|cta|call.?to.?action|contact detail|logo|search|social/i.test(s));
  const uniq = [...new Set(slots)].slice(0, 4);
  const cols = (uniq.length ? uniq : ["Product", "Company", "Resources", "Legal"]).map((head) => ({
    head,
    links: ["Overview", "Details", "More"],
  }));
  return cols;
}

export function GeneratedSection({ spec, pattern, theme }: { spec: GeneratedSectionSpec; pattern: SectionPattern; theme?: SectionTheme }) {
  const t = resolveTheme(theme);
  const c = spec.previewContent ?? {};
  const items = c.items ?? [];
  const side = spec.assetPlacement === "left" ? "left" : "right";
  const eyebrow = c.eyebrow;
  const title = c.title ?? spec.name;
  const desc = c.description;

  const Eyebrow = eyebrow ? <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: t.accentColor }}>{eyebrow}</span> : null;
  const Btns = (
    <div className="flex flex-wrap gap-2.5">
      {c.primaryButtonLabel && <span className="px-5 py-2.5 text-[13px] font-medium" style={fill(t)}>{c.primaryButtonLabel}</span>}
      {c.secondaryButtonLabel && <span className="px-5 py-2.5 text-[13px] font-medium" style={outline(t)}>{c.secondaryButtonLabel}</span>}
    </div>
  );

  const wrap = "px-6 py-14 sm:px-10 sm:py-16";

  switch (spec.type) {
    case "hero": {
      const copy = (
        <div className="grid gap-4">
          {Eyebrow}
          <h1 className="text-[32px] font-bold leading-tight sm:text-[40px]" style={h(t)}>{title}</h1>
          {desc && <p className="max-w-lg text-[15px] leading-relaxed" style={b(t)}>{desc}</p>}
          <div className="mt-2">{Btns}</div>
        </div>
      );
      const media = <Placeholder t={t} label="Hero visual" ratio="16/10" className="w-full" />;
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            {side === "left" ? <>{media}{copy}</> : <>{copy}{media}</>}
          </div>
        </section>
      );
    }

    case "features":
    case "services": {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-2xl text-center">
            {Eyebrow}
            <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            {desc && <p className="mt-2 text-[14px]" style={b(t)}>{desc}</p>}
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
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

    case "testimonials": {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-2xl text-center">
            {Eyebrow}
            <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <div key={i} className="p-6" style={cardRaised(t)}>
                <div className="text-[13px]" style={{ color: t.accentColor }}>★★★★★</div>
                <p className="mt-3 text-[13.5px] italic leading-relaxed" style={b(t)}>“{it.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <Placeholder t={t} className="h-9 w-9 rounded-full" label="" />
                  <p className="text-[12.5px] font-semibold" style={h(t)}>{it.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "pricing": {
      const plans = items.length ? items : [{ title: "Starter", text: "For getting going" }, { title: "Growth", text: "For scaling teams" }, { title: "Scale", text: "For large orgs" }];
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-2xl text-center">
            {Eyebrow}
            <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            {desc && <p className="mt-2 text-[14px]" style={b(t)}>{desc}</p>}
          </div>
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

    case "faq": {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              {Eyebrow}
              <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            </div>
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

    case "cta": {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-2xl p-10 text-center" style={{ background: t.surfaceColor, border: `1px solid ${t.borderColor}` }}>
            <h2 className="text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            {desc && <p className="max-w-xl text-[14px]" style={b(t)}>{desc}</p>}
            {Btns}
          </div>
        </section>
      );
    }

    case "footer": {
      const cols = footerColumns(pattern);
      const dark = /dark/i.test(pattern.styleTags.join(" "));
      const bg = dark ? t.primaryColor : t.backgroundColor;
      const fg = dark ? "#ffffff" : t.textColor;
      const mut = dark ? "rgba(255,255,255,0.6)" : t.mutedTextColor;
      return (
        <footer className="px-6 py-14 sm:px-10" style={{ background: bg, borderTop: dark ? undefined : `1px solid ${t.borderColor}` }}>
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <p className="text-[16px] font-bold" style={{ color: fg }}>{title}</p>
              {desc && <p className="mt-2 max-w-xs text-[12.5px]" style={{ color: mut }}>{desc}</p>}
              <div className="mt-4 flex max-w-sm gap-2">
                <div className="h-9 flex-1 rounded-lg" style={{ background: dark ? "rgba(255,255,255,0.08)" : t.surfaceColor, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : t.borderColor}` }} />
                <span className="rounded-lg px-4 py-2 text-[13px] font-medium" style={fill(t)}>{c.primaryButtonLabel ?? "Subscribe"}</span>
              </div>
            </div>
            {cols.map((col) => (
              <div key={col.head}>
                <p className="text-[13px] font-semibold" style={{ color: fg }}>{col.head}</p>
                <ul className="mt-3 grid gap-2 text-[12.5px]" style={{ color: mut }}>
                  {col.links.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      );
    }

    case "showcase": {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-2xl text-center">
            {Eyebrow}
            <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            {desc && <p className="mt-2 text-[14px]" style={b(t)}>{desc}</p>}
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Placeholder key={i} t={t} label={`Project ${i + 1}`} ratio="4/3" />)}
          </div>
        </section>
      );
    }

    default: {
      return (
        <section className={wrap} style={{ background: t.backgroundColor }}>
          <div className="mx-auto max-w-2xl text-center">
            {Eyebrow}
            <h2 className="mt-2 text-[26px] font-bold sm:text-[30px]" style={h(t)}>{title}</h2>
            {desc && <p className="mt-2 text-[14px]" style={b(t)}>{desc}</p>}
            <div className="mt-5 flex justify-center">{Btns}</div>
          </div>
        </section>
      );
    }
  }
}
