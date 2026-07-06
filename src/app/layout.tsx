import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-design-system-generator-production.up.railway.app"),
  title: {
    default: "Flowfreak — Plan, build, optimize & automate business websites",
    template: "%s · Flowfreak",
  },
  description:
    "Flowfreak is an AI platform to plan, build, optimize, and automate business websites — Studio, Library, SEO, Automations, and MCP in one workspace.",
  openGraph: {
    title: "Flowfreak",
    description:
      "An AI platform to plan, build, optimize, and automate business websites.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, mono.variable, "font-sans")}
    >
      <head>
        {/* Google fonts used by Section Library preview themes (heading + body). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700;800&family=Fraunces:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-body">
        {children}
      </body>
    </html>
  );
}
