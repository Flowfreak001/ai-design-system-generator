import Link from "next/link";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Product", href: "/#product" },
      { label: "Workflow Builder", href: "/#workflow" },
      { label: "Agency OS", href: "/#agency" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Small businesses", href: "/#use-cases" },
      { label: "Agencies", href: "/#use-cases" },
      { label: "Templates", href: "/#use-cases" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Docs", href: "/#product" },
      { label: "Contact", href: "mailto:hello@projectos.dev" },
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-12 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 font-semibold tracking-tight text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white text-sm">
                ◆
              </span>
              Project OS
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Projects, prompts, workflows, and approvals in one AI-powered
              agency workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="eyebrow mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Project OS.</p>
          <p className="font-mono">AI drafts. Humans approve. Clients get delivery.</p>
        </div>
      </div>
    </footer>
  );
}
