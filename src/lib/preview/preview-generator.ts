// Preview generator — renders a self-contained preview.html from the design
// system data (tokens + brief + animation summary). No external assets, no
// scripts required to view; safe to iframe with srcDoc.

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

function paletteEntries(tokens: TokensAnalysis | null, brandRefs: string[]) {
  const entries = Object.entries(tokens?.color ?? {}).map(([name, value]) => ({
    name,
    value: String(value),
  }));
  if (entries.length) return { entries, assumed: false };
  const refs = brandRefs.filter((r) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(r));
  if (refs.length)
    return {
      entries: refs.map((value, i) => ({ name: i === 0 ? "primary" : `color-${i + 1}`, value })),
      assumed: true,
    };
  return {
    entries: [
      { name: "primary", value: "#111827" },
      { name: "accent", value: "#2563eb" },
      { name: "background", value: "#fafaf8" },
    ],
    assumed: true,
  };
}

export function generatePreviewHtml(data: PreviewData): string {
  const { input, tokens, animation } = data;
  const name = input.clientName || input.projectName;
  const { entries: palette, assumed } = paletteEntries(tokens, input.brief.brandRefs);
  const accent = palette[1]?.value ?? palette[0].value;
  const dark = palette[0].value;
  const font = String(Object.values(tokens?.typography ?? {})[0] ?? "Inter");
  const radius = String(Object.values(tokens?.radius ?? {})[0] ?? "12px");
  const services = input.brief.keyItems.slice(0, 3);
  while (services.length < 3) services.push(["Core service", "Second service", "Third service"][services.length]);

  const swatches = palette
    .map(
      (c) => `<div class="swatch"><div class="chip" style="background:${esc(c.value)}"></div><code>${esc(c.value)}</code><span>${esc(c.name)}</span></div>`,
    )
    .join("");

  const motionLines = animation
    ? [
        `Motion style: ${animation.globalMotionStyle}`,
        animation.detectedLibraries.length
          ? `Libraries on current site: ${animation.detectedLibraries.join(", ")}`
          : "No animation libraries detected on the current site.",
        `Reduced motion: ${animation.reducedMotionSupport}`,
        ...animation.recommendedAnimationRules.slice(0, 3),
      ]
    : ["No animation analysis yet — premium baseline: fade-up reveals, subtle hover lifts, reduced-motion respected."];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — Design System Preview</title>
<style>
  :root { --accent:${esc(accent)}; --dark:${esc(dark)}; --radius:${esc(radius)}; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:${esc(font)}, ui-sans-serif, system-ui, sans-serif; background:#fafaf8; color:#26282e; line-height:1.6; }
  .wrap { max-width:960px; margin:0 auto; padding:40px 24px; }
  section { margin-bottom:48px; }
  .label { font:600 11px/1 ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase; color:#8a8f9a; margin-bottom:14px; }
  h1,h2,h3 { color:#101115; letter-spacing:-.02em; }
  .brandbar { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; background:#fff; border:1px solid #e6e2dd; border-radius:var(--radius); }
  .brandbar strong { font-size:17px; }
  .swatches { display:flex; flex-wrap:wrap; gap:14px; }
  .swatch { text-align:center; font-size:11px; color:#6b7280; }
  .swatch .chip { width:84px; height:56px; border-radius:10px; border:1px solid #e6e2dd; margin-bottom:6px; }
  .swatch code { display:block; font-size:11px; color:#26282e; }
  .type h1 { font-size:44px; line-height:1.08; } .type h2 { font-size:30px; margin-top:10px; } .type p { max-width:60ch; margin-top:10px; }
  .btn { display:inline-block; padding:12px 22px; border-radius:10px; font-weight:600; font-size:14px; text-decoration:none; margin-right:10px; }
  .btn.primary { background:var(--accent); color:#fff; }
  .btn.secondary { background:#fff; color:#101115; border:1px solid #d6d1ca; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
  .card { background:#fff; border:1px solid #e6e2dd; border-radius:var(--radius); padding:20px; }
  .card .dot { width:34px; height:34px; border-radius:9px; background:color-mix(in srgb, var(--accent) 14%, #fff); margin-bottom:12px; border:1px solid #e6e2dd; }
  .hero { background:#fff; border:1px solid #e6e2dd; border-radius:var(--radius); padding:48px 32px; }
  .hero h1 { font-size:36px; max-width:20ch; } .hero p { max-width:48ch; margin:12px 0 20px; color:#5a5e68; }
  .cta { background:var(--dark); color:#fff; border-radius:var(--radius); padding:36px 32px; display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between; align-items:center; }
  .cta h3 { color:#fff; font-size:22px; }
  ul.notes { padding-left:18px; color:#5a5e68; font-size:14px; }
  .assumed { font-size:12px; color:#b45309; background:#fdf3e2; border:1px solid #f5d9a8; padding:6px 10px; border-radius:8px; display:inline-block; margin-top:10px; }
  footer { border-top:1px solid #e6e2dd; padding-top:16px; color:#8a8f9a; font-size:12px; }
  @media (max-width:640px){ .type h1{font-size:32px} .hero h1{font-size:26px} }
</style>
</head>
<body>
<div class="wrap">
  <section>
    <div class="brandbar"><strong>${esc(name)}</strong><span style="font-size:13px;color:#6b7280">${esc(input.brief.businessType ?? "Design system preview")}</span></div>
  </section>

  <section>
    <div class="label">Color palette</div>
    <div class="swatches">${swatches}</div>
    ${assumed ? '<div class="assumed">Palette assumed — no tokens extracted yet. Run "Analyze website" for grounded values.</div>' : ""}
  </section>

  <section class="type">
    <div class="label">Typography — ${esc(font)}</div>
    <h1>Heading one sets the outcome.</h1>
    <h2>Heading two frames each section</h2>
    <p>Body text stays at 16–17px with relaxed line height. It explains the benefit plainly, keeps sentences short, and always ends near one clear action.</p>
  </section>

  <section>
    <div class="label">Buttons</div>
    <a class="btn primary" href="#">Primary action</a>
    <a class="btn secondary" href="#">Secondary</a>
  </section>

  <section>
    <div class="label">Hero example</div>
    <div class="hero">
      <h1>${esc(input.brief.goal?.trim() ? `${input.brief.goal.trim().replace(/\.$/, "")} — handled.` : `Work with ${name}, without the runaround.`)}</h1>
      <p>For ${esc(input.brief.targetAudience?.trim() || "your customers")} — clear answers, fast responses, and one obvious next step.</p>
      <a class="btn primary" href="#">Get started</a>
      <a class="btn secondary" href="#">See how it works</a>
    </div>
  </section>

  <section>
    <div class="label">Service / feature cards</div>
    <div class="cards">
      ${services
        .map(
          (s) => `<div class="card"><div class="dot"></div><h3 style="font-size:16px">${esc(s)}</h3><p style="font-size:14px;color:#5a5e68;margin-top:6px">Two lines on the concrete benefit, ending in a proof point.</p></div>`,
        )
        .join("")}
    </div>
  </section>

  <section>
    <div class="label">CTA section</div>
    <div class="cta"><h3>Ready when you are.</h3><a class="btn primary" href="#">${esc(input.brief.goal?.toLowerCase().includes("quote") ? "Get a quote" : "Get started")}</a></div>
  </section>

  <section>
    <div class="label">Animation summary</div>
    <ul class="notes">${motionLines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
  </section>

  <section>
    <div class="label">Responsive notes</div>
    <ul class="notes">
      <li>Mobile-first; breakpoints 640 / 768 / 1024 / 1280.</li>
      <li>Tap targets ≥44px; no horizontal scroll; type scales down via clamp.</li>
      <li>Cards stack to one column; hero copy leads on small screens.</li>
    </ul>
  </section>

  <footer>Generated by Project OS — design system preview for ${esc(name)}.</footer>
</div>
</body>
</html>`;
}
