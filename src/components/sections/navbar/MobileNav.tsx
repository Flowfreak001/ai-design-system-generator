"use client";

// Responsive mobile header menu. Real site headers collapse their nav into a
// hamburger button that toggles a dropdown panel below a breakpoint. This is
// shown only under `md` (links show inline at md+), so tablet/desktop keep the
// full nav and phones get a proper hamburger → stacked menu with the CTAs.

import { useState } from "react";
import type { NavLink, SectionTheme } from "../types";
import { resolveTheme, fill, outline } from "../section-theme";

export function MobileNav({
  nav,
  theme,
  primaryLabel,
  secondaryLabel,
}: {
  nav: NavLink[];
  theme?: SectionTheme;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = resolveTheme(theme);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-lg"
        style={{ color: t.textColor }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl shadow-xl"
            style={{ background: t.backgroundColor, border: `1px solid ${t.borderColor}` }}
          >
            <nav className="flex flex-col p-1.5">
              {nav.map((l, i) =>
                l.href ? (
                  <a
                    key={`${l.label}-${i}`}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[14px] transition-colors"
                    style={{
                      color: t.textColor,
                      fontFamily: t.bodyFont,
                      fontWeight: l.active ? 700 : 500,
                      background: l.active ? t.surfaceColor : "transparent",
                    }}
                  >
                    {l.label}
                  </a>
                ) : (
                  <span key={`${l.label}-${i}`} className="rounded-lg px-3 py-2.5 text-[14px]" style={{ color: t.textColor }}>
                    {l.label}
                  </span>
                ),
              )}
            </nav>

            {(secondaryLabel || primaryLabel) && (
              <div className="flex flex-col gap-2 border-t p-3" style={{ borderColor: t.borderColor }}>
                {secondaryLabel && <span className="w-full text-center text-[13px] font-medium" style={outline(t)}>{secondaryLabel}</span>}
                {primaryLabel && <span className="w-full text-center text-[13px] font-medium" style={fill(t)}>{primaryLabel}</span>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
