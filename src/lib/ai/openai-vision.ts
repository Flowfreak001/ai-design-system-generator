// OpenAI Vision section analysis. Extracts DETAILED design evidence from a
// screenshot — typography, color usage (with hex guesses), spacing, components,
// button/card/form styles, image treatment, responsive + animation clues — so
// downstream generators (Brand Guideline, Style Direction, DESIGN.md,
// COMPONENTS.md, builder prompts) have real evidence to work from. It does NOT
// invent exact CSS when computed styles are supplied (those are factual).
// Falls back safely (labelled) when the API key is missing or the call fails.

import { getOpenAI, VISION_MODEL, type ChatMessage } from "./openai-client";
import type { VisionInput, VisionAnalysis } from "./types";

const EMPTY: Omit<VisionAnalysis, "source" | "confidence" | "warnings"> = {
  sectionType: "",
  pageType: "",
  visualLayout: "",
  typographyObservations: [],
  colorUsage: [],
  spacingObservations: [],
  componentStructure: [],
  buttonStyles: [],
  cardStyles: [],
  formStyles: [],
  imageTreatment: [],
  responsiveNotes: [],
  animationClues: [],
  assumptions: [],
};

const SECTION_LABELS = [
  "navbar/header", "hero", "hero + case-study showcase", "services/features",
  "pricing", "testimonials", "FAQ", "CTA", "footer", "location selector",
  "image gallery", "booking form", "contact form", "dashboard preview", "unknown",
].join(", ");

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 14) : [];

/** Never return an empty array for a key field — fall back to an explanatory string. */
const arrOr = (v: unknown, fallback: string): string[] => {
  const a = arr(v);
  return a.length ? a : [fallback];
};

export async function analyzeSectionScreenshotWithOpenAI(input: VisionInput): Promise<VisionAnalysis> {
  const na = (what: string) => [`${what} unavailable — Vision analysis did not run.`];
  const base: VisionAnalysis = {
    ...EMPTY,
    source: "fallback",
    sectionType: input.sectionType || "unknown",
    pageType: input.pageType,
    visualLayout: "Vision analysis did not run for this screenshot.",
    typographyObservations: na("Typography"),
    colorUsage: na("Colour usage"),
    spacingObservations: na("Spacing"),
    componentStructure: na("Component structure"),
    buttonStyles: na("Button styles"),
    cardStyles: na("Card styles"),
    formStyles: na("Form styles"),
    imageTreatment: na("Image treatment"),
    responsiveNotes: na("Responsive notes"),
    animationClues: na("Animation clues"),
    confidence: "low",
    warnings: [],
    label: input.userNotes || undefined,
  };

  const client = getOpenAI();
  if (!client) {
    return { ...base, warnings: ["OPENAI_API_KEY missing. Vision analysis not run."] };
  }
  if (!input.screenshotDataUrl?.startsWith("data:image/")) {
    return { ...base, warnings: ["No valid screenshot image provided."] };
  }

  const system =
    "You are a senior design-systems analyst reverse-engineering a website from a screenshot. " +
    "Your job is to extract DETAILED, SPECIFIC visual design evidence a developer can use to rebuild it. " +
    "Look closely at the pixels and report what you actually see — do not be vague or generic. " +
    "Rules: " +
    "(1) If computed styles are provided, treat them as the FACTUAL source and never contradict them; " +
    "otherwise give approximate impressions (e.g. colour names + best-guess hex, size/weight impressions). " +
    "(2) NEVER return an empty array for a key field. If evidence for a field is genuinely absent, return a " +
    "single short explanatory string (e.g. \"No form visible in this screenshot.\", \"No clear animation clues visible.\"). " +
    "(3) Be concrete: name colours with approximate hex, describe radius/shadow/fill, list every visible component. " +
    "(4) Reply with a SINGLE minified JSON object only, no prose, no markdown.";

  const userText =
    `Analyse THIS screenshot of one website section. Hint — page type: ${input.pageType}; ` +
    `caller-provided section type: ${input.sectionType || "unknown"}. ` +
    (input.sourceUrl ? `Source URL: ${input.sourceUrl}. ` : "") +
    (input.userNotes ? `User notes: ${input.userNotes}. ` : "") +
    (input.computedStyles
      ? `Computed styles (FACTUAL, do not contradict): ${JSON.stringify(input.computedStyles).slice(0, 1500)}. `
      : "No computed styles supplied — give best-guess approximations. ") +
    "Return a JSON object with EXACTLY these keys:\n" +
    `- sectionType (string): the SPECIFIC type; pick the best match from [${SECTION_LABELS}]. Only use "unknown" if truly unclear.\n` +
    "- visualLayout (string): layout structure — top navigation, hero position, columns/grid, cards, media placement, CTA placement, section stacking.\n" +
    "- typographyObservations (array): headline size/weight impression, uppercase/lowercase use, font-style impression (serif/sans/display/mono), hierarchy, alignment, readability.\n" +
    "- colorUsage (array): background colours, primary/accent colours, text colours, button colours, card/surface colours, contrast notes — use colour names AND best-guess hex.\n" +
    "- spacingObservations (array): section padding impression, content width, grid gaps, whitespace density, alignment.\n" +
    "- componentStructure (array): every visible component (navbar, logo, nav links, CTA buttons, hero title, subtitle, trust badges/logos, cards, forms, image blocks, floating button, footer, etc.).\n" +
    "- buttonStyles (array): button types, fill vs outline, radius, colour, size, placement.\n" +
    "- cardStyles (array): card layout, radius, shadow/border, image treatment, grid/masonry behaviour.\n" +
    "- formStyles (array): fields/inputs/labels/buttons; if no form is visible return [\"No form visible in this screenshot.\"].\n" +
    "- imageTreatment (array): image size, crop style, overlays, mockups, collage/grid, opacity/blur, background treatment.\n" +
    "- responsiveNotes (array): likely mobile behaviour (navbar collapses, hero stacks vertically, cards become single column, form stacks).\n" +
    "- animationClues (array): likely motion (marquee/ticker, hover cards, floating CTA, scroll reveal, carousel, interactive selector); if none return [\"No clear animation clues visible.\"].\n" +
    "- confidence (string): 'high' | 'medium' | 'low' based on screenshot clarity.\n" +
    "- assumptions (array): only where inference is uncertain.\n" +
    "- warnings (array): only if the screenshot is cropped, blurry, or an overlay blocks content.\n" +
    "Every array field except assumptions/warnings MUST be non-empty (use an explanatory string if no evidence).";

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: input.screenshotDataUrl } },
      ],
    },
  ];

  try {
    const raw = await client.chatJSON(messages, { model: VISION_MODEL, maxTokens: 2400 });
    const p = JSON.parse(raw) as Record<string, unknown>;
    const conf = String(p.confidence ?? "medium").toLowerCase();
    const detected = String(p.sectionType ?? "").trim();
    return {
      source: "openai_vision",
      // Prefer the model's specific classification; fall back to the caller's.
      sectionType: detected || input.sectionType || "unknown",
      pageType: input.pageType,
      visualLayout: String(p.visualLayout ?? "").slice(0, 900),
      typographyObservations: arrOr(p.typographyObservations, "Typography not clearly legible in this screenshot."),
      colorUsage: arrOr(p.colorUsage, "Colours not clearly discernible in this screenshot."),
      spacingObservations: arrOr(p.spacingObservations, "Spacing not clearly measurable from this screenshot."),
      componentStructure: arrOr(p.componentStructure, "No distinct components identified in this screenshot."),
      buttonStyles: arrOr(p.buttonStyles, "No buttons visible in this screenshot."),
      cardStyles: arrOr(p.cardStyles, "No cards visible in this screenshot."),
      formStyles: arrOr(p.formStyles, "No form visible in this screenshot."),
      imageTreatment: arrOr(p.imageTreatment, "No imagery visible in this screenshot."),
      responsiveNotes: arrOr(p.responsiveNotes, "Responsive behaviour not inferable from this screenshot."),
      animationClues: arrOr(p.animationClues, "No clear animation clues visible."),
      confidence: conf === "high" || conf === "low" ? (conf as "high" | "low") : "medium",
      assumptions: arr(p.assumptions),
      warnings: arr(p.warnings),
      label: input.userNotes || undefined,
    };
  } catch (err) {
    return {
      ...base,
      warnings: [`Vision analysis failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}
