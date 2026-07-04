// Shared navbar link rendering. In live preview, real page `navLinks` are
// passed in and rendered as anchors that switch the previewed page (the site's
// own header becomes the navigation). Outside preview, it falls back to the
// section's editable `items` or sensible placeholder labels, rendered as plain
// text — exactly as before.

import type { NavLink, SectionItem } from "../types";

/** Resolve the links to render: real nav links win, then editable items, then defaults. */
export function toNav(navLinks: NavLink[] | undefined, items: SectionItem[] | undefined, defaults: string[]): NavLink[] {
  if (navLinks?.length) return navLinks;
  const labels = items?.length ? items.map((i) => i.label ?? i.title ?? "") : defaults;
  return labels.filter(Boolean).map((label) => ({ label, href: "" }));
}

export function NavItems({ nav }: { nav: NavLink[] }) {
  return (
    <>
      {nav.map((l, i) =>
        l.href ? (
          <a
            key={`${l.label}-${i}`}
            href={l.href}
            className="whitespace-nowrap transition-opacity hover:opacity-70"
            style={{ fontWeight: l.active ? 700 : undefined, opacity: l.active ? 1 : 0.85, color: "inherit", textDecoration: "none" }}
          >
            {l.label}
          </a>
        ) : (
          <span key={`${l.label}-${i}`} className="whitespace-nowrap">{l.label}</span>
        ),
      )}
    </>
  );
}
