"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/(app)/auth-actions";
import type { SessionUser } from "@/lib/auth";
import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  clients: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16.5" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 14.7c2 .2 3.7 1.4 4.4 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  projects: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  team: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19.5c1-3.4 3.6-5 6.5-5s5.5 1.6 6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.5 6.5a2.5 2.5 0 1 1-2-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.6-6.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5V4a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 4 4v16a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 14 20v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12h11m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV: { label: string; href?: string; icon: string; soon?: boolean }[] = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Clients", href: "/clients", icon: "clients" },
  { label: "Projects", href: "/projects", icon: "projects" },
  { label: "Team", icon: "team", soon: true },
  { label: "Settings", icon: "settings", soon: true },
];

const TITLES: [string, string][] = [
  ["/dashboard", "Dashboard"],
  ["/clients/new", "Add Client"],
  ["/clients", "Clients"],
  ["/projects/new", "New Project"],
  ["/projects", "Projects"],
];

function railItemCls(active: boolean, disabled = false) {
  return [
    "flex w-[72px] flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-medium transition-colors duration-150",
    disabled
      ? "cursor-default text-faint"
      : active
        ? "bg-accent-soft text-accent"
        : "text-muted hover:bg-panel hover:text-ink",
  ].join(" ");
}

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Workspace";
  const initials = (user.name ?? user.email)
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex min-h-screen flex-1">
      {/* Icon rail */}
      <aside className="sticky top-0 flex h-screen w-[100px] shrink-0 flex-col items-center border-r border-line bg-surface py-4">
        <Link
          href="/"
          aria-label="Project OS home"
          className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white text-lg"
        >
          ◆
        </Link>

        <nav className="mt-6 flex flex-col items-center gap-1.5" aria-label="App">
          {NAV.map((item) => {
            if (item.soon) {
              return (
                <span key={item.label} className={railItemCls(false, true)} aria-disabled="true" title="Coming soon">
                  {ICONS[item.icon]}
                  {item.label}
                </span>
              );
            }
            const active = pathname.startsWith(item.href!);
            return (
              <Link
                key={item.label}
                href={item.href!}
                aria-current={active ? "page" : undefined}
                className={railItemCls(active)}
              >
                {ICONS[item.icon]}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signOutAction} className="mt-auto">
          <button type="submit" className={`${railItemCls(false)} cursor-pointer`}>
            {ICONS.logout}
            Logout
          </button>
        </form>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/90 px-5 backdrop-blur sm:px-8">
          <h1 className="text-[15px] font-medium text-ink">{title}</h1>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search…"
              aria-label="Search"
              className="hidden w-64 rounded-full border border-line bg-surface px-4 py-2 text-sm placeholder:text-faint focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent sm:block"
            />
            <span
              title={user.email}
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[12px] font-semibold text-white"
            >
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
