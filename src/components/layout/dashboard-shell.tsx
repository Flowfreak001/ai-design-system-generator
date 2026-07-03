"use client";

// App shell: 250px labeled sidebar (grouped nav, Linear/Vercel pattern) +
// slim topbar with breadcrumbs and a primary quick action. The sidebar stays
// visible so navigation never needs a "back"; disabled groups show the
// roadmap without dead links.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/(app)/auth-actions";
import type { SessionUser } from "@/lib/auth";
import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";

const ICONS: Record<string, ReactNode> = {
  home: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  clients: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16.5" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 14.7c2 .2 3.7 1.4 4.4 3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  projects: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  workflows: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 7h5a2 2 0 0 1 2 2v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  approvals: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  leads: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16l-6.2 7.2V19l-3.6-2v-4.8L4 5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  library: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16.5 5.2 3.4.9a1 1 0 0 1 .7 1.2l-3 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.6-6.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5V4a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 4 4v16a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 14 20v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 12h11m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

type NavItem = { label: string; href?: string; icon: string; soon?: boolean; dynamic?: "references" };
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "home" },
      { label: "Clients", href: "/clients", icon: "clients" },
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Library", icon: "library", dynamic: "references" },
    ],
  },
  {
    title: "Automation",
    items: [
      { label: "Workflows", icon: "workflows", soon: true },
      { label: "Approvals", icon: "approvals", soon: true },
      { label: "Leads", icon: "leads", soon: true },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", icon: "settings", soon: true }],
  },
];

const CRUMBS: [RegExp, string[]][] = [
  [/^\/dashboard/, ["Dashboard"]],
  [/^\/library/, ["Library"]],
  [/^\/clients\/new/, ["Clients", "Add client"]],
  [/^\/clients\/[^/]+/, ["Clients", "Client"]],
  [/^\/clients/, ["Clients"]],
  [/^\/projects\/new/, ["Projects", "New project"]],
  [/^\/projects\/[^/]+/, ["Projects", "Workspace"]],
  [/^\/projects/, ["Projects"]],
];

function navItemCls(active: boolean, disabled = false, collapsed = false) {
  return [
    "relative flex w-full font-medium transition-colors duration-150",
    collapsed
      ? "flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] leading-tight"
      : "items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px]",
    disabled
      ? "cursor-default text-faint"
      : active
        ? "bg-accent-soft text-accent"
        : "text-body hover:bg-panel hover:text-ink",
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem("pos-sidebar") === "collapsed");
  }, []);
  // Close the mobile drawer on navigation.
  useEffect(() => setMobileOpen(false), [pathname]);
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("pos-sidebar", next ? "collapsed" : "open");
  };
  const crumbs = CRUMBS.find(([re]) => re.test(pathname))?.[1] ?? ["Workspace"];
  // Section Reference Library is project-scoped; resolve it to the open project.
  const projectId = pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? null;
  const projectIdActive = projectId && projectId !== "new" ? projectId : null;
  const onReferences = /^\/projects\/[^/]+\/references/.test(pathname);
  const initials = (user.name ?? user.email)
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  const nav = (isCollapsed: boolean) => (
    <nav className={`mt-1 flex-1 overflow-y-auto ${isCollapsed ? "px-2.5" : "px-3"}`} aria-label="App">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mb-4">
          {isCollapsed ? (
            group.title !== NAV_GROUPS[0].title && <div className="mx-2 mb-3 border-t border-line" aria-hidden="true" />
          ) : (
            <p className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
              {group.title}
            </p>
          )}
          <div className="grid gap-0.5">
            {group.items.map((item) => {
              // Project-scoped Library link — points at the open project's
              // Section Reference Library, disabled when no project is open.
              if (item.dynamic === "references") {
                // Inside a project → that project's library; otherwise the
                // global library hub so it's reachable from the dashboard.
                const href = projectIdActive ? `/projects/${projectIdActive}/references` : "/library";
                const active = onReferences || pathname.startsWith("/library");
                return (
                  <Link key={item.label} href={href} aria-current={active ? "page" : undefined} className={`mt-1 ${navItemCls(active, false, isCollapsed)}`}>
                    {!isCollapsed && active && <span aria-hidden="true" className="absolute -left-3 h-4 w-[3px] rounded-full bg-accent" />}
                    {ICONS[item.icon]}
                    {item.label}
                  </Link>
                );
              }
              if (item.soon) {
                return (
                  <span key={item.label} className={navItemCls(false, true, isCollapsed)} aria-disabled="true" title={`${item.label} — coming soon`}>
                    {ICONS[item.icon]}
                    {item.label}
                    {!isCollapsed && (
                      <span className="ml-auto rounded-full border border-line px-1.5 py-px text-[9.5px] font-medium uppercase tracking-wide text-faint">
                        soon
                      </span>
                    )}
                  </span>
                );
              }
              // The references route is owned by the Library item, not Projects.
              const active = pathname.startsWith(item.href!) && !(item.href === "/projects" && onReferences);
              return (
                <Link key={item.label} href={item.href!} aria-current={active ? "page" : undefined} className={navItemCls(active, false, isCollapsed)}>
                  {!isCollapsed && active && <span aria-hidden="true" className="absolute -left-3 h-4 w-[3px] rounded-full bg-accent" />}
                  {ICONS[item.icon]}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const userCard = (isCollapsed: boolean) => (
    <div className={`border-t border-line ${isCollapsed ? "p-2" : "p-3"}`}>
      <div className={`flex items-center gap-2.5 rounded-lg ${isCollapsed ? "flex-col px-0 py-1" : "px-2 py-1.5"}`}>
        <span title={user.email} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">
          {initials}
        </span>
        {!isCollapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight text-ink">{user.name ?? "Account"}</span>
            <span className="block truncate text-[11.5px] leading-tight text-muted">{user.email}</span>
          </span>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            title="Sign out"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
          >
            {ICONS.logout}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-1">
      {/* Desktop sidebar */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 md:flex ${collapsed ? "w-[92px]" : "w-[216px]"}`}>
        <div className={`flex items-center pt-4 pb-3 ${collapsed ? "flex-col gap-2 px-0" : "justify-between gap-1 pl-3.5 pr-2"}`}>
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Project OS home">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-[15px] text-white">◆</span>
            {!collapsed && <span className="truncate text-[14px] font-semibold text-ink">Project OS</span>}
          </Link>
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-panel hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </button>
        </div>
        {nav(collapsed)}
        {userCard(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] max-w-[85vw] flex-col border-r border-line bg-surface shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pt-4 pb-3 pl-3.5 pr-2">
              <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Project OS home">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-[15px] text-white">◆</span>
                <span className="truncate text-[14px] font-semibold text-ink">Project OS</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted hover:bg-panel hover:text-ink"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {nav(false)}
            {userCard(false)}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-body hover:bg-panel md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 truncate text-[13.5px]">
              {crumbs.map((c, i) => (
                <span key={c} className="flex min-w-0 items-center gap-1.5">
                  {i > 0 && <span className="text-faint">/</span>}
                  <span className={`truncate ${i === crumbs.length - 1 ? "font-medium text-ink" : "text-muted"}`}>{c}</span>
                </span>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <input
              type="search"
              placeholder="Search…"
              aria-label="Search"
              className="hidden w-56 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-[13px] placeholder:text-faint focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent lg:block"
            />
            <LinkButton href="/projects/new" size="md" className="h-8 px-3 text-[13px]">
              <span className="hidden sm:inline">New project</span>
              <span className="sm:hidden" aria-hidden="true">+</span>
            </LinkButton>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
