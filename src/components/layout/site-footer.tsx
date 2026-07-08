import Link from "next/link";
import { FlowfreakWordmark } from "@/components/layout/logo";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Studio", href: "/#product" },
      { label: "Library", href: "/#library" },
      { label: "SEO", href: "/#product" },
      { label: "Connect", href: "/#export" },
      { label: "Automations", href: "/#product" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Components", href: "/#library" },
      { label: "Templates", href: "/#library" },
      { label: "Industry Packs", href: "/#packs" },
      { label: "Documentation", href: "/#product" },
      { label: "Changelog", href: "/#product" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Agencies", href: "/#use-cases" },
      { label: "Freelancers", href: "/#use-cases" },
      { label: "Small Businesses", href: "/#use-cases" },
      { label: "Developers", href: "/#use-cases" },
      { label: "AI Builders", href: "/#use-cases" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#product" },
      { label: "Contact", href: "mailto:hello@flowfreak.io" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Login", href: "/signin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-12 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <FlowfreakWordmark height={68} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Turn client briefs into brand guidelines, sitemaps, wireframes,
              component-based page designs, and export-ready website prompts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4">
            {COLS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-muted transition-colors duration-200 hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Flowfreak.</p>
          <p className="font-mono">Brief in. Structured website plan out.</p>
        </div>
      </div>
    </footer>
  );
}
