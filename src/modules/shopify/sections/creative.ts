// Creative section library (phase 3). Each: real Online Store 2.0 Liquid + valid
// {% schema %} with blocks/presets, a color scheme + padding, `data-animate`, and
// `#shopify-section-{{ section.id }}`-scoped responsive CSS.

import type { ShopifySectionDefinition, ShopifySettingField } from "../types";

/** Shared wrapper settings every creative section exposes. */
const WRAP: ShopifySettingField[] = [
  { type: "color_scheme", id: "color_scheme", label: "Color scheme", default: "scheme-1" },
  { type: "range", id: "padding_top", label: "Top padding", min: 0, max: 120, step: 4, unit: "px", default: 56 },
  { type: "range", id: "padding_bottom", label: "Bottom padding", min: 0, max: 120, step: 4, unit: "px", default: 56 },
];

/** Root attrs shared by every creative section (scheme class, padding vars, reveal). */
const ROOT = `color-{{ section.settings.color_scheme }} section" data-animate style="--section-pt:{{ section.settings.padding_top }}px;--section-pb:{{ section.settings.padding_bottom }}px`;

export const imageBannerSection: ShopifySectionDefinition = {
  id: "image-banner", name: "Image banner", category: "hero",
  description: "Full-width overlay hero with heading, text and up to two buttons.",
  supportedTemplates: ["index", "page", "collection"],
  liquid: `<div class="ib ${ROOT}">
  <div class="ib__media">{% if section.settings.image %}{% render 'image', image: section.settings.image, sizes: '100vw' %}{% else %}<div class="placeholder-media" style="height:100%"></div>{% endif %}<div class="ib__overlay" style="opacity:{{ section.settings.overlay | divided_by: 100.0 }}"></div></div>
  <div class="ib__inner page-width ib--{{ section.settings.alignment }}">
    {% if section.settings.eyebrow != blank %}<p class="eyebrow" style="color:#fff">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.heading != blank %}<h1>{{ section.settings.heading | escape }}</h1>{% endif %}
    {% if section.settings.subheading != blank %}<div class="ib__sub rte">{{ section.settings.subheading }}</div>{% endif %}
    <div class="ib__btns">{% render 'button', label: section.settings.button_label, url: section.settings.button_link %}{% if section.settings.button2_label != blank %}{% render 'button', label: section.settings.button2_label, url: section.settings.button2_link, style: 'secondary' %}{% endif %}</div>
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .ib{position:relative;overflow:hidden;color:#fff;min-height:clamp(360px,60vh,620px);display:grid}
  #shopify-section-{{ section.id }} .ib__media{position:absolute;inset:0}
  #shopify-section-{{ section.id }} .ib__media img{width:100%;height:100%;object-fit:cover}
  #shopify-section-{{ section.id }} .ib__overlay{position:absolute;inset:0;background:#000}
  #shopify-section-{{ section.id }} .ib__inner{position:relative;display:flex;flex-direction:column;justify-content:center;padding-block:60px;max-width:min(680px,90%)}
  #shopify-section-{{ section.id }} .ib--center{margin-inline:auto;text-align:center;align-items:center}
  #shopify-section-{{ section.id }} .ib__sub{font-size:clamp(16px,2vw,19px);opacity:.92;margin-bottom:22px}
  #shopify-section-{{ section.id }} .ib__btns{display:flex;gap:12px;flex-wrap:wrap}
  #shopify-section-{{ section.id }} .ib--center .ib__btns{justify-content:center}
</style>`,
  schema: {
    name: "Image banner", tag: "section",
    settings: [
      { type: "image_picker", id: "image", label: "Background image" },
      { type: "range", id: "overlay", label: "Overlay", min: 0, max: 80, step: 5, unit: "%", default: 35 },
      { type: "select", id: "alignment", label: "Alignment", default: "left", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Designed to stand out" },
      { type: "richtext", id: "subheading", label: "Text", default: "<p>A bold statement banner for your best story.</p>" },
      { type: "text", id: "button_label", label: "Primary button", default: "Shop now" },
      { type: "url", id: "button_link", label: "Primary link" },
      { type: "text", id: "button2_label", label: "Secondary button" },
      { type: "url", id: "button2_link", label: "Secondary link" },
      ...WRAP,
    ],
    presets: [{ name: "Image banner" }],
  },
  defaultSettings: { heading: "Designed to stand out", alignment: "left", overlay: 35, button_label: "Shop now", color_scheme: "scheme-2" },
};

export const slideshowSection: ShopifySectionDefinition = {
  id: "slideshow", name: "Slideshow", category: "hero",
  description: "Auto-rotating slides with heading, text and a button (blocks).",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="ss ${ROOT}" data-slideshow>
  <div class="ss__track">
    {% for block in section.blocks %}
      <div class="ss__slide" data-slide {{ block.shopify_attributes }}>
        <div class="ss__media">{% if block.settings.image %}{% render 'image', image: block.settings.image, sizes: '100vw' %}{% else %}<div class="placeholder-media" style="height:100%"></div>{% endif %}<div class="ss__overlay"></div></div>
        <div class="ss__inner page-width">
          {% if block.settings.heading != blank %}<h2>{{ block.settings.heading | escape }}</h2>{% endif %}
          {% if block.settings.text != blank %}<p class="ss__text">{{ block.settings.text | escape }}</p>{% endif %}
          {% render 'button', label: block.settings.button_label, url: block.settings.button_link %}
        </div>
      </div>
    {% endfor %}
  </div>
  <div class="ss__dots">{% for block in section.blocks %}<button type="button" class="ss__dot" data-dot aria-label="Slide {{ forloop.index }}"></button>{% endfor %}</div>
</div>
<style>
  #shopify-section-{{ section.id }} .ss{position:relative;color:#fff}
  #shopify-section-{{ section.id }} .ss__track{position:relative;display:grid}
  #shopify-section-{{ section.id }} .ss__slide{grid-area:1/1;position:relative;min-height:clamp(360px,58vh,600px);display:flex;align-items:center;transition:opacity .6s ease}
  #shopify-section-{{ section.id }} .ss__slide+.ss__slide{opacity:0}
  #shopify-section-{{ section.id }} .ss__media{position:absolute;inset:0}
  #shopify-section-{{ section.id }} .ss__media img{width:100%;height:100%;object-fit:cover}
  #shopify-section-{{ section.id }} .ss__overlay{position:absolute;inset:0;background:rgba(0,0,0,.32)}
  #shopify-section-{{ section.id }} .ss__inner{position:relative;max-width:640px}
  #shopify-section-{{ section.id }} .ss__text{font-size:clamp(16px,2vw,19px);opacity:.92;margin-bottom:20px}
  #shopify-section-{{ section.id }} .ss__dots{position:absolute;bottom:18px;left:0;right:0;display:flex;gap:8px;justify-content:center;z-index:2}
  #shopify-section-{{ section.id }} .ss__dot{width:9px;height:9px;border-radius:999px;border:0;background:rgba(255,255,255,.5);cursor:pointer}
  #shopify-section-{{ section.id }} .ss__dot[aria-current="true"]{background:#fff}
</style>`,
  schema: {
    name: "Slideshow", tag: "section", max_blocks: 5,
    settings: [...WRAP],
    blocks: [{ type: "slide", name: "Slide", settings: [
      { type: "image_picker", id: "image", label: "Image" },
      { type: "text", id: "heading", label: "Heading", default: "Season highlights" },
      { type: "text", id: "text", label: "Text", default: "Tell a short, punchy story." },
      { type: "text", id: "button_label", label: "Button", default: "Shop" },
      { type: "url", id: "button_link", label: "Link" },
    ] }],
    presets: [{ name: "Slideshow", blocks: [{ type: "slide" }, { type: "slide" }] }],
  },
  defaultSettings: { color_scheme: "scheme-1" },
};

export const multicolumnSection: ShopifySectionDefinition = {
  id: "multicolumn", name: "Multicolumn", category: "content",
  description: "Row of icon/title/text columns — features, benefits, steps (blocks).",
  supportedTemplates: ["index", "page", "product", "collection", "search", "blog"],
  liquid: `<div class="mc ${ROOT}"><div class="page-width">
  {% if section.settings.heading != blank %}<h2 class="mc__h">{{ section.settings.heading | escape }}</h2>{% endif %}
  <div class="mc__grid" style="--cols:{{ section.settings.columns }}">
    {% for block in section.blocks %}
      <div class="mc__col" {{ block.shopify_attributes }}>
        {% if block.settings.image %}<div class="mc__img">{% render 'image', image: block.settings.image, sizes: '120px' %}</div>{% elsif block.settings.icon != blank %}<div class="mc__icon">{{ block.settings.icon }}</div>{% endif %}
        <h3>{{ block.settings.title | escape }}</h3>
        {% if block.settings.text != blank %}<div class="rte">{{ block.settings.text }}</div>{% endif %}
      </div>
    {% endfor %}
  </div>
</div></div>
<style>
  #shopify-section-{{ section.id }} .mc__h{text-align:center;margin-bottom:calc(var(--space) * 3)}
  #shopify-section-{{ section.id }} .mc__grid{display:grid;grid-template-columns:1fr;gap:calc(var(--space) * 3)}
  @media(min-width:750px){#shopify-section-{{ section.id }} .mc__grid{grid-template-columns:repeat(var(--cols,3),minmax(0,1fr))}}
  #shopify-section-{{ section.id }} .mc__icon{font-size:30px;margin-bottom:10px}
  #shopify-section-{{ section.id }} .mc__img img{width:56px;height:56px;object-fit:contain;margin-bottom:10px}
  #shopify-section-{{ section.id }} .mc__col h3{margin:0 0 6px;font-size:19px}
  #shopify-section-{{ section.id }} .mc--center .mc__col{text-align:center}
</style>`,
  schema: {
    name: "Multicolumn", tag: "section", max_blocks: 6,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Why shop with us" },
      { type: "range", id: "columns", label: "Columns", min: 2, max: 4, step: 1, default: 3 },
      ...WRAP,
    ],
    blocks: [{ type: "column", name: "Column", settings: [
      { type: "image_picker", id: "image", label: "Image" },
      { type: "text", id: "icon", label: "Icon (emoji)", default: "★" },
      { type: "text", id: "title", label: "Title", default: "Free shipping" },
      { type: "richtext", id: "text", label: "Text", default: "<p>On all orders over $50.</p>" },
    ] }],
    presets: [{ name: "Multicolumn", blocks: [{ type: "column" }, { type: "column" }, { type: "column" }] }],
  },
  defaultSettings: { heading: "Why shop with us", columns: 3, color_scheme: "scheme-1" },
};

export const multirowSection: ShopifySectionDefinition = {
  id: "multirow", name: "Multirow", category: "content",
  description: "Alternating image + text rows for storytelling (blocks).",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="mr ${ROOT}"><div class="page-width">
  {% for block in section.blocks %}
    <div class="mr__row {% cycle 'a','b' %}" {{ block.shopify_attributes }}>
      <div class="mr__media">{% if block.settings.image %}{% render 'image', image: block.settings.image, sizes: '(min-width:750px) 50vw, 100vw' %}{% else %}<div class="placeholder-media" style="aspect-ratio:4/3"></div>{% endif %}</div>
      <div class="mr__text">
        {% if block.settings.eyebrow != blank %}<p class="eyebrow">{{ block.settings.eyebrow | escape }}</p>{% endif %}
        <h2>{{ block.settings.heading | escape }}</h2>
        {% if block.settings.text != blank %}<div class="rte">{{ block.settings.text }}</div>{% endif %}
        {% render 'button', label: block.settings.button_label, url: block.settings.button_link %}
      </div>
    </div>
  {% endfor %}
</div></div>
<style>
  #shopify-section-{{ section.id }} .mr__row{display:grid;gap:calc(var(--space) * 3);align-items:center;margin-bottom:calc(var(--space) * 5)}
  #shopify-section-{{ section.id }} .mr__row:last-child{margin-bottom:0}
  @media(min-width:800px){#shopify-section-{{ section.id }} .mr__row{grid-template-columns:1fr 1fr}#shopify-section-{{ section.id }} .mr__row.b .mr__media{order:2}}
  #shopify-section-{{ section.id }} .mr__media img{width:100%;border-radius:var(--radius)}
</style>`,
  schema: {
    name: "Multirow", tag: "section", max_blocks: 6,
    settings: [...WRAP],
    blocks: [{ type: "row", name: "Row", settings: [
      { type: "image_picker", id: "image", label: "Image" },
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Made with intention" },
      { type: "richtext", id: "text", label: "Text", default: "<p>Explain a value or process step here.</p>" },
      { type: "text", id: "button_label", label: "Button" },
      { type: "url", id: "button_link", label: "Link" },
    ] }],
    presets: [{ name: "Multirow", blocks: [{ type: "row" }, { type: "row" }] }],
  },
  defaultSettings: { color_scheme: "scheme-1" },
};

export const logoListSection: ShopifySectionDefinition = {
  id: "logo-list", name: "Logo list", category: "logos",
  description: "Row of partner/press logos (blocks).",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="ll ${ROOT}"><div class="page-width">
  {% if section.settings.heading != blank %}<p class="ll__h eyebrow" style="text-align:center">{{ section.settings.heading | escape }}</p>{% endif %}
  <div class="ll__row">
    {% for block in section.blocks %}<div class="ll__logo" {{ block.shopify_attributes }}>{% if block.settings.image %}{% render 'image', image: block.settings.image, sizes: '140px' %}{% else %}<span>{{ block.settings.name | default: 'Logo' }}</span>{% endif %}</div>{% endfor %}
  </div>
</div></div>
<style>
  #shopify-section-{{ section.id }} .ll__row{display:flex;flex-wrap:wrap;gap:calc(var(--space) * 4);align-items:center;justify-content:center;margin-top:20px}
  #shopify-section-{{ section.id }} .ll__logo{opacity:.7;font-weight:700;font-size:18px}
  #shopify-section-{{ section.id }} .ll__logo img{max-height:36px;width:auto;filter:grayscale(1);opacity:.75}
</style>`,
  schema: {
    name: "Logo list", tag: "section", max_blocks: 12,
    settings: [{ type: "text", id: "heading", label: "Heading", default: "As seen in" }, ...WRAP],
    blocks: [{ type: "logo", name: "Logo", settings: [{ type: "image_picker", id: "image", label: "Logo" }, { type: "text", id: "name", label: "Name", default: "Brand" }] }],
    presets: [{ name: "Logo list", blocks: [{ type: "logo" }, { type: "logo" }, { type: "logo" }, { type: "logo" }] }],
  },
  defaultSettings: { heading: "As seen in", color_scheme: "scheme-3" },
};

export const countdownSection: ShopifySectionDefinition = {
  id: "countdown", name: "Countdown", category: "content",
  description: "Urgency band with a heading and a live countdown to a date.",
  supportedTemplates: ["index", "page", "collection"],
  liquid: `<div class="cd ${ROOT}"><div class="page-width" style="text-align:center">
  {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
  {% if section.settings.text != blank %}<p>{{ section.settings.text | escape }}</p>{% endif %}
  <div class="cd__timer" data-countdown="{{ section.settings.date }}"><span data-d>00</span>d <span data-h>00</span>h <span data-m>00</span>m <span data-s>00</span>s</div>
  {% render 'button', label: section.settings.button_label, url: section.settings.button_link %}
</div></div>
<style>
  #shopify-section-{{ section.id }} .cd__timer{font-size:clamp(24px,4vw,40px);font-weight:700;font-variant-numeric:tabular-nums;margin:16px 0 18px;letter-spacing:.02em}
</style>
<script>(function(){var el=document.currentScript.previousElementSibling;}());</script>
<script>
(function(){var root=document.getElementById('shopify-section-{{ section.id }}');if(!root)return;var t=root.querySelector('[data-countdown]');if(!t)return;var target=new Date(t.getAttribute('data-countdown')).getTime();function pad(n){return String(n).padStart(2,'0');}function tick(){var d=Math.max(0,target-Date.now());var s=Math.floor(d/1000);t.querySelector('[data-d]').textContent=pad(Math.floor(s/86400));t.querySelector('[data-h]').textContent=pad(Math.floor(s%86400/3600));t.querySelector('[data-m]').textContent=pad(Math.floor(s%3600/60));t.querySelector('[data-s]').textContent=pad(s%60);}tick();setInterval(tick,1000);}());
</script>`,
  schema: {
    name: "Countdown", tag: "section",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Sale ends soon" },
      { type: "text", id: "text", label: "Text", default: "Don't miss out." },
      { type: "text", id: "date", label: "End date (YYYY-MM-DD)", default: "2030-01-01", info: "Use an ISO date/time." },
      { type: "text", id: "button_label", label: "Button", default: "Shop the sale" },
      { type: "url", id: "button_link", label: "Link" },
      ...WRAP,
    ],
    presets: [{ name: "Countdown" }],
  },
  defaultSettings: { heading: "Sale ends soon", date: "2030-01-01", color_scheme: "scheme-2" },
};

export const contactFormSection: ShopifySectionDefinition = {
  id: "contact-form", name: "Contact form", category: "content",
  description: "Accessible contact form wired to Shopify's contact form.",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="cf ${ROOT}"><div class="page-width" style="max-width:640px">
  {% if section.settings.heading != blank %}<h2 style="text-align:center">{{ section.settings.heading | escape }}</h2>{% endif %}
  {% form 'contact' %}
    {% if form.posted_successfully? %}<p class="cf__ok">Thanks — we'll be in touch.</p>{% endif %}
    <div class="cf__row"><label>Name<input type="text" name="contact[name]" required></label><label>Email<input type="email" name="contact[email]" required></label></div>
    <label>Message<textarea name="contact[body]" rows="5" required></textarea></label>
    <button type="submit" class="btn btn--primary">{{ section.settings.button_label | default: 'Send' }}</button>
  {% endform %}
</div></div>
<style>
  #shopify-section-{{ section.id }} label{display:block;margin-bottom:14px;font-weight:600;font-size:14px}
  #shopify-section-{{ section.id }} input,#shopify-section-{{ section.id }} textarea{display:block;width:100%;margin-top:6px;border:1px solid var(--color-border);border-radius:var(--radius);padding:11px 13px;font-size:15px;font-weight:400}
  #shopify-section-{{ section.id }} .cf__row{display:grid;gap:14px}
  @media(min-width:600px){#shopify-section-{{ section.id }} .cf__row{grid-template-columns:1fr 1fr}}
  #shopify-section-{{ section.id }} .cf__ok{background:var(--color-secondary);color:#fff;padding:10px 14px;border-radius:var(--radius)}
</style>`,
  schema: {
    name: "Contact form", tag: "section",
    settings: [{ type: "text", id: "heading", label: "Heading", default: "Get in touch" }, { type: "text", id: "button_label", label: "Button", default: "Send" }, ...WRAP],
    presets: [{ name: "Contact form" }],
  },
  defaultSettings: { heading: "Get in touch", color_scheme: "scheme-1" },
};

export const blogPostsSection: ShopifySectionDefinition = {
  id: "blog-posts", name: "Blog posts", category: "content",
  description: "Recent articles from a chosen blog.",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="bp ${ROOT}"><div class="page-width">
  <div class="bp__head">{% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}</div>
  <div class="grid grid--3">
    {% assign blog = blogs[section.settings.blog] %}
    {% for article in blog.articles limit: section.settings.count %}
      <a class="card" href="{{ article.url }}"><div class="product-card__media" style="aspect-ratio:16/10">{% if article.image %}{% render 'image', image: article.image %}{% else %}<div class="placeholder-media"></div>{% endif %}</div><div style="padding:14px"><p class="eyebrow">{{ article.published_at | date: '%b %d' }}</p><p class="product-card__title" style="margin:0">{{ article.title | escape }}</p></div></a>
    {% else %}
      {% for i in (1..section.settings.count) %}<div class="card"><div class="placeholder-media" style="aspect-ratio:16/10"></div><div style="padding:14px"><p class="product-card__title" style="margin:0">Article title</p></div></div>{% endfor %}
    {% endfor %}
  </div>
</div></div>
<style>#shopify-section-{{ section.id }} .bp__head{margin-bottom:calc(var(--space) * 3)}</style>`,
  schema: {
    name: "Blog posts", tag: "section",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "From the journal" },
      { type: "text", id: "blog", label: "Blog handle", default: "news" },
      { type: "range", id: "count", label: "Posts", min: 2, max: 6, step: 1, default: 3 },
      ...WRAP,
    ],
    presets: [{ name: "Blog posts" }],
  },
  defaultSettings: { heading: "From the journal", blog: "news", count: 3, color_scheme: "scheme-1" },
};

export const productRecommendationsSection: ShopifySectionDefinition = {
  id: "product-recommendations", name: "Product recommendations", category: "products",
  description: "Related products (Shopify recommendations) on the product page.",
  supportedTemplates: ["product"],
  liquid: `<div class="pr ${ROOT}"><div class="page-width">
  {% if recommendations.performed and recommendations.products_count > 0 %}
    {% if section.settings.heading != blank %}<h2 style="margin-bottom:calc(var(--space) * 3)">{{ section.settings.heading | escape }}</h2>{% endif %}
    <div class="grid grid--4">{% for product in recommendations.products limit: section.settings.count %}{% render 'product-card', product: product %}{% endfor %}</div>
  {% endif %}
</div></div>`,
  schema: {
    name: "Product recommendations", tag: "section",
    settings: [{ type: "text", id: "heading", label: "Heading", default: "You may also like" }, { type: "range", id: "count", label: "Products", min: 2, max: 8, step: 1, default: 4 }, ...WRAP],
    presets: [{ name: "Product recommendations" }],
  },
  defaultSettings: { heading: "You may also like", count: 4, color_scheme: "scheme-1" },
};

export const CREATIVE_SECTIONS: ShopifySectionDefinition[] = [
  imageBannerSection, slideshowSection, multicolumnSection, multirowSection,
  logoListSection, countdownSection, contactFormSection, blogPostsSection,
  productRecommendationsSection,
];
