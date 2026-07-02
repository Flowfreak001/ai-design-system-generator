// Component preview — a component-sheet HTML rendered from MEASURED specs:
// nav, buttons, inputs (login/signup forms), and cards use the styles the
// probe measured on the live reference site; brief data fills the copy.
// Every section carries a provenance caption (measured vs derived).
// Self-contained, iframe-safe.

import type { PreviewData } from "./preview-generator";

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

type InputSpec = { background?: string; borderColor?: string; borderWidth?: string; radius?: string; paddingY?: number; paddingX?: number; fontSizePx?: number; heightPx?: number; placeholder?: string };
type CardSpec = { background?: string; borderColor?: string; borderWidth?: string; radius?: string; shadow?: string; paddingPx?: number };
type NavSpec = { heightPx?: number; background?: string; linkColor?: string };

export function generateComponentPreviewHtml(data: PreviewData): string {
  const { input, tokens } = data;
  const name = input.clientName || input.projectName;
  const c = (tokens?.color ?? {}) as Record<string, string>;
  const m = tokens?.metrics ?? null;
  const probe = (tokens as unknown as {
    renderedProbe?: {
      button?: Record<string, unknown> | null;
      content?: { headings?: { text: string; sizePx: number }[]; navItems?: string[]; ctaText?: string; bodySample?: string; faq?: { q: string; a: string }[] };
      components?: { input?: InputSpec; card?: CardSpec; nav?: NavSpec };
      headingTransform?: string;
    };
  })?.renderedProbe;
  const live = probe?.content;
  const comp = probe?.components ?? {};

  // ---- Theme (same derivation as the specimen page) ------------------------
  const bg = c.background ?? input.brief.primaryColor ?? "#fafaf8";
  const isDark = lum(bg) < 0.5;
  const ink = c.ink && Math.abs(lum(c.ink) - lum(bg)) > 0.3 ? c.ink : isDark ? "#f5f5f5" : "#101115";
  const accent = c.accent ?? input.brief.primaryColor ?? (isDark ? "#ffffff" : "#111111");
  const accents = Object.entries(c).filter(([k]) => k.startsWith("accent")).map(([, v]) => v);
  const surface = mix(bg, isDark ? "#ffffff" : "#000000", 0.05);
  const line = mix(bg, isDark ? "#ffffff" : "#000000", 0.14);
  const muted = mix(ink, bg, 0.35);

  const bodyFont = String(tokens?.typography?.primary ?? "Inter");
  const displayFont = String(tokens?.typography?.display ?? bodyFont);
  const headingW = m?.headingWeight ?? 700;
  const radius = String(probe?.button?.radius ?? m?.button?.radius ?? "10px");
  const btnBg = String(probe?.button?.background ?? accent);
  const btnColor = String(probe?.button?.color ?? (lum(btnBg) > 0.5 ? "#111111" : "#ffffff"));
  const btnPadY = (probe?.button?.paddingY as number) ?? m?.button?.paddingY ?? 11;
  const btnPadX = (probe?.button?.paddingX as number) ?? m?.button?.paddingX ?? 20;
  const btnW = (probe?.button?.fontWeight as number) ?? m?.button?.fontWeight ?? 600;
  const btnMs = (probe?.button?.transitionMs as number) ?? m?.button?.transitionMs ?? 200;
  const measuredBtn = Boolean(probe?.button);

  // ---- Measured component specs with derived fallbacks ---------------------
  const inp = comp.input;
  const inputCss = {
    background: inp?.background ?? bg,
    borderColor: inp?.borderColor ?? line,
    borderWidth: inp?.borderWidth ?? "1px",
    radius: inp?.radius ?? radius,
    padY: inp?.paddingY ?? 10,
    padX: inp?.paddingX ?? 12,
    fontPx: inp?.fontSizePx ?? 14,
  };
  const inputCap = inp
    ? `${inputCss.borderWidth} ${inputCss.borderColor} border / radius ${inputCss.radius} / ${inputCss.padY}×${inputCss.padX}px${inp.heightPx ? ` / h${inp.heightPx}px` : ""} · measured from a live input`
    : "derived from theme — no input measurable on the reference page";
  const livePlaceholder = inp?.placeholder;

  const card = comp.card;
  const cardCss = {
    background: card?.background ?? bg,
    border: card?.borderColor ? `${card.borderWidth ?? "1px"} solid ${card.borderColor}` : `1px solid ${line}`,
    radius: card?.radius ?? radius,
    shadow: card?.shadow ?? "none",
    padding: card?.paddingPx ?? 18,
  };
  const cardCap = card
    ? `${cardCss.background} / radius ${cardCss.radius}${card.shadow ? " / shadow measured" : ""}${card.paddingPx ? ` / ${card.paddingPx}px padding` : ""} · measured (most common card pattern)`
    : "derived from theme — no repeated card pattern measurable";

  const nav = comp.nav;
  const navCap = nav
    ? `${nav.heightPx ? `h${nav.heightPx}px / ` : ""}${nav.background ?? "transparent"}${nav.linkColor ? ` / links ${nav.linkColor}` : ""} · measured from the live header`
    : "derived from theme";
  const navLinkColor = nav?.linkColor ?? muted;

  // ---- Content from the live site / brief ----------------------------------
  const brief = input.brief;
  const servicesFromBrief = (brief.services ?? "")
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const navItems = (live?.navItems?.length ? live.navItems : brief.keyItems.length ? brief.keyItems : servicesFromBrief).slice(0, 4);
  if (!navItems.length) navItems.push(brief.businessType?.trim() ?? name);
  const liveSubheading = (live?.headings ?? []).filter((h) => h.sizePx <= 30)[0]?.text;
  const cardTitle = liveSubheading ?? servicesFromBrief[0] ?? brief.keyItems[0] ?? brief.businessType?.trim() ?? name;
  const cardBody = live?.bodySample
    ? live.bodySample.slice(0, 140)
    : brief.goal?.trim()
      ? `Supports the core goal: ${brief.goal.trim().replace(/\.$/, "").toLowerCase()}.`
      : `Copy to be written for ${brief.targetAudience?.trim() || "the target audience"}.`;
  const ctaLabel = live?.ctaText || brief.ctaGoal?.trim() || brief.goal?.trim() || name;
  const badgeSources = accents.length ? accents : [accent];

  // FAQ: real Q&A scraped from the live page when present; otherwise derive
  // pairs whose answers actually answer the question (offering = services or
  // business type — never the project goal sentence).
  const offering = servicesFromBrief.length
    ? servicesFromBrief.slice(0, 4).join(", ")
    : brief.businessType?.trim()
      ? `${name} is a ${brief.businessType.trim().toLowerCase()}${brief.targetAudience?.trim() ? ` built for ${brief.targetAudience.trim()}` : ""}.`
      : `See the ${name} brief for the offering.`;
  const faqPairs: { q: string; a: string }[] = live?.faq?.length
    ? live.faq.slice(0, 3)
    : [
        { q: `What does ${name} offer?`, a: offering },
        {
          q: "How do I get started?",
          a: `${ctaLabel}${brief.goal?.trim() ? ` — ${brief.goal.trim().replace(/\.$/, "").toLowerCase()}` : ""}.`,
        },
      ];
  const faqCap = live?.faq?.length
    ? "questions and answers taken from the live reference site"
    : "no FAQ found on the reference site — pairs derived from the brief";

  const fontLink = [...new Set([bodyFont, displayFont])]
    .filter((f) => !/^(inter)$/i.test(f))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
    .join("&");

  const block = (label: string, cap: string, body: string) => `
  <div class="block"><div class="label">${esc(label)}</div>${body}<div class="cap">${esc(cap)}</div></div>`;

  const field = (labelText: string, type: string, placeholder: string, value = "", error = "") => `
    <div class="field"><label>${esc(labelText)}</label>
      <input type="${type}" placeholder="${esc(placeholder)}" ${value ? `value="${esc(value)}"` : ""} class="${error ? "error" : ""}" />
      ${error ? `<div class="err">${esc(error)}</div>` : ""}</div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — Component Preview</title>
${fontLink ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?${fontLink}&display=swap" rel="stylesheet" />` : ""}
<style>
  :root { --bg:${bg}; --ink:${esc(ink)}; --accent:${esc(accent)}; --surface:${surface}; --line:${line}; --muted:${muted}; --radius:${esc(radius)}; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:'${esc(bodyFont)}', ui-sans-serif, system-ui, sans-serif; background:var(--bg); color:var(--ink); padding:32px 24px; }
  .grid { max-width:880px; margin:0 auto; display:grid; gap:20px; }
  .block { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); padding:20px; }
  .label { font:600 10px/1 ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:12px; }
  .cap { margin-top:12px; font:400 11px/1.6 ui-monospace,monospace; color:var(--muted); }
  .row { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .btn { padding:${btnPadY}px ${btnPadX}px; border-radius:var(--radius); font-weight:${btnW}; font-size:14px; border:0; cursor:pointer; font-family:inherit; transition:all ${btnMs}ms ease; text-transform:${String(probe?.button?.textTransform ?? "none") || "none"}; letter-spacing:${String(probe?.button?.letterSpacing ?? "normal") || "normal"}; }
  .btn.primary { background:${esc(btnBg)}; color:${esc(btnColor)}; }
  .btn.primary:hover { filter:brightness(${isDark ? "1.12" : ".92"}); }
  .btn.secondary { background:transparent; color:var(--ink); border:1px solid var(--ink); }
  .btn.ghost { background:transparent; color:var(--muted); }
  .btn[disabled] { opacity:.45; cursor:not-allowed; }
  .nav { display:flex; justify-content:space-between; align-items:center; ${nav?.heightPx ? `height:${Math.min(nav.heightPx, 96)}px;` : ""} ${nav?.background ? `background:${esc(nav.background)}; border-radius:calc(var(--radius) - 4px); padding:0 16px; margin:-6px; ` : ""} }
  .nav strong { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${Math.max(headingW, 600)}; ${nav?.background && lum(nav.background) < 0.5 ? "color:#fff;" : ""} }
  .nav a { font-size:14px; color:${esc(navLinkColor)}; text-decoration:none; margin-left:16px; }
  .nav a.active { color:var(--accent); font-weight:600; }
  .field label { display:block; font-size:13px; font-weight:600; margin-bottom:6px; }
  .field input { width:100%; max-width:340px; padding:${inputCss.padY}px ${inputCss.padX}px; border:${esc(inputCss.borderWidth)} solid ${esc(inputCss.borderColor)}; border-radius:${esc(inputCss.radius)}; font-size:${inputCss.fontPx}px; background:${esc(inputCss.background)}; color:var(--ink); font-family:inherit; }
  .field input:focus { outline:2px solid ${esc(accent)}; outline-offset:1px; }
  .field .error { border-color:#e5484d; } .err { color:#e5484d; font-size:12px; margin-top:4px; }
  .field + .field { margin-top:12px; }
  .forms { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); }
  .form-card { background:${esc(cardCss.background)}; border:${esc(cardCss.border)}; border-radius:${esc(cardCss.radius)}; padding:${cardCss.padding + 4}px; }
  .form-card h4 { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${Math.max(headingW, 600)}; font-size:16px; margin-bottom:12px; }
  .form-card .btn { margin-top:14px; width:100%; }
  .form-card .alt { margin-top:10px; text-align:center; font-size:12px; color:var(--muted); }
  .badge { display:inline-block; padding:3px 10px; border-radius:99px; font:600 11px/1.6 ui-monospace,monospace; text-transform:uppercase; letter-spacing:.06em; }
  .card { background:${esc(cardCss.background)}; border:${esc(cardCss.border)}; border-radius:${esc(cardCss.radius)}; box-shadow:${esc(cardCss.shadow)}; padding:${cardCss.padding}px; max-width:300px; transition:transform ${btnMs}ms ease, box-shadow ${btnMs}ms ease; }
  .card:hover { transform:translateY(-3px); }
  .card strong { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${Math.max(headingW, 600)}; }
  .faq summary { cursor:pointer; font-weight:600; font-size:14px; padding:10px 0; }
  .faq p { color:var(--muted); font-size:14px; padding-bottom:10px; }
  @media (prefers-reduced-motion: reduce){ .card,.btn{transition:none} }
</style>
</head>
<body>
<div class="grid">
  ${block("Navbar", navCap, `
    <div class="nav"><strong>${esc(name)}</strong><span>${navItems.map((it, i) => `<a href="#"${i === 0 ? ' class="active"' : ""}>${esc(it)}</a>`).join("")}</span></div>`)}

  ${block("Buttons — states", `${esc(btnBg)} / ${esc(btnColor)} / radius ${esc(radius)} / ${btnPadY}×${btnPadX}px / w${btnW} / ${btnMs}ms · ${measuredBtn ? "measured from the live CTA" : "derived"}`, `
    <div class="row"><button class="btn primary">${esc(ctaLabel)}</button><button class="btn secondary">${esc(navItems[1] ?? cardTitle)}</button><button class="btn ghost">${esc(navItems[2] ?? cardTitle)}</button><button class="btn primary" disabled>${esc(ctaLabel)}</button></div>`)}

  ${block("Forms — sign in / sign up", inputCap, `
    <div class="forms">
      <div class="form-card"><h4>Sign in to ${esc(name)}</h4>
        ${field("Email", "email", livePlaceholder ?? "you@company.com")}
        ${field("Password", "password", "••••••••")}
        <button class="btn primary">Sign in</button>
        <p class="alt">No account? ${esc(ctaLabel)}</p>
      </div>
      <div class="form-card"><h4>${esc(ctaLabel)}</h4>
        ${field("Work email", "email", livePlaceholder ?? "you@company.com")}
        ${field("Password", "password", "8+ characters", "short", "Password must be at least 8 characters.")}
        <button class="btn primary">${esc(ctaLabel)}</button>
        <p class="alt">By continuing you agree to the ${esc(name)} terms.</p>
      </div>
    </div>`)}

  ${block("Card — hover to lift", cardCap, `
    <div class="card"><strong style="font-size:15px">${esc(cardTitle)}</strong><p style="font-size:14px;color:var(--muted);margin-top:6px">${esc(cardBody)}</p></div>`)}

  ${block("Badges", `chromatic accents from the extracted palette (${badgeSources.slice(0, 3).join(", ")})`, `
    <div class="row">${badgeSources.slice(0, 3).map((a, i) => `<span class="badge" style="background:${esc(mix(bg, a, 0.16))};color:${esc(a)}">${esc(["New", "Active", "Beta"][i])}</span>`).join("")}
      <span class="badge" style="background:${esc(mix(bg, "#22a06b", 0.16))};color:#22a06b">Completed</span></div>`)}

  ${block("FAQ accordion", faqCap, `
    <div class="faq">${faqPairs.map((f, i) => `
      <details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div>`)}
</div>
</body>
</html>`;
}
