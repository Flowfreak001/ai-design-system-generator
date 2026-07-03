// Evidence-based section/component inventory. Builds a SectionEvidence list and
// a multi-page analysis document from what was ACTUALLY detected on the scanned
// pages — so DESIGN.md and the preview are generated from evidence, never a
// fixed hero/services/FAQ/CTA template.

import type { PageStructure } from "./rendered-probe";
import type { RenderedProbeResult } from "./rendered-probe";

export type SectionEvidence = {
  id: string;
  projectId: string;
  pageType: string;
  sectionType: string;
  sectionName: string;
  sourceUrl: string;
  /** Screenshot slots — user-confirmable placeholders (upload not wired yet). */
  desktopScreenshotUrl: string | null;
  mobileScreenshotUrl: string | null;
  detectedStyles: Record<string, unknown> | null;
  designTokens: Record<string, unknown> | null;
  animationFindings: string[];
  /** "high" = measured on the rendered page · "medium" = structural detection. */
  confidence: "high" | "medium";
  source: "Extracted from website" | "Confirmed by screenshot" | "Inferred" | "Assumed";
  notes?: string;
};

export type Accuracy = {
  level: "Low" | "Medium" | "High" | "Very High" | "Best";
  score: number; // 0-100
  signals: {
    homepageScanned: boolean;
    innerPagesScanned: number;
    sectionScreenshots: number;
    renderedStylesExtracted: boolean;
    animationChecked: boolean;
    mobileChecked: boolean;
  };
};

export type MultiPageAnalysis = {
  scope: "homepage-only" | "multi-page" | "no-url";
  note: string;
  pagesAnalyzed: { url: string; pageType: string; ok: boolean; title?: string }[];
  componentInventory: Record<string, boolean | number>;
  sectionInventory: string[];
  formsDetected: { sourceUrl: string; fields: { type: string; label: string }[] }[];
  faqDetected: { present: boolean; sourceUrl?: string };
  ctaPatterns: { text: string; sourceUrl: string }[];
  navigationPatterns: string[];
  footerPatterns: string[];
  sectionEvidence: SectionEvidence[];
  accuracy: Accuracy;
  recommendedPagesMissing: string[];
  assumptions: string[];
};

const COMPONENT_LABELS: Record<string, string> = {
  navbar: "Navigation bar",
  hero: "Hero section",
  cards: "Card grid",
  forms: "Form",
  faq: "FAQ / accordion",
  pricing: "Pricing",
  testimonials: "Testimonials",
  gallery: "Gallery / portfolio",
  booking: "Booking flow",
  cta: "Call-to-action",
  footer: "Footer",
};

const RECOMMENDED_PAGES = ["homepage", "about", "services", "contact", "faq", "pricing"];

export function buildMultiPageAnalysis(
  projectId: string,
  pages: PageStructure[],
  primaryProbe: RenderedProbeResult | null,
  screenshotCount = 0,
): MultiPageAnalysis {
  const okPages = pages.filter((p) => p.ok);
  const homepage = pages.find((p) => p.pageType === "homepage") ?? pages[0];
  const homepageScanned = Boolean(homepage?.ok);
  const innerPagesScanned = okPages.filter((p) => p.pageType !== "homepage").length;

  // Union of components across all scanned pages.
  const componentInventory: Record<string, boolean | number> = {};
  for (const key of Object.keys(COMPONENT_LABELS)) {
    if (key === "cards") {
      componentInventory.cards = Math.max(0, ...okPages.map((p) => p.components.cards || 0), 0);
    } else {
      componentInventory[key] = okPages.some((p) => Boolean((p.components as Record<string, unknown>)[key]));
    }
  }

  const sectionInventory = [...new Set(okPages.flatMap((p) => p.sections))].slice(0, 40);

  const formsDetected = okPages
    .filter((p) => p.formFields.length)
    .map((p) => ({ sourceUrl: p.url, fields: p.formFields }));

  const faqPage = okPages.find((p) => p.components.faq);
  const faqDetected = { present: Boolean(faqPage), sourceUrl: faqPage?.url };

  const ctaPatterns = okPages
    .filter((p) => p.ctaText)
    .map((p) => ({ text: p.ctaText as string, sourceUrl: p.url }));

  const navigationPatterns = [...new Set(okPages.flatMap((p) => p.navItems))].slice(0, 12);
  const footerPatterns = okPages.filter((p) => p.components.footer).map((p) => p.url);

  // ---- SectionEvidence: one entry per detected component per page ----------
  const sectionEvidence: SectionEvidence[] = [];
  for (const p of okPages) {
    for (const [key, label] of Object.entries(COMPONENT_LABELS)) {
      const present = key === "cards" ? p.components.cards > 0 : Boolean((p.components as Record<string, unknown>)[key]);
      if (!present) continue;
      const isHome = p.pageType === "homepage";
      // Attach measured styles/tokens only for the primary (rendered) probe page.
      const measured = isHome && primaryProbe;
      sectionEvidence.push({
        id: `${p.pageType}-${key}`,
        projectId,
        pageType: p.pageType,
        sectionType: key,
        sectionName: key === "cards" ? `${p.components.cards}× ${label}` : label,
        sourceUrl: p.url,
        desktopScreenshotUrl: null,
        mobileScreenshotUrl: null,
        detectedStyles: measured
          ? {
              button: primaryProbe.button ?? null,
              input: primaryProbe.components.input ?? null,
              card: primaryProbe.components.card ?? null,
              nav: primaryProbe.components.nav ?? null,
            }
          : null,
        designTokens: measured
          ? { palette: primaryProbe.palette, typography: primaryProbe.typography, containerWidth: primaryProbe.containerWidth }
          : null,
        animationFindings: measured
          ? [...primaryProbe.scrollFindings, ...primaryProbe.stickyFindings].map((f) => f.pattern)
          : [],
        confidence: measured ? "high" : "medium",
        source: measured ? "Extracted from website" : "Extracted from website",
        notes: measured ? "Styles measured from the rendered page." : "Detected structurally; confirm styles with a screenshot.",
      });
    }
  }

  const recommendedPagesMissing = RECOMMENDED_PAGES.filter(
    (t) => !okPages.some((p) => p.pageType === t),
  );

  // ---- Accuracy score ------------------------------------------------------
  const signals = {
    homepageScanned,
    innerPagesScanned,
    sectionScreenshots: screenshotCount,
    renderedStylesExtracted: Boolean(primaryProbe),
    animationChecked: Boolean(primaryProbe && (primaryProbe.scrollFindings.length || primaryProbe.stickyFindings.length)),
    mobileChecked: false,
  };
  let score = 0;
  if (homepageScanned) score += 35;
  score += Math.min(innerPagesScanned, 4) * 10; // up to 40
  if (signals.renderedStylesExtracted) score += 15;
  if (signals.animationChecked) score += 5;
  score += Math.min(signals.sectionScreenshots * 3, 15); // uploaded screenshots
  score = Math.min(score, 100);

  let level: Accuracy["level"] = "Low";
  if (!homepageScanned) level = "Low";
  else if (signals.sectionScreenshots > 0 && innerPagesScanned > 0 && signals.renderedStylesExtracted) level = "Best";
  else if (signals.sectionScreenshots > 0) level = "Very High";
  else if (innerPagesScanned > 0) level = "High";
  else level = "Medium";

  const scope: MultiPageAnalysis["scope"] = !okPages.length ? "no-url" : okPages.length === 1 ? "homepage-only" : "multi-page";
  const note =
    scope === "no-url"
      ? "No page could be scanned — the design system is based on business input only (assumption-based starter)."
      : scope === "homepage-only"
        ? "Based mainly on the homepage. Add more page URLs (about, services, FAQ, pricing, contact) for a truer section inventory."
        : `Scanned ${okPages.length} pages across ${new Set(okPages.map((p) => p.pageType)).size} page types.`;

  const assumptions: string[] = [];
  if (scope !== "multi-page") assumptions.push("Section inventory reflects only the scanned page(s); other pages were not provided.");
  if (recommendedPagesMissing.length) assumptions.push(`Not detected/not provided: ${recommendedPagesMissing.join(", ")} page(s).`);

  return {
    scope,
    note,
    pagesAnalyzed: pages.map((p) => ({ url: p.url, pageType: p.pageType, ok: p.ok, title: p.title })),
    componentInventory,
    sectionInventory,
    formsDetected,
    faqDetected,
    ctaPatterns,
    navigationPatterns,
    footerPatterns,
    sectionEvidence,
    accuracy: { level, score, signals },
    recommendedPagesMissing,
    assumptions,
  };
}
