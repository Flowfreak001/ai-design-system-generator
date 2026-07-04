import type { SectionProps } from "../types";
import { resolveTheme, h, b } from "../section-theme";
import { NavItems, toNav } from "./nav-items";
import { MobileNav } from "./MobileNav";

export default function CenterLogoNavbar({ theme, title, items, navLinks }: SectionProps) {
  const t = resolveTheme(theme);
  const nav = toNav(navLinks, items, ["Home", "Services", "About", "Contact"]);
  const half = Math.ceil(nav.length / 2);
  return (
    <nav
      className="flex items-center justify-between px-6 py-4 sm:px-8 lg:grid lg:grid-cols-3"
      style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}
    >
      {/* md+: split links left of the centered logo. */}
      <div className="hidden items-center gap-6 text-[13px] lg:flex" style={b(t)}>
        <NavItems nav={nav.slice(0, half)} />
      </div>
      <span className="text-[16px] font-bold lg:text-center" style={h(t)}>{title || "Logo"}</span>
      <div className="hidden items-center justify-end gap-6 text-[13px] lg:flex" style={b(t)}>
        <NavItems nav={nav.slice(half)} />
      </div>
      {/* mobile: hamburger on the right. */}
      <MobileNav nav={nav} theme={theme} />
    </nav>
  );
}
