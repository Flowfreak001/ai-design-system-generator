"use client";

// Editor-only React preview of the Shopify storefront. It renders the SAME
// structured section data that the Liquid generator consumes, using mock Shopify
// data (products/collections). It is never exported — the export path is Liquid.
// Renders full-width inside app chrome (Context A: normal CSS responsive is fine).

import type { BrandTokens, ShopifyPage, ShopifySectionInstance } from "@/modules/shopify";

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

function AnnouncementBar() {
  return <div className="ff-announce">Free shipping on orders over $50</div>;
}

function Header({ storeName }: { storeName: string }) {
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

function Footer() {
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

function renderSection(inst: ShopifySectionInstance) {
  if (inst.disabled) return null;
  switch (inst.sectionId) {
    case "hero-banner": return <Hero settings={inst.settings} />;
    case "image-with-text": return <ImageWithText settings={inst.settings} />;
    case "featured-collection": return <FeaturedCollection settings={inst.settings} />;
    case "faq": return <Faq instance={inst} />;
    default:
      return <section className="ff-section"><div className="ff-unknown">Unsupported section: {inst.sectionId}</div></section>;
  }
}

export function StorefrontPreview({ brand, page, storeName }: {
  brand: BrandTokens; page: ShopifyPage; storeName: string;
}) {
  const vars: React.CSSProperties = {
    ["--c-primary" as string]: brand.primaryColor,
    ["--c-secondary" as string]: brand.secondaryColor,
    ["--c-bg" as string]: brand.backgroundColor,
    ["--c-text" as string]: brand.textColor,
    ["--f-head" as string]: brand.headingFont,
    ["--f-body" as string]: brand.bodyFont,
    ["--radius" as string]: brand.borderRadius,
  };
  return (
    <div className="ff-store" style={vars}>
      <AnnouncementBar />
      <Header storeName={storeName} />
      <main>
        {page.sections.length === 0
          ? <div className="ff-empty">This template has no sections yet. Add some in <b>Pages</b>.</div>
          : page.sections.map((inst) => <div key={inst.key}>{renderSection(inst)}</div>)}
      </main>
      <Footer />
      <style>{STORE_CSS}</style>
    </div>
  );
}

const STORE_CSS = `
.ff-store{background:var(--c-bg);color:var(--c-text);font-family:var(--f-body);line-height:1.55;container-type:inline-size;}
.ff-store h1,.ff-store h2{font-family:var(--f-head);line-height:1.1;margin:0;}
.ff-store *{box-sizing:border-box;}
.ff-announce{background:#111827;color:#fff;text-align:center;font-size:12.5px;padding:8px 12px;letter-spacing:.01em;}
.ff-header{display:flex;align-items:center;gap:16px;padding:14px 24px;border-bottom:1px solid rgba(0,0,0,.08);}
.ff-wordmark{font-family:var(--f-head);font-weight:700;font-size:18px;}
.ff-nav{display:none;gap:20px;margin-left:auto;font-size:14px;color:var(--c-text);opacity:.8;}
.ff-nav span{cursor:default;}
.ff-hicon{background:none;border:0;color:inherit;cursor:pointer;padding:4px;display:inline-flex;}
.ff-header .ff-hicon:last-child{margin-left:auto;}
@container (min-width:760px){.ff-nav{display:flex;}.ff-header .ff-hicon:first-child{display:none;}.ff-header .ff-hicon:last-child{margin-left:0;}}
.ff-eyebrow{display:inline-block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--c-secondary);font-weight:600;margin-bottom:10px;}
.ff-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;}
.ff-btn{display:inline-flex;align-items:center;padding:11px 22px;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:default;}
.ff-btn--primary{background:var(--c-primary);color:#fff;}
.ff-btn--ghost{border:1px solid currentColor;}
.ff-hero{position:relative;display:flex;overflow:hidden;color:#fff;padding:40px 24px;}
.ff-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--c-primary),var(--c-secondary));}
.ff-hero-overlay{position:absolute;inset:0;background:#000;}
.ff-hero-inner{position:relative;display:flex;flex-direction:column;justify-content:center;max-width:620px;}
.ff-hero h1{font-size:clamp(30px,6cqw,54px);margin-bottom:14px;}
.ff-hero-sub p{margin:0;font-size:clamp(15px,2cqw,18px);opacity:.92;}
.ff-section{padding:clamp(40px,6cqw,72px) 24px;max-width:1200px;margin:0 auto;}
.ff-sec-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:12px;margin-bottom:26px;}
.ff-sec-head h2{font-size:clamp(22px,3.4cqw,32px);}
.ff-viewall{margin-left:auto;font-size:14px;color:var(--c-secondary);font-weight:600;cursor:default;}
.ff-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(12px,2cqw,22px);}
@container (min-width:760px){.ff-grid{grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));}}
.ff-card-t{margin-top:10px;font-size:14px;font-weight:500;}
.ff-card-p{font-size:14px;opacity:.7;}
.ff-ph{width:100%;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,.35);border-radius:var(--radius);overflow:hidden;}
.ff-ph span{font-size:12px;}
.ff-iwt{display:flex;flex-direction:column;gap:clamp(20px,4cqw,48px);align-items:center;}
@container (min-width:760px){.ff-iwt{flex-direction:var(--iwt-dir,row);}.ff-iwt-media,.ff-iwt-body{flex:1;}}
.ff-iwt-body h2{font-size:clamp(22px,3.4cqw,32px);margin-bottom:14px;}
.ff-iwt-media{width:100%;}
.ff-prose p,.ff-hero-sub p{margin:0 0 10px;}
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
`;
