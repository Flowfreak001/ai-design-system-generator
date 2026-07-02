// Component preview — a branded component-sheet HTML (states + form + nav)
// complementing preview.html's specimen view. Rendered in the extracted
// brand's own canvas/type/radius. Self-contained, iframe-safe.

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

export function generateComponentPreviewHtml(data: PreviewData): string {
  const { input, tokens } = data;
  const name = input.clientName || input.projectName;
  const c = (tokens?.color ?? {}) as Record<string, string>;
  const m = tokens?.metrics ?? null;
  const probe = (tokens as unknown as { renderedProbe?: { button?: Record<string, unknown> | null } })?.renderedProbe;

  const bg = c.background ?? input.brief.primaryColor ?? "#fafaf8";
  const isDark = lum(bg) < 0.5;
  const ink = c.ink && Math.abs(lum(c.ink) - lum(bg)) > 0.3 ? c.ink : isDark ? "#f5f5f5" : "#101115";
  const accent = c.accent ?? input.brief.primaryColor ?? (isDark ? "#ffffff" : "#111111");
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

  const fontLink = [...new Set([bodyFont, displayFont])]
    .filter((f) => !/^(inter)$/i.test(f))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
    .join("&");

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
  .row { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .btn { padding:${btnPadY}px ${btnPadX}px; border-radius:var(--radius); font-weight:${btnW}; font-size:14px; border:0; cursor:pointer; font-family:inherit; transition:all ${btnMs}ms ease; }
  .btn.primary { background:${esc(btnBg)}; color:${esc(btnColor)}; }
  .btn.primary:hover { filter:brightness(${isDark ? "1.12" : ".92"}); }
  .btn.secondary { background:transparent; color:var(--ink); border:1px solid var(--ink); }
  .btn.ghost { background:transparent; color:var(--muted); }
  .btn[disabled] { opacity:.45; cursor:not-allowed; }
  .nav { display:flex; justify-content:space-between; align-items:center; }
  .nav strong { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${Math.max(headingW, 600)}; }
  .nav a { font-size:14px; color:var(--muted); text-decoration:none; margin-left:16px; }
  .nav a.active { color:var(--accent); font-weight:600; }
  .field label { display:block; font-size:13px; font-weight:600; margin-bottom:6px; }
  .field input { width:100%; max-width:340px; padding:10px 12px; border:1px solid var(--line); border-radius:var(--radius); font-size:14px; background:var(--bg); color:var(--ink); font-family:inherit; }
  .field .error { border-color:#e5484d; } .err { color:#e5484d; font-size:12px; margin-top:4px; }
  .badge { display:inline-block; padding:3px 10px; border-radius:99px; font:600 11px/1.6 ui-monospace,monospace; text-transform:uppercase; letter-spacing:.06em; }
  .b1 { background:${mix(bg, accent, 0.16)}; color:var(--accent); }
  .b2 { background:${mix(bg, "#22a06b", 0.16)}; color:#22a06b; } .b3 { background:${mix(bg, "#b45309", 0.16)}; color:#b45309; }
  .card { border:1px solid var(--line); border-radius:var(--radius); padding:18px; max-width:280px; background:var(--bg); transition:transform ${btnMs}ms ease, box-shadow ${btnMs}ms ease; }
  .card:hover { transform:translateY(-3px); box-shadow:0 10px 26px -18px rgba(8,9,10,.5); }
  .card strong { font-family:'${esc(displayFont)}','${esc(bodyFont)}',sans-serif; font-weight:${Math.max(headingW, 600)}; }
  .faq summary { cursor:pointer; font-weight:600; font-size:14px; padding:10px 0; }
  .faq p { color:var(--muted); font-size:14px; padding-bottom:10px; }
  @media (prefers-reduced-motion: reduce){ .card,.btn{transition:none} }
</style>
</head>
<body>
<div class="grid">
  <div class="block nav-block"><div class="label">Navbar</div>
    <div class="nav"><strong>${esc(name)}</strong><span><a href="#" class="active">Services</a><a href="#">About</a><a href="#">FAQ</a><a href="#">Contact</a></span></div>
  </div>
  <div class="block"><div class="label">Buttons — states (${esc(btnBg)} / radius ${esc(radius)} / ${btnMs}ms${probe?.button ? " · measured" : " · derived"})</div>
    <div class="row"><button class="btn primary">Primary</button><button class="btn secondary">Secondary</button><button class="btn ghost">Ghost</button><button class="btn primary" disabled>Disabled</button></div>
  </div>
  <div class="block"><div class="label">Badges</div>
    <div class="row"><span class="badge b1">New</span><span class="badge b2">Completed</span><span class="badge b3">Pending</span></div>
  </div>
  <div class="block"><div class="label">Card — hover to lift</div>
    <div class="card"><strong style="font-size:15px">Card title</strong><p style="font-size:14px;color:var(--muted);margin-top:6px">Supporting copy with one proof point and a clear takeaway.</p></div>
  </div>
  <div class="block"><div class="label">Form — states</div>
    <div class="field"><label>Email</label><input placeholder="you@example.com" /></div>
    <div class="field" style="margin-top:12px"><label>Phone</label><input class="error" value="123" /><div class="err">Enter a valid phone number.</div></div>
  </div>
  <div class="block faq"><div class="label">FAQ accordion</div>
    <details open><summary>How fast do you respond?</summary><p>Within one business day — usually much faster.</p></details>
    <details><summary>Do you provide quotes up front?</summary><p>Yes, every job is quoted before work begins.</p></details>
  </div>
</div>
</body>
</html>`;
}
