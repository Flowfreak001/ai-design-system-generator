import type { SectionProps } from "../types";
import { resolveTheme, h, b, fill } from "../section-theme";

export default function SimpleNavbar({ theme, title, items, primaryButtonLabel }: SectionProps) {
  const t = resolveTheme(theme);
  const links = (items?.length ? items.map((i) => i.label ?? i.title ?? "") : ["Home", "Services", "About", "Contact"]).filter(Boolean);
  return (
    <nav className="flex items-center justify-between px-8 py-4" style={{ background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}` }}>
      <span className="text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
      <div className="hidden items-center gap-6 text-[13px] sm:flex" style={b(t)}>
        {links.map((l) => <span key={l}>{l}</span>)}
      </div>
      <span className="hidden px-4 py-2 text-[13px] font-medium sm:inline-block" style={fill(t)}>{primaryButtonLabel || "Get started"}</span>
    </nav>
  );
}
