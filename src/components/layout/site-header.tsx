"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";
import { FlowfreakWordmark } from "@/components/layout/logo";
import { useScrollDirection } from "@/lib/motion/use-scroll-direction";

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

function initialsOf(u: HeaderUser): string {
  const base = (u.name && u.name.trim()) || u.email;
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
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
            <Link
              href="/dashboard"
              aria-label="Go to your dashboard"
              className="flex items-center gap-2.5 rounded-full border border-ink/25 bg-surface py-1 pl-1 pr-3 transition-colors hover:border-ink/40 hover:bg-panel"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
                {initialsOf(user)}
              </span>
              <span className="hidden max-w-[140px] truncate text-[15px] font-medium text-ink sm:block">
                {(user.name && user.name.trim()) || user.email}
              </span>
            </Link>
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
