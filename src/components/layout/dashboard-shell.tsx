"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/(app)/auth-actions";
import { LinkButton } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth";
import type { ReactNode } from "react";

const NAV: { label: string; href?: string; soon?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Workflows", soon: true },
  { label: "Approvals", soon: true },
  { label: "Leads", soon: true },
  { label: "Templates", soon: true },
  { label: "Settings", soon: true },
];

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-1">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <Link
          href="/"
          className="flex h-16 items-center gap-2.5 border-b border-line px-5 font-semibold tracking-tight text-ink"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white text-sm">◆</span>
          Project OS
        </Link>
        <nav className="flex-1 p-3" aria-label="App">
          {NAV.map((item) => {
            const active = item.href && pathname.startsWith(item.href);
            if (item.soon) {
              return (
                <span
                  key={item.label}
                  className="mb-0.5 flex items-center justify-between rounded-lg px-3 py-2 text-sm text-faint"
                  aria-disabled="true"
                >
                  {item.label}
                  <span className="rounded-full border border-line px-1.5 py-px font-mono text-[9px] uppercase tracking-wider">
                    soon
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href!}
                aria-current={active ? "page" : undefined}
                className={`mb-0.5 block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-body hover:bg-panel hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate font-mono text-[11px] text-faint">{user.email}</p>
          <form action={signOutAction} className="mt-2">
            <button
              type="submit"
              className="cursor-pointer text-xs text-muted transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/90 px-5 backdrop-blur sm:px-8">
          {/* Mobile brand */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink md:hidden">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white text-xs">◆</span>
            Project OS
          </Link>
          <div className="hidden flex-1 md:block">
            <input
              type="search"
              placeholder="Search projects…"
              aria-label="Search projects"
              className="w-full max-w-xs rounded-[10px] border border-line bg-surface px-3.5 py-2 text-sm placeholder:text-faint focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href="/projects/new" size="md">
              Create project
            </LinkButton>
            <form action={signOutAction} className="md:hidden">
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-line px-3 py-2 text-xs text-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
