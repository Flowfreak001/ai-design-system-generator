"use client";

// Responsive mobile header menu. Below lg the inline nav collapses into a
// hamburger that opens a full-screen overlay menu (the standard mobile pattern):
// a header row with the logo + close, large stacked links with the active page
// highlighted, and the CTAs pinned at the bottom. At lg+ the inline nav shows.

import { useEffect, useState } from "react";
import type { NavLink, SectionTheme } from "../types";
import { resolveTheme, h, fill, outline } from "../section-theme";

export function MobileNav({
  nav,
  theme,
  title,
  primaryLabel,
  secondaryLabel,
}: {
  nav: NavLink[];
  theme?: SectionTheme;
  title?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = resolveTheme(theme);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-lg"
        style={{ color: t.textColor }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: t.backgroundColor }}>
          {/* Header row mirrors the site header, with a close button. */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${t.borderColor}` }}
          >
            <span className="text-[16px] font-bold" style={h(t)}>{title || "Logo"}</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-lg"
              style={{ color: t.textColor }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Links — large tap targets, active page highlighted. */}
          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            {nav.map((l, i) => {
              const content = (
                <span className="flex items-center justify-between">
                  <span>{l.label}</span>
                  {l.active && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: t.accentColor }}>
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              );
              const style = {
                color: l.active ? t.accentColor : t.textColor,
                fontFamily: t.bodyFont,
                fontWeight: l.active ? 700 : 500,
              } as const;
              return l.href ? (
                <a key={`${l.label}-${i}`} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3.5 text-[17px]" style={style}>
                  {content}
                </a>
              ) : (
                <span key={`${l.label}-${i}`} className="rounded-xl px-4 py-3.5 text-[17px]" style={style}>
                  {content}
                </span>
              );
            })}
          </nav>

          {/* CTAs pinned at the bottom. */}
          {(secondaryLabel || primaryLabel) && (
            <div className="flex flex-col gap-2.5 px-6 py-5" style={{ borderTop: `1px solid ${t.borderColor}` }}>
              {secondaryLabel && <span className="w-full py-2.5 text-center text-[14px] font-medium" style={outline(t)}>{secondaryLabel}</span>}
              {primaryLabel && <span className="w-full py-2.5 text-center text-[14px] font-medium" style={fill(t)}>{primaryLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
