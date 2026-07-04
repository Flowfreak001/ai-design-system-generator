import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";
import { NavItems, toNav } from "./nav-items";
import { MobileNav } from "./MobileNav";

export default function SimpleNavbar({ theme, title, items, primaryButtonLabel, navLinks }: SectionProps) {
  const t = resolveTheme(theme);
  const nav = toNav(navLinks, items, ["Home", "Services", "About", "Contact"]);
  const cta = primaryButtonLabel || "Get started";
  return (
    <nav className="flex items-center justify-between px-6 py-4 sm:px-8" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <span className="text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
      <div className="hidden items-center gap-6 text-[13px] lg:flex" style={b(t)}>
        <NavItems nav={nav} />
      </div>
      <span className="hidden px-4 py-2 text-[13px] font-medium lg:inline-block" style={fill(t)}>{cta}</span>
      <MobileNav nav={nav} theme={theme} title={title || "Logo"} primaryLabel={cta} />
    </nav>
  );
}
