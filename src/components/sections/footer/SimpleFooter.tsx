import type { SectionProps } from "../types";
import { resolveTheme } from "../section-theme";

export default function SimpleFooter({ theme, title, items }: SectionProps) {
  const t = resolveTheme(theme);
  const links = (items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Home", "Services", "About", "Contact", "Privacy"]).filter(Boolean);
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-8 py-8" style={{ background: t.primaryColor }}>
      <span className="text-[15px] font-bold" style={{ fontFamily: t.headingFont, color: "#ffffff" }}>{title || "Company"}</span>
      <div className="flex flex-wrap gap-5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.7)" }}>
        {links.map((l) => <span key={l}>{l}</span>)}
      </div>
      <span className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>© {new Date().getFullYear()}</span>
    </footer>
  );
}
