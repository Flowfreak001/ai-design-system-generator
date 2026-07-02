// Small utilities.

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Short, url-safe random suffix to keep slugs unique. */
export function shortId(len = 6): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len);
}
