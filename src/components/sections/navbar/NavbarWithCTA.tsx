import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill, outline } from "../section-theme";

export default function NavbarWithCTA({ theme, title, items, primaryButtonLabel, secondaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  const links = (items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Product", "Solutions", "Pricing", "Docs"]).filter(Boolean);
  return (
    <nav className="flex items-center justify-between px-8 py-4" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <div className="flex items-center gap-8">
        <span className="text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
        <div className="hidden items-center gap-5 text-[13px] md:flex" style={b(t)}>
          {links.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden px-3.5 py-2 text-[13px] font-medium sm:inline-block" style={outline(t)}>{secondaryButtonLabel || "Sign in"}</span>
        <span className="px-4 py-2 text-[13px] font-medium" style={fill(t)}>{primaryButtonLabel || "Get started"}</span>
      </div>
    </nav>
  );
}
