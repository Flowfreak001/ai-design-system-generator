import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";
import { NavItems, toNav } from "./nav-items";

export default function CenterLogoNavbar({ theme, title, items, navLinks }: SectionProps) {
  const t = resolveTheme(theme);
  const nav = toNav(navLinks, items, ["Home", "Services", "About", "Contact"]);
  const half = Math.ceil(nav.length / 2);
  return (
    <nav className="grid grid-cols-3 items-center px-8 py-4" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <div className="hidden items-center gap-6 text-[13px] sm:flex" style={b(t)}>
        <NavItems nav={nav.slice(0, half)} />
      </div>
      <span className="text-center text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
      <div className="hidden items-center justify-end gap-6 text-[13px] sm:flex" style={b(t)}>
        <NavItems nav={nav.slice(half)} />
      </div>
    </nav>
  );
}
