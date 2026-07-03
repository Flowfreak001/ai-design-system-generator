import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";

export default function CenterLogoNavbar({ theme, title, items }: SectionProps) {
  const t = resolveTheme(theme);
  const links = (items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Home", "Services", "About", "Contact"]).filter(Boolean);
  const half = Math.ceil(links.length / 2);
  return (
    <nav className="grid grid-cols-3 items-center px-8 py-4" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <div className="hidden items-center gap-6 text-[13px] sm:flex" style={b(t)}>
        {links.slice(0, half).map((l) => <span key={l}>{l}</span>)}
      </div>
      <span className="text-center text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
      <div className="hidden items-center justify-end gap-6 text-[13px] sm:flex" style={b(t)}>
        {links.slice(half).map((l) => <span key={l}>{l}</span>)}
      </div>
    </nav>
  );
}
