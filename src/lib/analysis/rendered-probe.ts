// Rendered-page probe — the real extraction engine. Loads the reference site
// in headless Chromium and measures the RENDERED page: computed typography,
// area-weighted painted palette, actual button styling, container width, and
// scroll-verified animation/sticky behavior.
//
// Availability is environment-dependent (a browser must be installed).
// Callers must treat null as "probe unavailable" and fall back to the static
// heuristics — never fail the pipeline because the browser is missing.

import type { AnimationFinding } from "./animation-extractor";

export type RenderedProbeResult = {
  method: "rendered";
  palette: { value: string; weight: number; role: "background" | "text" | "accent" }[];
  typography: {
    bodyFamily?: string;
    bodySizePx?: number;
    bodyLineHeight?: number;
    headingFamily?: string;
    headingWeight?: number;
    headingSizesPx: number[];
    /** Dominant text-transform on rendered h1/h2 ("uppercase" | "none" | ...). */
    headingTransform?: string;
  };
  button?: {
    background?: string;
    color?: string;
    radius?: string;
    paddingY?: number;
    paddingX?: number;
    fontWeight?: number;
    transitionMs?: number;
    textTransform?: string;
    letterSpacing?: string;
  };
  containerWidth?: number;
  /** Measured component specs from the rendered page (inputs, cards, nav). */
  components: {
    input?: {
      background?: string;
      borderColor?: string;
      borderWidth?: string;
      radius?: string;
      paddingY?: number;
      paddingX?: number;
      fontSizePx?: number;
      heightPx?: number;
      placeholder?: string;
    };
    card?: {
      background?: string;
      borderColor?: string;
      borderWidth?: string;
      radius?: string;
      shadow?: string;
      paddingPx?: number;
    };
    nav?: {
      heightPx?: number;
      background?: string;
      linkColor?: string;
    };
  };
  /** Real rendered copy from the live page, so previews can show the site's
   *  actual headings/nav/CTA text rather than reconstructed placeholders. */
  content: {
    headings: { text: string; sizePx: number }[];
    navItems: string[];
    ctaText?: string;
    bodySample?: string;
    /** Real FAQ question/answer pairs found on the page, when present. */
    faq: { q: string; a: string }[];
  };
  scrollFindings: AnimationFinding[];
  stickyFindings: AnimationFinding[];
};

const NAV_TIMEOUT = 25_000;

function rgbToHex(rgb: string): string | null {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/.exec(rgb);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) < 0.5) return null; // mostly transparent
  const c = (n: string) => (+n).toString(16).padStart(2, "0");
  return `#${c(m[1])}${c(m[2])}${c(m[3])}`;
}

export async function runRenderedProbe(url: string): Promise<RenderedProbeResult | null> {
  let browser: import("playwright").Browser | null = null;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    // tsx/esbuild injects __name() helpers into serialized evaluate functions;
    // define a no-op in the page so they don't throw in the browser context.
    await page.addInitScript(() => {
      (globalThis as unknown as Record<string, unknown>).__name = (f: unknown) => f;
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    // Let hydration finish: many sites mount hero forms/inputs client-side.
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page
      .waitForSelector("input[type='email'], input[type='text'], input[type='search']", { timeout: 4000, state: "attached" })
      .catch(() => {});
    await page.waitForTimeout(2500); // let fonts/animations/lazy CSS settle

    // ---- Measure the rendered page in one evaluate -----------------------
    const raw = await page.evaluate(() => {
      const firstFamily = (ff: string) => ff.split(",")[0].replace(/["']/g, "").trim();
      const area = (r: DOMRect) => Math.max(0, r.width) * Math.max(0, r.height);

      // Body typography (fully resolved)
      const bodyCs = getComputedStyle(document.body);
      const bodySizePx = parseFloat(bodyCs.fontSize);
      const lhRaw = bodyCs.lineHeight;
      const bodyLineHeight =
        lhRaw.endsWith("px") && bodySizePx
          ? Math.round((parseFloat(lhRaw) / bodySizePx) * 100) / 100
          : undefined;

      // Headings
      const hs = [...document.querySelectorAll("h1, h2, h3")].slice(0, 24);
      const headingSizes = new Set<number>();
      let headingWeight = 0;
      let headingFamily = "";
      const headingTexts: { text: string; sizePx: number }[] = [];
      const transformTally = new Map<string, number>();
      for (const h of hs) {
        const cs = getComputedStyle(h);
        const px = Math.round(parseFloat(cs.fontSize));
        const text = (h as HTMLElement).innerText?.trim().replace(/\s+/g, " ") ?? "";
        if (h.tagName !== "H3") {
          headingSizes.add(px);
          headingWeight = Math.max(headingWeight, parseInt(cs.fontWeight, 10) || 0);
          if (!headingFamily) headingFamily = firstFamily(cs.fontFamily);
          transformTally.set(cs.textTransform, (transformTally.get(cs.textTransform) ?? 0) + 1);
        }
        if (text.length > 2 && text.length < 120) headingTexts.push({ text, sizePx: px });
      }

      // Real nav labels from the header/nav
      const navItems = [...document.querySelectorAll("header a, nav a")]
        .map((a) => (a as HTMLElement).innerText?.trim().replace(/\s+/g, " ") ?? "")
        .filter((t) => t.length > 1 && t.length < 26 && !/^https?:/.test(t))
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .slice(0, 8);

      // Representative body copy: longest visible paragraph
      let bodySample = "";
      for (const p of [...document.querySelectorAll("p")].slice(0, 120)) {
        const t = (p as HTMLElement).innerText?.trim().replace(/\s+/g, " ") ?? "";
        const r = p.getBoundingClientRect();
        // Real prose only — skip embedded schema/JSON and symbol-heavy text.
        if (/@type|@context|[{}<>]|": "/.test(t)) continue;
        const letters = (t.match(/[a-zA-Z\s]/g) ?? []).length;
        if (t.length > 20 && letters / t.length < 0.8) continue;
        if (r.width > 100 && t.length > bodySample.length) bodySample = t;
      }
      bodySample = bodySample.slice(0, 220);

      // Painted palette: backgrounds weighted by element area, text by length.
      // Also tally real font families by rendered text length.
      const GENERIC_FAMILY = /^(sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|-apple-system|blinkmacsystemfont|arial|helvetica( neue)?|cursive)$/i;
      const bg = new Map<string, number>();
      const txt = new Map<string, number>();
      const fam = new Map<string, number>();
      const els = [...document.querySelectorAll("body *")].slice(0, 2500);
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const cs = getComputedStyle(el);
        const b = cs.backgroundColor;
        if (b && b !== "rgba(0, 0, 0, 0)") bg.set(b, (bg.get(b) ?? 0) + area(r));
        const t = (el as HTMLElement).innerText;
        if (t && t.length > 1 && el.children.length === 0) {
          const len = Math.min(t.length, 200);
          txt.set(cs.color, (txt.get(cs.color) ?? 0) + len);
          const f = firstFamily(cs.fontFamily);
          if (f && !GENERIC_FAMILY.test(f)) fam.set(f, (fam.get(f) ?? 0) + len);
        }
      }
      const topFamily = [...fam.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      // Buttons: real clickable CTAs
      const btnEls = [
        ...document.querySelectorAll("button, a, [role='button'], input[type='submit']"),
      ].filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.width > 360 || r.height < 30 || r.height > 72) return false;
        const cs = getComputedStyle(el);
        if (cs.backgroundColor === "rgba(0, 0, 0, 0)") return false;
        const text = (el as HTMLElement).innerText?.trim() ?? "";
        // Exclude a11y/consent chrome that pattern-matches as a "button".
        if (/skip to|cookie|consent|accept all|privacy|manage preferences/i.test(text)) return false;
        return text.length > 1 && text.length < 40;
      });
      let button: Record<string, unknown> | null = null;
      // pick the most saturated-background button (likely the primary CTA)
      let bestScore = -1;
      for (const el of btnEls.slice(0, 30)) {
        const cs = getComputedStyle(el);
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(cs.backgroundColor);
        if (!m) continue;
        const [r0, g0, b0] = [+m[1], +m[2], +m[3]];
        const sat = Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
        if (sat > bestScore) {
          bestScore = sat;
          button = {
            text: (el as HTMLElement).innerText?.trim().replace(/\s+/g, " "),
            textTransform: cs.textTransform,
            letterSpacing: cs.letterSpacing,
            background: cs.backgroundColor,
            color: cs.color,
            radius: cs.borderRadius,
            paddingY: Math.round(parseFloat(cs.paddingTop)),
            paddingX: Math.round(parseFloat(cs.paddingLeft)),
            fontWeight: parseInt(cs.fontWeight, 10) || undefined,
            transitionMs: (() => {
              const d = parseFloat(cs.transitionDuration);
              return Number.isFinite(d) && d > 0 ? Math.round(d * 1000) : undefined;
            })(),
          };
        }
      }

      // Real FAQ pairs: native <details>, then FAQ-classed sections, then any
      // question-heading followed by a paragraph.
      const faq: { q: string; a: string }[] = [];
      // textContent (not innerText) so collapsed accordion answers still read.
      const cleanTxt = (el: Element | null) =>
        (el?.textContent ?? "").trim().replace(/\s+/g, " ");
      const pushFaq = (q: string, a: string) => {
        if (q.length < 8 || q.length > 140 || a.length < 20) return;
        if (faq.some((f) => f.q === q)) return;
        faq.push({ q, a: a.slice(0, 260) });
      };
      // 1) Native <details>/<summary>
      for (const d of [...document.querySelectorAll("details")].slice(0, 20)) {
        const q = cleanTxt(d.querySelector("summary"));
        const a = cleanTxt(d).replace(q, "").trim();
        pushFaq(q, a);
      }
      // 2) ARIA accordions: question button + aria-controls answer panel
      if (faq.length < 3) {
        for (const b of [...document.querySelectorAll("[aria-expanded]")].slice(0, 60)) {
          const q = cleanTxt(b);
          if (!/\?/.test(q)) continue;
          const panelId = b.getAttribute("aria-controls");
          const panel = panelId ? document.getElementById(panelId) : b.parentElement?.nextElementSibling ?? b.nextElementSibling;
          const a = cleanTxt(panel ?? null);
          pushFaq(q.replace(/\s*\?.*$/, "?"), a);
          if (faq.length >= 3) break;
        }
      }
      // 3) Question headings followed by a paragraph
      if (faq.length < 3) {
        const faqRoot = document.querySelector("[class*='faq' i], [id*='faq' i], [data-testid*='faq' i]");
        const scope = faqRoot ?? document;
        for (const h of [...scope.querySelectorAll("h2, h3, h4, [role='button']")].slice(0, 200)) {
          const q = cleanTxt(h);
          if (!/\?$/.test(q)) continue;
          const next = h.nextElementSibling ?? h.parentElement?.nextElementSibling;
          const a = cleanTxt(next && /^(p|div)$/i.test(next.tagName) ? next : null);
          pushFaq(q, a);
          if (faq.length >= 3) break;
        }
      }

      // Component specs: first visible text input, most common card pattern,
      // and the header/nav bar — all from computed styles.
      let inputSpec: Record<string, unknown> | null = null;
      for (const el of [...document.querySelectorAll("input[type='text'], input[type='email'], input[type='search'], input:not([type])")].slice(0, 20)) {
        const r = el.getBoundingClientRect();
        if (r.width < 120 || r.height < 24 || r.height > 80) continue;
        const cs = getComputedStyle(el);
        inputSpec = {
          background: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          borderWidth: cs.borderTopWidth,
          radius: cs.borderRadius,
          paddingY: Math.round(parseFloat(cs.paddingTop)),
          paddingX: Math.round(parseFloat(cs.paddingLeft)),
          fontSizePx: Math.round(parseFloat(cs.fontSize)),
          heightPx: Math.round(r.height),
          placeholder: (el as HTMLInputElement).placeholder || undefined,
        };
        break;
      }

      let cardSpec: Record<string, unknown> | null = null;
      const cardTally = new Map<string, { count: number; spec: Record<string, unknown> }>();
      for (const el of [...document.querySelectorAll("div, article, section > div, li")].slice(0, 1500)) {
        const r = el.getBoundingClientRect();
        if (r.width < 200 || r.width > 640 || r.height < 100 || r.height > 560) continue;
        const cs = getComputedStyle(el);
        const hasBorder = cs.borderTopWidth !== "0px" && cs.borderTopStyle !== "none";
        const hasShadow = cs.boxShadow !== "none";
        const radiusPx = parseFloat(cs.borderRadius);
        if ((!hasBorder && !hasShadow) || !(radiusPx > 0)) continue;
        if (cs.backgroundColor === "rgba(0, 0, 0, 0)") continue;
        const key = `${cs.backgroundColor}|${cs.borderRadius}|${cs.borderTopColor}|${hasShadow}`;
        const entry = cardTally.get(key) ?? {
          count: 0,
          spec: {
            background: cs.backgroundColor,
            borderColor: hasBorder ? cs.borderTopColor : undefined,
            borderWidth: hasBorder ? cs.borderTopWidth : undefined,
            radius: cs.borderRadius,
            shadow: hasShadow ? cs.boxShadow.slice(0, 80) : undefined,
            paddingPx: Math.round(parseFloat(cs.paddingTop)) || undefined,
          },
        };
        entry.count += 1;
        cardTally.set(key, entry);
      }
      cardSpec = [...cardTally.values()].sort((a, b) => b.count - a.count)[0]?.spec ?? null;

      let navSpec: Record<string, unknown> | null = null;
      const header = document.querySelector("header, nav");
      if (header) {
        const r = header.getBoundingClientRect();
        const cs = getComputedStyle(header);
        const firstLink = header.querySelector("a");
        navSpec = {
          heightPx: r.height > 30 && r.height < 200 ? Math.round(r.height) : undefined,
          background: cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : undefined,
          linkColor: firstLink ? getComputedStyle(firstLink).color : undefined,
        };
      }

      // Container width: widest centered block under 1600px
      let containerWidth: number | undefined;
      const candidates = [...document.querySelectorAll("main, section > div, header > div, [class*='container'], [class*='wrapper']")].slice(0, 200);
      const widthTally = new Map<number, number>();
      for (const el of candidates) {
        const r = el.getBoundingClientRect();
        const w = Math.round(r.width);
        if (w >= 720 && w <= 1440 && Math.abs((1440 - w) / 2 - r.left) < 40) {
          widthTally.set(w, (widthTally.get(w) ?? 0) + 1);
        }
      }
      containerWidth = [...widthTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      // Record elements to track for scroll behavior
      const marks = [...document.querySelectorAll("section, [class*='section'], h2")]
        .slice(0, 40)
        .map((el, i) => {
          (el as HTMLElement).dataset.__probe = String(i);
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return { i, top: r.top, opacity: parseFloat(cs.opacity), transform: cs.transform };
        });

      return {
        bodyFamily: (() => {
          const direct = firstFamily(bodyCs.fontFamily);
          return GENERIC_FAMILY.test(direct) ? (topFamily ?? direct) : direct;
        })(),
        bodySizePx: Math.round(bodySizePx),
        bodyLineHeight,
        headingFamily,
        headingWeight: headingWeight || undefined,
        headingSizes: [...headingSizes].sort((a, b) => a - b),
        headingTransform: [...transformTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
        bg: [...bg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
        txt: [...txt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
        button,
        containerWidth,
        inputSpec,
        cardSpec,
        navSpec,
        headingTexts,
        navItems,
        bodySample,
        faq,
        marks,
      };
    });

    // ---- Scroll probe: verify reveal/sticky behavior ----------------------
    const before = new Map(raw.marks.map((m) => [m.i, m]));
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(900);

    const after = await page.evaluate(() =>
      [...document.querySelectorAll("[data-__probe]")].map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          i: Number((el as HTMLElement).dataset.__probe),
          top: r.top,
          opacity: parseFloat(cs.opacity),
          transform: cs.transform,
        };
      }),
    );

    const scrollFindings: AnimationFinding[] = [];
    const stickyFindings: AnimationFinding[] = [];
    let revealed = 0;
    let stickies = 0;
    for (const a2 of after) {
      const b = before.get(a2.i);
      if (!b) continue;
      // reveal: opacity increased or transform changed as it entered view
      if (b.opacity < 0.9 && a2.opacity > b.opacity + 0.1) revealed++;
      else if (b.transform !== a2.transform && a2.opacity >= 0.9 && b.opacity < 0.9) revealed++;
      // sticky: page scrolled 1800px but element viewport-top barely moved
      if (Math.abs(a2.top - b.top) < 40 && b.top > 0 && b.top < 500) stickies++;
    }
    if (revealed > 0) {
      scrollFindings.push({
        pattern: "Scroll reveal (verified by rendered scroll probe)",
        evidence: [`${revealed} section(s) changed opacity/transform while scrolling`],
        confidence: "high",
      });
    }
    if (stickies > 0) {
      stickyFindings.push({
        pattern: "Sticky/pinned element (verified by rendered scroll probe)",
        evidence: [`${stickies} element(s) held viewport position across 1800px of scroll`],
        confidence: "high",
      });
    }

    // ---- Normalize palette -------------------------------------------------
    const palette: RenderedProbeResult["palette"] = [];
    for (const [color, weight] of raw.bg) {
      const hex = rgbToHex(color);
      if (hex) palette.push({ value: hex, weight: Math.round(weight), role: "background" });
    }
    for (const [color, weight] of raw.txt) {
      const hex = rgbToHex(color);
      if (hex) palette.push({ value: hex, weight: Math.round(weight), role: "text" });
    }
    const btnBg = raw.button?.background ? rgbToHex(String(raw.button.background)) : null;
    if (btnBg) palette.push({ value: btnBg, weight: 0, role: "accent" });

    return {
      method: "rendered",
      palette,
      typography: {
        bodyFamily: raw.bodyFamily,
        bodySizePx: raw.bodySizePx,
        bodyLineHeight: raw.bodyLineHeight,
        headingFamily: raw.headingFamily || undefined,
        headingWeight: raw.headingWeight,
        headingSizesPx: raw.headingSizes,
        headingTransform: raw.headingTransform,
      },
      button: raw.button
        ? {
            background: btnBg ?? undefined,
            color: raw.button.color ? (rgbToHex(String(raw.button.color)) ?? undefined) : undefined,
            radius: (raw.button.radius as string) || undefined,
            paddingY: raw.button.paddingY as number | undefined,
            paddingX: raw.button.paddingX as number | undefined,
            fontWeight: raw.button.fontWeight as number | undefined,
            transitionMs: raw.button.transitionMs as number | undefined,
            textTransform: (raw.button.textTransform as string) || undefined,
            letterSpacing: (raw.button.letterSpacing as string) || undefined,
          }
        : undefined,
      containerWidth: raw.containerWidth,
      components: {
        input: raw.inputSpec
          ? {
              background: raw.inputSpec.background ? (rgbToHex(String(raw.inputSpec.background)) ?? undefined) : undefined,
              borderColor: raw.inputSpec.borderColor ? (rgbToHex(String(raw.inputSpec.borderColor)) ?? undefined) : undefined,
              borderWidth: (raw.inputSpec.borderWidth as string) || undefined,
              radius: (raw.inputSpec.radius as string) || undefined,
              paddingY: raw.inputSpec.paddingY as number | undefined,
              paddingX: raw.inputSpec.paddingX as number | undefined,
              fontSizePx: raw.inputSpec.fontSizePx as number | undefined,
              heightPx: raw.inputSpec.heightPx as number | undefined,
              placeholder: raw.inputSpec.placeholder as string | undefined,
            }
          : undefined,
        card: raw.cardSpec
          ? {
              background: raw.cardSpec.background ? (rgbToHex(String(raw.cardSpec.background)) ?? undefined) : undefined,
              borderColor: raw.cardSpec.borderColor ? (rgbToHex(String(raw.cardSpec.borderColor)) ?? undefined) : undefined,
              borderWidth: (raw.cardSpec.borderWidth as string) || undefined,
              radius: (raw.cardSpec.radius as string) || undefined,
              shadow: (raw.cardSpec.shadow as string) || undefined,
              paddingPx: raw.cardSpec.paddingPx as number | undefined,
            }
          : undefined,
        nav: raw.navSpec
          ? {
              heightPx: raw.navSpec.heightPx as number | undefined,
              background: raw.navSpec.background ? (rgbToHex(String(raw.navSpec.background)) ?? undefined) : undefined,
              linkColor: raw.navSpec.linkColor ? (rgbToHex(String(raw.navSpec.linkColor)) ?? undefined) : undefined,
            }
          : undefined,
      },
      content: {
        headings: raw.headingTexts,
        navItems: raw.navItems,
        ctaText: (raw.button?.text as string) || undefined,
        bodySample: raw.bodySample || undefined,
        faq: raw.faq,
      },
      scrollFindings,
      stickyFindings,
    };
  } catch (err) {
    if (process.env.PROBE_DEBUG) console.error("[probe]", err);
    return null; // probe unavailable or site unreachable — caller falls back
  } finally {
    await browser?.close().catch(() => {});
  }
}
