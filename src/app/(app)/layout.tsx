import Link from "next/link";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Authenticated users get the dashboard shell (sidebar + top bar).
// Unauthenticated (signin/signup) get a minimal centered page.
// Auth *gating* lives in projects/ and dashboard/ layouts.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();

  if (user) {
    return <DashboardShell user={user}>{children}</DashboardShell>;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white text-sm">◆</span>
          Project OS
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
