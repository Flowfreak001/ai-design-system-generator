// Preview generator — renders the design system as a branded specimen page
// (getdesign.md-style): numbered sections, rendered IN the extracted brand's
// own canvas/typography/radius, every value measured or explicitly assumed.
// Self-contained HTML, iframe-safe.

import type { GenerationInput } from "@/types";
import type { AnimationAnalysis } from "@/lib/analysis/animation-extractor";
import type { TokensAnalysis } from "@/lib/analysis/site-analyzer";

export type PreviewData = {
  input: GenerationInput;
  tokens: TokensAnalysis | null;
  animation: AnimationAnalysis | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
const mix = (hex: string, other: string, t: number) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(other.slice(1), 16);
  const ch = (sh: number) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
};

type Swatch = { name: string; value: string; note: string };

export function generatePreviewHtml(data: PreviewData): string {
  const { input, tokens, animation } = data;
  const name = input.clientName || input.projectName;
  const c = (tokens?.color ?? {}) as Record<string, string>;
  const m = tokens?.metrics ?? null;
  const probe = (tokens as unknown as {
    renderedProbe?: {
      palette?: { value: string; weight: number; role: string }[];
      button?: Record<string, unknown> | null;
      content?: { headings?: { text: string; sizePx: number; blurb?: string }[]; navItems?: string[]; ctaText?: string; bodySample?: string };
      headingTransform?: string;
    };
  })?.renderedProbe;
  const live = probe?.content;
  // Multi-page evidence (scope + accuracy + detected components) so the preview
  // is honest about what was analyzed and which sections are real vs missing.
  const mp = (tokens as unknown as {
    multiPage?: {
      scope?: string;
      note?: string;
      accuracy?: { level: string; score: number };
      componentInventory?: Record<string, boolean | number>;
      recommendedPagesMissing?: string[];
    };
  })?.multiPage;
  // Casing is a measured property, not a style choice: only uppercase what the
  // reference site actually renders uppercase.
  const headingTransform = probe?.headingTransform && probe.headingTransform !== "none" ? probe.headingTransform : "none";
  const btnTransform = String(probe?.button?.textTransform ?? "none") || "none";
  const btnLs = String(probe?.button?.letterSpacing ?? "normal") || "normal";
  const assumed: string[] = [];

  // ---- Theme derived from extraction -------------------------------------
  // measuredBg is the real extracted page background (shown in the palette
  // swatch). The sheet canvas uses a clean white for light brands and the
  // measured dark surface for dark brands — like a printed brand guide.
  const measuredBg = c.background ?? input.brief.primaryColor ?? "#0a0a0a";
  const isDark = lum(measuredBg) < 0.5;
  const bg = isDark ? measuredBg : "#ffffff";
  const ink = c.ink && Math.abs(lum(c.ink) - lum(bg)) > 0.3 ? c.ink : isDark ? "#f5f5f5" : "#101115";
  // Heading text color, measured from rendered h1/h2 (often darker than body).
  const measuredHeadingInk = c["ink-heading"];
  const displayInk = measuredHeadingInk && Math.abs(lum(measuredHeadingInk) - lum(bg)) > 0.3 ? measuredHeadingInk : ink;
  const headingInkMeasured = Boolean(measuredHeadingInk && displayInk === measuredHeadingInk);
  const accents = Object.entries(c).filter(([k]) => k.startsWith("accent")).map(([, v]) => v);
  const accent = accents[0] ?? input.brief.primaryColor ?? (isDark ? "#ffffff" : "#111111");
  if (!accents.length && !input.brief.primaryColor) assumed.push("No accent color extracted — monochrome CTA assumed until brand assets arrive.");
  const surface = mix(bg, isDark ? "#ffffff" : "#000000", 0.06);
  const hairline = mix(bg, isDark ? "#ffffff" : "#000000", 0.14);
  const mutedText = mix(ink, bg, 0.35);

  const bodyFont = String(tokens?.typography?.primary ?? "Inter");
  const displayFont = String(tokens?.typography?.display ?? tokens?.typography?.primary ?? bodyFont);
  if (!tokens?.typography?.primary) assumed.push("Fonts not extracted — Inter assumed.");
  const bodyPx = m?.bodyFontSizePx ?? 16;
  const lh = m?.bodyLineHeight ?? 1.6;
  const headingW = m?.headingWeight ?? 700;
  const radius = String(probe?.button?.radius ?? m?.button?.radius ?? "0px");
  const btnBg = String(probe?.button?.background ?? accent);
  const btnColor = String(probe?.button?.color ?? (lum(btnBg) > 0.5 ? "#111111" : "#ffffff"));
  const btnPadY = (probe?.button?.paddingY as number) ?? m?.button?.paddingY ?? 12;
  const btnPadX = (probe?.button?.paddingX as number) ?? m?.button?.paddingX ?? 24;
  const btnW = (probe?.button?.fontWeight as number) ?? m?.button?.fontWeight ?? 600;
  const btnMs = (probe?.button?.transitionMs as number) ?? m?.button?.transitionMs;
  const measuredBtn = Boolean(probe?.button);
  if (!measuredBtn) assumed.push("Primary CTA not isolated on the reference site — button spec derived from CSS/defaults.");

  // Google Fonts best-effort (common families render; custom ones fall back).
  const fontLink = [...new Set([bodyFont, displayFont])]
    .filter((f) => !/^(inter)$/i.test(f))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");

  // ---- Swatches with dynamic usage notes ----------------------------------
  const roleNotes: Record<string, string> = {
    ink: "Body text color (rendered, text-length weighted).",
    "ink-heading": "Heading text color (measured from rendered h1/h2).",
    background: "Dominant painted surface (rendered, area-weighted).",
    accent: measuredBtn ? "Measured from the live primary CTA." : "Primary chromatic accent from stylesheet analysis.",
  };
  const swatches: Swatch[] = Object.entries(c).map(([key, value]) => ({
    name: key.replace(/-/g, " "),
    value,
    note: roleNotes[key] ?? (key.startsWith("accent") ? "Secondary chromatic accent — use for state, never large surfaces." : "Supporting neutral."),
  }));
  if (!swatches.length) {
    assumed.push("No palette extracted — neutral placeholder swatches shown.");
    swatches.push(
      { name: "ink", value: ink, note: "Assumed text color." },
      { name: "background", value: bg, note: "Assumed surface." },
    );
  }

  const typeScale = (m?.typeScale ?? []).slice(-4);
  // Hero headline: the live site's largest rendered heading when the probe
  // captured one, otherwise the brief's goal.
  const largestLiveHeading = (live?.headings ?? []).slice().sort((a, b) => b.sizePx - a.sizePx)[0]?.text;
  const heroHeadline = largestLiveHeading
    ?? (input.brief.goal?.trim()
      ? input.brief.goal.trim().replace(/\.$/, "")
      : `Built for ${input.brief.targetAudience?.trim() || "your customers"}`);

  // Spec cells — engineered numbers from real metrics
  const specCells: { v: string; l: string }[] = [];
  if (m?.containerWidth) specCells.push({ v: `${m.containerWidth}`, l: "container px (measured)" });
  if (m?.spacingBase) specCells.push({ v: `${m.spacingBase}px`, l: "spacing rhythm (measured)" });
  if (m?.breakpoints?.length) specCells.push({ v: `${m.breakpoints.length}`, l: `breakpoints · ${m.breakpoints.slice(0, 3).join("/")}…` });
  if (typeScale.length) specCells.push({ v: `${typeScale[typeScale.length - 1]}px`, l: "largest display size (measured)" });
  if (btnMs) specCells.push({ v: `${btnMs}ms`, l: "cta transition (measured)" });
  specCells.push({ v: `${swatches.length}`, l: "palette tokens extracted" });
  if (headingW) specCells.push({ v: `${headingW}`, l: "heading weight (measured)" });
  if (bodyPx) specCells.push({ v: `${bodyPx}px`, l: "body size (measured)" });

  const motionLines = animation
    ? [
        animation.globalMotionStyle,
        animation.detectedLibraries.length ? `Stack: ${animation.detectedLibraries.join(", ")}` : "No animation libraries detected in source.",
        ...[...animation.scrollAnimations, ...animation.stickyPinnedSections].slice(0, 3).map((f) => `${f.pattern} — ${f.evidence[0] ?? ""}`),
        animation.reducedMotionSupport,
      ].filter(Boolean)
    : ["No animation analysis available — run Analyze References for measured motion data."];

  // ---- Brief-derived content (no static filler) ----------------------------
  const brief = input.brief;
  // Offer names: real services from the brief first, then key pages/workflows.
  const servicesFromBrief = (brief.services ?? "")
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const services = [...servicesFromBrief, ...brief.keyItems].slice(0, 3);
  if (!services.length) {
    assumed.push("No services or key pages provided in the brief — card examples show the business type instead.");
    services.push(brief.businessType?.trim() || name);
  }
  const tone = brief.brandPersonality?.trim() || brief.toneOfVoice?.trim() || "";
  const keywords = brief.seoKeywords.filter(Boolean);
  // One supporting sentence assembled only from brief fields that exist.
  const heroSupport = [
    brief.services?.trim() ? `Offering ${servicesFromBrief.slice(0, 3).join(", ")}` : null,
    brief.targetAudience?.trim() ? `for ${brief.targetAudience.trim()}` : null,
    tone ? `— ${tone.toLowerCase()} in every interaction` : null,
  ].filter(Boolean).join(" ") || `${name} — ${brief.businessType?.trim() || "brand"} design system.`;
  // Live-site copy wins over brief reconstructions when the probe captured it.
  const ctaLabel = live?.ctaText || brief.ctaGoal?.trim() || heroHeadline;
  if (!live?.ctaText && !brief.ctaGoal?.trim()) assumed.push("No CTA measurable and no CTA goal in the brief — the project goal is used as the CTA label.");
  const navItems = live?.navItems?.length
    ? live.navItems.slice(0, 5)
    : brief.keyItems.length ? brief.keyItems.slice(0, 5) : services.slice(0, 4);
  const bodySample = live?.bodySample || heroSupport;
  // For each measured display size, prefer the heading text actually rendered
  // at (or nearest to) that size on the live page.
  const liveHeadings = live?.headings ?? [];
  const usedHeading = new Set<number>();
  const liveTextFor = (px: number): string | null => {
    let best = -1, bestDiff = 7;
    for (let i = 0; i < liveHeadings.length; i++) {
      if (usedHeading.has(i)) continue;
      const diff = Math.abs(liveHeadings[i].sizePx - px);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    if (best === -1) return null;
    usedHeading.add(best);
    return liveHeadings[best].text;
  };
  // Card titles: real sub-headings (h3-scale) from the live page when present.
  const liveCardTitles = liveHeadings.filter((h) => h.sizePx <= 30).map((h) => h.text).slice(0, 3);
  const cardTitles = liveCardTitles.length ? liveCardTitles : services;
  // Real per-module blurb captured under each live sub-heading, keyed by title;
  // falls back to distinct derived copy so cards never read identically.
  const blurbByTitle = new Map<string, string>();
  for (const h of live?.headings ?? []) if (h.blurb) blurbByTitle.set(h.text, h.blurb);
  const cardCopy = (title: string, i: number) =>
    blurbByTitle.get(title) ??
    (keywords[i]
      ? `Positioned around “${keywords[i]}” — copy from the brief's SEO focus.`
      : brief.goal?.trim()
        ? `“${title}” supports the goal: ${brief.goal.trim().replace(/\.$/, "").toLowerCase()}.`
        : `Copy for “${title}”, written for ${brief.targetAudience?.trim() || "the target audience"}.`);

  // ---- Named type ramp (getdesign.md-style roles) --------------------------
  // Display/title sizes come from the measured type scale; body/label/button
  // rows come from measured body + CTA specs. lh/tracking derived per size.
  type TypeRow = { role: string; source: string; px: number; w: number; lh: number; ls: string; upper: boolean; text: string; mutedRow?: boolean };
  // Token names are built from the EXTRACTED font families and measured sizes
  // (e.g. "ROOBERT-PRO-56"), never from a fixed naming template.
  const slug = (f: string) => f.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const displaySlug = slug(displayFont);
  const bodySlug = slug(bodyFont);
  const displaySizes = [...new Set((m?.typeScale ?? []).filter((px) => px >= 20))].sort((a, b) => b - a);
  // Specimen copy: every line comes from a brief field (goal, services, key
  // pages, style, audience, keywords) — never canned marketing filler.
  const displayTexts = [
    heroHeadline,
    `More from ${name}`,
    ...services,
    ...(brief.stylePreference?.trim() ? [brief.stylePreference.trim()] : []),
    ...(brief.targetAudience?.trim() ? [`Made for ${brief.targetAudience.trim()}`] : []),
    ...keywords,
  ].filter(Boolean);
  const lhFor = (px: number) => (px >= 64 ? 1.0 : px >= 48 ? 1.05 : px >= 36 ? 1.1 : px >= 28 ? 1.15 : px >= 22 ? 1.3 : 1.4);
  const typeRamp: TypeRow[] = displaySizes.slice(0, 7).map((px, i) => {
    const liveText = liveTextFor(px);
    return {
      role: `${displaySlug}-${px}`,
      source: liveText ? "text + size measured from live headings" : "size measured from rendered h1/h2",
      px,
      w: px >= 22 ? headingW : 400,
      lh: lhFor(px),
      ls: "0",
      upper: headingTransform === "uppercase",
      text: liveText ?? displayTexts[i] ?? `${name} — design in motion`,
    };
  });
  if (!typeRamp.length) {
    assumed.push("No heading sizes measurable — a default display ramp is shown.");
    typeRamp.push(
      { role: `${displaySlug}-56`, source: "assumed — no headings measurable", px: 56, w: headingW, lh: 1.05, ls: "0", upper: headingTransform === "uppercase", text: heroHeadline },
      { role: `${displaySlug}-24`, source: "assumed — no headings measurable", px: 24, w: headingW, lh: 1.3, ls: "0", upper: false, text: services[0] },
    );
  }
  const displayRoles = new Set(typeRamp.map((r) => r.role));
  const btnPxRow = 14;
  typeRamp.push(
    { role: `${bodySlug}-${bodyPx}`, source: live?.bodySample ? "text + size measured from live body copy" : m?.bodyFontSizePx ? "measured rendered body text" : "assumed body size", px: bodyPx, w: 400, lh, ls: "0", upper: false, text: bodySample },
    { role: `${bodySlug}-${Math.max(bodyPx - 2, 12)}-FINE`, source: "derived from measured body size", px: Math.max(bodyPx - 2, 12), w: 400, lh, ls: "0", upper: false, text: brief.notes?.trim() || `${name} · ${brief.businessType?.trim() || "brand"} — fine print and footer text.`, mutedRow: true },
    { role: `${bodySlug}-${btnPxRow}-CTA`, source: measuredBtn ? "measured from the live primary CTA" : "derived — CTA not isolated", px: btnPxRow, w: btnW, lh: 1.0, ls: btnLs, upper: btnTransform === "uppercase", text: ctaLabel },
    { role: `${bodySlug}-${btnPxRow}-NAV`, source: live?.navItems?.length ? "labels measured from the live site nav" : "derived from the brief's key pages", px: btnPxRow, w: 400, lh: 1.4, ls: "0.5px", upper: false, text: navItems.join(" · ") },
  );
  const isDisplayRole = (r: TypeRow) => displayRoles.has(r.role);

  const host = tokens?.sourceUrl ? String(tokens.sourceUrl).replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;

  // Sections are composed only from extracted/brief data; a section with no
  // data behind it is omitted — a brand guide documents what exists.
  type Section = { kicker: string; title: string; intro: string; body: string };
  const sections: Section[] = [];

  sections.push({
    kicker: "Color palette",
    title: `${isDark ? "Dark" : "Light"} canvas, ${accents.length} chromatic accent${accents.length === 1 ? "" : "s"}`,
    intro: accents.length
      ? `Surfaces stay ${isDark ? "dark" : "light"}; ${accents.slice(0, 3).join(", ")} carry identity and action.${measuredBtn ? " The accent is taken from the live primary CTA, not guessed." : ""}`
      : "No chromatic accent was extracted — the system stays monochrome until brand assets are provided.",
    body: `${accents.length ? `<div class="stripe">${accents.map((a) => `<div style="flex:1;background:${esc(a)}"></div>`).join("")}</div>` : ""}
     <div class="swatches">${swatches.map((s) => `
       <div class="swatch"><div class="chip" style="background:${esc(s.value)}"></div>
       <div class="meta"><div class="nm">${esc(s.name)}</div><code>${esc(s.value)}</code><div class="use">${esc(s.note)}</div></div></div>`).join("")}
     </div>`,
  });

  sections.push({
    kicker: "Typography scale",
    title: `${displayFont === bodyFont ? bodyFont : `${displayFont} display, ${bodyFont} body`} · ${headingW} / 400 contrast`,
    intro: `Display at weight ${headingW}${m?.headingWeight ? " (measured)" : " (assumed)"}, body at ${bodyPx}px / ${lh}${m?.bodyFontSizePx ? " (measured)" : " (assumed)"}${headingTransform === "uppercase" ? "; headings render uppercase (measured)" : ""}. ${headingInkMeasured ? `Headings render in ${displayInk} and body in ${ink} — both measured from the live text.` : `Text renders in ${ink} (measured body color).`} Spec reads size / weight / line-height / letter-spacing.`,
    body: typeRamp.map((r) => `
      <div class="typerow">
        <div class="tmeta"><div class="trole">${esc(r.role)}</div><div class="tspec">${r.px}px / ${r.w} / ${r.lh} / ${esc(r.ls)}</div><div class="tsrc">${esc(r.source)}</div></div>
        <div class="tspec-sample${r.mutedRow ? " tmuted" : ""}" style="color:${esc(isDisplayRole(r) ? displayInk : ink)};font-family:'${esc(isDisplayRole(r) ? displayFont : bodyFont)}','${esc(bodyFont)}',sans-serif;font-size:${r.px}px;font-weight:${r.w};line-height:${r.lh};letter-spacing:${esc(r.ls)};${r.upper ? "text-transform:uppercase;" : ""}">${esc(r.text)}</div>
      </div>`).join(""),
  });

  sections.push({
    kicker: "Button variants",
    title: `${radius} radius · ${btnBg} on ${btnColor}${btnMs ? ` · ${btnMs}ms` : ""}`,
    intro: measuredBtn
      ? `Primary spec measured from the live CTA${host ? ` on ${host}` : ""}: ${btnBg} on ${btnColor}, ${btnPadY}px/${btnPadX}px padding, weight ${btnW}${btnTransform !== "none" ? `, ${btnTransform}` : ""}${btnMs ? `, ${btnMs}ms` : ""}.`
      : "Primary spec derived from stylesheet heuristics — confirm against live brand.",
    body: `<div class="btncards">
      <div class="btncard"><div class="lbl">button-primary</div><a class="btn primary" href="#">${esc(ctaLabel)}</a>
        <div class="cap">${esc(btnBg)} / ${esc(btnColor)} / radius ${esc(radius)} / ${btnPadY}×${btnPadX}px / w${btnW}${btnMs ? ` / ${btnMs}ms` : ""}${measuredBtn ? " · measured" : " · derived"}</div></div>
      <div class="btncard"><div class="lbl">button-outline</div><a class="btn outline" href="#">${esc(navItems[1] ?? services[0])}</a>
        <div class="cap">Inverse of primary: transparent fill, 1px ${esc(ink)} outline, radius ${esc(radius)} / padding ${btnPadY}×${btnPadX}px.</div></div>
      <div class="btncard"><div class="lbl">text-link</div><a class="btn textlink" href="#">${esc(navItems[0] ?? services[0])} →</a>
        <div class="cap">No fill; weight ${btnW} matches the primary CTA${btnMs ? `, ${btnMs}ms transition` : ""}.</div></div>
    </div>`,
  });

  if (cardTitles.length) {
    sections.push({
      kicker: "Cards & containers",
      title: `${cardTitles.length} content module${cardTitles.length === 1 ? "" : "s"} · radius ${radius} on ${surface}`,
      intro: `${liveCardTitles.length ? `Module titles are real sub-headings rendered on ${host ?? "the reference site"}` : "Module names come from the brief's services and key pages"}; titles set in ${displayFont}${m?.spacingBase ? `, ${m.spacingBase}px spacing rhythm (measured)` : ""}.`,
      body: `<div class="cards">${cardTitles.map((s, i) => `
      <div class="pcard"><div class="ph" style="background:linear-gradient(150deg, ${esc(accents[i % Math.max(accents.length, 1)] ?? mix(bg, ink, 0.2))}, ${esc(mix(bg, ink, 0.05))})"></div>
      <div class="pd"><div class="tag">${esc(input.brief.businessType ?? "offer")} · 0${i + 1}</div><h3>${esc(s)}</h3><p>${esc(cardCopy(s, i))}</p></div></div>`).join("")}
    </div>`,
    });
  }

  sections.push({
    kicker: "Hero composition",
    title: largestLiveHeading ? `As rendered on ${host ?? "the reference site"}` : `Composed from the ${name} brief`,
    intro: `${largestLiveHeading ? "Headline, support copy, and CTA are the live site's own rendered text." : "Headline and CTA come from the brief's goal."}${brief.targetAudience?.trim() ? ` Audience: ${brief.targetAudience.trim()}.` : ""}`,
    body: `<div class="hero"><h3>${esc(heroHeadline)}</h3>
      <p>${esc(bodySample)}</p>
      <a class="btn primary" href="#">${esc(ctaLabel)}</a>
      &nbsp;&nbsp;<a class="btn outline" href="#">${esc(navItems[1] ?? services[0])}</a></div>`,
  });

  if (specCells.length > 2) {
    const topSpecs = [
      m?.containerWidth ? `${m.containerWidth}px container` : null,
      m?.spacingBase ? `${m.spacingBase}px rhythm` : null,
      btnMs ? `${btnMs}ms CTA` : null,
    ].filter(Boolean).join(" · ");
    sections.push({
      kicker: "Measured spec",
      title: topSpecs || `${specCells.length} measured values`,
      intro: `Numbers measured from ${host ?? "the reference site"}; anything unmeasurable is flagged in the assumptions banner, never invented.`,
      body: `<div class="cells">${specCells.map((sc) => `<div class="cell"><div class="v">${esc(sc.v)}</div><div class="l">${esc(sc.l)}</div></div>`).join("")}</div>`,
    });
  }

  if (animation) {
    sections.push({
      kicker: "Motion",
      title: animation.globalMotionStyle || `${motionLines.length} motion findings`,
      intro: `From the animation analysis of ${host ?? "the reference site"}${animation.detectedLibraries.length ? ` — stack: ${animation.detectedLibraries.join(", ")}` : ""}.`,
      body: `<ul class="motion">${motionLines.map((l) => `<li>${esc(String(l))}</li>`).join("")}</ul>`,
    });
  }

  const sec = (num: string, kicker: string, title: string, intro: string, body: string) => `
  <section>
    <div class="kicker">${num} — ${esc(kicker)}</div>
    <h2 class="display">${esc(title)}</h2>
    <p class="intro">${esc(intro)}</p>
    ${body}
  </section>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — Design System</title>
${fontLink ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?${fontLink}&display=swap" rel="stylesheet" />` : ""}
<style>
  :root { --bg:${bg}; --ink:${esc(ink)}; --display-ink:${esc(displayInk)}; --accent:${esc(accent)}; --surface:${surface}; --line:${hairline}; --muted:${mutedText}; --radius:${esc(radius)}; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--ink); font-family:'${esc(bodyFont)}', ui-sans-serif, system-ui, sans-serif; font-size:${bodyPx < 14 ? 15 : bodyPx}px; line-height:${lh}; }
  .wrap { max-width:${m?.containerWidth ? Math.min(m.containerWidth, 1240) : 1100}px; margin:0 auto; padding:56px 32px; }
  section { margin-bottom:88px; }
  .kicker { font:600 11px/1 ui-monospace,monospace; letter-spacing:.22em; text-transform:uppercase; color:var(--muted); margin-bottom:18px; }
  .display { color:var(--display-ink); font-family:'${esc(displayFont)}', '${esc(bodyFont)}', sans-serif; font-weight:${headingW}; text-transform:${headingTransform}; letter-spacing:-.01em; font-size:clamp(28px,4.6vw,54px); line-height:1.02; margin-bottom:16px; }
  .intro { color:var(--muted); max-width:62ch; margin-bottom:34px; }
  .stripe { display:flex; height:12px; margin-bottom:22px; }
  .swatches { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
  .swatch { background:var(--surface); border:1px solid var(--line); }
  .swatch .chip { height:96px; }
  .swatch .meta { padding:16px; }
  .swatch .nm { font-weight:700; text-transform:uppercase; font-size:13px; letter-spacing:.06em; }
  .swatch code { display:block; color:var(--muted); font-size:12px; margin:6px 0 8px; }
  .swatch .use { color:var(--muted); font-size:13px; line-height:1.5; }
  .typerow { border-top:1px solid var(--line); padding:26px 0; display:grid; grid-template-columns:220px 1fr; gap:26px; align-items:center; }
  .typerow .trole { font:700 12px/1.3 '${esc(bodyFont)}',sans-serif; letter-spacing:.06em; text-transform:uppercase; }
  .typerow .tspec { font:400 12px/1.6 ui-monospace,monospace; color:var(--muted); margin-top:6px; }
  .typerow .tsrc { font-size:11px; color:var(--muted); margin-top:4px; opacity:.8; }
  .typerow .tspec-sample { overflow-wrap:break-word; min-width:0; max-width:60ch; }
  .typerow .tmuted { color:var(--muted); }
  @media (max-width:720px){ .typerow { grid-template-columns:1fr; gap:10px; } }
  .btncards { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
  .btncard { background:var(--surface); border:1px solid var(--line); padding:24px; }
  .btncard .lbl { font:700 11px/1 ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase; margin-bottom:18px; }
  .btncard .cap { color:var(--muted); font-size:13px; margin-top:16px; line-height:1.5; }
  .btn { display:inline-block; text-decoration:none; font-weight:${btnW}; padding:${btnPadY}px ${btnPadX}px; border-radius:var(--radius); font-size:14px; letter-spacing:${btnLs}; text-transform:${btnTransform}; ${btnMs ? `transition:all ${btnMs}ms ease;` : ""} }
  .btn.primary { background:${esc(btnBg)}; color:${esc(btnColor)}; }
  .btn.outline { background:transparent; color:var(--ink); border:1px solid var(--ink); }
  .btn.textlink { padding:0; background:none; color:var(--ink); border-bottom:0; font-weight:${btnW}; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
  .pcard { background:var(--surface); border:1px solid var(--line); }
  .pcard .ph { height:170px; }
  .pcard .pd { padding:20px; }
  .pcard .tag { font:600 10px/1 ui-monospace,monospace; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
  .pcard h3 { color:var(--display-ink); font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; text-transform:${headingTransform}; font-size:20px; margin:10px 0 8px; font-weight:${headingW}; }
  .pcard p { color:var(--muted); font-size:14px; }
  .hero { border:1px solid var(--line); background:linear-gradient(160deg, ${mix(bg, accent, 0.25)}, var(--bg) 65%); padding:64px 40px; }
  .hero h3 { color:var(--display-ink); font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; text-transform:${headingTransform}; font-size:clamp(26px,4vw,44px); line-height:1.04; max-width:22ch; margin-bottom:14px; font-weight:${headingW}; }
  .hero p { color:var(--muted); max-width:52ch; margin-bottom:26px; }
  .cells { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); border-top:1px solid var(--line); border-left:1px solid var(--line); }
  .cell { border-right:1px solid var(--line); border-bottom:1px solid var(--line); padding:26px 20px; background:var(--surface); }
  .cell .v { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-size:38px; font-weight:${headingW}; line-height:1; }
  .cell .l { font:600 10px/1.6 ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-top:10px; }
  ul.motion { list-style:none; display:grid; gap:10px; padding:0; }
  ul.motion li { border-left:2px solid var(--accent); padding:4px 0 4px 16px; color:var(--muted); font-size:14px; }
  .scope { border:1px solid var(--line); border-left:3px solid var(--accent); background:var(--surface); border-radius:8px; padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--muted); line-height:1.5; }
  .scope b { color:var(--ink); }
  .scope .acc { display:inline-block; margin-left:6px; font:600 11px/1 ui-monospace,monospace; color:var(--accent); }
  .scope-missing { margin-top:6px; font-size:12px; }
  .legend { display:flex; flex-wrap:wrap; gap:8px 20px; margin-bottom:22px; font-size:12px; color:var(--muted); }
  .legend span { display:flex; align-items:center; gap:7px; }
  .legend .dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
  .legend .dot.measured { background:var(--accent); }
  .legend .dot.derived { background:${mutedText}; }
  .legend .dot.assumed { background:transparent; border:1.5px dashed ${mutedText}; }
  .assume { border:1px solid var(--line); background:var(--surface); color:var(--muted); font-size:13px; padding:14px 18px; margin-bottom:56px; }
  .assume b { color:var(--ink); }
  header.top { display:flex; justify-content:space-between; align-items:baseline; border-bottom:1px solid var(--line); padding-bottom:22px; margin-bottom:64px; flex-wrap:wrap; gap:8px; }
  header.top .brand { color:var(--display-ink); font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${headingW}; text-transform:${headingTransform}; font-size:20px; letter-spacing:.04em; }
  header.top .src { font:500 11px/1 ui-monospace,monospace; color:var(--muted); }
  footer { border-top:1px solid var(--line); padding-top:18px; color:var(--muted); font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <span class="brand">${esc(name)}</span>
    <span class="src">${esc(input.brief.businessType ?? "design system")}${tokens?.sourceUrl ? ` · extracted from ${esc(String(tokens.sourceUrl))}` : ""} · confidence: ${esc(String(tokens?.confidence ?? "n/a"))}</span>
  </header>

  ${mp ? `<div class="scope">
    <b>Analysis scope:</b> ${esc(mp.note ?? "")} ${mp.accuracy ? `<span class="acc">Accuracy: ${esc(mp.accuracy.level)} (${mp.accuracy.score}/100)</span>` : ""}
    ${mp.recommendedPagesMissing?.length ? `<div class="scope-missing">Not detected / not provided: ${mp.recommendedPagesMissing.map(esc).join(", ")} page(s).</div>` : ""}
  </div>` : ""}

  <div class="legend">
    <span><i class="dot measured"></i>Measured — computed from the rendered live page</span>
    <span><i class="dot derived"></i>Derived — inferred from the site's CSS / analysis</span>
    <span><i class="dot assumed"></i>Assumed — no data on the reference site (flagged below)</span>
  </div>

  ${assumed.length ? `<div class="assume"><b>Assumptions:</b> ${assumed.map(esc).join(" ")}</div>` : ""}

  ${sections.map((x, i) => sec(String(i + 1).padStart(2, "0"), x.kicker, x.title, x.intro, x.body)).join("")}

  <footer>Generated by Project OS — ${esc(name)} design system specimen. Values marked measured come from the rendered-page probe.</footer>
</div>
</body>
</html>`;
}
