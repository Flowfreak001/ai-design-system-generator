// Blueprint engine. Turns an extracted pattern (+ starter content) into a
// structured, renderable SectionBlueprint, and validates a blueprint returned
// by Vision. One generic renderer draws any blueprint — so the created section
// follows the uploaded reference dynamically instead of a fixed per-type
// template. Media is always a grey placeholder; copy is original slot text.

import type { BlueprintBlock, SectionBlueprint, SectionPattern, GeneratedSectionSpec, DetectedPattern } from "./types";

/** Safe detection when Vision does not run/fails — prevents silent fallback
 *  into old generic layouts (they're explicitly listed as forbidden). */
export const FALLBACK_DETECTED: DetectedPattern = {
  layoutType: "custom-generated-layout",
  patternFamily: "unknown",
  shortDescription: "Vision analysis did not run.",
  isDark: false,
  cardCount: 0,
  hasMedia: false, hasAccordion: false, hasForm: false, hasPricing: false,
  hasTestimonials: false, hasStats: false, hasLogos: false, hasGallery: false, hasSplitIntro: false,
  mustNotFlattenInto: ["service-grid", "centered-hero", "simple-card-grid"],
};

/** Parse a Vision-returned `detected` object (visual pattern detection). */
export function normalizeDetected(raw: unknown): DetectedPattern | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const b = (v: unknown) => v === true;
  const s = (v: unknown, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
  const n = Number(o.cardCount);
  const d: DetectedPattern = {
    patternFamily: s(o.patternFamily, 40) ?? "unknown",
    shortDescription: s(o.shortDescription, 160),
    isDark: b(o.isDark),
    mediaSide: o.mediaSide === "left" ? "left" : o.mediaSide === "right" ? "right" : undefined,
    cardCount: Number.isFinite(n) && n > 0 && n <= 12 ? n : undefined,
    hasMedia: b(o.hasMedia), hasImageCards: b(o.hasImageCards), hasIconCards: b(o.hasIconCards),
    hasAccordion: b(o.hasAccordion), hasForm: b(o.hasForm),
    hasPricing: b(o.hasPricing), hasTestimonials: b(o.hasTestimonials), hasStats: b(o.hasStats),
    hasLogos: b(o.hasLogos), hasGallery: b(o.hasGallery), hasSplitIntro: b(o.hasSplitIntro),
    hasCarousel: b(o.hasCarousel), hasOffscreenElements: b(o.hasOffscreenElements),
    mustNotFlattenInto: Array.isArray(o.mustNotFlattenInto) ? o.mustNotFlattenInto.map((x) => String(x)).slice(0, 6) : undefined,
  };
  // Generic/content-category names are not layout types — derive a specific
  // one from the component evidence instead of accepting them.
  const rawLayout = s(o.layoutType, 40)?.toLowerCase().replace(/\s+/g, "-");
  const generic = !rawLayout || /^(services?|features?|grid|cards?|hero|section|content|grid-based|card-based|split-layout|multi-column|layout|generic-grid|service-grid|card-grid)$/.test(rawLayout);
  d.layoutType = generic ? deriveLayoutType(d) : rawLayout;
  return d;
}

/** Map component evidence to a specific layout type (used when Vision returns
 *  a generic name, or none at all). General across all reference shapes. */
export function deriveLayoutType(d: DetectedPattern): string {
  // Carousels first — arrow controls / off-screen cards are a strong signal
  // that this is NOT a hero or a plain grid.
  if (d.hasCarousel) {
    if (d.hasLogos && d.hasStats) return "logo-stats-carousel";
    if (d.hasStats || d.hasLogos) return "case-study-results-carousel";
    if (d.hasTestimonials) return "testimonial-carousel";
    return "results-card-carousel";
  }
  if (d.hasAccordion) return d.hasMedia ? "split-media-accordion" : "faq-accordion";
  if (d.hasForm) return "form-with-content";
  if (d.hasPricing) return "pricing-card-comparison";
  if (d.hasTestimonials) return "testimonial-card-row";
  if (d.hasStats) return "stats-row";
  if (d.hasLogos) return "logo-cloud";
  if (d.hasGallery) return "gallery-showcase";
  if (d.hasSplitIntro && d.hasImageCards) return d.isDark ? "dark-feature-showcase" : "split-intro-card-row";
  if (d.hasImageCards) return "media-card-grid";
  if (d.hasIconCards) return "icon-card-grid";
  return "custom-generated-layout";
}

type Content = NonNullable<GeneratedSectionSpec["previewContent"]>;

// ── colour + count helpers (derive design direction from the analysis) ──
export function allHex(arr: string[]): string[] {
  return [...arr.join(" ").matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})/gi)].map((m) => m[0]);
}
function lum(hex: string): number {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
export function refPalette(colorDirection: string[]): { background?: string; accent?: string } {
  const hexes = allHex(colorDirection);
  return { background: hexes.find((x) => lum(x) > 0.85), accent: hexes.find((x) => lum(x) < 0.7) };
}
export function cardCount(pattern: SectionPattern, fallback = 3): number {
  const j = pattern.componentStructure.concat(pattern.contentSlots).join(" ");
  const m = j.match(/\((\d+)\s*total\)/i) ?? j.match(/(\d+)\s*(?:cards?|columns?|tiles?|items?)/i);
  const n = m ? parseInt(m[1], 10) : NaN;
  return Number.isFinite(n) && n >= 2 && n <= 8 ? n : fallback;
}

const has = (pattern: SectionPattern, re: RegExp) =>
  re.test(`${pattern.layoutPattern} ${pattern.layoutTags.join(" ")} ${pattern.componentStructure.join(" ")} ${pattern.contentSlots.join(" ")}`.toLowerCase());

/** Deterministic blueprint from the extracted pattern + starter content. */
export function buildBlueprintFromPattern(pattern: SectionPattern, content: Content): SectionBlueprint {
  const type = pattern.sectionType;
  const pal = refPalette(pattern.colorDirection);
  const items = content.items ?? [];
  const hasImage = has(pattern, /image|photo|visual|media|screenshot|mockup/);
  const isSplit = has(pattern, /split|two.?col|side.?by.?side|image and text|text and image/) || (hasImage && /hero|services|features|cta/.test(type));
  const isGrid = has(pattern, /grid|cards|tiles|columns|masonry/) || type === "features" || type === "services" || type === "showcase";

  const buttons: BlueprintBlock[] = content.primaryButtonLabel || content.secondaryButtonLabel
    ? [{ type: "buttons", items: [
        ...(content.primaryButtonLabel ? [{ label: content.primaryButtonLabel, variant: "primary" as const }] : []),
        ...(content.secondaryButtonLabel ? [{ label: content.secondaryButtonLabel, variant: "secondary" as const }] : []),
      ] }]
    : [];
  const head: BlueprintBlock[] = [
    ...(content.eyebrow ? [{ type: "eyebrow" as const, text: content.eyebrow }] : []),
    ...(content.title ? [{ type: "heading" as const, text: content.title }] : []),
    ...(content.description ? [{ type: "paragraph" as const, text: content.description }] : []),
  ];

  const base: SectionBlueprint = { background: pal.background, accent: pal.accent, align: "center", layout: "stack", blocks: [] };

  // ── Pattern-first detection: pick the real UI pattern before defaulting to a
  // grid. Order matters (most specific first). Prevents accordion/form/pricing
  // references from flattening into a generic services grid. ──
  const st = String(type);
  const d = pattern.detected;
  const wantsCarousel = d?.hasCarousel ?? has(pattern, /carousel|slider|arrow|next.?prev|off.?screen|swipe/);
  const wantsAccordion = d?.hasAccordion ?? (st === "faq" || st === "accordion" || has(pattern, /accordion|faq|expand|collapse|toggle|plus.?minus|disclosure/));
  const wantsForm = d?.hasForm ?? (st === "contact" || st === "booking" || st === "quote" || has(pattern, /\bform\b|input field|text field|email field|contact form|booking form|quote form|sign.?up form|newsletter form|message field/));
  const wantsPricing = d?.hasPricing ?? (st === "pricing" || has(pattern, /pricing|per month|\/mo\b|price plan|tier|subscription plan/));
  const wantsTestimonial = d?.hasTestimonials ?? (st === "testimonials" || st === "quote" || has(pattern, /testimonial|customer quote|review card|rating star/));

  if (wantsCarousel) {
    const n = items.length || cardCount(pattern) || 3;
    const withLogos = d?.hasLogos ?? has(pattern, /logo|client|brand/);
    const withStats = d?.hasStats ?? has(pattern, /stat|metric|percent|number|result|kpi/);
    const cards = Array.from({ length: n }, (_, i) => ({
      title: items[i]?.title ?? `Client ${i + 1}`,
      body: items[i]?.text ?? "A short outcome or result statement.",
      logo: withLogos,
      stats: withStats ? [{ value: "00%", label: "Key metric" }, { value: "0×", label: "Improvement" }] : undefined,
    }));
    return { ...base, align: "left", blocks: [...head, { type: "carousel", cards }] };
  }

  if (wantsAccordion) {
    const acc = { type: "accordion" as const, items: (items.length ? items : Array.from({ length: 4 }, (_, i) => ({ title: `Question ${i + 1}`, text: "A clear, concise answer." }))).map((it) => ({ question: it.title ?? "", answer: it.text })) };
    // Media beside the accordion when the reference pairs a visual with it.
    if (hasImage) {
      return { ...base, align: "left", layout: "split", mediaSide: pattern.imageTreatment.some((s) => /left/i.test(s)) ? "left" : "right", blocks: [...head, acc] };
    }
    return { ...base, align: "center", blocks: [...head, acc] };
  }

  if (wantsForm) {
    const form = { type: "form" as const, fields: ["Name", "Email", "Message"], submitLabel: content.primaryButtonLabel ?? "Send" };
    return { ...base, align: "left", layout: hasImage ? "split" : "stack", mediaSide: "right", blocks: [...head, form] };
  }

  if (wantsPricing) {
    const plans = (items.length ? items.slice(0, 3) : [{ title: "Starter" }, { title: "Growth" }, { title: "Scale" }])
      .map((it, i) => ({ name: it.title ?? `Plan ${i + 1}`, price: "$—", features: ["Included feature", "Included feature", "Included feature"], featured: i === 1 }));
    return { ...base, align: "center", blocks: [...head, { type: "pricing", plans }] };
  }

  if (wantsTestimonial) {
    const n = items.length || cardCount(pattern);
    const cards = (items.length ? items : Array.from({ length: n }, (_, i) => ({ title: `Client ${i + 1}`, text: "A short, genuine quote about the results." }))).map((it) => ({ title: it.title ?? "", body: it.text }));
    return { ...base, align: "center", blocks: [...head, { type: "cardGrid", columns: Math.min(3, n), cards }] };
  }

  if (type === "footer") {
    const cols = [...new Set(
      (pattern.componentStructure.length ? pattern.componentStructure : pattern.contentSlots)
        .map((s) => s.replace(/\bslots?\b/gi, "").replace(/\s+/g, " ").trim())
        .filter((s) => s && !/newsletter|subscribe|cta|call.?to.?action|logo|search|social/i.test(s)),
    )].slice(0, 4).map((heading) => ({ heading: heading.charAt(0).toUpperCase() + heading.slice(1), links: ["Overview", "Details", "More"] }));
    return { ...base, align: "left", blocks: [
      ...(content.title ? [{ type: "heading" as const, text: content.title }] : []),
      ...(content.description ? [{ type: "paragraph" as const, text: content.description }] : []),
      { type: "linkColumns", columns: cols.length ? cols : [{ heading: "Company", links: ["About", "Contact"] }] },
    ] };
  }

  if (type === "faq") {
    return { ...base, align: "center", blocks: [
      ...head,
      { type: "accordion", items: (items.length ? items : [{ title: "A question?", text: "A clear answer." }]).map((it) => ({ question: it.title ?? "", answer: it.text })) },
    ] };
  }

  if (isSplit) {
    return { ...base, align: "left", layout: "split", mediaSide: pattern.imageTreatment.some((s) => /left/i.test(s)) || /left/i.test(pattern.layoutPattern) ? "left" : "right", blocks: [
      ...head,
      ...(items.length ? [{ type: "chips" as const, items: items.map((it) => it.title ?? "").filter(Boolean).slice(0, 6) }] : []),
      ...buttons,
    ] };
  }

  if (isGrid || type === "testimonials" || type === "pricing" || type === "custom") {
    const n = items.length || cardCount(pattern);
    // Media cards (image on top, text below) when the reference shows imagery.
    const mediaCards = hasImage || pattern.imageTreatment.length > 0;
    const cards = (items.length ? items : Array.from({ length: n }, (_, i) => ({ title: `Card ${i + 1}`, text: "A short supporting line describing this card." })))
      .map((it) => ({ title: it.title ?? "", body: it.text, icon: !mediaCards, image: mediaCards }));
    // A split intro above the cards when the reference reads that way
    // (heading one side, paragraph/CTA the other) — preserves composition.
    const splitIntro = has(pattern, /split|two.?col|side.?by.?side|intro|hero/) && Boolean(content.title || content.description);
    if (splitIntro) {
      return { ...base, align: "left", blocks: [
        { type: "splitIntro", heading: content.title, paragraph: content.description, buttons: buttons[0]?.type === "buttons" ? buttons[0].items : undefined },
        { type: "spacer", size: "large" },
        { type: "cardGrid", columns: n, cards },
      ] };
    }
    return { ...base, align: "center", blocks: [...head, { type: "cardGrid", columns: n, cards }, ...buttons] };
  }

  // centered / cta / default
  return { ...base, align: "center", blocks: [...head, ...buttons] };
}

/** Correct a blueprint against what the analysis detected, so a flattened
 *  layout (e.g. cards where the reference clearly has an accordion) is fixed.
 *  General — applies to any reference, whether the blueprint came from Vision
 *  or the deterministic builder. */
export function enforcePattern(bp: SectionBlueprint, pattern: SectionPattern): SectionBlueprint {
  const blocks = [...bp.blocks];
  const hasType = (tp: string) => blocks.some((b) => b.type === tp);
  const d = pattern.detected;
  const sig = `${pattern.layoutPattern} ${pattern.layoutTags.join(" ")} ${pattern.interactionPattern.join(" ")} ${pattern.componentStructure.join(" ")} ${pattern.contentSlots.join(" ")}`.toLowerCase();
  const st = String(pattern.sectionType);
  // Prefer explicit Vision detectors; fall back to text signals.
  const wantsAccordion = d?.hasAccordion ?? (st === "faq" || st === "accordion" || /accordion|faq|expand|collapse|toggle|plus.?minus|disclosure/.test(sig));
  const wantsForm = d?.hasForm ?? (st === "contact" || st === "booking" || st === "quote" || /\bform\b|input field|email field|contact form|booking form|quote form/.test(sig));
  const wantsPricing = d?.hasPricing ?? false;

  // Card count from detection first: never render more cards than the
  // reference shows (also bounds a later grid→accordion conversion).
  if (d?.cardCount && d.cardCount > 0) {
    for (let i = 0; i < blocks.length; i++) {
      const blk = blocks[i];
      if (blk.type === "cardGrid" && blk.cards.length > d.cardCount) {
        blocks[i] = { ...blk, columns: Math.min(blk.columns ?? d.cardCount, d.cardCount), cards: blk.cards.slice(0, d.cardCount) };
      }
    }
  }
  // Image-card detection wins over icon cards (reference shows image tiles).
  if (d?.hasImageCards) {
    for (let i = 0; i < blocks.length; i++) {
      const blk = blocks[i];
      if (blk.type === "cardGrid" && blk.cards.some((c) => !c.image)) {
        blocks[i] = { ...blk, cards: blk.cards.map((c) => ({ ...c, image: true, icon: false })) };
      }
    }
  }

  // Carousel reference must render as a carousel (not a flat grid).
  if (d?.hasCarousel && !hasType("carousel")) {
    const gi = blocks.findIndex((b) => b.type === "cardGrid");
    const cardsFrom = gi >= 0 ? (blocks[gi] as Extract<BlueprintBlock, { type: "cardGrid" }>).cards.map((c) => ({ title: c.title, body: c.body, logo: d.hasLogos, stats: d.hasStats ? [{ value: "00%", label: "Key metric" }] : undefined })) : Array.from({ length: d.cardCount ?? 3 }, (_, i) => ({ title: `Client ${i + 1}`, body: "A short outcome or result.", logo: d.hasLogos, stats: d.hasStats ? [{ value: "00%", label: "Key metric" }] : undefined }));
    const carousel: BlueprintBlock = { type: "carousel", cards: cardsFrom };
    if (gi >= 0) blocks[gi] = carousel; else blocks.push(carousel);
  }

  // Accordion reference must not render as a card grid.
  if (wantsAccordion && !hasType("accordion")) {
    const gi = blocks.findIndex((b) => b.type === "cardGrid");
    if (gi >= 0) {
      const grid = blocks[gi] as Extract<BlueprintBlock, { type: "cardGrid" }>;
      blocks[gi] = { type: "accordion", items: grid.cards.map((c) => ({ question: c.title, answer: c.body })) };
    } else {
      blocks.push({ type: "accordion", items: Array.from({ length: 4 }, (_, i) => ({ question: `Question ${i + 1}`, answer: "A clear, concise answer." })) });
    }
  }
  // Form reference must include a form.
  if (wantsForm && !hasType("form")) blocks.push({ type: "form", fields: ["Name", "Email", "Message"], submitLabel: "Send" });
  // Pricing reference must include pricing plans.
  if (wantsPricing && !hasType("pricing")) blocks.push({ type: "pricing", plans: [
    { name: "Starter", price: "$—", features: ["Included feature", "Included feature"] },
    { name: "Growth", price: "$—", features: ["Included feature", "Included feature"], featured: true },
    { name: "Scale", price: "$—", features: ["Included feature", "Included feature"] },
  ] });

  // Preserve a clearly-dark background if Vision returned a pale/empty one.
  const pal = refPalette(pattern.colorDirection);
  const darkHex = allHex(pattern.colorDirection).find((x) => {
    let h = x.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return (parseInt(h.slice(0, 2), 16) * 0.299 + parseInt(h.slice(2, 4), 16) * 0.587 + parseInt(h.slice(4, 6), 16) * 0.114) / 255 < 0.25;
  });
  const isDarkRef = d?.isDark ?? (/\bdark\b|\bblack\b/.test(sig) || Boolean(darkHex));
  const background = isDarkRef ? (darkHex ?? "#0B0B0F") : (bp.background ?? pal.background);

  // Detected media side wins over the blueprint's guess.
  const mediaSide = d?.mediaSide ?? bp.mediaSide;
  // A split-media detection keeps the split layout — but only when the
  // blueprint actually has a side media block (media inside cards doesn't
  // count; the renderer never invents a visual).
  const hasMediaBlock = blocks.some((b) => b.type === "media");
  const layout = hasMediaBlock && d?.hasMedia && (d.hasAccordion || d.hasSplitIntro || /split/.test(d.layoutType ?? "")) ? "split" as const : (hasMediaBlock ? bp.layout : "stack" as const);

  return { ...bp, background, accent: bp.accent ?? pal.accent, mediaSide, layout, blocks };
}

/** Post-enforcement check: does the final blueprint honour what Vision saw?
 *  Returns human-readable warnings; empty = passed. Sections with warnings
 *  should not be marked Ready. */
export function validateBlueprintAgainstDetected(bp: SectionBlueprint, d?: DetectedPattern): string[] {
  if (!d) return [];
  const warnings: string[] = [];
  const hasType = (tp: string) => bp.blocks.some((b) => b.type === tp);
  const carousel = bp.blocks.find((b) => b.type === "carousel") as Extract<BlueprintBlock, { type: "carousel" }> | undefined;
  const carouselHasStats = Boolean(carousel?.cards.some((c) => c.stats?.length));
  const carouselHasLogos = Boolean(carousel?.cards.some((c) => c.logo));
  if (d.hasCarousel && !hasType("carousel")) warnings.push("Reference shows a carousel but the section has no carousel.");
  if (d.hasAccordion && !hasType("accordion")) warnings.push("Reference shows an accordion but the section has none.");
  if (d.hasForm && !hasType("form")) warnings.push("Reference shows a form but the section has none.");
  if (d.hasPricing && !hasType("pricing")) warnings.push("Reference shows pricing tiers but the section has none.");
  if (d.hasStats && !hasType("stats") && !carouselHasStats) warnings.push("Reference shows stats but the section has none.");
  if (d.hasLogos && !hasType("logos") && !carouselHasLogos) warnings.push("Reference shows logos but the section has none.");
  if (d.cardCount && d.cardCount > 0) {
    const grid = bp.blocks.find((b) => b.type === "cardGrid") as Extract<BlueprintBlock, { type: "cardGrid" }> | undefined;
    if (grid && grid.cards.length > d.cardCount) warnings.push(`Reference shows ${d.cardCount} cards but the section has ${grid.cards.length}.`);
  }
  if (d.hasImageCards) {
    const grid = bp.blocks.find((b) => b.type === "cardGrid") as Extract<BlueprintBlock, { type: "cardGrid" }> | undefined;
    if (grid && grid.cards.some((c) => !c.image)) warnings.push("Reference shows image cards but the section uses icon-only cards.");
  }
  if (d.isDark && bp.background) {
    let h = bp.background.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const lum = (parseInt(h.slice(0, 2), 16) * 0.299 + parseInt(h.slice(2, 4), 16) * 0.587 + parseInt(h.slice(4, 6), 16) * 0.114) / 255;
    if (lum > 0.45) warnings.push("Reference has a dark background but the section is light.");
  }
  if (d.mediaSide && bp.layout === "split" && bp.mediaSide !== d.mediaSide) warnings.push(`Reference places media on the ${d.mediaSide}, section places it on the ${bp.mediaSide}.`);
  return warnings;
}

// ── validate a Vision-returned blueprint (defensive; drop invalid blocks) ──
// Replace literal template-label junk ("Your Main Heading", "Card Title 1"…)
// with sensible original copy so the preview never looks unfinished.
const PLACEHOLDER = /^(your\b|card title\s*\d*|card description|lorem|placeholder|section title|main heading|sub-?heading|eyebrow text|descriptive paragraph|media placeholder|your media)/i;
const FALLBACK: Record<string, string> = {
  eyebrow: "Overview", heading: "Everything you need, beautifully designed",
  subheading: "Built for teams that move fast", paragraph: "A short, benefit-led sentence that sets up what follows.",
  cardTitle: "Feature", cardBody: "A concise line describing this feature.", button: "Get started",
};
const clean = (v: unknown, kind: string, max = 200) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s && !PLACEHOLDER.test(s) ? s : (FALLBACK[kind] ?? "");
};
/** Optional heading: empty or placeholder → undefined (no injected fallback). */
const optHeading = (v: unknown) => {
  const s = typeof v === "string" ? v.trim().slice(0, 100) : "";
  return s && !PLACEHOLDER.test(s) ? s : undefined;
};
const S = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const A = <T>(v: unknown): T[] => (Array.isArray(v) ? v : []);
const hex = (v: unknown) => (typeof v === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim()) ? v.trim() : undefined);

export function normalizeBlueprint(raw: unknown): SectionBlueprint | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const blocks: BlueprintBlock[] = [];
  for (const rb of A<Record<string, unknown>>(o.blocks)) {
    const t = String(rb.type ?? "");
    switch (t) {
      case "eyebrow": case "heading": case "subheading": case "paragraph": {
        const text = clean(rb.text, t, t === "paragraph" ? 400 : 120);
        if (text) blocks.push({ type: t, text } as BlueprintBlock);
        break;
      }
      case "buttons": {
        const items = A<Record<string, unknown>>(rb.items).map((x) => ({ label: clean(x.label, "button", 40), variant: x.variant === "secondary" ? "secondary" as const : "primary" as const })).filter((x) => x.label).slice(0, 3);
        if (items.length) blocks.push({ type: "buttons", items });
        break;
      }
      case "chips": {
        const items = A<unknown>(rb.items).map((x) => S(x, 40)).filter(Boolean).slice(0, 8);
        if (items.length) blocks.push({ type: "chips", items });
        break;
      }
      case "cardGrid": {
        const cards = A<Record<string, unknown>>(rb.cards).map((x) => ({ title: clean(x.title, "cardTitle", 60), body: clean(x.body, "cardBody", 200), icon: Boolean(x.icon), image: Boolean(x.image) })).filter((x) => x.title || x.body).slice(0, 8);
        const columns = Number(rb.columns);
        if (cards.length) blocks.push({ type: "cardGrid", columns: Number.isFinite(columns) ? Math.min(4, Math.max(2, columns)) : undefined, cards });
        break;
      }
      case "media": {
        const label = S(rb.label, 40);
        blocks.push({ type: "media", ratio: S(rb.ratio, 8) || undefined, label: label && !PLACEHOLDER.test(label) ? label : undefined });
        break;
      }
      case "stats": {
        const items = A<Record<string, unknown>>(rb.items).map((x) => ({ value: S(x.value, 20), label: S(x.label, 40) })).filter((x) => x.value || x.label).slice(0, 6);
        if (items.length) blocks.push({ type: "stats", items });
        break;
      }
      case "logos":
        blocks.push({ type: "logos", count: Math.min(8, Math.max(3, Number(rb.count) || 5)) });
        break;
      case "accordion": {
        const items = A<Record<string, unknown>>(rb.items).map((x) => ({ question: S(x.question, 120), answer: S(x.answer, 300) })).filter((x) => x.question).slice(0, 8);
        if (items.length) blocks.push({ type: "accordion", items });
        break;
      }
      case "linkColumns": {
        const columns = A<Record<string, unknown>>(rb.columns).map((x) => ({ heading: S(x.heading, 40), links: A<unknown>(x.links).map((l) => S(l, 40)).filter(Boolean).slice(0, 6) })).filter((x) => x.heading).slice(0, 5);
        if (columns.length) blocks.push({ type: "linkColumns", columns });
        break;
      }
      case "splitIntro": {
        const heading = clean(rb.heading, "heading", 120);
        const paragraph = clean(rb.paragraph, "paragraph", 400);
        const eyebrow = S(rb.eyebrow, 60);
        const subheading = S(rb.subheading, 120);
        const btns = A<Record<string, unknown>>(rb.buttons).map((x) => ({ label: clean(x.label, "button", 40), variant: x.variant === "secondary" ? "secondary" as const : "primary" as const })).filter((x) => x.label).slice(0, 3);
        if (heading || paragraph) blocks.push({ type: "splitIntro", eyebrow: eyebrow || undefined, heading, subheading: subheading || undefined, paragraph, buttons: btns, headingSide: rb.headingSide === "right" ? "right" : "left" });
        break;
      }
      case "spacer":
        blocks.push({ type: "spacer", size: rb.size === "small" ? "small" : rb.size === "large" ? "large" : "medium" });
        break;
      case "form": {
        const fields = A<unknown>(rb.fields).map((x) => S(x, 40)).filter(Boolean).slice(0, 6);
        blocks.push({ type: "form", heading: optHeading(rb.heading), fields: fields.length ? fields : ["Name", "Email", "Message"], submitLabel: clean(rb.submitLabel, "button", 30) || "Submit" });
        break;
      }
      case "pricing": {
        const plans = A<Record<string, unknown>>(rb.plans).map((x) => ({ name: S(x.name, 30) || "Plan", price: S(x.price, 16) || undefined, features: A<unknown>(x.features).map((f) => S(f, 40)).filter(Boolean).slice(0, 6), featured: Boolean(x.featured) })).slice(0, 4);
        if (plans.length) blocks.push({ type: "pricing", plans });
        break;
      }
      case "carousel": {
        const cards = A<Record<string, unknown>>(rb.cards).map((x) => ({
          title: clean(x.title, "cardTitle", 60), body: clean(x.body, "cardBody", 200), logo: Boolean(x.logo),
          stats: A<Record<string, unknown>>(x.stats).map((s2) => ({ value: S(s2.value, 16), label: S(s2.label, 40) })).filter((s2) => s2.value || s2.label).slice(0, 4),
        })).slice(0, 8);
        if (cards.length) blocks.push({ type: "carousel", heading: optHeading(rb.heading), cards });
        break;
      }
    }
  }
  if (!blocks.length) return null;

  // A "split" layout with NO media block is really a split INTRO (heading on
  // one side, paragraph/CTA on the other). Convert the leading text blocks
  // into a splitIntro and render as a stack — never invent a phantom visual.
  let layout: "split" | "stack" = o.layout === "split" ? "split" : "stack";
  if (layout === "split" && !blocks.some((b) => b.type === "media")) {
    const heading = blocks.find((b): b is Extract<BlueprintBlock, { type: "heading" }> => b.type === "heading");
    const paragraph = blocks.find((b): b is Extract<BlueprintBlock, { type: "paragraph" }> => b.type === "paragraph");
    const btns = blocks.find((b): b is Extract<BlueprintBlock, { type: "buttons" }> => b.type === "buttons");
    if (heading && (paragraph || btns)) {
      const eyebrow = blocks.find((b): b is Extract<BlueprintBlock, { type: "eyebrow" }> => b.type === "eyebrow");
      const subheading = blocks.find((b): b is Extract<BlueprintBlock, { type: "subheading" }> => b.type === "subheading");
      const consumed = new Set<BlueprintBlock>([heading, ...(paragraph ? [paragraph] : []), ...(btns ? [btns] : []), ...(eyebrow ? [eyebrow] : []), ...(subheading ? [subheading] : [])]);
      const rest = blocks.filter((b) => !consumed.has(b));
      // Everything folds INTO the split intro (eyebrow above the heading,
      // subheading above the paragraph) — no orphan centered rows. The big
      // heading defaults to the LEFT (mediaSide is meaningless without media).
      const intro: BlueprintBlock = {
        type: "splitIntro",
        eyebrow: eyebrow?.text,
        heading: heading.text,
        subheading: subheading?.text,
        paragraph: paragraph?.text,
        buttons: btns?.items,
        headingSide: "left",
      };
      blocks.length = 0;
      blocks.push(intro, { type: "spacer", size: "large" }, ...rest);
    }
    layout = "stack";
  }

  return {
    background: hex(o.background),
    accent: hex(o.accent),
    textColor: hex(o.textColor),
    align: o.align === "left" ? "left" : "center",
    layout,
    mediaSide: o.mediaSide === "left" ? "left" : "right",
    blocks,
  };
}
