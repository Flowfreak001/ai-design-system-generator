const OUTPUT_FILES = [
  "PROJECT_BRIEF.json",
  "RESEARCH_REPORT.md",
  "WEBSITE_ANALYSIS.md",
  "VISUAL_ANALYSIS.md",
  "DESIGN_TOKENS.json",
  "tokens.css",
  "tailwind.theme.json",
  "BRAND.md · DESIGN.md · CREATIVE.md · UX.md",
  "CONTENT.md · COPY_GUIDE.md · COMPONENTS.md",
  "ANIMATION.md · SEO.md · ACCESSIBILITY.md",
  "PROMPT_*.md (Codex, Claude Code, Cursor, v0, Bolt, Lovable, Replit, Webflow, Wix, WordPress)",
  "preview.html · component-preview.html",
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-indigo-600">
        Scaffold · foundation
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
        AI Website Design System Generator
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-gray-600">
        Create a project, add business details and reference URLs, upload assets,
        run AI agents, and export a structured, AI-ready design system.
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Module structure
        </h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
{`src/
  app/            routes + API
  components/     UI
  lib/
    agents/       AI pipeline stages (stubbed)
    generators/   output-file registry
    queue/        BullMQ (Railway) + inline fallback
    db/           Prisma 7 client
    validators/   zod schemas
    storage/      asset adapter (local fs)
  types/          shared domain types
  prompts/        per-tool prompt templates`}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Generated artifacts
        </h2>
        <ul className="mt-3 grid gap-1.5 text-sm text-gray-700">
          {OUTPUT_FILES.map((f) => (
            <li key={f} className="font-mono">
              {f}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        Status: skeleton, schema, and types in place. AI agents, Playwright
        crawler, and export ZIP are stubbed and wired for later.
      </p>
    </main>
  );
}
