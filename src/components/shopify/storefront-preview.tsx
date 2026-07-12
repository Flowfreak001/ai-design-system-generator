"use client";

// Editor-only React preview of the Shopify storefront. It renders the SAME
// structured section data that the Liquid generator consumes, using mock Shopify
// data (products/collections). It is never exported — the export path is Liquid.
// Renders full-width inside app chrome (Context A: normal CSS responsive is fine).

import { useEffect, useRef, useState } from "react";
import { resolveSchemes, type BrandTokens, type ShopifyPage, type ShopifySectionInstance } from "@/modules/shopify";

type Settings = Record<string, string | number | boolean>;

const MOCK_PRODUCTS = [
  { title: "Linen throw pillow", price: "$48", hue: 28 },
  { title: "Stoneware mug", price: "$24", hue: 200 },
  { title: "Oak serving board", price: "$65", hue: 40 },
  { title: "Ceramic vase", price: "$52", hue: 340 },
  { title: "Wool blanket", price: "$120", hue: 260 },
  { title: "Brass candlestick", price: "$38", hue: 45 },
  { title: "Glass carafe", price: "$34", hue: 180 },
  { title: "Cotton tote", price: "$22", hue: 100 },
];

function s(settings: Settings | undefined, key: string, fallback = ""): string {
  const v = settings?.[key];
  return v == null ? fallback : String(v);
}
function num(settings: Settings | undefined, key: string, fallback: number): number {
  const v = Number(settings?.[key]);
  return Number.isFinite(v) ? v : fallback;
}
function bool(settings: Settings | undefined, key: string, fallback: boolean): boolean {
  const v = settings?.[key];
  return v == null ? fallback : Boolean(v);
}
/** Very small rich-text guard — the schema stores simple <p> HTML. */
function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Placeholder({ hue = 220, label, ratio = "4 / 3" }: { hue?: number; label?: string; ratio?: string }) {
  return (
    <div
      className="ff-ph"
      style={{
        aspectRatio: ratio,
        background: `linear-gradient(135deg, hsl(${hue} 42% 90%), hsl(${(hue + 40) % 360} 38% 80%))`,
      }}
    >
      {label ? <span>{label}</span> : (
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      )}
    </div>
  );
}

export function AnnouncementBar() {
  return <div className="ff-announce">Free shipping on orders over $50</div>;
}

export function Header({ storeName }: { storeName: string }) {
  return (
    <header className="ff-header">
      <button className="ff-hicon" aria-label="Menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className="ff-wordmark">{storeName || "Your store"}</div>
      <nav className="ff-nav">
        <span>Shop</span><span>Collections</span><span>About</span><span>Contact</span>
      </nav>
      <button className="ff-hicon" aria-label="Cart">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 12H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
      </button>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ff-footer">
      <div className="ff-footcols">
        {["Shop", "Company", "Support"].map((t) => (
          <div key={t}>
            <div className="ff-foottitle">{t}</div>
            <span>Link one</span><span>Link two</span><span>Link three</span>
          </div>
        ))}
        <div>
          <div className="ff-foottitle">Newsletter</div>
          <div className="ff-sub"><input placeholder="Email address" readOnly /><button>Join</button></div>
        </div>
      </div>
      <div className="ff-footbar">Considered products, made to last.</div>
    </footer>
  );
}

function Hero({ settings }: { settings?: Settings }) {
  const align = s(settings, "alignment", "left");
  const height = s(settings, "height", "medium");
  const minH = height === "large" ? 460 : height === "small" ? 260 : 360;
  const overlay = num(settings, "overlay_opacity", 30) / 100;
  return (
    <section className="ff-hero" style={{ minHeight: minH, textAlign: align === "center" ? "center" : "left" }}>
      <div className="ff-hero-bg" />
      <div className="ff-hero-overlay" style={{ opacity: overlay }} />
      <div className="ff-hero-inner" style={{ alignItems: align === "center" ? "center" : "flex-start", margin: align === "center" ? "0 auto" : undefined }}>
        {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow")}</span>}
        <h1>{s(settings, "heading", "Designed for everyday living")}</h1>
        <RichText className="ff-hero-sub" html={s(settings, "subheading", "<p>Tell customers what makes your store worth their time.</p>")} />
        <div className="ff-btns">
          <span className="ff-btn ff-btn--primary">{s(settings, "button_label", "Shop now")}</span>
          {s(settings, "button2_label") && <span className="ff-btn ff-btn--ghost">{s(settings, "button2_label")}</span>}
        </div>
      </div>
    </section>
  );
}

function ImageWithText({ settings }: { settings?: Settings }) {
  const right = s(settings, "image_position", "left") === "right";
  return (
    <section className="ff-section ff-iwt" style={{ ["--iwt-dir" as string]: right ? "row-reverse" : "row" }}>
      <div className="ff-iwt-media"><Placeholder hue={30} ratio="1 / 1" /></div>
      <div className="ff-iwt-body">
        {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow")}</span>}
        <h2>{s(settings, "heading", "Built with care")}</h2>
        <RichText className="ff-prose" html={s(settings, "body", "<p>Describe a product benefit, your story, or what sets you apart.</p>")} />
        {s(settings, "button_label") && <span className="ff-btn ff-btn--primary">{s(settings, "button_label")}</span>}
      </div>
    </section>
  );
}

function FeaturedCollection({ settings }: { settings?: Settings }) {
  const count = Math.max(2, Math.min(12, num(settings, "products_to_show", 4)));
  const cols = num(settings, "columns", 4);
  const items = Array.from({ length: count }, (_, i) => MOCK_PRODUCTS[i % MOCK_PRODUCTS.length]);
  return (
    <section className="ff-section">
      <div className="ff-sec-head">
        {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow")}</span>}
        <h2>{s(settings, "heading", "Shop our favourites")}</h2>
        {bool(settings, "show_view_all", true) && <span className="ff-viewall">{s(settings, "view_all_label", "View all")} →</span>}
      </div>
      <div className="ff-grid" style={{ ["--cols" as string]: String(cols) }}>
        {items.map((p, i) => (
          <div key={i} className="ff-card">
            <Placeholder hue={p.hue} ratio="4 / 5" />
            <div className="ff-card-t">{p.title}</div>
            <div className="ff-card-p">{p.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq({ instance }: { instance: ShopifySectionInstance }) {
  const blocks = instance.blocks ?? [];
  return (
    <section className="ff-section ff-faq">
      <h2>{s(instance.settings, "heading", "Frequently asked questions")}</h2>
      <div className="ff-faq-list">
        {(blocks.length ? blocks : [{ key: "d", type: "question", settings: { question: "Add questions in the editor", answer: "<p>Each question becomes an accordion row.</p>" } }]).map((b) => (
          <details key={b.key} className="ff-faq-row">
            <summary>{s(b.settings, "question", "Question")}</summary>
            <RichText className="ff-prose" html={s(b.settings, "answer", "<p>Answer.</p>")} />
          </details>
        ))}
      </div>
    </section>
  );
}

function RichTextSec({ settings }: { settings?: Settings }) {
  const center = s(settings, "alignment", "center") === "center";
  return (
    <section className="ff-section" style={{ maxWidth: 720, textAlign: center ? "center" : "left" }}>
      {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow")}</span>}
      <h2 style={{ fontSize: "clamp(24px,3.2cqw,34px)" }}>{s(settings, "heading", "Our promise")}</h2>
      <RichText className="ff-prose" html={s(settings, "body", "<p>Share your brand story or a message that matters.</p>")} />
      {s(settings, "button_label") && <span className="ff-btn ff-btn--primary" style={{ marginTop: 14 }}>{s(settings, "button_label")}</span>}
    </section>
  );
}
function UspBar({ instance }: { instance: ShopifySectionInstance }) {
  const blocks = instance.blocks ?? [];
  return (
    <section className="ff-section">
      {s(instance.settings, "heading") && <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: "clamp(20px,2.6cqw,28px)" }}>{s(instance.settings, "heading")}</h2>}
      <div className="ff-usp">
        {blocks.map((b) => (
          <div key={b.key} className="ff-usp-i">
            <div className="ff-usp-ic">{s(b.settings, "icon", "★")}</div>
            <div className="ff-usp-t">{s(b.settings, "title", "Value")}</div>
            <div className="ff-usp-x">{s(b.settings, "text")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Newsletter({ settings }: { settings?: Settings }) {
  return (
    <section className="ff-section" style={{ maxWidth: 560, textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(22px,3cqw,32px)" }}>{s(settings, "heading", "Join the list")}</h2>
      {s(settings, "subtext") && <p style={{ opacity: 0.82, margin: "10px 0 18px" }}>{s(settings, "subtext")}</p>}
      <div className="ff-nl-row"><input placeholder={s(settings, "placeholder", "Email address")} readOnly /><span className="ff-btn ff-btn--primary">{s(settings, "button_label", "Subscribe")}</span></div>
    </section>
  );
}
function Testimonials({ instance }: { instance: ShopifySectionInstance }) {
  const blocks = instance.blocks ?? [];
  return (
    <section className="ff-section">
      {s(instance.settings, "heading") && <h2 style={{ textAlign: "center", marginBottom: 26, fontSize: "clamp(22px,3cqw,32px)" }}>{s(instance.settings, "heading")}</h2>}
      <div className="ff-tm">
        {blocks.map((b) => (
          <figure key={b.key} className="ff-tm-c">
            <RichText className="ff-tm-q" html={s(b.settings, "quote", "A great experience from start to finish.")} />
            <figcaption><b>{s(b.settings, "author", "Jordan Blake")}</b><span>{s(b.settings, "role", "Verified buyer")}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
function CollectionList({ instance }: { instance: ShopifySectionInstance }) {
  const blocks = instance.blocks ?? [];
  const cols = num(instance.settings, "columns", 3);
  return (
    <section className="ff-section">
      {s(instance.settings, "heading") && <h2 style={{ marginBottom: 24, fontSize: "clamp(22px,3cqw,32px)" }}>{s(instance.settings, "heading")}</h2>}
      <div className="ff-grid" style={{ ["--cols" as string]: String(cols) }}>
        {blocks.map((b, i) => (
          <div key={b.key} className="ff-card">
            <Placeholder hue={(i * 47) % 360} ratio="1 / 1" />
            <div className="ff-card-t">{s(b.settings, "title", "Collection")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function FeaturedProduct({ settings }: { settings?: Settings }) {
  const p = MOCK_PRODUCTS[0];
  return (
    <section className="ff-section ff-iwt" style={{ ["--iwt-dir" as string]: "row" }}>
      <div className="ff-iwt-media"><Placeholder hue={p.hue} ratio="1 / 1" /></div>
      <div className="ff-iwt-body">
        {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow", "Featured")}</span>}
        <h2>{p.title}</h2>
        <div className="ff-card-p" style={{ fontSize: 20, fontWeight: 600, margin: "6px 0 14px" }}>{p.price}</div>
        <RichText className="ff-prose" html="<p>A short product description highlighting the key benefit and materials.</p>" />
        <span className="ff-btn ff-btn--primary" style={{ marginTop: 8 }}>{s(settings, "button_label", "Add to cart")}</span>
      </div>
    </section>
  );
}

// ── Creative + main-section renderers ──────────────────────────────────────────
function ImageBanner({ settings }: { settings?: Settings }) {
  const center = s(settings, "alignment", "left") === "center";
  return (
    <section className="ff-ib" style={{ textAlign: center ? "center" : "left" }}>
      <div className="ff-ib-bg" /><div className="ff-ib-ov" style={{ opacity: num(settings, "overlay", 35) / 100 }} />
      <div className="ff-ib-in" style={{ margin: center ? "0 auto" : undefined, alignItems: center ? "center" : "flex-start" }}>
        {s(settings, "eyebrow") && <span className="ff-eyebrow" style={{ color: "#fff" }}>{s(settings, "eyebrow")}</span>}
        <h1>{s(settings, "heading", "Designed to stand out")}</h1>
        <RichText className="ff-ib-sub" html={s(settings, "subheading", "<p>A bold statement banner.</p>")} />
        <div className="ff-btns" style={{ justifyContent: center ? "center" : "flex-start" }}>
          <span className="ff-btn ff-btn--primary">{s(settings, "button_label", "Shop now")}</span>
          {s(settings, "button2_label") && <span className="ff-btn ff-btn--ghost" style={{ color: "#fff" }}>{s(settings, "button2_label")}</span>}
        </div>
      </div>
    </section>
  );
}
function Slideshow({ instance }: { instance: ShopifySectionInstance }) {
  const b = (instance.blocks ?? [])[0];
  return (
    <section className="ff-ib">
      <div className="ff-ib-bg" style={{ background: "linear-gradient(120deg,#334155,#0f172a)" }} /><div className="ff-ib-ov" style={{ opacity: 0.32 }} />
      <div className="ff-ib-in">
        <h2 style={{ color: "#fff" }}>{s(b?.settings, "heading", "Season highlights")}</h2>
        <p className="ff-ib-sub">{s(b?.settings, "text", "Tell a short, punchy story.")}</p>
        <span className="ff-btn ff-btn--primary">{s(b?.settings, "button_label", "Shop")}</span>
      </div>
      <div className="ff-ss-dots">{(instance.blocks ?? [{ key: "x" }]).map((bl, i) => <span key={bl.key} style={{ opacity: i === 0 ? 1 : 0.5 }} />)}</div>
    </section>
  );
}
function Multicolumn({ instance }: { instance: ShopifySectionInstance }) {
  const cols = num(instance.settings, "columns", 3);
  return (
    <section className="ff-section">
      {s(instance.settings, "heading") && <h2 style={{ textAlign: "center", marginBottom: 26, fontSize: "clamp(22px,3cqw,32px)" }}>{s(instance.settings, "heading")}</h2>}
      <div className="ff-usp" style={{ ["--ff-cols" as string]: String(cols), gridTemplateColumns: `repeat(2,minmax(0,1fr))` }}>
        {(instance.blocks ?? []).map((b) => (
          <div key={b.key}><div className="ff-usp-ic">{s(b.settings, "icon", "★")}</div><div className="ff-usp-t">{s(b.settings, "title", "Feature")}</div><RichText className="ff-usp-x" html={s(b.settings, "text", "")} /></div>
        ))}
      </div>
    </section>
  );
}
function Multirow({ instance }: { instance: ShopifySectionInstance }) {
  return (
    <section className="ff-section">
      {(instance.blocks ?? []).map((b, i) => (
        <div key={b.key} className="ff-iwt" style={{ ["--iwt-dir" as string]: i % 2 ? "row-reverse" : "row", marginBottom: 40 }}>
          <div className="ff-iwt-media"><Placeholder hue={(i * 60) % 360} /></div>
          <div className="ff-iwt-body">
            {s(b.settings, "eyebrow") && <span className="ff-eyebrow">{s(b.settings, "eyebrow")}</span>}
            <h2>{s(b.settings, "heading", "Made with intention")}</h2>
            <RichText className="ff-prose" html={s(b.settings, "text", "<p>Explain a value or step.</p>")} />
            {s(b.settings, "button_label") && <span className="ff-btn ff-btn--primary" style={{ marginTop: 8 }}>{s(b.settings, "button_label")}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}
function LogoList({ instance }: { instance: ShopifySectionInstance }) {
  return (
    <section className="ff-section" style={{ textAlign: "center" }}>
      {s(instance.settings, "heading") && <span className="ff-eyebrow">{s(instance.settings, "heading")}</span>}
      <div className="ff-logos">{(instance.blocks ?? []).map((b) => <span key={b.key}>{s(b.settings, "name", "Brand")}</span>)}</div>
    </section>
  );
}
function Countdown({ settings }: { settings?: Settings }) {
  return (
    <section className="ff-section" style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(22px,3cqw,32px)" }}>{s(settings, "heading", "Sale ends soon")}</h2>
      {s(settings, "text") && <p style={{ opacity: 0.8 }}>{s(settings, "text")}</p>}
      <div className="ff-cd">04d 12h 30m 00s</div>
      <span className="ff-btn ff-btn--primary">{s(settings, "button_label", "Shop the sale")}</span>
    </section>
  );
}
function ContactForm({ settings }: { settings?: Settings }) {
  return (
    <section className="ff-section" style={{ maxWidth: 640 }}>
      {s(settings, "heading") && <h2 style={{ textAlign: "center" }}>{s(settings, "heading")}</h2>}
      <div className="ff-cf-row"><input placeholder="Name" readOnly /><input placeholder="Email" readOnly /></div>
      <textarea placeholder="Message" rows={4} readOnly />
      <span className="ff-btn ff-btn--primary" style={{ marginTop: 8 }}>{s(settings, "button_label", "Send")}</span>
    </section>
  );
}
function BlogPosts({ settings }: { settings?: Settings }) {
  const n = Math.max(2, Math.min(6, num(settings, "count", 3)));
  return (
    <section className="ff-section">
      {s(settings, "heading") && <h2 style={{ marginBottom: 24, fontSize: "clamp(22px,3cqw,32px)" }}>{s(settings, "heading")}</h2>}
      <div className="ff-grid" style={{ ["--cols" as string]: "3" }}>
        {Array.from({ length: n }, (_, i) => <div key={i} className="ff-card"><Placeholder hue={(i * 50) % 360} ratio="16 / 10" /><div className="ff-card-t">Article headline goes here</div></div>)}
      </div>
    </section>
  );
}
function ProductRecs({ settings }: { settings?: Settings }) {
  const n = Math.max(2, Math.min(8, num(settings, "count", 4)));
  return (
    <section className="ff-section">
      <h2 style={{ marginBottom: 22, fontSize: "clamp(22px,3cqw,32px)" }}>{s(settings, "heading", "You may also like")}</h2>
      <div className="ff-grid" style={{ ["--cols" as string]: "4" }}>
        {Array.from({ length: n }, (_, i) => { const p = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length]; return <div key={i} className="ff-card"><Placeholder hue={p.hue} ratio="4 / 5" /><div className="ff-card-t">{p.title}</div><div className="ff-card-p">{p.price}</div></div>; })}
      </div>
    </section>
  );
}
// Main (template) sections
function MainProduct() {
  const p = MOCK_PRODUCTS[0];
  return (
    <section className="ff-section ff-pdp">
      <div className="ff-pdp-grid">
        <div className="ff-pdp-gallery">
          <div className="ff-pdp-thumbs">{[0, 1, 2].map((i) => <div key={i} className={`ff-pdp-thumb${i === 0 ? " is-active" : ""}`}><Placeholder hue={(p.hue + i * 30) % 360} ratio="1 / 1" /></div>)}</div>
          <div className="ff-pdp-stage"><Placeholder hue={p.hue} ratio="1 / 1" /></div>
        </div>
        <div className="ff-pdp-info">
          <p className="ff-pdp-vendor">brand-name</p>
          <h1>{p.title}</h1>
          <div className="ff-pdp-pricerow"><span className="ff-pdp-price">{p.price}</span><s className="ff-pdp-compare">$14.00</s><span className="ff-pdp-badge">Sale</span></div>
          <p className="ff-pdp-tax">Taxes included. Shipping calculated at checkout.</p>
          <RichText className="ff-pdp-lead" html="<p>A considered product with durable materials and a clean, timeless design.</p>" />
          <hr className="ff-pdp-rule" />
          <p className="ff-pdp-stock"><span className="ff-pdp-dot" />In stock</p>
          <div className="ff-pdp-qlabel">Quantity</div>
          <div className="ff-pdp-qty"><button>–</button><input defaultValue={1} readOnly /><button>+</button></div>
          <div className="ff-pdp-actions"><span className="ff-btn ff-btn--primary ff-pdp-add">Add to cart</span><span className="ff-pdp-buynow">Buy it now</span></div>
          <ul className="ff-pdp-features">{["Enter your feature text", "Enter your feature text", "Enter your feature text"].map((t, i) => <li key={i}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 6 9 17l-5-5" /></svg>{t}</li>)}</ul>
          <div className="ff-pdp-rows">
            {["Description", "Collapsible Tab"].map((t, i) => <div key={i} className="ff-pdp-row"><span>{t}</span><span>{i === 0 ? "–" : "+"}</span></div>)}
          </div>
          <div className="ff-pdp-share">Share:<span>f</span><span>𝕏</span><span>p</span></div>
        </div>
      </div>
    </section>
  );
}
const FILTER_TYPES = ["Beverages (1)", "Breads & Buns (6)", "Dried Fruits (1)", "Eggs (1)", "Fruits & Vegetables (11)"];
function MainCollection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="ff-section ff-cx">
      <div className="ff-cx-crumbs">Home / Collections / All products</div>
      <h1 style={{ marginBottom: 20 }}>All products</h1>
      <div className="ff-cx-toolbar">
        <button type="button" className="ff-cx-filter-btn" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 5h18M6 12h12M10 19h4" /></svg> Filters
        </button>
        <p className="ff-cx-count" style={{ margin: 0 }}>{MOCK_PRODUCTS.length * 3} products</p>
      </div>
      <div className={`ff-cx-overlay${open ? " is-open" : ""}`} onClick={() => setOpen(false)} />
      <div className="ff-cx-layout">
        <aside className={`ff-cx-side${open ? " is-open" : ""}`}>
          <div className="ff-cx-side-head"><span>Filters</span><button type="button" onClick={() => setOpen(false)} aria-label="Close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></button></div>
          <div className="ff-cx-group"><p className="ff-cx-label">Sort by</p><select className="ff-cx-select" disabled><option>Featured</option></select></div>
          <div className="ff-cx-group"><p className="ff-cx-label">Price</p><div className="ff-cx-price"><input placeholder="$ 0" readOnly /><span>to</span><input placeholder="$ 96" readOnly /></div></div>
          <div className="ff-cx-group"><p className="ff-cx-label">Product type</p><ul className="ff-cx-values">{FILTER_TYPES.map((f) => <li key={f} className="ff-cx-check"><input type="checkbox" readOnly /> <span>{f}</span></li>)}</ul></div>
        </aside>
        <div className="ff-cx-main">
          <p className="ff-cx-count">{MOCK_PRODUCTS.length * 3} products</p>
          <div className="ff-grid" style={{ ["--cols" as string]: "3" }}>
            {MOCK_PRODUCTS.map((p, i) => (
              <div key={i} className="ff-pcard">
                <div className="ff-pcard-media"><Placeholder hue={p.hue} ratio="1 / 1" />{i === 1 && <span className="ff-pcard-badge">On sale</span>}</div>
                <div className="ff-pcard-body">
                  <div className="ff-pcard-price">{p.price}{i === 1 && <s> $6.00</s>}</div>
                  <div className="ff-pcard-title">{p.title}</div>
                  <span className="ff-btn ff-btn--ghost ff-pcard-buy">Buy now</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function MainCart() {
  const items = MOCK_PRODUCTS.slice(0, 2);
  return (
    <section className="ff-section" style={{ maxWidth: 820 }}>
      <h1>Your cart</h1>
      <div style={{ margin: "20px 0" }}>{items.map((p, i) => (
        <div key={i} className="ff-cart-row"><Placeholder hue={p.hue} ratio="1 / 1" /><div style={{ flex: 1 }}>{p.title}</div><div>1 × {p.price}</div><b>{p.price}</b></div>
      ))}</div>
      <div className="ff-cart-foot"><span style={{ fontSize: 18 }}>Subtotal <b>$72</b></span><span className="ff-btn ff-btn--primary">Check out</span></div>
    </section>
  );
}
function MainSearch() {
  return (
    <section className="ff-section">
      <div className="ff-nl-row" style={{ maxWidth: 520, marginBottom: 24 }}><input placeholder="Search" readOnly /><span className="ff-btn ff-btn--primary">Search</span></div>
      <div className="ff-grid" style={{ ["--cols" as string]: "4" }}>{MOCK_PRODUCTS.slice(0, 4).map((p, i) => <div key={i} className="ff-card"><Placeholder hue={p.hue} ratio="4 / 5" /><div className="ff-card-t">{p.title}</div><div className="ff-card-p">{p.price}</div></div>)}</div>
    </section>
  );
}
function MainBlog() {
  return (
    <section className="ff-section">
      <h1 style={{ marginBottom: 24 }}>Journal</h1>
      <div className="ff-grid" style={{ ["--cols" as string]: "3" }}>{Array.from({ length: 6 }, (_, i) => <div key={i} className="ff-card"><Placeholder hue={(i * 45) % 360} ratio="16 / 10" /><div style={{ padding: 4 }}><span className="ff-eyebrow">Jul 12</span><div className="ff-card-t" style={{ marginTop: 0 }}>How we think about materials</div></div></div>)}</div>
    </section>
  );
}
function MainArticle() {
  return (
    <article className="ff-section" style={{ maxWidth: 720 }}>
      <span className="ff-eyebrow">July 12, 2026</span>
      <h1>The story behind the collection</h1>
      <Placeholder hue={30} ratio="16 / 9" />
      <RichText className="ff-prose" html="<p style='margin-top:18px'>An article body with a comfortable reading measure and generous line height.</p><p>A second paragraph to show flow.</p>" />
    </article>
  );
}
function MainPage() {
  return (
    <section className="ff-section" style={{ maxWidth: 780 }}>
      <h1>About us</h1>
      <RichText className="ff-prose" html="<p>Rich page content rendered from the page template.</p>" />
    </section>
  );
}

function CustomSection({ instance }: { instance: ShopifySectionInstance }) {
  const width = s(instance.settings, "content_width", "normal");
  const maxW = width === "narrow" ? 680 : width === "wide" ? 1200 : 960;
  const bg = s(instance.settings, "background");
  const alignItems = (a: string) => (a === "center" ? "center" : a === "right" ? "flex-end" : "flex-start");
  const textAlign = (a: string) => (a === "center" ? "center" : a === "right" ? "right" : "left") as "left" | "center" | "right";
  return (
    <section className="ff-section" style={{ maxWidth: maxW, background: bg || undefined }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {(instance.blocks ?? []).map((b) => {
          const a = s(b.settings, "align", "left");
          const sp = { marginTop: num(b.settings, "space_top", 0), marginBottom: num(b.settings, "space_bottom", 16) };
          const wrap = { ...sp, textAlign: textAlign(a), display: "flex", flexDirection: "column" as const, alignItems: alignItems(a) };
          switch (b.type) {
            case "heading": return (
              <div key={b.key} style={wrap}>
                {s(b.settings, "eyebrow") && <span className="ff-eyebrow">{s(b.settings, "eyebrow")}</span>}
                <h2 style={{ fontSize: num(b.settings, "size", 36), lineHeight: 1.06, letterSpacing: "-0.02em", margin: 0 }}>{s(b.settings, "text", "A heading")}</h2>
              </div>
            );
            case "text": return <div key={b.key} style={{ ...sp, textAlign: textAlign(a), maxWidth: "70ch", marginInline: a === "center" ? "auto" : undefined, opacity: 0.92, lineHeight: 1.65 }}><RichText html={s(b.settings, "text", "<p>Body text.</p>")} /></div>;
            case "image": return (
              <div key={b.key} style={wrap}>
                <div style={{ maxWidth: `${num(b.settings, "max_width", 100)}%`, borderRadius: num(b.settings, "radius", 12), overflow: "hidden", width: "100%" }}>
                  <Placeholder hue={210} ratio={s(b.settings, "ratio", "16/9").replace("/", " / ")} />
                </div>
              </div>
            );
            case "button": return <div key={b.key} style={wrap}><span className={`ff-btn ff-btn--${s(b.settings, "style", "primary") === "secondary" ? "ghost" : "primary"}`}>{s(b.settings, "label", "Shop now")}</span></div>;
            case "feature": return (
              <div key={b.key} style={{ ...wrap, maxWidth: "60ch", marginInline: a === "center" ? "auto" : undefined }}>
                {s(b.settings, "icon") && <div style={{ fontSize: 30, marginBottom: 10 }}>{s(b.settings, "icon", "★")}</div>}
                {s(b.settings, "title") && <p style={{ fontWeight: 600, fontSize: 18, margin: "0 0 6px" }}>{s(b.settings, "title")}</p>}
                <RichText className="ff-prose" html={s(b.settings, "text", "")} />
              </div>
            );
            case "divider": return <hr key={b.key} style={{ ...sp, width: `${num(b.settings, "width", 100)}%`, border: 0, borderTop: `${num(b.settings, "thickness", 1)}px solid rgba(0,0,0,.12)`, marginInline: a === "center" ? "auto" : a === "right" ? "0 0 0 auto" : 0 }} />;
            case "spacer": return <div key={b.key} style={{ height: num(b.settings, "height", 32) }} />;
            default: return null;
          }
        })}
      </div>
    </section>
  );
}

function SplitHero({ settings }: { settings?: Settings }) {
  const side = s(settings, "image_side", "right");
  const rating = num(settings, "rating", 5);
  const showRating = (settings?.show_rating ?? true) !== false;
  return (
    <section className="ff-section ff-shx">
      <div className="ff-shx-grid" style={{ ["--shx-dir" as string]: side === "left" ? "row-reverse" : "row" }}>
        <div className="ff-shx-text">
          {s(settings, "eyebrow") && <span className="ff-eyebrow">{s(settings, "eyebrow")}</span>}
          {showRating && (
            <div className="ff-shx-rating">
              <span className="ff-shx-stars"><span className="ff-shx-stars-bg">★★★★★</span><span className="ff-shx-stars-fg" style={{ width: `${(rating / 5) * 100}%` }}>★★★★★</span></span>
              {s(settings, "rating_text") && <span className="ff-shx-rt">{s(settings, "rating_text")}</span>}
            </div>
          )}
          <h1 className="ff-shx-h">{s(settings, "heading", "Fresh. Organic. Delivered.")}</h1>
          <RichText className="ff-shx-sub" html={s(settings, "subheading", "<p>Everyday essentials, delivered.</p>")} />
          {s(settings, "button_label", "Shop now") && <div className="ff-btns"><span className="ff-btn ff-btn--primary">{s(settings, "button_label", "Shop now")}</span></div>}
        </div>
        <div className="ff-shx-media"><Placeholder hue={135} ratio="1 / 1" /></div>
      </div>
    </section>
  );
}
function CategoryCards({ instance }: { instance: ShopifySectionInstance }) {
  const cols = s(instance.settings, "columns", "3");
  return (
    <section className="ff-section">
      {s(instance.settings, "heading") && <h2 style={{ textAlign: "center", marginBottom: 34 }}>{s(instance.settings, "heading")}</h2>}
      <div className="ff-ccx-grid" style={{ ["--cols" as string]: cols }}>
        {(instance.blocks ?? []).map((b, i) => (
          <div key={b.key} className="ff-ccx-card" style={{ background: s(b.settings, "bg") || ["#ece7dd", "#dbe8de", "#dbe4ec"][i % 3] }}>
            <div className="ff-ccx-media"><div className="ff-ccx-ph" /></div>
            <div className="ff-ccx-body">
              {s(b.settings, "eyebrow") && <p className="ff-ccx-eyebrow">{s(b.settings, "eyebrow")}</p>}
              <p className="ff-ccx-title">{s(b.settings, "title", "Category")}</p>
              {s(b.settings, "button_label", "Show more") && <span className="ff-ccx-btn">{s(b.settings, "button_label", "Show more")}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function renderSection(inst: ShopifySectionInstance) {
  if (inst.disabled) return null;
  switch (inst.sectionId) {
    case "split-hero": return <SplitHero settings={inst.settings} />;
    case "category-cards": return <CategoryCards instance={inst} />;
    case "custom-section": return <CustomSection instance={inst} />;
    case "hero-banner": return <Hero settings={inst.settings} />;
    case "image-banner": return <ImageBanner settings={inst.settings} />;
    case "slideshow": return <Slideshow instance={inst} />;
    case "image-with-text": return <ImageWithText settings={inst.settings} />;
    case "multirow": return <Multirow instance={inst} />;
    case "featured-collection": return <FeaturedCollection settings={inst.settings} />;
    case "collection-list": return <CollectionList instance={inst} />;
    case "featured-product": return <FeaturedProduct settings={inst.settings} />;
    case "product-recommendations": return <ProductRecs settings={inst.settings} />;
    case "multicolumn": return <Multicolumn instance={inst} />;
    case "usp-bar": return <UspBar instance={inst} />;
    case "rich-text": return <RichTextSec settings={inst.settings} />;
    case "testimonials": return <Testimonials instance={inst} />;
    case "logo-list": return <LogoList instance={inst} />;
    case "countdown": return <Countdown settings={inst.settings} />;
    case "blog-posts": return <BlogPosts settings={inst.settings} />;
    case "contact-form": return <ContactForm settings={inst.settings} />;
    case "newsletter": return <Newsletter settings={inst.settings} />;
    case "faq": return <Faq instance={inst} />;
    case "main-product": return <MainProduct />;
    case "main-collection": case "main-list-collections": return <MainCollection />;
    case "main-cart": return <MainCart />;
    case "main-search": return <MainSearch />;
    case "main-blog": return <MainBlog />;
    case "main-article": return <MainArticle />;
    case "main-page": return <MainPage />;
    default:
      return <section className="ff-section"><div className="ff-unknown">Section: {inst.sectionId}</div></section>;
  }
}

// Prepend the template's main section (mirrors the generator) so switching to
// Product/Collection/Cart previews the real storefront template.
export const TEMPLATE_MAIN: Record<string, string> = {
  product: "main-product", collection: "main-collection", "list-collections": "main-list-collections",
  cart: "main-cart", search: "main-search", blog: "main-blog", article: "main-article", page: "main-page",
};

/** Root CSS variables for the store shell (colours, fonts, radius, type scale). */
export function storeVars(brand: BrandTokens): React.CSSProperties {
  return {
    ["--c-primary" as string]: brand.primaryColor,
    ["--c-secondary" as string]: brand.secondaryColor,
    ["--c-bg" as string]: brand.backgroundColor,
    ["--c-text" as string]: brand.textColor,
    ["--f-head" as string]: brand.headingFont,
    ["--f-body" as string]: brand.bodyFont,
    ["--radius" as string]: brand.borderRadius,
    ["--h-scale" as string]: String(brand.headingScale ?? 1.1),
    ["--b-scale" as string]: String(brand.bodyScale ?? 1),
  };
}

/** Per-section colour-scheme CSS variables (empty for full-bleed hero-type ids). */
export function sectionSchemeVars(brand: BrandTokens, inst: ShopifySectionInstance): React.CSSProperties | undefined {
  if (["hero-banner", "image-banner", "slideshow"].includes(inst.sectionId)) return undefined;
  const schemes = resolveSchemes(brand);
  const sc = schemes.find((x) => x.id === (inst.settings?.color_scheme || "scheme-1")) ?? schemes[0];
  if (!sc) return undefined;
  return { ["--c-bg" as string]: sc.background, ["--c-text" as string]: sc.text, ["--c-primary" as string]: sc.button, ["--c-secondary" as string]: sc.secondary, background: sc.background, color: sc.text };
}

/** The main section id auto-injected for a storefront template (undefined for index/page-less). */
export function mainSectionId(template: string): string | undefined {
  return TEMPLATE_MAIN[template];
}

export function StorefrontPreview({ brand, page, storeName }: {
  brand: BrandTokens; page: ShopifyPage; storeName: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const animate = brand.animate !== false;
  const vars = storeVars(brand);

  // Prepend the template's main section so storefront templates preview fully.
  const mainId = TEMPLATE_MAIN[page.template];
  const effective: ShopifySectionInstance[] = [
    ...(mainId && !page.sections.some((s2) => s2.sectionId === mainId) ? [{ key: "__main", sectionId: mainId } as ShopifySectionInstance] : []),
    ...page.sections,
  ];

  // Reveal-on-scroll (mirrors the generated theme.js), reduced-motion safe.
  useEffect(() => {
    if (!animate || !rootRef.current) return;
    const els = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-ffreveal]"));
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in")); return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [animate, page.template, effective.length]);

  return (
    <div className="ff-store" style={vars} ref={rootRef}>
      <AnnouncementBar />
      <Header storeName={storeName} />
      <main>
        {effective.length === 0
          ? <div className="ff-empty">This template has no sections yet. Add some in <b>Pages</b>.</div>
          : effective.map((inst) => (
              <div key={inst.key} data-ffreveal={animate ? "" : undefined} className={animate ? "ff-reveal" : undefined} style={sectionSchemeVars(brand, inst)}>
                {renderSection(inst)}
              </div>
            ))}
      </main>
      <Footer />
      <style>{STORE_CSS}</style>
    </div>
  );
}

export const STORE_CSS = `
.ff-store{background:var(--c-bg);color:var(--c-text);font-family:var(--f-body);line-height:1.62;container-type:inline-size;font-size:calc(15px * var(--b-scale,1));}
.ff-store h1,.ff-store h2{font-family:var(--f-head);line-height:1.06;letter-spacing:-0.022em;margin:0;font-weight:600;}
.ff-store h1{font-size:calc(clamp(30px,5.4cqw,50px) * var(--h-scale,1));letter-spacing:-0.03em;}
.ff-store h2{font-size:calc(clamp(23px,3.6cqw,34px) * var(--h-scale,1));}
.ff-store *{box-sizing:border-box;}
.ff-reveal{opacity:0;transform:translateY(16px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1);}
.ff-reveal.is-in{opacity:1;transform:none;}
.ff-ib{position:relative;overflow:hidden;color:#fff;min-height:clamp(320px,52cqw,520px);display:flex;align-items:center;}
.ff-ib-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--c-primary),var(--c-secondary));}
.ff-ib-ov{position:absolute;inset:0;background:#000;}
.ff-ib-in{position:relative;display:flex;flex-direction:column;justify-content:center;max-width:min(640px,86%);padding:44px 24px;}
.ff-ib-in h1,.ff-ib-in h2{color:#fff;}
.ff-ib-sub{font-size:clamp(15px,2cqw,18px);opacity:.92;margin:8px 0 18px;}
.ff-ib-sub p{margin:0;}
.ff-ss-dots{position:absolute;bottom:16px;left:0;right:0;display:flex;gap:7px;justify-content:center;}
.ff-ss-dots span{width:8px;height:8px;border-radius:999px;background:#fff;}
.ff-logos{display:flex;flex-wrap:wrap;gap:36px;align-items:center;justify-content:center;margin-top:18px;font-weight:700;font-size:17px;opacity:.6;}
.ff-cd{font-size:clamp(24px,4cqw,38px);font-weight:700;font-variant-numeric:tabular-nums;margin:14px 0 18px;}
.ff-cf-row{display:grid;gap:12px;margin-bottom:12px;}
@container (min-width:600px){.ff-cf-row{grid-template-columns:1fr 1fr;}}
.ff-cf-row input,.ff-store textarea{width:100%;border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:11px 13px;font-size:15px;font-family:inherit;}
.ff-po{margin-bottom:12px;font-weight:600;font-size:14px;}
.ff-po span{display:block;margin-bottom:5px;}
.ff-po select,.ff-po input{border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:9px 12px;min-width:160px;font-weight:400;}
.ff-cart-row{display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(0,0,0,.1);}
.ff-cart-row>div:first-child,.ff-cart-row .ff-ph{width:56px;flex:0 0 56px;}
.ff-cart-foot{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-top:8px;}
.ff-announce{background:#111827;color:#fff;text-align:center;font-size:12.5px;padding:8px 12px;letter-spacing:.01em;}
.ff-header{display:flex;align-items:center;gap:16px;padding:14px 24px;border-bottom:1px solid rgba(0,0,0,.08);}
.ff-wordmark{font-family:var(--f-head);font-weight:700;font-size:18px;}
.ff-nav{display:none;gap:20px;margin-left:auto;font-size:14px;color:var(--c-text);opacity:.8;}
.ff-nav span{cursor:default;}
.ff-hicon{background:none;border:0;color:inherit;cursor:pointer;padding:4px;display:inline-flex;}
.ff-header .ff-hicon:last-child{margin-left:auto;}
@container (min-width:760px){.ff-nav{display:flex;}.ff-header .ff-hicon:first-child{display:none;}.ff-header .ff-hicon:last-child{margin-left:0;}}
.ff-eyebrow{display:inline-block;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--c-secondary);font-weight:600;margin-bottom:12px;}
.ff-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;}
.ff-btn{display:inline-flex;align-items:center;padding:13px 26px;border-radius:var(--radius);font-size:14px;font-weight:600;letter-spacing:.005em;cursor:default;transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s ease;}
.ff-btn--primary{background:var(--c-primary);color:#fff;}
.ff-btn--primary:hover{transform:translateY(-2px);}
.ff-btn--ghost{border:1px solid currentColor;}
.ff-hero{position:relative;display:flex;overflow:hidden;color:#fff;padding:clamp(48px,7cqw,96px) 24px;}
.ff-hero-bg{position:absolute;inset:0;background:linear-gradient(155deg,var(--c-primary),color-mix(in srgb,var(--c-primary) 78%,var(--c-secondary)));}
.ff-hero-overlay{position:absolute;inset:0;background:#000;}
.ff-hero-inner{position:relative;display:flex;flex-direction:column;justify-content:center;max-width:640px;}
.ff-hero h1,.ff-hero .ff-hero-sub,.ff-hero .ff-eyebrow{color:#fff;}
.ff-hero h1{font-size:clamp(32px,6.4cqw,58px);line-height:1.03;letter-spacing:-0.03em;margin-bottom:16px;}
.ff-hero-sub p{margin:0;font-size:clamp(15px,2cqw,19px);opacity:.9;line-height:1.55;}
.ff-section{padding:clamp(48px,8cqw,104px) 24px;max-width:1200px;margin:0 auto;}
.ff-sec-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:12px;margin-bottom:34px;}
.ff-sec-head h2{font-size:clamp(23px,3.6cqw,34px);}
.ff-viewall{margin-left:auto;font-size:14px;color:var(--c-secondary);font-weight:600;cursor:default;text-decoration:underline;text-underline-offset:3px;}
.ff-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,2.2cqw,28px);}
@container (min-width:760px){.ff-grid{grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));}}
.ff-card{display:block;}
.ff-card .ff-ph,.ff-card-media{overflow:hidden;border-radius:var(--radius);}
.ff-card img{transition:transform .55s cubic-bezier(.22,1,.36,1);}
.ff-card:hover img{transform:scale(1.045);}
.ff-card-t{margin-top:12px;font-size:14px;font-weight:500;letter-spacing:-0.01em;}
.ff-card-p{font-size:14px;opacity:.7;font-variant-numeric:tabular-nums;}
.ff-ph{width:100%;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,.35);border-radius:var(--radius);overflow:hidden;}
.ff-ph span{font-size:12px;}
.ff-iwt{display:flex;flex-direction:column;gap:clamp(20px,4cqw,48px);align-items:center;}
@container (min-width:760px){.ff-iwt{flex-direction:var(--iwt-dir,row);}.ff-iwt-media,.ff-iwt-body{flex:1;}}
.ff-iwt-body h2{font-size:clamp(22px,3.4cqw,32px);margin-bottom:14px;}
.ff-iwt-media{width:100%;}
.ff-prose p,.ff-hero-sub p{margin:0 0 10px;}
.ff-shx-grid{display:flex;flex-direction:column;gap:clamp(24px,4cqw,56px);align-items:center;}
@container (min-width:760px){.ff-shx-grid{flex-direction:var(--shx-dir,row);}.ff-shx-text,.ff-shx-media{flex:1;}}
.ff-shx-h{font-size:clamp(34px,6.6cqw,64px);line-height:1.02;letter-spacing:-0.035em;margin:0;}
.ff-shx-rating{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.ff-shx-stars{position:relative;display:inline-block;font-size:17px;letter-spacing:2px;line-height:1;}
.ff-shx-stars-bg{color:rgba(0,0,0,.16);}
.ff-shx-stars-fg{position:absolute;inset:0;overflow:hidden;color:#f5a623;white-space:nowrap;}
.ff-shx-rt{font-size:13px;font-weight:600;opacity:.85;}
.ff-shx-sub{margin-top:16px;opacity:.85;max-width:44ch;}
.ff-shx-sub p{margin:0;}
.ff-ccx-grid{display:grid;grid-template-columns:1fr;gap:clamp(14px,2cqw,24px);}
@container (min-width:640px){.ff-ccx-grid{grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));}}
.ff-ccx-card{display:flex;flex-direction:column;border-radius:calc(var(--radius) * 1.6);padding:clamp(18px,2.2cqw,30px);min-height:clamp(300px,34cqw,460px);color:#1a1a1a;}
.ff-ccx-media{flex:1;display:flex;align-items:center;justify-content:center;padding:6px 0 18px;}
.ff-ccx-ph{width:64%;aspect-ratio:3/4;border-radius:var(--radius);background:rgba(0,0,0,.06);}
.ff-ccx-body{text-align:center;}
.ff-ccx-eyebrow{margin:0 0 6px;font-size:13px;opacity:.7;}
.ff-ccx-title{margin:0 0 16px;font-family:var(--f-head);font-weight:600;font-size:clamp(22px,2.6cqw,32px);letter-spacing:-0.02em;}
.ff-ccx-btn{display:inline-flex;align-items:center;min-height:42px;padding:0 24px;border-radius:999px;background:var(--c-primary);color:#fff;font-weight:600;font-size:13px;}
.ff-pdp-grid{display:grid;gap:clamp(24px,4cqw,48px);}
@container (min-width:820px){.ff-pdp-grid{grid-template-columns:1.05fr .95fr;align-items:start;}}
.ff-pdp-gallery{display:grid;gap:12px;}
@container (min-width:520px){.ff-pdp-gallery{grid-template-columns:78px 1fr;}}
.ff-pdp-stage{grid-column:2;background:#f4f4f5;border-radius:calc(var(--radius) * 1.4);overflow:hidden;}
@container (max-width:519px){.ff-pdp-stage{grid-column:1;}}
.ff-pdp-thumbs{display:flex;gap:10px;flex-wrap:wrap;}
@container (min-width:520px){.ff-pdp-thumbs{grid-row:1;grid-column:1;flex-direction:column;flex-wrap:nowrap;}}
.ff-pdp-thumb{width:70px;flex:0 0 auto;border:1px solid rgba(0,0,0,.12);border-radius:var(--radius);overflow:hidden;}
.ff-pdp-thumb.is-active{border-color:var(--c-primary);border-width:2px;}
.ff-pdp-vendor{font-size:13px;color:var(--c-secondary);margin:0 0 8px;}
.ff-pdp-info h1{margin:4px 0 12px;}
.ff-pdp-pricerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ff-pdp-price{font-size:22px;font-weight:600;}
.ff-pdp-compare{opacity:.5;}
.ff-pdp-badge{background:var(--c-secondary);color:#fff;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;}
.ff-pdp-tax{font-size:13px;opacity:.6;margin:6px 0 0;}
.ff-pdp-lead{margin:14px 0;opacity:.85;}
.ff-pdp-lead p{margin:0;}
.ff-pdp-rule{border:0;border-top:1px solid rgba(0,0,0,.1);margin:16px 0;}
.ff-pdp-stock{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#1a7f37;margin:0 0 16px;}
.ff-pdp-dot{width:10px;height:10px;border-radius:2px;background:#1a7f37;}
.ff-pdp-qlabel{font-weight:600;font-size:15px;margin-bottom:8px;}
.ff-pdp-qty{display:inline-flex;align-items:center;border-radius:var(--radius);overflow:hidden;margin-bottom:14px;}
.ff-pdp-qty button{width:46px;height:50px;border:0;background:rgba(0,0,0,.05);font-size:17px;cursor:default;}
.ff-pdp-qty input{width:52px;height:50px;border:0;background:rgba(0,0,0,.05);text-align:center;}
.ff-pdp-actions{display:grid;grid-template-columns:1fr;gap:12px;}
@container (min-width:480px){.ff-pdp-actions{grid-template-columns:1fr 1fr;}}
.ff-pdp-add{justify-content:center;}
.ff-pdp-buynow{display:inline-flex;align-items:center;justify-content:center;padding:13px 26px;border-radius:var(--radius);background:#2f9fd0;color:#fff;font-weight:600;font-size:14px;}
.ff-pdp-features{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:12px;}
.ff-pdp-features li{display:flex;align-items:center;gap:10px;font-size:15px;}
.ff-pdp-features svg{flex:0 0 auto;color:var(--c-primary);}
.ff-pdp-rows{margin-top:22px;border-top:1px solid rgba(0,0,0,.1);}
.ff-pdp-row{display:flex;justify-content:space-between;padding:15px 0;border-bottom:1px solid rgba(0,0,0,.1);font-weight:600;}
.ff-pdp-share{display:flex;align-items:center;gap:14px;margin-top:22px;font-weight:600;font-size:14px;}
.ff-pdp-share span{display:inline-flex;width:22px;height:22px;align-items:center;justify-content:center;}
.ff-cx-crumbs{font-size:13px;opacity:.6;margin-bottom:10px;}
.ff-cx-layout{display:grid;gap:clamp(20px,3cqw,40px);}
.ff-cx{position:relative;}
.ff-cx-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;}
.ff-cx-filter-btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border:1px solid rgba(0,0,0,.15);border-radius:999px;background:none;font-weight:600;font-size:14px;cursor:pointer;color:inherit;}
.ff-cx-side-head{display:none;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(0,0,0,.1);}
.ff-cx-side-head span{font-size:17px;font-weight:600;}
.ff-cx-side-head button{background:none;border:0;cursor:pointer;color:inherit;padding:4px;display:inline-flex;}
.ff-cx-overlay{display:none;}
@container (min-width:900px){.ff-cx-layout{grid-template-columns:230px 1fr;align-items:start;}.ff-cx-toolbar{display:none;}}
@container (max-width:899px){
  .ff-cx-main .ff-cx-count{display:none;}
  .ff-cx-overlay{display:block;position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.42);opacity:0;pointer-events:none;transition:opacity .3s ease;}
  .ff-cx-overlay.is-open{opacity:1;pointer-events:auto;}
  .ff-cx-side{position:absolute;top:0;left:0;bottom:0;z-index:6;width:min(320px,84%);background:var(--c-bg);padding:18px;overflow-y:auto;transform:translateX(-105%);transition:transform .32s cubic-bezier(.22,1,.36,1);box-shadow:0 0 40px rgba(0,0,0,.18);border-radius:0 var(--radius) var(--radius) 0;}
  .ff-cx-side.is-open{transform:none;}
  .ff-cx-side-head{display:flex;}
}
.ff-cx-group{padding:14px 0;border-top:1px solid rgba(0,0,0,.1);}
.ff-cx-group:first-child{border-top:0;padding-top:0;}
.ff-cx-label{font-weight:600;font-size:14px;margin:0 0 10px;}
.ff-cx-select{width:100%;height:44px;border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:0 12px;}
.ff-cx-price{display:flex;align-items:center;gap:8px;}
.ff-cx-price input{width:100%;height:42px;border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:0 10px;}
.ff-cx-values{list-style:none;margin:0;padding:0;display:grid;gap:9px;}
.ff-cx-check{display:flex;align-items:center;gap:9px;font-size:14px;}
.ff-cx-count{opacity:.6;font-size:14px;margin:0 0 16px;}
.ff-pcard{display:flex;flex-direction:column;border:1px solid rgba(0,0,0,.1);border-radius:var(--radius);overflow:hidden;}
.ff-pcard-media{position:relative;aspect-ratio:1/1;overflow:hidden;}
.ff-pcard-badge{position:absolute;top:10px;right:10px;background:#e2483d;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;padding:4px 8px;border-radius:6px;}
.ff-pcard-body{display:flex;flex-direction:column;gap:6px;padding:14px;}
.ff-pcard-price{font-size:14px;opacity:.75;}
.ff-pcard-price s{opacity:.6;}
.ff-pcard-title{font-size:18px;font-weight:600;margin-bottom:6px;}
.ff-pcard-buy{margin-top:auto;justify-content:center;}
.ff-faq h2{font-size:clamp(22px,3.4cqw,32px);margin-bottom:20px;}
.ff-faq-list{max-width:780px;}
.ff-faq-row{border-bottom:1px solid rgba(0,0,0,.1);padding:14px 0;}
.ff-faq-row summary{font-weight:600;font-size:16px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;}
.ff-faq-row summary::after{content:"+";opacity:.5;}
.ff-faq-row[open] summary::after{content:"–";}
.ff-faq-row .ff-prose{margin-top:10px;opacity:.8;font-size:14.5px;}
.ff-footer{background:var(--c-primary);color:#fff;padding:48px 24px 0;margin-top:20px;}
.ff-footcols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;max-width:1100px;margin:0 auto;}
@container (min-width:760px){.ff-footcols{grid-template-columns:repeat(4,minmax(0,1fr));}}
.ff-footcols>div{display:flex;flex-direction:column;gap:8px;font-size:13.5px;opacity:.85;}
.ff-foottitle{font-weight:700;opacity:1;margin-bottom:4px;}
.ff-sub{display:flex;gap:6px;}
.ff-sub input{flex:1;min-width:0;border:0;border-radius:var(--radius);padding:9px 12px;font-size:13px;}
.ff-sub button{border:0;border-radius:var(--radius);background:var(--c-secondary);color:#fff;padding:0 14px;font-weight:600;font-size:13px;cursor:default;}
.ff-footbar{max-width:1100px;margin:36px auto 0;border-top:1px solid rgba(255,255,255,.18);padding:18px 0;font-size:12.5px;opacity:.7;}
.ff-empty,.ff-unknown{padding:60px 24px;text-align:center;color:var(--c-text);opacity:.55;font-size:14px;}
.ff-usp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;text-align:center;}
@container (min-width:760px){.ff-usp{grid-template-columns:repeat(4,minmax(0,1fr));}}
.ff-usp-ic{font-size:26px;margin-bottom:6px;}
.ff-usp-t{font-weight:600;}
.ff-usp-x{opacity:.75;font-size:14px;}
.ff-nl-row{display:flex;gap:8px;flex-wrap:wrap;}
.ff-nl-row input{flex:1;min-width:0;border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:11px 14px;font-size:15px;}
.ff-tm{display:grid;grid-template-columns:1fr;gap:18px;}
@container (min-width:760px){.ff-tm{grid-template-columns:repeat(3,minmax(0,1fr));}}
.ff-tm-c{margin:0;padding:22px;border:1px solid rgba(0,0,0,.1);border-radius:var(--radius);background:rgba(0,0,0,.02);}
.ff-tm-q p{margin:0 0 14px;font-size:15px;line-height:1.55;}
.ff-tm-c figcaption b{display:block;}
.ff-tm-c figcaption span{opacity:.7;font-size:13px;}
`;
