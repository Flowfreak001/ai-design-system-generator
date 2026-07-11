"use client";

// Rich product purchase panel for the storefront PDP: price + save badge,
// stock, colour + size + quantity selectors, Add to cart / Buy it now (post to
// the Wix-hosted checkout), a limited-time countdown, fit scale, shipping perks
// and detail accordions. Selections are UI-level; checkout is product-level.
import { useEffect, useState } from "react";
import type { SectionTheme } from "@/components/sections/types";
import type { WixProduct } from "@/lib/integrations/wix/stores";

const SIZES = ["XS", "S", "M", "L", "XL"];

export function ProductDetail({ product, slug, theme }: { product: WixProduct; slug: string; theme: SectionTheme }) {
  const t = theme;
  const [size, setSize] = useState("XS");
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const savePct = savePercent(product.price, product.compareAtPrice);
  const dark = t.textColor;

  return (
    <div style={{ fontFamily: t.bodyFont, color: t.textColor }}>
      <h1 style={{ margin: 0, fontFamily: t.headingFont, fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 800, letterSpacing: "-0.02em" }}>{product.name}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{money(product.price)}</span>
        {product.compareAtPrice && product.compareAtPrice !== product.price ? (
          <span style={{ color: t.mutedTextColor, textDecoration: "line-through", fontSize: 17 }}>{money(product.compareAtPrice)}</span>
        ) : null}
        {savePct ? <span style={{ background: "#d7263d", color: "#fff", fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>Save {savePct}%</span> : null}
      </div>

      <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 0", fontSize: 14 }}>
        <span style={{ height: 9, width: 9, borderRadius: 999, background: product.inStock ? "#1a9e5f" : "#b45309" }} />
        {product.inStock ? "Item is in stock" : "Out of stock"}
      </p>

      <div style={{ height: 1, background: t.borderColor, margin: "20px 0" }} />

      {/* Colour */}
      <p style={label(t)}>Color</p>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {["#111", "#fff"].map((c, i) => (
          <button key={i} type="button" onClick={() => setColor(i)} aria-label={`Color ${i + 1}`}
            style={{ height: 40, width: 44, borderRadius: 10, background: c, border: `2px solid ${color === i ? dark : t.borderColor}`, cursor: "pointer", display: "grid", placeItems: "center" }}>
            {color === i ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c === "#fff" ? "#111" : "#fff"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4 4 10-10" /></svg> : null}
          </button>
        ))}
      </div>

      {/* Size */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
        <p style={{ ...label(t), margin: 0 }}>Size</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: t.mutedTextColor }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 15 6-6 6 6M9 9l3-3 9 9-6 6-9-9Z" /></svg> Size guide
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        {SIZES.map((s) => (
          <button key={s} type="button" onClick={() => setSize(s)}
            style={{ minWidth: 56, padding: "13px 14px", borderRadius: 10, border: `1.5px solid ${size === s ? dark : t.borderColor}`, background: t.backgroundColor, color: t.textColor, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{s}</button>
        ))}
      </div>

      {/* Quantity */}
      <p style={{ ...label(t), marginTop: 22 }}>Quantity</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 18, marginTop: 10, border: `1.5px solid ${t.borderColor}`, borderRadius: 10, padding: "8px 14px" }}>
        <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} style={stepBtn}>−</button>
        <span style={{ minWidth: 20, textAlign: "center", fontWeight: 600 }}>{qty}</span>
        <button type="button" aria-label="Increase" onClick={() => setQty((q) => q + 1)} style={stepBtn}>+</button>
      </div>

      {/* Actions */}
      <form method="post" action={`/s/${slug}/checkout`} style={{ marginTop: 26, display: "grid", gap: 12 }}>
        <input type="hidden" name="product" value={product.slug} />
        <input type="hidden" name="quantity" value={qty} />
        <button type="submit" disabled={!product.inStock}
          style={{ padding: "17px", background: dark, color: t.backgroundColor, border: "none", borderRadius: t.radius, fontSize: 13.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: product.inStock ? "pointer" : "not-allowed", opacity: product.inStock ? 1 : 0.5, display: "flex", justifyContent: "center", gap: 10 }}>
          <span>Add to cart · {money(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice !== product.price ? <span style={{ opacity: 0.6, textDecoration: "line-through" }}>{money(product.compareAtPrice)}</span> : null}
        </button>
        <button type="submit" disabled={!product.inStock}
          style={{ padding: "17px", background: t.backgroundColor, color: t.textColor, border: `1.5px solid ${dark}`, borderRadius: t.radius, fontSize: 13.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: product.inStock ? "pointer" : "not-allowed" }}>
          Buy it now
        </button>
      </form>

      {/* Limited time offer */}
      {savePct ? <Countdown theme={t} /> : null}

      {/* Fit scale */}
      <p style={{ ...label(t), marginTop: 28 }}>Fit</p>
      <div style={{ height: 5, background: t.borderColor, borderRadius: 999, marginTop: 12, position: "relative" }}>
        <span style={{ position: "absolute", left: "50%", top: -4, height: 13, width: 13, borderRadius: 999, background: dark, transform: "translateX(-50%)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12.5, color: t.mutedTextColor }}>
        <span>Small</span><span>True to size</span><span>Large</span>
      </div>

      {/* Perks */}
      <div style={{ marginTop: 26, display: "grid", gap: 12 }}>
        <Perk theme={t} icon="ship" text="Free shipping on orders over $100" />
        <Perk theme={t} icon="return" text="Free 30 day returns" />
      </div>

      {/* Accordions */}
      <div style={{ marginTop: 20 }}>
        {["Size and fit", "Care information", "Shipping and returns"].map((a) => (
          <div key={a} style={{ borderTop: `1px solid ${t.borderColor}` }}>
            <button type="button" onClick={() => setOpen(open === a ? null : a)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer", color: t.textColor, fontFamily: t.headingFont, fontSize: 16, fontWeight: 600 }}>
              {a}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={open === a ? "M5 12h14" : "M12 5v14M5 12h14"} /></svg>
            </button>
            {open === a ? <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.6, color: t.mutedTextColor }}>All products in this store are for demo purposes only. They have been generously provided.</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Countdown({ theme }: { theme: SectionTheme }) {
  const [left, setLeft] = useState(3 * 86400);
  useEffect(() => { const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(id); }, []);
  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  const cell = (n: number, l: string) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: theme.headingFont, fontSize: 26, fontWeight: 800 }}>{String(n).padStart(2, "0")}</div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: theme.mutedTextColor, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
    </div>
  );
  return (
    <div style={{ marginTop: 22, background: theme.surfaceColor, borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: theme.headingFont, fontSize: 19, fontWeight: 700 }}>Limited time offer</p>
      <p style={{ margin: "6px 0 16px", fontSize: 14, color: theme.mutedTextColor }}>Exclusive styles at 30% off, only for three days!</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 22 }}>{cell(d, "days")}{cell(h, "hours")}{cell(m, "minutes")}{cell(s, "seconds")}</div>
    </div>
  );
}

function Perk({ theme, icon, text }: { theme: SectionTheme; icon: string; text: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g = icon === "ship"
    ? <><path d="M3 7l9-4 9 4-9 4-9-4Z" {...p} /><path d="M3 7v10l9 4 9-4V7" {...p} /></>
    : <><path d="M21 12a9 9 0 1 1-3-6.7" {...p} /><path d="M21 4v5h-5" {...p} /></>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ color: theme.textColor }}>{g}</svg>
      <span>{text}</span>
    </div>
  );
}

const stepBtn: React.CSSProperties = { background: "none", border: "none", fontSize: 20, lineHeight: 1, cursor: "pointer", color: "inherit" };
const label = (t: SectionTheme): React.CSSProperties => ({ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textColor });
const money = (v: string) => (v ? (/^\d/.test(v) ? `$${v}` : v) : "");
function savePercent(price?: string, compare?: string) {
  const p = Number(price), c = Number(compare);
  if (!p || !c || c <= p) return 0;
  return Math.round((1 - p / c) * 100);
}
