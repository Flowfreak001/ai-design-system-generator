// OpenAI Vision extraction for the Section Reference Library. Given an uploaded
// section screenshot, extract a REUSABLE DESIGN PATTERN (layout, hierarchy,
// spacing, components, typography/colour direction, interaction clues) — never
// the exact text, imagery, logos, or pixel design. Falls back safely when the
// API key is missing or the call fails.

import { getOpenAI, REFERENCE_VISION_MODEL, REFERENCE_VISION_MAX_TOKENS, REFERENCE_MODEL_FALLBACK, type ChatMessage } from "./openai-client";
import { VISUAL_STYLE_TAGS, LAYOUT_TAGS, INTERACTION_TAGS, type SectionBlueprint, type DetectedPattern } from "@/lib/references/types";
import { normalizeBlueprint, normalizeDetected, FALLBACK_DETECTED } from "@/lib/references/blueprint";

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
  /** Auto-tags chosen by the model from our known vocabularies. */
  suggestedStyleTags: string[];
  suggestedLayoutTags: string[];
  suggestedInteractionTags: string[];
  confidence: "high" | "medium" | "low";
  /** Structured, renderable blueprint (dynamic layout) — grey placeholders only. */
  blueprint?: SectionBlueprint;
  /** Visual-pattern detection (layout type + component detectors). */
  detected?: DetectedPattern;
}

/** Keep only values that exist in the given vocabulary (case-insensitive). */
const pickFromVocab = (v: unknown, vocab: readonly string[]): string[] => {
  const set = new Map(vocab.map((t) => [t.toLowerCase(), t]));
  const arr = Array.isArray(v) ? v : [];
  const out = new Set<string>();
  for (const x of arr) {
    const hit = set.get(String(x).trim().toLowerCase());
    if (hit) out.add(hit);
  }
  return [...out];
};

const arrOr = (v: unknown, fallback: string): string[] => {
  const a = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 14) : [];
  return a.length ? a : [fallback];
};

export async function analyzeSectionReferenceImage(input: {
  imageDataUrl: string;
  sectionType?: string;
  websiteType?: string;
  industry?: string;
  primaryPurpose?: string;
  secondaryPurposes?: string[];
  purposeCategory?: string;
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
    reusableDesignRules: NA("Design rules"), originalityWarnings: [],
    suggestedStyleTags: [], suggestedLayoutTags: [], suggestedInteractionTags: [],
    confidence: "low",
    // Safe detection so a failed/skipped Vision run never silently falls back
    // into old generic layouts.
    detected: FALLBACK_DETECTED,
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
    `Analyse this section reference. Classification hints from the user — section type: ${input.sectionType || "unknown"}; website type: ${input.websiteType || "unknown"}; industry: ${input.industry || "unknown"}.` +
    ` Primary purpose (what this section is mainly trying to achieve): ${input.primaryPurpose || "unknown"}${input.purposeCategory ? ` (category: ${input.purposeCategory})` : ""}.` +
    tagLine("Secondary purposes", input.secondaryPurposes) +
    " Focus the extracted pattern on serving the PRIMARY purpose first (e.g. for 'Drive primary CTA' — emphasise CTA placement, headline hierarchy and conversion layout; for 'Build trust' — emphasise where proof/logos/stats sit), and treat secondary purposes as supporting goals." +
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
    ` suggestedStyleTags (array — choose ALL that visibly apply, ONLY from: ${VISUAL_STYLE_TAGS.join(", ")}),` +
    ` suggestedLayoutTags (array — choose ALL that apply, ONLY from: ${LAYOUT_TAGS.join(", ")}),` +
    ` suggestedInteractionTags (array — choose ALL that apply, ONLY from: ${INTERACTION_TAGS.join(", ")}),` +
    " confidence ('high'|'medium'|'low'). For the three suggested*Tags, pick multiple as needed based on what the image actually shows — do not invent tags outside the given lists." +
    // Structured, renderable blueprint — the dynamic layout to recreate the section.
    " ALSO return a `blueprint` object so we can RECREATE this section's layout as an ORIGINAL editable design (not a copy):" +
    " { background (hex from the reference bg), accent (hex for buttons/icons), textColor (hex), align ('left'|'center')," +
    " layout ('stack' for single-column, or 'split' for text-beside-media), mediaSide ('left'|'right') if split," +
    " blocks: an ORDERED array matching the reference's real structure, each one of:" +
    ' {type:"eyebrow",text}, {type:"heading",text}, {type:"subheading",text}, {type:"paragraph",text},' +
    ' {type:"buttons",items:[{label,variant:"primary"|"secondary"}]}, {type:"chips",items:[string]},' +
    ' {type:"cardGrid",columns:<actual number of cards>,cards:[{title,body,icon:true|image:true}]},' +
    ' {type:"media",ratio,label}, {type:"stats",items:[{value,label}]}, {type:"logos",count},' +
    ' {type:"accordion",items:[{question,answer}]}, {type:"linkColumns",columns:[{heading,links:[string]}]},' +
    // Composition primitives — capture WHERE elements sit, not just that they exist.
    ' {type:"splitIntro",eyebrow,heading,subheading,paragraph,buttons:[{label,variant}],headingSide:"left"|"right"} (use this when a large heading sits on ONE side and the paragraph/CTA on the OTHER side — e.g. heading top-left, paragraph+button top-right; put any kicker/eyebrow and supporting subheading INSIDE this block, and set headingSide to the side the BIG heading actually sits on in the screenshot),' +
    ' {type:"spacer",size:"small"|"medium"|"large"} (use for deliberate large negative space between areas),' +
    ' {type:"form",heading,fields:[string],submitLabel} (use when the reference shows a contact/booking/newsletter/lead FORM with input fields),' +
    ' {type:"pricing",plans:[{name,price,features:[string],featured}]} (use when the reference shows PRICING PLANS/tiers) }.' +
    " Layout rules: layout:'split' ONLY when ONE large media/visual sits BESIDE the text column — and then you MUST include a media block. A heading on one side with the paragraph/CTA on the OTHER side at the TOP is a splitIntro block (hasSplitIntro:true) with layout:'stack', NOT layout:'split'." +
    " Large image tiles in a row with captions/text below them → cardGrid with image:true on each card AND hasMedia:true (these are media cards, not icon cards)." +
    " DETECT THE ACTUAL UI PATTERN FIRST, then choose blocks to match it — do not flatten creative layouts into a generic card grid:" +
    " if you see expandable rows with +/- icons or dividers → use an accordion block (NOT cardGrid); if you see input fields → use a form block; if you see price tiers → use a pricing block; if you see testimonials → cardGrid of quotes; if a big media/mockup sits beside text → splitIntro or media." +
    " Do NOT classify as 'services' just because there are multiple items, and do NOT classify as a plain grid when it is really an accordion, form, pricing, or split composition." +
    " ANALYSE THE VISUAL COMPOSITION LIKE A UI DESIGNER, not just the content: where is the heading, where is the paragraph/CTA, how many columns, are cards image-on-top with text below, how much whitespace, is the background dark/black." +
    " Reproduce that composition with the blocks IN ORDER. If the heading and paragraph are on opposite sides, use splitIntro (NOT separate centred heading+paragraph). If large image cards sit in a row, use cardGrid with image:true (image on top, text below) and columns = the real count. Put a spacer where there is big vertical whitespace." +
    " Set background to the ACTUAL section background hex INCLUDING dark/black backgrounds. Do NOT flatten a rich composition into a generic centred hero or a plain icon grid." +
    // Structured visual-pattern detection — the "what UI pattern is this" signal.
    " ALSO return a `detected` object describing the VISUAL PATTERN (not the content category):" +
    ' { layoutType (one concise kebab-case pattern name, e.g. "split-media-accordion", "dark-feature-showcase", "faq-accordion", "pricing-card-comparison", "contact-form-section", "testimonial-card-row", "logo-cloud", "stats-row", "gallery-showcase", "centered-hero", "split-hero", "simple-card-grid", "media-card-grid"),' +
    " patternFamily, shortDescription, isDark (true if the section background is dark/black), mediaSide ('left'|'right'), cardCount (number of cards if any)," +
    " hasMedia, hasImageCards (cards are large image tiles with text below), hasIconCards (small icon+text cards), hasAccordion, hasForm, hasPricing, hasTestimonials, hasStats, hasLogos, hasGallery, hasSplitIntro (all booleans for what is actually visible)," +
    " mustNotFlattenInto (array of generic layouts this must NOT collapse into, e.g. ['simple-card-grid','centered-hero']) }." +
    " Set the booleans from what you SEE (e.g. expandable +/- rows → hasAccordion:true; input fields → hasForm:true; price tiers → hasPricing:true)." +
    " detected.layoutType is the MOST IMPORTANT field — the generated section follows it. Never return a generic content category ('services','features','grid','cards') as layoutType; if unsure use 'custom-generated-layout'." +
    " Consistency rules: hasAccordion:true → layoutType must contain 'accordion'; hasForm:true → layoutType must contain 'form'; hasPricing:true → layoutType must contain 'pricing'; a dark/black section → isDark:true AND blueprint.background must be that dark hex; exactly N cards visible → cardCount:N and the blueprint cardGrid must have exactly N cards." +
    " Write REAL, concrete, ORIGINAL starter copy for every text slot — natural words a designer would ship, relevant to the section's purpose. Do NOT output literal template labels like 'Your Main Heading', 'Your Subheading', 'Card Title 1', 'Card description here', or 'Your Media Placeholder'. Example — good heading: 'Launch a site that converts'; bad: 'Your Main Heading'. Never transcribe the reference's exact words, brand, or logo; for any image use a placeholder — never reuse the reference's images.";

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: [{ type: "text", text: userText }, { type: "image_url", image_url: { url: input.imageDataUrl } }] },
  ];

  try {
    // Strongest available vision model + a high token ceiling so the full
    // analysis + blueprint + detected object never truncates (a cut-off
    // response fails JSON.parse → silent fallback to the shallow path).
    console.info("[Reference Vision] Using model:", REFERENCE_VISION_MODEL, "(fallback:", REFERENCE_MODEL_FALLBACK + ") · max tokens:", REFERENCE_VISION_MAX_TOKENS);
    const raw = await client.chatJSON(messages, { model: REFERENCE_VISION_MODEL, fallbackModel: REFERENCE_MODEL_FALLBACK, maxTokens: REFERENCE_VISION_MAX_TOKENS });
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
      suggestedStyleTags: pickFromVocab(p.suggestedStyleTags, VISUAL_STYLE_TAGS),
      suggestedLayoutTags: pickFromVocab(p.suggestedLayoutTags, LAYOUT_TAGS),
      suggestedInteractionTags: pickFromVocab(p.suggestedInteractionTags, INTERACTION_TAGS),
      confidence: conf === "high" || conf === "low" ? (conf as "high" | "low") : "medium",
      blueprint: normalizeBlueprint(p.blueprint) ?? undefined,
      detected: normalizeDetected(p.detected),
    };
  } catch (err) {
    return { ...base, originalityWarnings: [`Vision analysis failed: ${err instanceof Error ? err.message : String(err)}`] };
  }
}
