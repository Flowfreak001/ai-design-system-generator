// Additional content sections (phase 2). Each is real Online Store 2.0 Liquid
// with a valid {% schema %}, theme-token CSS variables, and scoped responsive
// styles. Registered in sections/index.ts.

import type { ShopifySectionDefinition } from "../types";

export const richTextSection: ShopifySectionDefinition = {
  id: "rich-text",
  name: "Rich text",
  category: "content",
  description: "Centered heading + rich text with an optional button — good for story or intro copy.",
  supportedTemplates: ["index", "page", "product", "collection"],
  liquid: `<div class="rt page-width section rt--{{ section.settings.alignment }}">
  {% if section.settings.eyebrow != blank %}<p class="rt__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
  {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
  {% if section.settings.body != blank %}<div class="rt__body">{{ section.settings.body }}</div>{% endif %}
  {% if section.settings.button_label != blank %}<a class="btn btn--primary" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label | escape }}</a>{% endif %}
</div>
<style>
  #shopify-section-{{ section.id }} .rt{max-width:720px}
  #shopify-section-{{ section.id }} .rt--center{margin-inline:auto;text-align:center}
  #shopify-section-{{ section.id }} .rt__eyebrow{margin:0 0 8px;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:600;color:var(--color-secondary)}
  #shopify-section-{{ section.id }} h2{font-size:clamp(26px,3.4vw,40px)}
  #shopify-section-{{ section.id }} .rt__body{opacity:.86;line-height:1.65;margin:14px 0 20px}
</style>`,
  schema: {
    name: "Rich text",
    class: "section-rt",
    settings: [
      { type: "select", id: "alignment", label: "Alignment", default: "center", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Our promise" },
      { type: "richtext", id: "body", label: "Text", default: "<p>Use this space to share your brand story, values, or a message that matters to your customers.</p>" },
      { type: "text", id: "button_label", label: "Button" },
      { type: "url", id: "button_link", label: "Button link" },
    ],
    presets: [{ name: "Rich text" }],
  },
  defaultSettings: { heading: "Our promise", alignment: "center" },
};

export const uspBarSection: ShopifySectionDefinition = {
  id: "usp-bar",
  name: "USP bar",
  category: "content",
  description: "Row of icon + title + text value props (blocks). Great trust strip under the hero.",
  supportedTemplates: ["index", "page", "product", "collection"],
  liquid: `<div class="usp page-width section">
  {% if section.settings.heading != blank %}<h2 class="usp__heading">{{ section.settings.heading | escape }}</h2>{% endif %}
  <div class="usp__grid">
    {% for block in section.blocks %}
      <div class="usp__item" {{ block.shopify_attributes }}>
        {% if block.settings.icon != blank %}<div class="usp__icon">{{ block.settings.icon }}</div>{% endif %}
        <p class="usp__title">{{ block.settings.title | escape }}</p>
        {% if block.settings.text != blank %}<p class="usp__text">{{ block.settings.text | escape }}</p>{% endif %}
      </div>
    {% endfor %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .usp__heading{text-align:center;font-size:clamp(22px,2.6vw,30px);margin-bottom:calc(var(--space) * 3)}
  #shopify-section-{{ section.id }} .usp__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(var(--space) * 3)}
  @media(min-width:800px){#shopify-section-{{ section.id }} .usp__grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
  #shopify-section-{{ section.id }} .usp__item{text-align:center}
  #shopify-section-{{ section.id }} .usp__icon{font-size:26px;margin-bottom:8px}
  #shopify-section-{{ section.id }} .usp__title{font-weight:600;margin:0 0 4px}
  #shopify-section-{{ section.id }} .usp__text{opacity:.8;font-size:14px;margin:0}
</style>`,
  schema: {
    name: "USP bar",
    class: "section-usp",
    settings: [{ type: "text", id: "heading", label: "Heading" }],
    blocks: [
      {
        type: "usp", name: "Value prop",
        settings: [
          { type: "text", id: "icon", label: "Icon (emoji or text)", default: "★" },
          { type: "text", id: "title", label: "Title", default: "Free shipping" },
          { type: "text", id: "text", label: "Text", default: "On orders over $50" },
        ],
      },
    ],
    max_blocks: 4,
    presets: [{
      name: "USP bar",
      blocks: [
        { type: "usp", settings: { title: "Free shipping", text: "On orders over $50" } },
        { type: "usp", settings: { title: "Easy returns", text: "30-day window" } },
        { type: "usp", settings: { title: "Secure checkout", text: "Encrypted payments" } },
        { type: "usp", settings: { title: "Real support", text: "We reply within a day" } },
      ],
    }],
  },
  defaultSettings: {},
};

export const newsletterSection: ShopifySectionDefinition = {
  id: "newsletter",
  name: "Newsletter",
  category: "content",
  description: "Email capture band wired to Shopify's customer form.",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="nl page-width section">
  <div class="nl__box">
    {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
    {% if section.settings.subtext != blank %}<p class="nl__sub">{{ section.settings.subtext | escape }}</p>{% endif %}
    {% form 'customer' %}
      <input type="hidden" name="contact[tags]" value="newsletter">
      <div class="nl__row">
        <input type="email" name="contact[email]" placeholder="{{ section.settings.placeholder | default: 'Email address' }}" required>
        <button type="submit" class="btn btn--primary">{{ section.settings.button_label | default: 'Subscribe' }}</button>
      </div>
    {% endform %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .nl__box{max-width:560px;margin-inline:auto;text-align:center}
  #shopify-section-{{ section.id }} h2{font-size:clamp(24px,3vw,34px)}
  #shopify-section-{{ section.id }} .nl__sub{opacity:.82;margin:10px 0 20px}
  #shopify-section-{{ section.id }} .nl__row{display:flex;gap:8px;flex-wrap:wrap}
  #shopify-section-{{ section.id }} .nl__row input{flex:1;min-width:0;border:1px solid rgba(0,0,0,.15);border-radius:var(--radius);padding:12px 14px;font-size:15px}
</style>`,
  schema: {
    name: "Newsletter",
    class: "section-nl",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Join the list" },
      { type: "text", id: "subtext", label: "Subtext", default: "Get new arrivals and offers in your inbox." },
      { type: "text", id: "placeholder", label: "Input placeholder", default: "Email address" },
      { type: "text", id: "button_label", label: "Button label", default: "Subscribe" },
    ],
    presets: [{ name: "Newsletter" }],
  },
  defaultSettings: { heading: "Join the list", button_label: "Subscribe" },
};

export const testimonialsSection: ShopifySectionDefinition = {
  id: "testimonials",
  name: "Testimonials",
  category: "content",
  description: "Grid of customer quotes with author + role (blocks).",
  supportedTemplates: ["index", "page", "product"],
  liquid: `<div class="tm page-width section">
  {% if section.settings.heading != blank %}<h2 class="tm__heading">{{ section.settings.heading | escape }}</h2>{% endif %}
  <div class="tm__grid">
    {% for block in section.blocks %}
      <figure class="tm__card" {{ block.shopify_attributes }}>
        <blockquote>{{ block.settings.quote | escape }}</blockquote>
        <figcaption><span class="tm__author">{{ block.settings.author | escape }}</span>{% if block.settings.role != blank %}<span class="tm__role">{{ block.settings.role | escape }}</span>{% endif %}</figcaption>
      </figure>
    {% endfor %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .tm__heading{text-align:center;font-size:clamp(24px,3vw,36px);margin-bottom:calc(var(--space) * 3)}
  #shopify-section-{{ section.id }} .tm__grid{display:grid;grid-template-columns:1fr;gap:calc(var(--space) * 3)}
  @media(min-width:800px){#shopify-section-{{ section.id }} .tm__grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
  #shopify-section-{{ section.id }} .tm__card{margin:0;padding:24px;border:1px solid rgba(0,0,0,.1);border-radius:var(--radius);background:rgba(0,0,0,.015)}
  #shopify-section-{{ section.id }} blockquote{margin:0 0 16px;font-size:16px;line-height:1.6}
  #shopify-section-{{ section.id }} .tm__author{display:block;font-weight:600}
  #shopify-section-{{ section.id }} .tm__role{display:block;opacity:.7;font-size:14px}
</style>`,
  schema: {
    name: "Testimonials",
    class: "section-tm",
    settings: [{ type: "text", id: "heading", label: "Heading", default: "What customers say" }],
    blocks: [
      {
        type: "quote", name: "Testimonial",
        settings: [
          { type: "richtext", id: "quote", label: "Quote", default: "This is the best purchase I've made all year." },
          { type: "text", id: "author", label: "Author", default: "Jordan Blake" },
          { type: "text", id: "role", label: "Role", default: "Verified buyer" },
        ],
      },
    ],
    max_blocks: 9,
    presets: [{
      name: "Testimonials",
      blocks: [
        { type: "quote", settings: { author: "Jordan Blake", role: "Verified buyer" } },
        { type: "quote", settings: { author: "Sam Rivera", role: "Verified buyer" } },
        { type: "quote", settings: { author: "Priya Nair", role: "Verified buyer" } },
      ],
    }],
  },
  defaultSettings: { heading: "What customers say" },
};

export const collectionListSection: ShopifySectionDefinition = {
  id: "collection-list",
  name: "Collection list",
  category: "products",
  description: "Grid of collection cards linking into each collection (blocks).",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="cl page-width section">
  <div class="cl__head">
    {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
  </div>
  <div class="grid grid--{{ section.settings.columns }}">
    {% for block in section.blocks %}
      {% assign coll = collections[block.settings.collection] %}
      <a class="cl__card" href="{{ coll.url | default: '#' }}" {{ block.shopify_attributes }}>
        <div class="cl__media">{% if coll.featured_image %}<img src="{{ coll.featured_image | image_url: width: 700 }}" alt="{{ coll.title | escape }}" loading="lazy" width="700" height="700">{% endif %}</div>
        <p class="cl__title">{{ block.settings.title | default: coll.title | default: 'Collection' }}</p>
      </a>
    {% endfor %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .cl__head{margin-bottom:calc(var(--space) * 3)}
  #shopify-section-{{ section.id }} .cl__head h2{font-size:clamp(24px,3vw,36px)}
  #shopify-section-{{ section.id }} .cl__card{display:block;text-decoration:none;color:inherit}
  #shopify-section-{{ section.id }} .cl__media{aspect-ratio:1/1;border-radius:var(--radius);overflow:hidden;background:#eef0f3;margin-bottom:10px}
  #shopify-section-{{ section.id }} .cl__media img{width:100%;height:100%;object-fit:cover}
  #shopify-section-{{ section.id }} .cl__title{font-weight:600;margin:0}
</style>`,
  schema: {
    name: "Collection list",
    class: "section-cl",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Shop by collection" },
      { type: "select", id: "columns", label: "Columns", default: "3", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    ],
    blocks: [
      {
        type: "collection_item", name: "Collection",
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "title", label: "Custom title" },
        ],
      },
    ],
    max_blocks: 12,
    presets: [{
      name: "Collection list",
      blocks: [
        { type: "collection_item", settings: { title: "New arrivals" } },
        { type: "collection_item", settings: { title: "Best sellers" } },
        { type: "collection_item", settings: { title: "On sale" } },
      ],
    }],
  },
  defaultSettings: { heading: "Shop by collection", columns: "3" },
};

export const featuredProductSection: ShopifySectionDefinition = {
  id: "featured-product",
  name: "Featured product",
  category: "products",
  description: "Single highlighted product with image, title, price and add-to-cart.",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="fp page-width section">
  {% assign product = all_products[section.settings.product] %}
  <div class="fp__grid">
    <div class="fp__media">
      {% if product.featured_image %}<img src="{{ product.featured_image | image_url: width: 900 }}" alt="{{ product.title | escape }}" width="900" height="900">
      {% else %}<div class="fp__ph"></div>{% endif %}
    </div>
    <div class="fp__body">
      {% if section.settings.eyebrow != blank %}<p class="fp__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
      <h2>{{ product.title | default: 'Featured product' }}</h2>
      <p class="fp__price">{{ product.price | money | default: '$0.00' }}</p>
      {% if product.description != blank %}<div class="fp__desc">{{ product.description | strip_html | truncatewords: 40 }}</div>{% endif %}
      {% if product != blank %}
        {% form 'product', product %}
          <button type="submit" name="add" class="btn btn--primary" {% if product.available == false %}disabled{% endif %}>{% if product.available %}{{ section.settings.button_label | default: 'Add to cart' }}{% else %}Sold out{% endif %}</button>
        {% endform %}
      {% else %}
        <button class="btn btn--primary" type="button">{{ section.settings.button_label | default: 'Add to cart' }}</button>
      {% endif %}
    </div>
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .fp__grid{display:grid;gap:calc(var(--space) * 4);align-items:center}
  @media(min-width:800px){#shopify-section-{{ section.id }} .fp__grid{grid-template-columns:1fr 1fr}}
  #shopify-section-{{ section.id }} .fp__media img,#shopify-section-{{ section.id }} .fp__ph{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--radius);background:#eef0f3}
  #shopify-section-{{ section.id }} .fp__eyebrow{margin:0 0 8px;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:600;color:var(--color-secondary)}
  #shopify-section-{{ section.id }} h2{font-size:clamp(26px,3.4vw,40px);margin:0 0 8px}
  #shopify-section-{{ section.id }} .fp__price{font-size:20px;font-weight:600;margin:0 0 14px}
  #shopify-section-{{ section.id }} .fp__desc{opacity:.85;line-height:1.6;margin-bottom:20px}
</style>`,
  schema: {
    name: "Featured product",
    class: "section-fp",
    settings: [
      { type: "product", id: "product", label: "Product" },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Featured" },
      { type: "text", id: "button_label", label: "Button label", default: "Add to cart" },
    ],
    presets: [{ name: "Featured product" }],
  },
  defaultSettings: { eyebrow: "Featured", button_label: "Add to cart" },
};
