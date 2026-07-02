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
              Project OS<span className="text-brand">.</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              An AI-powered project workspace for freelancers and agencies to
              scope, organize, and deliver websites, apps, and small-business
              automation workflows — from first client brief to final handoff.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { label: "Pillars", href: "/#features" },
                { label: "How it works", href: "/#how" },
                { label: "Generated files", href: "/#output" },
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
              title="Use cases"
              links={[
                { label: "Agencies", href: "/#features" },
                { label: "Small businesses", href: "/#features" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Project OS.</p>
          <p className="font-mono">Brief → files → workflow → approval → handoff</p>
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
