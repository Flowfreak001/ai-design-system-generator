"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { FlowfreakWordmark } from "@/components/layout/logo";

type NavItem = {
  label: string;
  href: string;
  menu?: { label: string; href: string; desc?: string }[];
};

const NAV: NavItem[] = [
  {
    label: "Platform",
    href: "/#product",
    menu: [
      { label: "Studio", href: "/#product", desc: "Brief in, structured plan out" },
      { label: "Section Library", href: "/#library", desc: "Reusable page components" },
      { label: "Workflow", href: "/#workflow", desc: "From brief to build-ready" },
      { label: "Export", href: "/#export", desc: "Handoff-ready website prompts" },
    ],
  },
  {
    label: "Solutions",
    href: "/#use-cases",
    menu: [
      { label: "Agencies", href: "/#use-cases", desc: "Scope and ship faster" },
      { label: "Freelancers", href: "/#use-cases", desc: "Look bigger than you are" },
      { label: "Small Businesses", href: "/#use-cases", desc: "Get a real plan, fast" },
      { label: "Developers", href: "/#use-cases", desc: "Skip the blank canvas" },
    ],
  },
  {
    label: "Resources",
    href: "/#library",
    menu: [
      { label: "Components", href: "/#library", desc: "Browse the section catalog" },
      { label: "Industry Packs", href: "/#packs", desc: "Prebuilt page sets" },
      { label: "Templates", href: "/#library", desc: "Start from a layout" },
      { label: "Changelog", href: "/#product", desc: "What's new" },
    ],
  },
  { label: "Pricing", href: "/#pricing" },
];

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-[border-color] duration-300 ${
        solid || open || active ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="flex h-[70px] w-full items-center justify-between px-5 sm:px-8 lg:px-[60px]">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Flowfreak home" className="flex items-center">
            <FlowfreakWordmark height={58} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) =>
            item.menu ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openMenu(item.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-expanded={active === item.label}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[16px] font-medium text-ink transition-colors duration-200 ${
                    active === item.label ? "text-ink" : "hover:text-accent"
                  }`}
                >
                  {item.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`mt-px transition-transform duration-200 ${active === item.label ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {active === item.label && (
                  <div
                    className="absolute left-0 top-full pt-2"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="w-72 rounded-2xl border border-line bg-surface p-2 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.28)]">
                      {item.menu.map((m) => (
                        <Link
                          key={m.label}
                          href={m.href}
                          onClick={() => setActive(null)}
                          className="block rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-panel"
                        >
                          <span className="block text-sm font-medium text-ink">{m.label}</span>
                          {m.desc && <span className="mt-0.5 block text-xs text-muted">{m.desc}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[16px] font-medium text-ink transition-colors duration-200 hover:text-accent"
              >
                {item.label}
              </Link>
            )
          )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LinkButton href="/signin" variant="ghost" size="md" className="hidden sm:inline-flex">
            Login
          </LinkButton>
          <LinkButton href="/#pricing" variant="secondary" size="md" className="hidden md:inline-flex">
            Request Demo
          </LinkButton>
          <LinkButton href="/signup" size="md">
            Get Started
          </LinkButton>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg text-ink md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {open ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-canvas px-5 py-4 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-2.5 text-[15px] font-medium text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/signin" onClick={() => setOpen(false)} className="block py-2.5 text-[15px] font-medium text-muted">
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
