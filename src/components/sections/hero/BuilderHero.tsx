// Split hero with a version badge, eyebrow, oversized headline, solid CTA, and
// a detailed product/editor mockup (floating AI prompt chip, element-tile
// sidebar, and a preview with big display type). Modern website-builder style.
// Theme-token driven; supports asset-side swap.

import type { SectionProps, SectionTheme } from "../types";
import { resolveTheme, h, b, btnRadius } from "../section-theme";

const TILES = ["Div Block", "Flexbox", "Tabs", "Image", "Button", "SVG", "Paragraph", "Heading"];

function EditorMockup({ t }: { t: SectionTheme }) {
  return (
    <div className="relative overflow-hidden p-3" style={{ borderRadius: `calc(${t.radius} + 10px)`, background: `linear-gradient(180deg, ${t.accentColor} 0%, ${t.primaryColor} 42%)`, minHeight: 440 }}>
      {/* Floating AI prompt chip */}
      <div className="absolute left-6 top-6 z-10 w-64 rounded-xl p-3.5 shadow-2xl" style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}>
        <p className="text-[11px]" style={{ color: t.mutedTextColor }}><span style={{ color: t.accentColor }}>✦</span> Assistant working on: <span className="font-semibold" style={{ color: t.textColor }}>Homepage</span></p>
        <p className="mt-2 text-[12.5px] leading-snug" style={{ color: t.textColor }}>Create a hero section for an architecture studio</p>
        <div className="mt-2 flex justify-end"><span className="grid h-6 w-6 place-items-center rounded-md text-white" style={{ background: t.primaryColor }}>↑</span></div>
      </div>

      {/* Editor body: tile sidebar + preview */}
      <div className="mt-24 grid grid-cols-[150px_1fr] gap-2 overflow-hidden rounded-xl" style={{ background: t.backgroundColor }}>
        <div className="border-r p-3" style={{ borderColor: t.borderColor }}>
          <p className="mb-2 text-[10.5px] font-semibold" style={{ color: t.textColor }}>▾ Atomic Elements</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TILES.slice(0, 6).map((tile) => (
              <div key={tile} className="grid place-items-center rounded-lg py-2.5 text-center" style={{ border: `1px solid ${tile === "Button" ? t.accentColor : t.borderColor}` }}>
                <span className="h-3.5 w-3.5 rounded-sm" style={{ background: t.surfaceColor }} />
                <span className="mt-1 text-[8.5px]" style={{ color: t.mutedTextColor }}>{tile}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Preview canvas */}
        <div className="relative">
          <div className="flex items-center justify-end gap-3 px-4 py-2 text-[7.5px] font-semibold tracking-wide" style={{ background: "#111", color: "rgba(255,255,255,0.85)" }}>
            <span>WORK</span><span>ABOUT</span><span>OUR TEAM</span><span>CONTACT</span>
          </div>
          <div className="relative grid place-items-center overflow-hidden" style={{ height: 210, background: `linear-gradient(160deg, ${t.primaryColor}, ${t.surfaceColor})` }}>
            <span className="text-[64px] font-extrabold leading-none tracking-tight" style={{ fontFamily: t.headingFont, color: t.accentColor }}>YARI</span>
            <div className="absolute bottom-3 right-3 h-16 w-24 rounded-md" style={{ background: t.backgroundColor, opacity: 0.9 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderHero({ theme, eyebrow, title, subtitle, description, primaryButtonLabel, mobile, assetSide, items }: SectionProps) {
  const t = resolveTheme(theme);
  const badge = items?.[0]?.label ?? "Now in version 4";
  const content = (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ background: `linear-gradient(90deg, ${t.surfaceColor}, ${t.accentColor}22)`, color: t.textColor, border: `1px solid ${t.borderColor}` }}>
        <span style={{ color: t.accentColor }}>✦</span> {badge}
      </span>
      <p className="mt-5 text-[15px] font-semibold" style={{ color: t.textColor, fontFamily: t.headingFont }}>{eyebrow || "Website builder"}</p>
      <h1 className="mt-2 text-[46px] font-extrabold leading-[1.03] tracking-tight" style={h(t)}>{title || "Build with precision. Design without limits."}</h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={b(t)}>{subtitle || description || "Create high-performing, pixel-perfect sites your clients will notice — with advanced drag-and-drop tools, professional templates, and AI built right in."}</p>
      <span className="mt-7 inline-block px-6 py-3.5 text-[14px] font-semibold" style={{ background: t.primaryColor, color: "#fff", borderRadius: btnRadius(t) }}>{primaryButtonLabel || "See plans"}</span>
    </div>
  );
  const visual = <EditorMockup t={t} />;
  return (
    <section className="px-8 py-16" style={{ background: t.backgroundColor }}>
      <div className={`grid items-center gap-12 ${mobile ? "" : "grid-cols-2"}`}>
        {assetSide === "left" ? <>{visual}{content}</> : <>{content}{visual}</>}
      </div>
    </section>
  );
}
