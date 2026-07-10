import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Authenticated users get the dashboard shell (sidebar + top bar).
// Unauthenticated (signin/signup) render full-bleed — the AuthForm owns the
// whole split-screen (form panel + brand panel) including its own logo.
// Auth *gating* lives in projects/ and dashboard/ layouts.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();

  if (user) {
    return <DashboardShell user={user}>{children}</DashboardShell>;
  }

  return <div className="min-h-screen">{children}</div>;
}
