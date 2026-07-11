"use client";

// Multi-tenant storefront renderer — the hosted store chrome + page sections.
// Chrome: a looping announcement marquee, a header (brand, page nav, search /
// account / cart with a slide-in cart drawer), and a rich dark footer (feature
// strip, link columns, newsletter, oversized outline wordmark). Page sections
// render through the same sucrase engine the editor uses.
import { useState } from "react";
import { DynamicSectionRenderer } from "@/components/section-library/dynamic-renderer";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { CanvasSection, StyleGuideCanvas } from "@/lib/canvas";
import type { SectionTheme } from "@/components/sections/types";
import type { LibraryDefaultContent } from "@/lib/section-library/manual-sections";

export type SiteNavItem = { name: string; href: string; active: boolean };

const ANNOUNCE = "New customers save 10% with code WELCOME10 · Free shipping on orders over $100";

export function StorefrontRenderer({
  siteName,
  nav,
  sections,
  style,
}: {
  siteName: string;
  nav: SiteNavItem[];
  sections: CanvasSection[];
  style?: StyleGuideCanvas | null;
}) {
  const theme: SectionTheme = createSectionTheme(style ?? undefined);
  const [cartOpen, setCartOpen] = useState(false);
  const t = theme;

  return (
    <div style={{ background: t.backgroundColor, color: t.textColor, fontFamily: t.bodyFont, minHeight: "100dvh" }}>
      {/* Looping announcement marquee */}
      <style>{`@keyframes sf-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media (prefers-reduced-motion: reduce){.sf-track{animation:none!important}}`}</style>
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: t.textColor, color: t.backgroundColor, padding: "8px 0", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
        <div className="sf-track" style={{ display: "inline-block", animation: "sf-marquee 28s linear infinite" }}>
          {[0, 1].map((k) => (
            <span key={k} style={{ display: "inline-block" }}>
              {Array.from({ length: 4 }).map((_, i) => <span key={i} style={{ padding: "0 32px" }}>{ANNOUNCE}</span>)}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16, padding: "16px 24px", background: t.backgroundColor, borderBottom: `1px solid ${t.borderColor}`, backdropFilter: "saturate(180%) blur(6px)" }}>
        <nav style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
          {nav.map((n) => (
            <a key={n.href} href={n.href} style={{ fontSize: 12.5, fontWeight: n.active ? 700 : 500, letterSpacing: "0.06em", textTransform: "uppercase", color: n.active ? t.textColor : t.mutedTextColor, textDecoration: "none", whiteSpace: "nowrap" }}>{n.name}</a>
          ))}
        </nav>
        <a href={nav[0]?.href ?? "#"} style={{ fontFamily: t.headingFont, fontSize: 20, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", color: t.textColor, textDecoration: "none", textAlign: "center" }}>{siteName}</a>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18 }}>
          <IconBtn label="Search">{icon("search")}</IconBtn>
          <IconBtn label="Account">{icon("user")}</IconBtn>
          <IconBtn label="Cart" onClick={() => setCartOpen(true)}>{icon("bag")}</IconBtn>
        </div>
      </header>

      <main>
        {sections
          .filter((s) => s.status !== "rejected")
          .map((s) =>
            s.custom?.code ? (
              <DynamicSectionRenderer key={s.id} code={s.custom.code} mode={s.custom.mode} content={(s.content ?? {}) as LibraryDefaultContent} theme={theme} />
            ) : (
              <FallbackBlock key={s.id} content={s.content} theme={theme} />
            ),
          )}
      </main>

      <StoreFooter siteName={siteName} theme={t} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} theme={t} />
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "grid", placeItems: "center", padding: 2 }}>{children}</button>
  );
}

function icon(name: string) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="m20 20-3.2-3.2" {...p} /></>,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4 21a8 8 0 0 1 16 0" {...p} /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /></>,
  };
  return <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

// ── Cart drawer — slide-in from the right; action pinned to the bottom. ──
function CartDrawer({ open, onClose, theme }: { open: boolean; onClose: () => void; theme: SectionTheme }) {
  const t = theme;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,14,13,0.45)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .25s", zIndex: 50 }} />
      <aside style={{ position: "fixed", top: 0, right: 0, height: "100dvh", width: "min(420px, 92vw)", background: t.backgroundColor, color: t.textColor, boxShadow: "-16px 0 40px rgba(0,0,0,0.18)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .3s cubic-bezier(.22,1,.36,1)", zIndex: 60, display: "flex", flexDirection: "column", fontFamily: t.bodyFont }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${t.borderColor}` }}>
          <p style={{ margin: 0, fontFamily: t.headingFont, fontSize: 16, fontWeight: 700, letterSpacing: "0.02em" }}>Your cart</p>
          <button type="button" aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.mutedTextColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "grid", placeContent: "center", textAlign: "center", color: t.mutedTextColor }}>
          <div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ margin: "0 auto" }}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
            <p style={{ margin: "14px 0 0", fontSize: 14 }}>Your cart is empty.</p>
          </div>
        </div>

        {/* Bottom action — pinned under the cart contents */}
        <div style={{ borderTop: `1px solid ${t.borderColor}`, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 14 }}>
            <span style={{ color: t.mutedTextColor }}>Subtotal</span>
            <span style={{ fontWeight: 700 }}>$0.00</span>
          </div>
          <button type="button" disabled style={{ width: "100%", padding: "15px", background: t.buttonBgColor, color: t.buttonTextColor, border: "none", borderRadius: t.radius, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, cursor: "not-allowed" }}>Checkout</button>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: t.mutedTextColor, textAlign: "center" }}>Secure checkout by Wix</p>
        </div>
      </aside>
    </>
  );
}

// ── Rich store footer ──
function StoreFooter({ siteName, theme }: { siteName: string; theme: SectionTheme }) {
  const t = theme;
  const features = [
    { title: "New customers get 15% off", text: "on your first purchase" },
    { title: "Free shipping", text: "on orders over $100" },
    { title: "Buy now, pay later", text: "flexible checkout" },
  ];
  const cols = [
    { head: "Help", links: ["FAQ", "Contact", "Size Chart"] },
    { head: "Company", links: ["About", "Blog", "Careers"] },
  ];
  return (
    <footer style={{ marginTop: 8, background: "#0e0e10", color: "#fff", fontFamily: t.bodyFont }}>
      <style>{`.sf-fcols{grid-template-columns:1.4fr repeat(2,0.8fr) 1.6fr}@media(max-width:900px){.sf-fcols{grid-template-columns:1fr 1fr}}@media(max-width:560px){.sf-fcols{grid-template-columns:1fr}}`}</style>
      {/* Feature strip */}
      <div style={{ background: t.backgroundColor, color: t.textColor, borderRadius: "0 0 22px 22px", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {features.map((f, i) => (
            <div key={i} style={{ textAlign: "center", padding: "8px 20px", borderLeft: i === 0 ? "none" : `1px solid ${t.borderColor}` }}>
              <p style={{ margin: 0, fontFamily: t.headingFont, fontSize: 17, fontWeight: 700 }}>{f.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: t.mutedTextColor }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 24px" }}>
        <div className="sf-fcols" style={{ display: "grid", gap: 32, alignItems: "start" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 240 }}>
            All products in this store are for demo purposes only.
          </p>
          {cols.map((c) => (
            <div key={c.head}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em" }}>{c.head}</p>
              {c.links.map((l) => (
                <a key={l} href="#" style={{ display: "block", marginTop: 14, fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          ))}
          <div>
            <p style={{ margin: 0, fontFamily: t.headingFont, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 }}>Sign up for offers and get 10% off</p>
            <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Join our newsletter for the latest updates.</p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)", borderRadius: t.radius, padding: "4px 4px 4px 16px" }}>
              <input placeholder="Your email" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
              <button type="button" aria-label="Subscribe" style={{ height: 36, width: 36, borderRadius: 8, background: t.accentColor, color: "#fff", border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Oversized outline wordmark */}
        <div style={{ marginTop: 40, fontFamily: t.headingFont, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", fontSize: "clamp(56px, 15vw, 200px)", lineHeight: 0.9, color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden" }}>{siteName}</div>

        <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20, fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {["instagram", "tiktok", "facebook"].map((s) => (
              <span key={s} style={{ height: 30, width: 30, borderRadius: 999, background: "rgba(255,255,255,0.12)", display: "grid", placeItems: "center", color: "#fff" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
              </span>
            ))}
          </div>
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

function FallbackBlock({ content, theme }: { content?: CanvasSection["content"]; theme: SectionTheme }) {
  const c = content ?? {};
  if (!c.title && !c.subtitle && !(c.items?.length)) return null;
  return (
    <section style={{ padding: "72px 24px", background: theme.backgroundColor, color: theme.textColor }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {c.eyebrow ? <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, color: theme.accentColor }}>{c.eyebrow}</p> : null}
        {c.title ? <h2 style={{ margin: "10px 0 0", fontFamily: theme.headingFont, fontSize: 34, fontWeight: 700 }}>{c.title}</h2> : null}
        {c.subtitle ? <p style={{ margin: "10px 0 0", fontSize: 16, color: theme.mutedTextColor }}>{c.subtitle}</p> : null}
      </div>
    </section>
  );
}
