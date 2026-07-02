"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";

const LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Workflow Builder", href: "/#workflow" },
  { label: "Agency OS", href: "/#agency" },
];

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-canvas/90 backdrop-blur transition-[border-color] duration-300 ${
        solid ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-12">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white text-sm">
            ◆
          </span>
          Project OS
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LinkButton href="/signin" variant="ghost" size="md" className="hidden sm:inline-flex">
            Sign in
          </LinkButton>
          <LinkButton href="/signup" size="md">
            Get started
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
