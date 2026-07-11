// Generates a runnable Next.js headless-site starter for a project. The site
// reads its per-project CMS collection (populated by publishProjectToWix)
// and renders each section's REAL TSX component (compiled in the browser with
// sucrase, react + framer-motion only) — so the live site matches the design,
// animations included. Falls back to a simple text block if a row has no code.
// Pure — returns files as { path, content }[].

import { collectionIdForProject } from "./publish";

export type GeneratedFile = { path: string; content: string };

export function generateWixHeadlessSite(opts: { projectId: string; projectName: string }): GeneratedFile[] {
  const { projectId, projectName } = opts;
  const collectionId = collectionIdForProject(projectId);
  const safeName = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") || "flowfreak-site";

  const files: GeneratedFile[] = [];
  const add = (path: string, content: string) => files.push({ path, content: content.replace(/^\n/, "") });

  add("package.json", `
{
  "name": "${safeName}",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sucrase": "^3.35.0"
  },
  "devDependencies": { "@types/node": "^20", "@types/react": "^18", "typescript": "^5" }
}
`);

  add(".env.local.example", `
# Server-side Wix creds (never exposed to the browser).
WIX_API_KEY="your-wix-api-key"
WIX_SITE_ID="your-wix-site-id"
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
    "module": "esnext", "moduleResolution": "bundler", "strict": false, "noEmit": true,
    "esModuleInterop": true, "skipLibCheck": true, "resolveJsonModule": true,
    "plugins": [{ "name": "next" }], "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"], "exclude": ["node_modules"]
}
`);

  add("lib/wix.ts", `
// Server-side read of this project's CMS collection (Wix Data REST + API key).
export const PROJECT_ID = ${JSON.stringify(projectId)};

export type SectionRow = {
  _id: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  componentCode?: string;
  theme?: Record<string, any>;
  content?: Record<string, any>;
};

export async function getSections(): Promise<SectionRow[]> {
  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;
  if (!apiKey || !siteId) return [];
  const res = await fetch("https://www.wixapis.com/wix-data/v2/items/query", {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: apiKey, "wix-site-id": siteId },
    body: JSON.stringify({
      dataCollectionId: ${JSON.stringify(collectionId)},
      query: { filter: { projectId: PROJECT_ID }, sort: [{ fieldName: "order", order: "ASC" }], cursorPaging: { limit: 100 } },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.dataItems ?? []).map((it: any) => {
    const d = it.data || {};
    const safe = (s: any) => { try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return {}; } };
    return { _id: d._id, sectionType: d.sectionType, title: d.title, subtitle: d.subtitle, componentCode: d.componentCode, theme: safe(d.theme), content: safe(d.content) };
  });
}
`);

  add("components/DynamicSection.tsx", `
"use client";
// Compiles a section's TSX in the browser (sucrase) and renders it with the
// same react + framer-motion sandbox Flowfreak uses. Falls back to a simple
// block if there's no code or compilation fails.
import { Component, useEffect, useState } from "react";
import * as React from "react";
import * as FramerMotion from "framer-motion";
import type { SectionRow } from "@/lib/wix";

function sandboxRequire(name: string): unknown {
  if (name === "react") return React;
  if (name === "framer-motion" || name === "motion/react") return FramerMotion;
  throw new Error("Import not allowed: " + name);
}

async function compile(src: string): Promise<any> {
  const { transform } = await import("sucrase");
  const { code } = transform(src, { transforms: ["jsx", "typescript", "imports"], production: true });
  const mod: any = { exports: {} };
  const fn = new Function("require", "module", "exports", "React", code);
  fn(sandboxRequire, mod, mod.exports, React);
  return mod.exports.default || mod.exports.Section;
}

class Boundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Fallback({ row }: { row: SectionRow }) {
  const c = row.content || {};
  const items: any[] = Array.isArray(c.items) ? c.items : [];
  return (
    <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
      {c.eyebrow ? <p style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, color: "#e94b6f", margin: 0 }}>{c.eyebrow}</p> : null}
      {(c.title || row.title) ? <h2 style={{ fontSize: 40, fontWeight: 700, margin: "12px 0 0", lineHeight: 1.1 }}>{c.title || row.title}</h2> : null}
      {(c.subtitle || row.subtitle) ? <p style={{ fontSize: 18, color: "#555", margin: "12px 0 0" }}>{c.subtitle || row.subtitle}</p> : null}
      {c.description ? <p style={{ fontSize: 16, color: "#666", margin: "10px 0 0", maxWidth: 640 }}>{c.description}</p> : null}
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

export function DynamicSection({ row }: { row: SectionRow }) {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    let ok = true;
    if (row.componentCode) compile(row.componentCode).then((c) => ok && setComp(() => c)).catch(() => ok && setComp(null));
    return () => { ok = false; };
  }, [row.componentCode]);

  const fallback = <Fallback row={row} />;
  if (!row.componentCode) return fallback;
  if (!Comp) return <div style={{ minHeight: 240 }} />; // brief placeholder while compiling
  return (
    <Boundary fallback={fallback}>
      <Comp content={row.content || {}} theme={row.theme || {}} />
    </Boundary>
  );
}
`);

  add("app/layout.tsx", `
export const metadata = { title: ${JSON.stringify(projectName)} };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: "#0b0b0c" }}>{children}</body>
    </html>
  );
}
`);

  add("app/page.tsx", `
import { getSections } from "@/lib/wix";
import { DynamicSection } from "@/components/DynamicSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sections = await getSections();
  if (!sections.length) {
    return <main style={{ padding: 48 }}>No sections published yet. Run "Publish to Wix" in Flowfreak.</main>;
  }
  return <main>{sections.map((row) => <DynamicSection key={row._id} row={row} />)}</main>;
}
`);

  add("README.md", `
# ${projectName} — Wix Headless site

Generated by Flowfreak. Renders your project's sections from its Wix CMS collection
(\`${collectionId}\`) — including each section's real component + animations (compiled in
the browser with sucrase + framer-motion).

## Run (self-managed — host it yourself, e.g. Railway/Vercel)
1. \`npm install\`
2. Copy \`.env.local.example\` → \`.env.local\`, set \`WIX_API_KEY\` + \`WIX_SITE_ID\` (server-side).
3. \`npm run dev\` → http://localhost:3000

The page reads the collection with the server-side Wix Data REST API (admin API key), so it
works against admin-created collections with no extra permission setup.

## Or: deploy as a Wix *Managed* Headless site
Prefer Wix to host + deploy it for you? Use the official bootstrap (Node ≥ 20.11):
\`\`\`bash
curl -fsSL -O https://wix-headless.dev/bootstrap.mjs && node bootstrap.mjs
\`\`\`
Then drop these \`app/\` + \`components/\` + \`lib/\` files into the generated project.

Re-run "Publish to Wix" in Flowfreak to update — this site reads it live.
`);

  return files;
}

/** Bundle the files into one Markdown doc (for copy / download / AI scaffold). */
export function bundleToMarkdown(projectName: string, files: GeneratedFile[]): string {
  const head = `# ${projectName} — Wix Headless site (Flowfreak export)\n\nSave each file at its path, then \`npm install && npm run dev\`.\n`;
  const body = files
    .map((f) => {
      const lang = f.path.endsWith(".tsx") || f.path.endsWith(".ts") ? "tsx" : f.path.endsWith(".json") ? "json" : f.path.endsWith(".mjs") ? "js" : f.path.endsWith(".md") ? "md" : "";
      return `\n### \`${f.path}\`\n\n\`\`\`${lang}\n${f.content}\`\`\`\n`;
    })
    .join("");
  return head + body;
}
