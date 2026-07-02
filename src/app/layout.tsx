import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    default: "Project OS — Agency projects & small-business automation",
    template: "%s · Project OS",
  },
  description:
    "An AI-powered project workspace for freelancers and agencies to scope, organize, and deliver websites, apps, and small-business automation workflows from first client brief to final handoff.",
  openGraph: {
    title: "Project OS",
    description:
      "Run client projects and small-business automations from one AI-powered workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
