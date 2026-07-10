// Normalizes any section id to ONE canonical saved key so a bookmark made from
// the in-app catalog (/library) matches one made from the public library
// (/components) and shows up on /saved.
//
// The same built-in section has three id shapes:
//   raw json id     → "motion-testimonials-marquee"      (builtin-sections.json)
//   public catalog  → "builtin-motion-testimonials-…"    (/components, /saved: `builtin-${id}`)
//   agency catalog  → "seed-<agencyId>-vNN-motion-…"      (/library seeded rows)
// We canonicalize to the PUBLIC form ("builtin-<rawId>") because /components and
// /saved already key on it — so only the agency-catalog id needs converting.
// User-created ("adm-…") and anything else pass through unchanged.
//
// Pure — no prisma, no "use server" — so both the store and client components
// can import it.
export function builtinSectionKey(id: string): string {
  const m = id.match(/^seed-.+?-v\d+-(.+)$/);
  return m ? `builtin-${m[1]}` : id;
}
