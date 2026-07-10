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
      <ScrollProgress />
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarketingProviders>
  );
}
