import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";

// The app group (projects + auth pages) renders in the DARK theme.
// Auth *gating* lives in projects/layout.tsx — signin/signup stay public.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();
  return (
    <div className="theme-dark flex min-h-screen flex-1 flex-col bg-canvas text-ink">
      <AppHeader user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
