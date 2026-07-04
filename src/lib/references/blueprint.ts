// Blueprint engine. Turns an extracted pattern (+ starter content) into a
// structured, renderable SectionBlueprint, and validates a blueprint returned
// by Vision. One generic renderer draws any blueprint — so the created section
// follows the uploaded reference dynamically instead of a fixed per-type
// template. Media is always a grey placeholder; copy is original slot text.

import type { BlueprintBlock, SectionBlueprint, SectionPattern, GeneratedSectionSpec, DetectedPattern } from "./types";

/** Parse a Vision-returned `detected` object (visual pattern detection). */
export function normalizeDetected(raw: unknown): DetectedPattern | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const b = (v: unknown) => v === true;
  const s = (v: unknown, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
  const n = Number(o.cardCount);
  return {
    layoutType: s(o.layoutType, 40),
    patternFamily: s(o.patternFamily, 40),
    shortDescription: s(o.shortDescription, 160),
    isDark: b(o.isDark),
    mediaSide: o.mediaSide === "left" ? "left" : o.mediaSide === "right" ? "right" : undefined,
    cardCount: Number.isFinite(n) && n > 0 && n <= 12 ? n : undefined,
    hasMedia: b(o.hasMedia), hasAccordion: b(o.hasAccordion), hasForm: b(o.hasForm),
    hasPricing: b(o.hasPricing), hasTestimonials: b(o.hasTestimonials), hasStats: b(o.hasStats),
    hasLogos: b(o.hasLogos), hasGallery: b(o.hasGallery), hasSplitIntro: b(o.hasSplitIntro),
    mustNotFlattenInto: Array.isArray(o.mustNotFlattenInto) ? o.mustNotFlattenInto.map((x) => String(x)).slice(0, 6) : undefined,
  };
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
  const wantsAccordion = d?.hasAccordion ?? (st === "faq" || st === "accordion" || has(pattern, /accordion|faq|expand|collapse|toggle|plus.?minus|disclosure/));
  const wantsForm = d?.hasForm ?? (st === "contact" || st === "booking" || st === "quote" || has(pattern, /\bform\b|input field|text field|email field|contact form|booking form|quote form|sign.?up form|newsletter form|message field/));
  const wantsPricing = d?.hasPricing ?? (st === "pricing" || has(pattern, /pricing|per month|\/mo\b|price plan|tier|subscription plan/));
  const wantsTestimonial = d?.hasTestimonials ?? (st === "testimonials" || st === "quote" || has(pattern, /testimonial|customer quote|review card|rating star/));

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

  return { ...bp, background, accent: bp.accent ?? pal.accent, blocks };
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
        const btns = A<Record<string, unknown>>(rb.buttons).map((x) => ({ label: clean(x.label, "button", 40), variant: x.variant === "secondary" ? "secondary" as const : "primary" as const })).filter((x) => x.label).slice(0, 3);
        if (heading || paragraph) blocks.push({ type: "splitIntro", heading, paragraph, buttons: btns, headingSide: rb.headingSide === "right" ? "right" : "left" });
        break;
      }
      case "spacer":
        blocks.push({ type: "spacer", size: rb.size === "small" ? "small" : rb.size === "large" ? "large" : "medium" });
        break;
      case "form": {
        const fields = A<unknown>(rb.fields).map((x) => S(x, 40)).filter(Boolean).slice(0, 6);
        blocks.push({ type: "form", heading: clean(rb.heading, "heading", 80) || undefined, fields: fields.length ? fields : ["Name", "Email", "Message"], submitLabel: clean(rb.submitLabel, "button", 30) || "Submit" });
        break;
      }
      case "pricing": {
        const plans = A<Record<string, unknown>>(rb.plans).map((x) => ({ name: S(x.name, 30) || "Plan", price: S(x.price, 16) || undefined, features: A<unknown>(x.features).map((f) => S(f, 40)).filter(Boolean).slice(0, 6), featured: Boolean(x.featured) })).slice(0, 4);
        if (plans.length) blocks.push({ type: "pricing", plans });
        break;
      }
    }
  }
  if (!blocks.length) return null;
  return {
    background: hex(o.background),
    accent: hex(o.accent),
    textColor: hex(o.textColor),
    align: o.align === "left" ? "left" : "center",
    layout: o.layout === "split" ? "split" : "stack",
    mediaSide: o.mediaSide === "left" ? "left" : "right",
    blocks,
  };
}
