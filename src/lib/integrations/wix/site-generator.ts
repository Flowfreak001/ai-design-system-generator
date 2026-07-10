// Generates a runnable Next.js + Wix SDK "headless site" starter for a project.
// The generated app reads the FlowfreakSections CMS collection (populated by
// publishProjectToWix) and renders the project's sections. Pure — returns files
// as { path, content }[]; delivery (download/copy) is handled by the caller.

export type GeneratedFile = { path: string; content: string };

export function generateWixHeadlessSite(opts: { projectId: string; projectName: string }): GeneratedFile[] {
  const { projectId, projectName } = opts;
  const safeName = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") || "flowfreak-site";

  const files: GeneratedFile[] = [];
  const add = (path: string, content: string) => files.push({ path, content: content.replace(/^\n/, "") });

  add("package.json", `
{
  "name": "${safeName}",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": {
    "@wix/data": "^1.0.0",
    "@wix/sdk": "^1.0.0",
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5"
  }
}
`);

  add(".env.local.example", `
# Public Wix Headless OAuth client id (safe to expose in the browser).
# Create/find it in your Wix headless project settings ("OAuth apps").
NEXT_PUBLIC_WIX_CLIENT_ID="your-wix-client-id"
`);

  add("next.config.mjs", `
/** @type {import('next').NextConfig} */
const nextConfig = { images: { remotePatterns: [{ protocol: "https", hostname: "**" }] } };
export default nextConfig;
`);

  add("tsconfig.json", `
{
  "compilerOptions": {
    "target": "ES2020", "lib": ["dom", "dom.iterable", "esnext"], "jsx": "preserve",
    "module": "esnext", "moduleResolution": "bundler", "strict": true, "noEmit": true,
    "esModuleInterop": true, "skipLibCheck": true, "resolveJsonModule": true,
    "plugins": [{ "name": "next" }], "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"], "exclude": ["node_modules"]
}
`);

  add("lib/wix.ts", `
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";

// Public (visitor) client — reads collections whose read permission is ANYONE.
export const wix = createClient({
  modules: { items },
  auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
});

// The Flowfreak project this site was generated for.
export const PROJECT_ID = ${JSON.stringify(projectId)};

export type SectionRow = {
  _id: string;
  page: string;
  order: number;
  sectionType: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  items?: string; // JSON string of [{ title, text }]
};

export async function getSections(): Promise<SectionRow[]> {
  const res = await wix.items
    .query("FlowfreakSections")
    .eq("projectId", PROJECT_ID)
    .ascending("order")
    .find();
  return (res.items as SectionRow[]) ?? [];
}
`);

  add("components/Section.tsx", `
import type { SectionRow } from "@/lib/wix";

function parseItems(raw?: string): { title?: string; text?: string }[] {
  if (!raw) return [];
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
}

export function Section({ row }: { row: SectionRow }) {
  const items = parseItems(row.items);
  return (
    <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
      {row.eyebrow ? (
        <p style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, color: "#e94b6f", margin: 0 }}>{row.eyebrow}</p>
      ) : null}
      {row.title ? <h2 style={{ fontSize: 40, fontWeight: 700, margin: "12px 0 0", lineHeight: 1.1 }}>{row.title}</h2> : null}
      {row.subtitle ? <p style={{ fontSize: 18, color: "#555", margin: "12px 0 0" }}>{row.subtitle}</p> : null}
      {row.description ? <p style={{ fontSize: 16, color: "#666", margin: "10px 0 0", maxWidth: 640 }}>{row.description}</p> : null}
      {items.length ? (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 28 }}>
          {items.map((it, i) => (
            <div key={i} style={{ border: "1px solid #eee", borderRadius: 16, padding: 20 }}>
              {it.title ? <p style={{ fontWeight: 600, margin: 0 }}>{it.title}</p> : null}
              {it.text ? <p style={{ color: "#555", margin: "6px 0 0", fontSize: 14 }}>{it.text}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
`);

  add("app/layout.tsx", `
export const metadata = { title: ${JSON.stringify(projectName)} };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0b0b0c" }}>
        {children}
      </body>
    </html>
  );
}
`);

  add("app/page.tsx", `
import { getSections } from "@/lib/wix";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sections = await getSections();
  if (!sections.length) {
    return <main style={{ padding: 48 }}>No sections published yet. Run "Publish to Wix" in Flowfreak.</main>;
  }
  return <main>{sections.map((row) => <Section key={row._id} row={row} />)}</main>;
}
`);

  add("README.md", `
# ${projectName} — Wix Headless site

Generated by Flowfreak. This Next.js app renders your project's sections directly
from the **FlowfreakSections** Wix CMS collection (populated by "Publish to Wix").

## Run it
1. \`npm install\`
2. Copy \`.env.local.example\` to \`.env.local\` and set \`NEXT_PUBLIC_WIX_CLIENT_ID\`
   (your Wix headless OAuth **Client ID** — a public value).
3. \`npm run dev\` → http://localhost:3000

## How it works
- \`lib/wix.ts\` creates a public Wix client and queries \`FlowfreakSections\`
  filtered to \`PROJECT_ID = ${projectId}\`, ordered by \`order\`.
- \`components/Section.tsx\` renders each row (eyebrow, title, subtitle, description, items).
- Re-run "Publish to Wix" in Flowfreak to update content — this site reads it live.

## Deploy
Deploy anywhere that runs Next.js (Vercel, Netlify, Railway). Set
\`NEXT_PUBLIC_WIX_CLIENT_ID\` in the host's environment.
`);

  return files;
}

/** Bundle the files into one Markdown doc (for copy / download / AI scaffold). */
export function bundleToMarkdown(projectName: string, files: GeneratedFile[]): string {
  const head = `# ${projectName} — Wix Headless site (Flowfreak export)\n\nSave each file below at its path, then \`npm install && npm run dev\`.\n`;
  const body = files
    .map((f) => {
      const lang = f.path.endsWith(".tsx") || f.path.endsWith(".ts") ? "tsx" : f.path.endsWith(".json") ? "json" : f.path.endsWith(".mjs") ? "js" : f.path.endsWith(".md") ? "md" : "";
      return `\n### \`${f.path}\`\n\n\`\`\`${lang}\n${f.content}\`\`\`\n`;
    })
    .join("");
  return head + body;
}
