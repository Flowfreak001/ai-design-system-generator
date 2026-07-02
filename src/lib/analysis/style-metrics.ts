// Style metrics extractor — measures concrete layout/typography/interaction
// values from a site's real CSS so downstream documents state what the site
// actually does instead of hardcoded defaults. Every field is optional;
// generators must label anything missing as an assumption.

export type StyleMetrics = {
  breakpoints: number[]; // @media min/max-width px values, sorted
  containerWidth?: number; // most common max-width in the 720–1600px band
  spacingBase?: 4 | 8; // inferred spacing rhythm
  spacingScale: number[]; // most-used spacing values (px), ascending
  typeScale: number[]; // most-used font sizes (px), ascending
  bodyFontSizePx?: number;
  bodyLineHeight?: number;
  headingWeight?: number; // strongest h1/h2 weight found
  button?: {
    radius?: string;
    fontWeight?: number;
    paddingY?: number;
    paddingX?: number;
    transitionMs?: number;
  };
};

const MEDIA_RE = /@media[^{]*\((?:min|max)-width:\s*(\d{3,4})(?:\.\d+)?px/gi;
const MAXW_RE = /max-width\s*:\s*(\d{3,4})px/gi;
const FS_RE = /font-size\s*:\s*(\d{2}(?:\.\d+)?)px/gi;
const SPACE_RE = /(?:padding|margin|gap|row-gap|column-gap)[^:;{}]*:\s*([^;}]{1,60})/gi;
const PX_RE = /(\d{1,3})px/g;
const BODY_BLOCK_RE = /(?:^|[}\s])(?:body|html)\s*(?:,[^{]*)?\{([^}]+)\}/gi;
const H_BLOCK_RE = /(?:^|[}\s,])h[12][^a-z{}]*\{([^}]+)\}/gi;
const BTN_BLOCK_RE = /(?:\.(?:btn|button|cta)[\w-]*|button|\[type=["']?submit["']?\])[^{}]*\{([^}]+)\}/gi;

function counts(values: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

function topSorted(values: number[], top: number, min = 0, max = Infinity): number[] {
  const c = counts(values.filter((v) => v >= min && v <= max));
  return [...c.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([v]) => v)
    .sort((a, b) => a - b);
}

function matchNums(css: string, re: RegExp): number[] {
  const out: number[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push(Math.round(parseFloat(m[1])));
  return out;
}

export function extractStyleMetrics(css: string): StyleMetrics {
  // Breakpoints
  const breakpoints = [...new Set(matchNums(css, MEDIA_RE))]
    .filter((v) => v >= 320 && v <= 1920)
    .sort((a, b) => a - b)
    .slice(0, 6);

  // Container width: most common max-width in the content band
  const widths = matchNums(css, MAXW_RE).filter((v) => v >= 720 && v <= 1600);
  const widthCounts = counts(widths);
  const containerWidth = [...widthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Spacing values + base rhythm
  const spacingVals: number[] = [];
  SPACE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SPACE_RE.exec(css))) {
    PX_RE.lastIndex = 0;
    let px: RegExpExecArray | null;
    while ((px = PX_RE.exec(m[1]))) {
      const v = parseInt(px[1], 10);
      if (v > 0 && v <= 200) spacingVals.push(v);
    }
  }
  const spacingScale = topSorted(spacingVals, 8, 2, 200);
  let spacingBase: 4 | 8 | undefined;
  if (spacingVals.length >= 10) {
    const div8 = spacingVals.filter((v) => v % 8 === 0).length / spacingVals.length;
    const div4 = spacingVals.filter((v) => v % 4 === 0).length / spacingVals.length;
    if (div8 >= 0.55) spacingBase = 8;
    else if (div4 >= 0.55) spacingBase = 4;
  }

  // Type scale
  const typeScale = topSorted(matchNums(css, FS_RE), 8, 10, 80);

  // Body font size / line height
  let bodyFontSizePx: number | undefined;
  let bodyLineHeight: number | undefined;
  BODY_BLOCK_RE.lastIndex = 0;
  while ((m = BODY_BLOCK_RE.exec(css))) {
    const block = m[1];
    const fs = /font-size\s*:\s*([\d.]+)(px|rem)/i.exec(block);
    if (fs && !bodyFontSizePx) {
      bodyFontSizePx = Math.round(parseFloat(fs[1]) * (fs[2] === "rem" ? 16 : 1));
    }
    const lh = /line-height\s*:\s*([\d.]+)\s*[;}]?/i.exec(block);
    if (lh && !bodyLineHeight) {
      const v = parseFloat(lh[1]);
      if (v > 0.8 && v < 3) bodyLineHeight = v;
    }
  }

  // Heading weight
  let headingWeight: number | undefined;
  H_BLOCK_RE.lastIndex = 0;
  while ((m = H_BLOCK_RE.exec(css))) {
    const w = /font-weight\s*:\s*(\d{3})/.exec(m[1]);
    if (w) headingWeight = Math.max(headingWeight ?? 0, parseInt(w[1], 10));
  }

  // Button styling — first meaningful button-ish block
  let button: StyleMetrics["button"];
  BTN_BLOCK_RE.lastIndex = 0;
  while ((m = BTN_BLOCK_RE.exec(css))) {
    const b = m[1];
    const radius = /border-radius\s*:\s*([^;]{1,24})/.exec(b)?.[1]?.trim();
    const weight = /font-weight\s*:\s*(\d{3})/.exec(b)?.[1];
    const pad = /padding\s*:\s*(\d{1,3})px(?:\s+(\d{1,3})px)?/.exec(b);
    const trans = /transition[^;]*?(\d{2,4})ms/.exec(b);
    if (radius || weight || pad || trans) {
      button = {
        radius,
        fontWeight: weight ? parseInt(weight, 10) : undefined,
        paddingY: pad ? parseInt(pad[1], 10) : undefined,
        paddingX: pad?.[2] ? parseInt(pad[2], 10) : undefined,
        transitionMs: trans ? parseInt(trans[1], 10) : undefined,
      };
      break;
    }
  }

  return {
    breakpoints,
    containerWidth,
    spacingBase,
    spacingScale,
    typeScale,
    bodyFontSizePx,
    bodyLineHeight,
    headingWeight,
    button,
  };
}
