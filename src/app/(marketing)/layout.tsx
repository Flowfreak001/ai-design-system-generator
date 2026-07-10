import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingProviders } from "./providers";
import { ScrollProgress } from "@/components/ui/motion";

// Marketing pages render in the default LIGHT theme (see globals.css :root).
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingProviders>
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarketingProviders>
  );
}
