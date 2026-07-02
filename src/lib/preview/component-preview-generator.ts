// Component preview — a compact component-sheet HTML (states + form + nav)
// complementing preview.html's page-level view. Self-contained, iframe-safe.

import type { PreviewData } from "./preview-generator";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function generateComponentPreviewHtml(data: PreviewData): string {
  const { input, tokens } = data;
  const name = input.clientName || input.projectName;
  const colors = Object.values(tokens?.color ?? {}).map(String);
  const accent = colors[1] ?? colors[0] ?? "#2563eb";
  const font = String(Object.values(tokens?.typography ?? {})[0] ?? "Inter");
  const radius = String(Object.values(tokens?.radius ?? {})[0] ?? "12px");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — Component Preview</title>
<style>
  :root { --accent:${esc(accent)}; --radius:${esc(radius)}; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:${esc(font)}, ui-sans-serif, system-ui, sans-serif; background:#fafaf8; color:#26282e; padding:32px 24px; }
  .grid { max-width:880px; margin:0 auto; display:grid; gap:20px; }
  .block { background:#fff; border:1px solid #e6e2dd; border-radius:var(--radius); padding:20px; }
  .label { font:600 10px/1 ui-monospace,monospace; letter-spacing:.14em; text-transform:uppercase; color:#8a8f9a; margin-bottom:12px; }
  .row { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .btn { padding:11px 20px; border-radius:10px; font-weight:600; font-size:14px; border:0; cursor:pointer; }
  .btn.primary { background:var(--accent); color:#fff; }
  .btn.primary:hover { filter:brightness(.94); }
  .btn.secondary { background:#fff; color:#101115; border:1px solid #d6d1ca; }
  .btn.ghost { background:transparent; color:#6b7280; }
  .btn[disabled] { opacity:.45; cursor:not-allowed; }
  .nav { display:flex; justify-content:space-between; align-items:center; }
  .nav a { font-size:14px; color:#5a5e68; text-decoration:none; margin-left:16px; }
  .nav a.active { color:var(--accent); font-weight:600; }
  .field label { display:block; font-size:13px; font-weight:600; margin-bottom:6px; }
  .field input { width:100%; max-width:340px; padding:10px 12px; border:1px solid #d6d1ca; border-radius:10px; font-size:14px; }
  .field .error { border-color:#e5484d; } .err { color:#e5484d; font-size:12px; margin-top:4px; }
  .badge { display:inline-block; padding:3px 10px; border-radius:99px; font:600 11px/1.6 ui-monospace,monospace; text-transform:uppercase; letter-spacing:.06em; }
  .b1 { background:color-mix(in srgb, var(--accent) 12%, #fff); color:var(--accent); }
  .b2 { background:#e6f5ee; color:#22a06b; } .b3 { background:#fdf3e2; color:#b45309; }
  .card { border:1px solid #e6e2dd; border-radius:var(--radius); padding:18px; max-width:280px; transition:transform .25s ease, box-shadow .25s ease; }
  .card:hover { transform:translateY(-3px); box-shadow:0 10px 26px -18px rgba(8,9,10,.35); }
  .faq summary { cursor:pointer; font-weight:600; font-size:14px; padding:10px 0; }
  .faq p { color:#5a5e68; font-size:14px; padding-bottom:10px; }
  @media (prefers-reduced-motion: reduce){ .card{transition:none} }
</style>
</head>
<body>
<div class="grid">
  <div class="block nav-block"><div class="label">Navbar</div>
    <div class="nav"><strong>${esc(name)}</strong><span><a href="#" class="active">Services</a><a href="#">About</a><a href="#">FAQ</a><a href="#">Contact</a></span></div>
  </div>
  <div class="block"><div class="label">Buttons — states</div>
    <div class="row"><button class="btn primary">Primary</button><button class="btn secondary">Secondary</button><button class="btn ghost">Ghost</button><button class="btn primary" disabled>Disabled</button></div>
  </div>
  <div class="block"><div class="label">Badges</div>
    <div class="row"><span class="badge b1">New</span><span class="badge b2">Completed</span><span class="badge b3">Pending</span></div>
  </div>
  <div class="block"><div class="label">Card — hover to lift</div>
    <div class="card"><strong style="font-size:15px">Card title</strong><p style="font-size:14px;color:#5a5e68;margin-top:6px">Supporting copy with one proof point and a clear takeaway.</p></div>
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
