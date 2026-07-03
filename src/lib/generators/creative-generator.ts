import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  visionBlock,
  orNa,
  who,
  sectionsOf,
  analysisConfidenceNote,
} from "./context";

export function generateCreativeMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const sections = sectionsOf(ctx, a);
  const anim = ctx.animation;
  const tokenColors = (ctx.tokens?.color ?? {}) as Record<string, string>;
  const accents = Object.entries(tokenColors).filter(([k]) => k.startsWith("accent")).map(([, v]) => v);
  const mood = accents.length
    ? `Grounded in the measured palette — ${tokenColors.background ?? "light"} surfaces, ${tokenColors.ink ?? "dark"} text, accents ${accents.slice(0, 3).join(", ")}. Evolve it, don't replace it without reason.`
    : ctx.visual?.colorUsage?.length
      ? `Grounded in the current palette (${ctx.visual.colorUsage.slice(0, 3).map((c) => c.value).join(", ")}) — evolve it, don't replace it without reason.`
      : "No visual sample — propose a calm, premium mood: light surfaces, one confident accent, real photography.";
  if (!accents.length && !ctx.visual?.colorUsage?.length) a.add("Visual mood proposed without a site sample.");

  const content = `# CREATIVE — ${name}

${analysisConfidenceNote(ctx)}

## Creative direction
Position ${name} as a credible, professional ${brief.businessType?.toLowerCase() || "business"} that customers can act on immediately. Every section earns its place by moving the visitor toward: ${orNa(brief.goal, "the primary conversion")}.

## Visual mood
${mood}

## Homepage story
1. Hook — the outcome for ${brief.targetAudience?.trim() || "the visitor"}.
2. Proof — why it's credible (reviews, results, guarantees).
3. How it works — remove uncertainty in 3 steps.
4. Offer — what they get, clearly priced or clearly quoted.
5. Ask — one unambiguous next step.

## Hero concept
One bold outcome-first headline, a single supporting line, primary + secondary CTA, and a real visual (product, team, or work — not stock). ${
    anim?.entranceAnimations.length
      ? "The current site uses entrance animation — keep a staggered fade-up entrance."
      : "Introduce a subtle staggered fade-up entrance (600–800ms)."
  }

## Section flow
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Image direction
- Real work/team/location photography; consistent color treatment tied to the palette.
- Every image earns a caption or context — no decorative filler.

## Differentiation
${
    brief.notes?.trim()
      ? `From the brief: ${brief.notes.trim()}`
      : `Lean on specificity for ${brief.targetAudience?.trim() || "the audience"}: concrete numbers, named outcomes, and real proof — the things competitors say vaguely.`
  }

## Creative do's and don'ts
**Do:** one orchestrated moment per view, cohesive mood, purposeful motion, specific claims.
**Don't:** stock-photo clutter, competing accent colors, decorative-only animation, vague superlatives.

${visionBlock(ctx, ["visualLayout", "imageTreatment", "colorUsage"])}
${a.section()}
`;
  return { name: "CREATIVE.md", content };
}
