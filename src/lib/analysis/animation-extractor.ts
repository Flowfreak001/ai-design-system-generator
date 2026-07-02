// Animation & interaction pattern extractor — Design Intelligence Pipeline.
//
// Detects animation/interaction patterns from a website's static HTML + CSS
// using heuristic signature matching (no AI, no browser). Produces the
// ANIMATION_ANALYSIS.json structure. Playwright-based scroll probing is
// prepared as hooks (see PlaywrightAnimationProbe) but not implemented yet —
// when detection is weak the module degrades honestly (confidence: low,
// explicit assumptions, sensible recommended rules).

export type AnimationFinding = {
  pattern: string;
  evidence: string[];
  confidence: "high" | "medium" | "low";
};

export type AnimationAnalysis = {
  globalMotionStyle: string;
  detectedLibraries: string[];
  scrollAnimations: AnimationFinding[];
  entranceAnimations: AnimationFinding[];
  hoverInteractions: AnimationFinding[];
  parallaxEffects: AnimationFinding[];
  stickyPinnedSections: AnimationFinding[];
  textAnimations: AnimationFinding[];
  timingAndEasing: string[];
  reducedMotionSupport: string;
  animationQualityNotes: string[];
  recommendedAnimationRules: string[];
  meta: {
    sourceUrl: string | null;
    confidence: "high" | "medium" | "low";
    method: "static-heuristics" | "fallback";
    assumptions: string[];
  };
};

// ---- library + pattern signatures ----------------------------------------

const LIBRARY_SIGNATURES: [string, RegExp][] = [
  ["GSAP", /gsap|greensock/i],
  ["ScrollTrigger", /scrolltrigger/i],
  ["ScrollSmoother", /scroll-?smoother/i],
  ["AOS (Animate On Scroll)", /data-aos|aos\.js|aos\.css/i],
  ["Framer Motion", /framer-motion|data-framer|__framer/i],
  ["Motion One / motion", /\bmotion\.(dev|min\.js)|motion-one/i],
  ["Lenis smooth scroll", /\blenis\b/i],
  ["Locomotive Scroll", /locomotive-scroll|data-scroll-container/i],
  ["Swiper", /swiper/i],
  ["Lottie", /lottie/i],
  ["Anime.js", /anime(\.min)?\.js/i],
  ["Rellax (parallax)", /rellax/i],
  ["SplitType / SplitText", /split-?(type|text)/i],
  ["Typed.js", /typed(\.min)?\.js/i],
  ["WOW.js", /wow(\.min)?\.js/i],
];

type PatternRule = {
  bucket: keyof Pick<
    AnimationAnalysis,
    | "scrollAnimations"
    | "entranceAnimations"
    | "hoverInteractions"
    | "parallaxEffects"
    | "stickyPinnedSections"
    | "textAnimations"
  >;
  pattern: string;
  re: RegExp;
  confidence: AnimationFinding["confidence"];
};

const PATTERN_RULES: PatternRule[] = [
  // Scroll-driven
  { bucket: "scrollAnimations", pattern: "Scroll reveal (AOS-style)", re: /data-aos=["']?[\w-]+/gi, confidence: "high" },
  { bucket: "scrollAnimations", pattern: "Fade-up sections", re: /fade[-_]?up|fadeInUp|reveal[-_]?up/gi, confidence: "medium" },
  { bucket: "scrollAnimations", pattern: "Generic reveal-on-scroll classes", re: /\b(reveal|in-?view|scroll-?(reveal|animate|fx))\b/gi, confidence: "medium" },
  { bucket: "scrollAnimations", pattern: "ScrollTrigger-driven animation", re: /scrolltrigger/gi, confidence: "high" },
  { bucket: "scrollAnimations", pattern: "Horizontal scroll section", re: /horizontal-?scroll|scroll-?x\b|data-scroll-direction=["']?horizontal/gi, confidence: "medium" },
  { bucket: "scrollAnimations", pattern: "Counter / stat count-up animation", re: /count-?up|counter|data-count|stat-?number/gi, confidence: "medium" },
  { bucket: "scrollAnimations", pattern: "Card stagger animation", re: /stagger|data-aos-delay|animation-delay/gi, confidence: "medium" },
  { bucket: "scrollAnimations", pattern: "Image movement on scroll", re: /data-speed|data-lag|img-?parallax|image-?scroll/gi, confidence: "medium" },
  // Entrance
  { bucket: "entranceAnimations", pattern: "Hero entrance animation", re: /hero[^"']{0,40}(animate|fade|reveal|enter)|animate-hero/gi, confidence: "medium" },
  { bucket: "entranceAnimations", pattern: "Keyframe entrance (fade/slide in)", re: /@keyframes\s+[\w-]*(fade|slide|enter|in)[\w-]*/gi, confidence: "high" },
  { bucket: "entranceAnimations", pattern: "Animate.css-style classes", re: /animate__|animated\s+(fadeIn|slideIn|zoomIn)/gi, confidence: "high" },
  // Hover / micro-interactions
  { bucket: "hoverInteractions", pattern: "Hover transitions (CSS :hover + transition)", re: /:hover\s*\{[^}]*(transform|opacity|box-shadow|scale)/gi, confidence: "high" },
  { bucket: "hoverInteractions", pattern: "Card hover lift", re: /hover[:_-][^;{]{0,30}(translate|lift|-?raise|scale)/gi, confidence: "medium" },
  { bucket: "hoverInteractions", pattern: "Button micro-interactions", re: /(btn|button)[^{}]{0,60}(transition|transform|hover)/gi, confidence: "medium" },
  // Parallax
  { bucket: "parallaxEffects", pattern: "Parallax effect", re: /parallax|data-rellax|background-attachment:\s*fixed/gi, confidence: "high" },
  // Sticky / pinned
  { bucket: "stickyPinnedSections", pattern: "Sticky section (position: sticky)", re: /position:\s*sticky/gi, confidence: "high" },
  { bucket: "stickyPinnedSections", pattern: "Pinned / ScrollTrigger pin", re: /\bpin(ned)?\b[^a-z]|data-pin|pinSpacing/gi, confidence: "medium" },
  // Text
  { bucket: "textAnimations", pattern: "Split-text / text reveal", re: /split-?(text|type|line|word|char)|text-?reveal|char-?reveal/gi, confidence: "high" },
  { bucket: "textAnimations", pattern: "Typewriter effect", re: /typewriter|typed(\.js)?|typing-?effect/gi, confidence: "medium" },
];

const EASING_RE = /(cubic-bezier\([^)]+\)|ease(-in-out|-in|-out)?|spring|linear)\b/gi;
const DURATION_RE = /(transition(-duration)?|animation(-duration)?)\s*:\s*[^;]{0,80}?(\d+(?:\.\d+)?m?s)/gi;

// ---- fetching --------------------------------------------------------------

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 1_500_000;
const MAX_STYLESHEETS = 5;

function isFetchableUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return false;
    const h = u.hostname;
    if (
      h === "localhost" ||
      /^127\.|^10\.|^192\.168\.|^0\.|^169\.254\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h.endsWith(".internal") ||
      h.endsWith(".local")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": "ProjectOS-DesignIntelligence/0.1 (+analysis)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, MAX_BYTES);
  } catch {
    return null;
  }
}

/** Fetch page HTML plus up to N linked same-origin stylesheets. */
export async function fetchSiteSource(url: string): Promise<{ html: string; css: string } | null> {
  if (!isFetchableUrl(url)) return null;
  const html = await fetchText(url);
  if (!html) return null;

  const cssChunks: string[] = [];
  const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi;
  const hrefs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html)) && hrefs.length < MAX_STYLESHEETS) {
    const href = m[1] ?? m[2];
    if (href) hrefs.push(href);
  }
  for (const href of hrefs) {
    try {
      const abs = new URL(href, url).toString();
      if (!isFetchableUrl(abs)) continue;
      const css = await fetchText(abs);
      if (css) cssChunks.push(css);
    } catch {
      /* skip bad hrefs */
    }
  }
  // Inline <style> blocks count as CSS too.
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleRe.exec(html))) cssChunks.push(m[1]);

  return { html, css: cssChunks.join("\n") };
}

// ---- extraction ------------------------------------------------------------

function findEvidence(source: string, re: RegExp, cap = 4): string[] {
  const out: string[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) && out.length < cap) {
    out.push(m[0].slice(0, 80).replace(/\s+/g, " ").trim());
    if (!re.global) break;
  }
  return out;
}

export function extractAnimationAnalysis(
  source: { html: string; css: string },
  sourceUrl: string,
): AnimationAnalysis {
  const combined = `${source.html}\n${source.css}`;

  const detectedLibraries = LIBRARY_SIGNATURES.filter(([, re]) => re.test(combined)).map(
    ([name]) => name,
  );

  const buckets: Record<PatternRule["bucket"], AnimationFinding[]> = {
    scrollAnimations: [],
    entranceAnimations: [],
    hoverInteractions: [],
    parallaxEffects: [],
    stickyPinnedSections: [],
    textAnimations: [],
  };

  for (const rule of PATTERN_RULES) {
    const evidence = findEvidence(combined, rule.re);
    if (evidence.length) {
      buckets[rule.bucket].push({ pattern: rule.pattern, evidence, confidence: rule.confidence });
    }
  }

  // Timing & easing values actually used on the site.
  const easings = [...new Set(findEvidence(combined, EASING_RE, 8))];
  const durations = [...new Set(findEvidence(combined, DURATION_RE, 8))];
  const timingAndEasing = [...durations, ...easings].slice(0, 10);

  const reducedMotion = /prefers-reduced-motion/i.test(combined)
    ? "Respected — a prefers-reduced-motion media query is present."
    : "Not detected — no prefers-reduced-motion query found; add one in the rebuild.";

  const totalFindings = Object.values(buckets).reduce((n, b) => n + b.length, 0);
  const confidence: AnimationAnalysis["meta"]["confidence"] =
    totalFindings >= 6 || detectedLibraries.length >= 2
      ? "high"
      : totalFindings >= 2
        ? "medium"
        : "low";

  const globalMotionStyle = describeMotionStyle(detectedLibraries, buckets, timingAndEasing);

  const notes: string[] = [];
  if (detectedLibraries.length)
    notes.push(`Animation stack detected: ${detectedLibraries.join(", ")}.`);
  if (buckets.stickyPinnedSections.length)
    notes.push("Sticky/pinned sections present — plan scroll choreography deliberately.");
  if (!/prefers-reduced-motion/i.test(combined))
    notes.push("Site does not honor reduced motion — an accessibility gap to fix in the rebuild.");
  if (totalFindings === 0)
    notes.push("No explicit animation signatures found in static source — motion may be JS-driven at runtime (verify with the Playwright probe when enabled).");

  return {
    globalMotionStyle,
    detectedLibraries,
    ...buckets,
    timingAndEasing,
    reducedMotionSupport: reducedMotion,
    animationQualityNotes: notes,
    recommendedAnimationRules: recommendRules(buckets, detectedLibraries, confidence),
    meta: {
      sourceUrl,
      confidence,
      method: "static-heuristics",
      assumptions: [
        "Derived from static HTML/CSS signature matching — runtime-injected animation may be missed.",
        "Confidence per finding reflects signature specificity, not measured motion.",
      ],
    },
  };
}

function describeMotionStyle(
  libs: string[],
  buckets: Record<string, AnimationFinding[]>,
  timing: string[],
): string {
  const scrollHeavy = buckets.scrollAnimations.length + buckets.parallaxEffects.length >= 3;
  const hasHover = buckets.hoverInteractions.length > 0;
  if (libs.some((l) => /GSAP|ScrollTrigger|Locomotive|Lenis/.test(l)) || scrollHeavy) {
    return "Scroll-choreographed and expressive — motion is a core part of the page narrative.";
  }
  if (hasHover && buckets.entranceAnimations.length) {
    return "Polished and restrained — entrance reveals plus hover micro-interactions, no heavy scroll choreography.";
  }
  if (hasHover) return "Minimal — mostly hover transitions; little to no scroll-driven motion.";
  return timing.length
    ? "Subtle — CSS transitions present but no distinct motion identity detected."
    : "Static — no meaningful motion detected in the source.";
}

function recommendRules(
  buckets: Record<string, AnimationFinding[]>,
  libs: string[],
  confidence: "high" | "medium" | "low",
): string[] {
  const rules: string[] = [];
  if (buckets.scrollAnimations.length)
    rules.push("Recreate scroll reveals as fade-up (16–24px rise, 500–700ms, ease-out), triggered once per section.");
  if (buckets.parallaxEffects.length)
    rules.push("Use restrained parallax (≤10% translate) and disable it under prefers-reduced-motion.");
  if (buckets.stickyPinnedSections.length)
    rules.push("Keep sticky/pinned sections, but reserve them for one key storytelling moment.");
  if (buckets.textAnimations.length)
    rules.push("Limit split-text reveals to the hero headline; body text should not animate per-character.");
  if (buckets.hoverInteractions.length)
    rules.push("Standardize hover: 150–300ms color/shadow transitions, ≤4px lift, no bounce.");
  if (libs.length === 0 && confidence === "low") {
    rules.push(
      "No motion detected — propose a minimal premium baseline: hero entrance stagger, fade-up sections, button micro-interactions.",
    );
  }
  rules.push("Always honor prefers-reduced-motion by disabling non-essential animation.");
  return rules;
}

// ---- fallback + entry point -------------------------------------------------

export function fallbackAnimationAnalysis(sourceUrl: string | null, reason: string): AnimationAnalysis {
  return {
    globalMotionStyle:
      "Unknown — source could not be inspected. Recommend a minimal premium baseline.",
    detectedLibraries: [],
    scrollAnimations: [],
    entranceAnimations: [],
    hoverInteractions: [],
    parallaxEffects: [],
    stickyPinnedSections: [],
    textAnimations: [],
    timingAndEasing: [],
    reducedMotionSupport: "Unknown — could not inspect the site.",
    animationQualityNotes: [`Analysis fell back: ${reason}.`],
    recommendedAnimationRules: [
      "Hero entrance: staggered fade-up for badge, headline, copy, CTAs (600–800ms, ease-out).",
      "Sections: fade-up on first scroll into view, one orchestrated moment per view.",
      "Cards: subtle hover lift (≤4px) with 200–300ms transitions.",
      "Buttons: micro-interactions only — color/scale ≤1.03, never bounce.",
      "Honor prefers-reduced-motion by disabling non-essential animation.",
    ],
    meta: {
      sourceUrl,
      confidence: "low",
      method: "fallback",
      assumptions: [
        "No site source was available; rules are a safe premium default based on content type.",
      ],
    },
  };
}

/** Main entry: analyze a URL. Never throws — falls back safely. */
export async function analyzeAnimations(url: string | null): Promise<AnimationAnalysis> {
  if (!url) return fallbackAnimationAnalysis(null, "no website or reference URL on the project");
  if (!isFetchableUrl(url)) return fallbackAnimationAnalysis(url, "URL is not publicly fetchable");
  const source = await fetchSiteSource(url);
  if (!source) return fallbackAnimationAnalysis(url, "site could not be fetched");
  try {
    return extractAnimationAnalysis(source, url);
  } catch (err) {
    return fallbackAnimationAnalysis(url, `extraction error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ---- Playwright hooks (future) ----------------------------------------------

/**
 * Contract for the future Playwright-based probe. When browser automation is
 * added, implement this interface in the worker and merge its findings into
 * extractAnimationAnalysis output (raising confidence).
 */
export interface PlaywrightAnimationProbe {
  /** Capture the above-the-fold screenshot. */
  captureAboveTheFold(url: string): Promise<Buffer>;
  /** Scroll the page in steps, capturing a screenshot at each position. */
  captureScrollSteps(url: string, steps: number): Promise<Buffer[]>;
  /** Diff element positions/opacity between scroll steps to detect motion. */
  detectElementMotion(url: string): Promise<AnimationFinding[]>;
  /** Detect sticky/pinned behavior by comparing element viewport offsets. */
  detectStickyPinned(url: string): Promise<AnimationFinding[]>;
}
