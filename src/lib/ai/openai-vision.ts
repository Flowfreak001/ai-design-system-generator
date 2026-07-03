// OpenAI Vision section analysis. Describes visual layout, hierarchy, feel, and
// component structure from a screenshot — it does NOT invent exact CSS values;
// when computed styles are supplied they are the factual source. Falls back
// safely (labelled) when the API key is missing or the call fails.

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

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 12) : [];

export async function analyzeSectionScreenshotWithOpenAI(input: VisionInput): Promise<VisionAnalysis> {
  const base: VisionAnalysis = {
    ...EMPTY,
    source: "fallback",
    sectionType: input.sectionType,
    pageType: input.pageType,
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
    "You are a senior design-systems analyst. Given a screenshot of ONE website section, " +
    "describe its visual layout, hierarchy, feel, and component structure so a developer can " +
    "recreate it. Rules: (1) If computed styles are provided, treat them as the FACTUAL source " +
    "and never contradict them — do not guess exact px/hex values that would conflict. " +
    "(2) Use the image only for visual interpretation (layout, grouping, emphasis, imagery, motion cues). " +
    "(3) Reply with a SINGLE JSON object only, no prose.";

  const userText =
    `Section type: ${input.sectionType}. Page type: ${input.pageType}. ` +
    (input.sourceUrl ? `Source URL: ${input.sourceUrl}. ` : "") +
    (input.userNotes ? `User notes: ${input.userNotes}. ` : "") +
    (input.computedStyles ? `Computed styles (factual, do not contradict): ${JSON.stringify(input.computedStyles).slice(0, 1500)}. ` : "No computed styles supplied. ") +
    "Return JSON with these keys (arrays of short strings unless noted): " +
    "visualLayout (string), typographyObservations, colorUsage, spacingObservations, componentStructure, " +
    "buttonStyles, cardStyles, formStyles, imageTreatment, responsiveNotes, animationClues, " +
    "confidence ('high'|'medium'|'low'), assumptions, warnings.";

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
    const raw = await client.chatJSON(messages, { model: VISION_MODEL, maxTokens: 1400 });
    const p = JSON.parse(raw) as Record<string, unknown>;
    const conf = String(p.confidence ?? "medium").toLowerCase();
    return {
      source: "openai_vision",
      sectionType: input.sectionType,
      pageType: input.pageType,
      visualLayout: String(p.visualLayout ?? "").slice(0, 800),
      typographyObservations: arr(p.typographyObservations),
      colorUsage: arr(p.colorUsage),
      spacingObservations: arr(p.spacingObservations),
      componentStructure: arr(p.componentStructure),
      buttonStyles: arr(p.buttonStyles),
      cardStyles: arr(p.cardStyles),
      formStyles: arr(p.formStyles),
      imageTreatment: arr(p.imageTreatment),
      responsiveNotes: arr(p.responsiveNotes),
      animationClues: arr(p.animationClues),
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
