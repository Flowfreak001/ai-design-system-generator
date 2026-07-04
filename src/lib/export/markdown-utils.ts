// Small markdown formatting helpers shared by every prompt exporter.

export const h1 = (s: string) => `# ${s}\n`;
export const h2 = (s: string) => `\n## ${s}\n`;
export const h3 = (s: string) => `\n### ${s}\n`;

export const bullets = (items: (string | undefined | null)[]): string =>
  items.filter(Boolean).map((i) => `- ${i}`).join("\n") + "\n";

export const numbered = (items: string[]): string =>
  items.map((i, n) => `${n + 1}. ${i}`).join("\n") + "\n";

export const codeBlock = (lang: string, body: string): string =>
  "```" + lang + "\n" + body.trim() + "\n```\n";

export const jsonBlock = (value: unknown): string =>
  codeBlock("json", JSON.stringify(value, null, 2));

/** Compact a record: drop undefined/null/empty-string/empty-array values. */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

/** Kebab slug for filenames/routes. */
export const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "page";
