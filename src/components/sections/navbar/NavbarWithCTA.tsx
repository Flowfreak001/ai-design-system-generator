import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";
import { NavItems, toNav } from "./nav-items";
import { MobileNav } from "./MobileNav";

export default function NavbarWithCTA({ theme, title, items, primaryButtonLabel, secondaryButtonLabel, navLinks }: SectionProps) {
  const t = resolveTheme(theme);
  const nav = toNav(navLinks, items, ["Product", "Solutions", "Pricing", "Docs"]);
  const primary = primaryButtonLabel || "Get started";
  const secondary = secondaryButtonLabel || "Sign in";
  return (
    <nav className="flex items-center justify-between px-6 py-4 sm:px-8" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <div className="flex items-center gap-8">
        <span className="text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
        <div className="hidden items-center gap-5 text-[13px] md:flex" style={b(t)}>
          <NavItems nav={nav} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden px-3.5 py-2 text-[13px] font-medium md:inline-block" style={outline(t)}>{secondary}</span>
        <span className="hidden px-4 py-2 text-[13px] font-medium md:inline-block" style={fill(t)}>{primary}</span>
        <MobileNav nav={nav} theme={theme} primaryLabel={primary} secondaryLabel={secondary} />
      </div>
    </nav>
  );
}
