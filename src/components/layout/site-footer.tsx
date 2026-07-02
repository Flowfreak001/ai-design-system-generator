import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-white text-sm">
                ◆
              </span>
              ADSG<span className="text-brand">.</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A multi-agent design intelligence system. Turn a brief into an
              AI-ready design system — tokens, docs, and platform prompts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { label: "Features", href: "/#features" },
                { label: "Workflow", href: "/#workflow" },
                { label: "Output files", href: "/#output" },
              ]}
            />
            <FooterCol
              title="App"
              links={[
                { label: "Projects", href: "/projects" },
                { label: "New project", href: "/projects/new" },
              ]}
            />
            <FooterCol
              title="Resources"
              links={[
                { label: "Docs", href: "/#output" },
                { label: "Export", href: "/#preview" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AI Design System Generator.</p>
          <p className="font-mono">Multi-agent design intelligence · not a website builder</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
