// Simple line icons for the Add Elements panel, keyed by ElementItem.icon.
// SVG only (per the button/icon convention); falls back to the "div" icon.

import type { ReactNode } from "react";

const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
const P = (d: string) => <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />;

export const ELEMENT_ICONS: Record<string, ReactNode> = {
  div: <svg {...s}><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /></svg>,
  flex: <svg {...s}><rect x="3" y="6" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="10" y="6" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="17" y="6" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" /></svg>,
  grid: <svg {...s}><rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" /></svg>,
  heading: <svg {...s}><path d="M6 5v14M18 5v14M6 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  paragraph: <svg {...s}>{P("M5 6h14M5 10h14M5 14h10M5 18h7")}</svg>,
  button: <svg {...s}><rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" strokeWidth="1.6" /></svg>,
  image: <svg {...s}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.6" />{P("m4.5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 16.5")}</svg>,
  icon: <svg {...s}><circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>,
  svg: <svg {...s}><path d="M12 4 5 8v8l7 4 7-4V8l-7-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  divider: <svg {...s}>{P("M4 12h16")}</svg>,
  spacer: <svg {...s}>{P("M4 6h16M4 18h16M12 9v6")}</svg>,
  badge: <svg {...s}><rect x="5" y="8" width="14" height="8" rx="4" stroke="currentColor" strokeWidth="1.6" /></svg>,
  label: <svg {...s}><rect x="4" y="8" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />{P("m16 8 4 4-4 4")}</svg>,
  video: <svg {...s}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />{P("m10 9.5 5 2.5-5 2.5v-5Z")}</svg>,
  youtube: <svg {...s}><rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />{P("m10 9.5 5 2.5-5 2.5v-5Z")}</svg>,
  lottie: <svg {...s}><path d="M4 16c4 0 4-8 8-8s4 8 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  code: <svg {...s}>{P("m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12")}</svg>,
  html: <svg {...s}>{P("m8 8-4 4 4 4M16 8l4 4-4 4")}</svg>,
  card: <svg {...s}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M4 9h16")}</svg>,
  cards: <svg {...s}><rect x="3" y="5" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="5" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>,
  stats: <svg {...s}>{P("M5 19V9M12 19V5M19 19v-7")}</svg>,
  logos: <svg {...s}><circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" /><rect x="10.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" /><path d="M18 9.5 20.5 14h-5L18 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  list: <svg {...s}><circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="17" r="1" fill="currentColor" />{P("M9 7h11M9 12h11M9 17h11")}</svg>,
  accordion: <svg {...s}><rect x="4" y="4" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="4" y="11" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />{P("m15 15 2 2 2-2")}</svg>,
  tabs: <svg {...s}>{P("M4 9h5V5")}<rect x="4" y="9" width="16" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.6" /></svg>,
  carousel: <svg {...s}><rect x="7" y="6" width="10" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" />{P("M4 8v8M20 8v8")}</svg>,
  marquee: <svg {...s}>{P("M3 9h18M3 15h18M8 9l-3 6M16 9l-3 6")}</svg>,
  sticky: <svg {...s}><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M9 10h6M9 13h6")}</svg>,
  form: <svg {...s}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M8 9h8M8 13h8M8 17h4")}</svg>,
  gallery: <svg {...s}><rect x="3" y="4" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="4" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="14" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="14" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" /></svg>,
  quote: <svg {...s}>{P("M7 7c-2 1-3 3-3 6h4v-4H7M17 7c-2 1-3 3-3 6h4v-4h-3")}</svg>,
  pricing: <svg {...s}><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4")}</svg>,
  team: <svg {...s}><circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />{P("M6 19c1-3 3-4 6-4s5 1 6 4")}</svg>,
  mockup: <svg {...s}><rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M9 20h6M12 17v3")}</svg>,
  cta: <svg {...s}><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="10" width="5" height="4" rx="2" stroke="currentColor" strokeWidth="1.4" /></svg>,
  faq: <svg {...s}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />{P("M9.5 9.5a2.5 2.5 0 0 1 3.5 2c0 1.5-1.5 1.5-1.5 3")}<circle cx="11.5" cy="16.5" r="0.8" fill="currentColor" /></svg>,
  compare: <svg {...s}><rect x="3" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>,
  process: <svg {...s}><circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" /><circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />{P("M8 12h8")}</svg>,
  footer: <svg {...s}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M3 15h18M7 18h4")}</svg>,
  navbar: <svg {...s}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M3 9h18M7 6.5h4")}</svg>,
  hero: <svg {...s}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />{P("M7 10h7M7 13h5M7 16h9")}</svg>,
};
