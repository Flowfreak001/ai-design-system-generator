"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";
import { FlowfreakWordmark } from "@/components/layout/logo";
import { useScrollDirection } from "@/lib/motion/use-scroll-direction";
import { signOutAction } from "@/app/(app)/auth-actions";

const EASE = [0.22, 1, 0.36, 1] as const;

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
      { label: "Components", href: "/components", desc: "Browse the section catalog" },
      { label: "Industry Packs", href: "/#packs", desc: "Prebuilt page sets" },
      { label: "Templates", href: "/#library", desc: "Start from a layout" },
      { label: "Changelog", href: "/#product", desc: "What's new" },
    ],
  },
  { label: "Pricing", href: "/#pricing" },
];

export type HeaderUser = { name: string | null; email: string };

// Account dropdown links (logged-in users) — mirrors the app's dashboard menu.
const USER_MENU_LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/saved", label: "Saved", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4.2L5.5 20V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg> },
  { href: "/projects", label: "Projects", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg> },
  { href: "/clients", label: "Clients", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 19c.8-3 3-4.5 5.5-4.5S13.7 16 14.5 19M16 6.5a3 3 0 0 1 0 5.8M20.5 19c-.5-2-1.6-3.4-3.2-4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { href: "/account", label: "Profile", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M5 19.5c1-3.4 3.6-5 7-5s6 1.6 7 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg> },
];

function initialsOf(u: HeaderUser): string {
  const base = (u.name && u.name.trim()) || u.email;
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function firstNameOf(u: HeaderUser): string {
  const name = u.name && u.name.trim();
  if (name) return name.split(/\s+/)[0];
  return u.email.split("@")[0];
}

export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();
  const { direction, atTop } = useScrollDirection(12);

  const solid = !atTop;
  // Hide when scrolling down away from the top; always show when a menu is open.
  const hidden = direction === "down" && !atTop && !open && !active && !reduce;

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300 ${
        solid || open || active
          ? "shadow-[0_6px_24px_-8px_rgba(15,23,42,0.12)]"
          : "shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="flex h-[70px] w-full items-center justify-between px-5 sm:px-10">
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

                <AnimatePresence>
                  {active === item.label && (
                    <motion.div
                      className="absolute left-0 top-full pt-2"
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={scheduleClose}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      style={{ transformOrigin: "top left" }}
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-panel focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
                  {initialsOf(user)}
                </span>
                <span className="hidden max-w-[140px] truncate text-[15px] font-medium text-ink sm:block">
                  {firstNameOf(user)}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`text-muted transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} aria-hidden="true" />
                  <div role="menu" className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center gap-2.5 px-2.5 py-2">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[12px] font-semibold text-white">{initialsOf(user)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium leading-tight text-ink">{(user.name && user.name.trim()) || firstNameOf(user)}</span>
                        <span className="block truncate text-[11.5px] leading-tight text-muted">{user.email}</span>
                      </span>
                    </div>
                    <div className="my-1 border-t border-line" />
                    {USER_MENU_LINKS.map((m) => (
                      <Link key={m.href} href={m.href} role="menuitem" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-body transition-colors hover:bg-panel hover:text-ink">
                        {m.icon}
                        {m.label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-line" />
                    <form action={signOutAction}>
                      <button type="submit" role="menuitem" className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-body transition-colors hover:bg-panel hover:text-ink">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Sign out
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <LinkButton href="/signin" variant="ghost" size="md" className="hidden sm:inline-flex">
                Login
              </LinkButton>
              <LinkButton href="/#pricing" variant="secondary" size="md" className="hidden md:inline-flex">
                Request Demo
              </LinkButton>
              <LinkButton href="/signup" size="md">
                Get Started
              </LinkButton>
            </>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg text-ink md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M4 7h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={open ? { d: "M6 6l12 12" } : { d: "M4 7h16" }}
                transition={{ duration: 0.22, ease: EASE }}
              />
              <motion.path
                d="M4 12h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={{ opacity: open ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.path
                d="M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={open ? { d: "M18 6L6 18" } : { d: "M4 17h16" }}
                transition={{ duration: 0.22, ease: EASE }}
              />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="overflow-hidden border-t border-line bg-canvas md:hidden"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <motion.ul
              className="flex flex-col px-5 py-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }}
            >
              {[...NAV, user ? { label: "Dashboard", href: "/dashboard" } : { label: "Log in", href: "/signin" }].map((item, i) => (
                <motion.li
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, y: reduce ? 0 : 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block py-2.5 text-[15px] font-medium ${i >= NAV.length ? "text-muted" : "text-ink"}`}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
