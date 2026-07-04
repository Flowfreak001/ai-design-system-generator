// SaaS footer (Elementor-grade): brand blurb + newsletter + grouped link columns.

import type { SectionProps } from "../types";
import { resolveTheme, fill } from "../section-theme";

export function SaaSFooter({ theme, title, subtitle, primaryButtonLabel, mobile }: SectionProps) {
  const t = resolveTheme(theme);
  const cols = [
    { head: "Product", links: ["Features", "Pricing", "Templates", "Integrations"] },
    { head: "Resources", links: ["Docs", "Blog", "Guides", "Changelog"] },
    { head: "Company", links: ["About", "Careers", "Contact"] },
  ];
  return (
    <footer className="px-8 py-14" style={{ background: t.primaryColor }}>
      <div className={`grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]`}>
        <div>
          <p className="text-[16px] font-bold" style={{ fontFamily: t.headingFont, color: "#fff" }}>{title || "Company"}</p>
          <p className="mt-2 max-w-xs text-[12.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>{subtitle || "Design and ship polished websites with AI — faster than ever."}</p>
          <div className="mt-4 flex max-w-xs gap-2">
            <div className="h-9 flex-1 rounded-lg" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }} />
            <span className="px-4 py-2 text-[12px] font-semibold" style={fill(t)}>{primaryButtonLabel || "Subscribe"}</span>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.head}>
            <p className="text-[12.5px] font-semibold" style={{ color: "#fff", fontFamily: t.headingFont }}>{c.head}</p>
            <div className="mt-2.5 grid gap-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>{c.links.map((l) => <span key={l}>{l}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[11.5px]" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
        <span>© {new Date().getFullYear()} All rights reserved.</span>
        <span className="flex gap-4">Privacy · Terms · Status</span>
      </div>
    </footer>
  );
}
