// OpenAI Vision extraction for the Section Reference Library. Given an uploaded
// section screenshot, extract a REUSABLE DESIGN PATTERN (layout, hierarchy,
// spacing, components, typography/colour direction, interaction clues) — never
// the exact text, imagery, logos, or pixel design. Falls back safely when the
// API key is missing or the call fails.

import { getOpenAI, VISION_MODEL, type ChatMessage } from "./openai-client";

export interface ReferenceVisionResult {
  source: "openai_vision" | "fallback";
  likelySectionType: string;
  pageContext: string;
  layoutPattern: string;
  visualHierarchy: string;
  componentStructure: string[];
  typographyObservations: string[];
  colorUsage: string[];
  spacingObservations: string[];
  imagePlacement: string[];
  cardStyle: string[];
  buttonStyle: string[];
  backgroundStyle: string[];
  interactionClues: string[];
  animationClues: string[];
  responsiveAssumptions: string[];
  contentSlots: string[];
  reusableDesignRules: string[];
  originalityWarnings: string[];
  confidence: "high" | "medium" | "low";
}

const arrOr = (v: unknown, fallback: string): string[] => {
  const a = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 14) : [];
  return a.length ? a : [fallback];
};

export async function analyzeSectionReferenceImage(input: {
  imageDataUrl: string;
  sectionType?: string;
  websiteType?: string;
  industry?: string;
  patternGoal?: string;
  styleTags?: string[];
  layoutTags?: string[];
  interactionTags?: string[];
  conversionTags?: string[];
  notes?: string;
}): Promise<ReferenceVisionResult> {
  const NA = (w: string) => [`${w} — no clear evidence visible.`];
  const base: ReferenceVisionResult = {
    source: "fallback",
    likelySectionType: input.sectionType || "custom",
    pageContext: "Vision analysis did not run.",
    layoutPattern: "Vision analysis did not run.",
    visualHierarchy: "Vision analysis did not run.",
    componentStructure: NA("Components"), typographyObservations: NA("Typography"),
    colorUsage: NA("Colour"), spacingObservations: NA("Spacing"), imagePlacement: NA("Imagery"),
    cardStyle: NA("Cards"), buttonStyle: NA("Buttons"), backgroundStyle: NA("Background"),
    interactionClues: NA("Interaction"), animationClues: NA("Animation"),
    responsiveAssumptions: NA("Responsive"), contentSlots: NA("Content slots"),
    reusableDesignRules: NA("Design rules"), originalityWarnings: [], confidence: "low",
  };

  const client = getOpenAI();
  if (!client) return base;
  if (!input.imageDataUrl?.startsWith("data:image/")) return base;

  const system =
    "You are a senior design-systems analyst building a REUSABLE PATTERN from a screenshot of ONE website section. " +
    "Extract the design PATTERN (layout, hierarchy, spacing logic, component structure, interaction idea, typography/colour DIRECTION) " +
    "so a developer can build an ORIGINAL, on-brand section with the same structure — NOT a copy. " +
    "Never transcribe the real marketing copy, brand names, or logos; describe roles/slots instead (e.g. 'headline slot', 'logo slot'). " +
    "Never suggest reusing the reference's photos. NEVER return an empty array for a useful field — if evidence is missing, return a single string \"No clear evidence visible.\". " +
    "Reply with a SINGLE minified JSON object only.";

  const tagLine = (label: string, arr?: string[]) => (arr && arr.length ? ` ${label}: ${arr.join(", ")}.` : "");
  const userText =
    `Analyse this section reference. Classification hints from the user — section type: ${input.sectionType || "unknown"}; website type: ${input.websiteType || "unknown"}; industry: ${input.industry || "unknown"}; pattern goal: ${input.patternGoal || "unknown"}.` +
    tagLine("Visual style tags", input.styleTags) +
    tagLine("Layout tags", input.layoutTags) +
    tagLine("Interaction tags", input.interactionTags) +
    tagLine("Conversion tags", input.conversionTags) +
    " Use these hints to classify the pattern more accurately and keep the extracted structure consistent with them." +
    (input.notes ? ` The user specifically likes: ${input.notes}.` : "") +
    " Return JSON with keys: likelySectionType (string), pageContext (string), layoutPattern (string)," +
    " visualHierarchy (string), componentStructure (array), typographyObservations (array), colorUsage (array with colour names + best-guess hex, described as DIRECTION not exact copy)," +
    " spacingObservations (array), imagePlacement (array), cardStyle (array), buttonStyle (array), backgroundStyle (array)," +
    " interactionClues (array), animationClues (array), responsiveAssumptions (array), contentSlots (array of content/asset slots)," +
    " reusableDesignRules (array of do's for building a similar original section), originalityWarnings (array — anything that must NOT be copied: text, logos, photos, exact palette)," +
    " confidence ('high'|'medium'|'low').";

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: [{ type: "text", text: userText }, { type: "image_url", image_url: { url: input.imageDataUrl } }] },
  ];

  try {
    const raw = await client.chatJSON(messages, { model: VISION_MODEL, maxTokens: 2400 });
    const p = JSON.parse(raw) as Record<string, unknown>;
    const conf = String(p.confidence ?? "medium").toLowerCase();
    return {
      source: "openai_vision",
      likelySectionType: String(p.likelySectionType ?? input.sectionType ?? "custom"),
      pageContext: String(p.pageContext ?? "").slice(0, 400) || "No clear evidence visible.",
      layoutPattern: String(p.layoutPattern ?? "").slice(0, 500) || "No clear evidence visible.",
      visualHierarchy: String(p.visualHierarchy ?? "").slice(0, 500) || "No clear evidence visible.",
      componentStructure: arrOr(p.componentStructure, "No clear evidence visible."),
      typographyObservations: arrOr(p.typographyObservations, "No clear evidence visible."),
      colorUsage: arrOr(p.colorUsage, "No clear evidence visible."),
      spacingObservations: arrOr(p.spacingObservations, "No clear evidence visible."),
      imagePlacement: arrOr(p.imagePlacement, "No imagery visible."),
      cardStyle: arrOr(p.cardStyle, "No cards visible."),
      buttonStyle: arrOr(p.buttonStyle, "No buttons visible."),
      backgroundStyle: arrOr(p.backgroundStyle, "No clear evidence visible."),
      interactionClues: arrOr(p.interactionClues, "No clear interaction clues visible."),
      animationClues: arrOr(p.animationClues, "No clear animation clues visible."),
      responsiveAssumptions: arrOr(p.responsiveAssumptions, "Standard mobile-first stacking assumed."),
      contentSlots: arrOr(p.contentSlots, "No clear evidence visible."),
      reusableDesignRules: arrOr(p.reusableDesignRules, "No clear evidence visible."),
      originalityWarnings: Array.isArray(p.originalityWarnings) ? p.originalityWarnings.map(String).slice(0, 8) : [],
      confidence: conf === "high" || conf === "low" ? (conf as "high" | "low") : "medium",
    };
  } catch (err) {
    return { ...base, originalityWarnings: [`Vision analysis failed: ${err instanceof Error ? err.message : String(err)}`] };
  }
}
