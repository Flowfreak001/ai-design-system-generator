import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingProviders } from "./providers";
import { ScrollProgress } from "@/components/ui/motion";
import { auth } from "@/lib/auth";

// Marketing pages render in the default LIGHT theme (see globals.css :root).
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();
  return (
    <MarketingProviders>
      {/* Marketing surface uses a LIGHTER page canvas than the dashboard's
          warm gray (#efeeea). Overriding the token here (not globally) keeps
          the dashboard untouched while white cards still read against it. */}
      <div
        className="flex min-h-dvh flex-col"
        style={{ ["--color-canvas" as string]: "#f7f6f4", background: "var(--color-canvas)" }}
      >
        <ScrollProgress />
        <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </MarketingProviders>
  );
}
