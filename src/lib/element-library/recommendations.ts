// Recommends library items for the current context (page type, website type,
// industry, goals, and which section kinds are still missing on the page).
// Pure scoring — no side effects.

import { ELEMENT_LIBRARY, isReady } from "./registry";
import type { ElementItem, ElementLibraryContext } from "./types";

// Curated recommendation sets keyed by a normalized page/website signal.
const PAGE_SETS: Record<string, string[]> = {
  home: ["sec-hero-centered", "blk-trustbadges", "sec-feat-grid", "sec-cta-banner", "sec-util-faq"],
  booking: ["sec-form-booking", "blk-locationcard", "sec-sp-stats", "sec-util-faq", "sec-cta-book"],
  saas: ["sec-hero-saas", "sec-feat-tabs", "blk-dashboardmockup", "blk-pricingcard", "sec-sp-logos", "sec-util-faq"],
  ecommerce: ["sec-sh-product", "sec-feat-grid", "blk-pricingcard", "sec-sp-testi", "sec-cta-banner"],
  agency: ["sec-hero-split", "sec-svc-cards", "sec-sh-portfolio", "sec-sp-testi", "sec-form-contact"],
  local: ["sec-hero-local", "sec-svc-cards", "blk-locationcard", "sec-sp-stats", "sec-cta-book"],
};

function signalFor(ctx: ElementLibraryContext): string {
  const hay = `${ctx.websiteType ?? ""} ${ctx.pageType ?? ""} ${ctx.pageName ?? ""} ${ctx.industry ?? ""}`.toLowerCase();
  if (/book|appointment|reserv|salon|clinic|restaurant/.test(hay)) return "booking";
  if (/saas|software|ai|platform|app/.test(hay)) return "saas";
  if (/shop|store|ecommerce|commerce|retail|product/.test(hay)) return "ecommerce";
  if (/agency|studio|portfolio|freelance|design/.test(hay)) return "agency";
  if (/local|service|plumb|trades|home service|automotive/.test(hay)) return "local";
  return "home";
}

/** Ordered, de-duplicated recommended items for the given context. */
export function recommendElements(ctx: ElementLibraryContext = {}, limit = 6): ElementItem[] {
  const present = new Set((ctx.presentKinds ?? []).map((k) => k.toLowerCase()));
  const goals = (ctx.goals ?? []).map((g) => g.toLowerCase());
  const ids = PAGE_SETS[signalFor(ctx)] ?? PAGE_SETS.home;

  const scored = ELEMENT_LIBRARY
    .filter(isReady)
    .map((e) => {
      let score = 0;
      if (ids.includes(e.id)) score += 10 - ids.indexOf(e.id); // curated order weight
      if (e.sectionType && !present.has(e.sectionType.toLowerCase())) score += 2; // fills a gap
      if (e.goals.some((g) => goals.includes(g.toLowerCase()))) score += 3;
      if (ctx.websiteType && e.websiteTypes.includes(ctx.websiteType)) score += 2;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.e);
}
