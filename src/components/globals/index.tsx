"use client";

// GLOBAL components — site-wide bands reused across pages (announcement bar,
// cookie consent, etc). Theme-token driven, editable slots, no hardcoded brand
// content. Rendered through the "block" SectionType like other bands, but
// registered with kind: "global" so the builder treats them as site-wide.
//
// Patterns adapted (accelerator only) from common shadcn/Magic UI layouts,
// normalized to our rules. See docs/COMPONENT_SOURCES.md.

import type { SectionProps, SectionTheme } from "../sections/types";
import { resolveTheme, btnRadius } from "../sections/section-theme";

const grad = (t: SectionTheme) => `linear-gradient(135deg, ${t.accentColor}, color-mix(in srgb, ${t.accentColor} 55%, #0b0b12))`;
const dark = (t: SectionTheme) => `color-mix(in srgb, ${t.textColor} 90%, #000)`;
const make = (fn: (t: SectionTheme, p: SectionProps) => React.ReactNode): React.FC<SectionProps> => (p) => <>{fn(resolveTheme(p.theme), p)}</>;

// Thin promo/announcement strip with a message + inline link.
export const AnnouncementBar = make((t, p) => (
  <div className="flex items-center justify-center gap-3 px-6 py-2.5 text-center text-[13px] font-medium" style={{ background: grad(t), color: "#fff", fontFamily: t.bodyFont }}>
    <span>{p.title ?? p.description ?? "New: something worth announcing is now live."}</span>
    <span className="hidden items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold sm:inline-flex" style={{ background: "rgba(255,255,255,0.16)" }}>{p.primaryButtonLabel ?? "Learn more"} →</span>
  </div>
));

// Bottom cookie-consent band (rendered inline in the editor preview).
export const CookieBanner = make((t, p) => (
  <div className="px-6 py-4" style={{ background: t.backgroundColor, fontFamily: t.bodyFont }}>
    <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: dark(t) }}>
      <p className="text-[13px] leading-relaxed" style={{ color: "#fff", opacity: 0.85 }}>{p.description ?? "We use cookies to improve your experience. Choose which cookies you allow."}</p>
      <div className="flex shrink-0 gap-2">
        <span className="px-4 py-2 text-[13px] font-semibold" style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: btnRadius(t) }}>{p.secondaryButtonLabel ?? "Decline"}</span>
        <span className="px-4 py-2 text-[13px] font-semibold" style={{ background: t.accentColor, color: "#fff", borderRadius: btnRadius(t) }}>{p.primaryButtonLabel ?? "Accept all"}</span>
      </div>
    </div>
  </div>
));
