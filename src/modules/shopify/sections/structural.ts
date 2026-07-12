import type { ShopifySectionDefinition } from "../types";

// Structural sections referenced directly by layout/theme.liquid. They are
// always present in a generated theme (not placed per-page).

export const announcementBarSection: ShopifySectionDefinition = {
  id: "announcement-bar",
  name: "Announcement bar",
  category: "structural",
  description: "Slim top bar for a promo or shipping message.",
  supportedTemplates: ["index", "product", "collection", "page", "cart"],
  liquid: `{% if section.settings.text != blank %}
<div class="announcement" style="background:{{ section.settings.bg }};color:{{ section.settings.fg }}">
  <div class="page-width announcement__inner">{{ section.settings.text | escape }}</div>
</div>
<style>#shopify-section-{{ section.id }} .announcement__inner{padding:9px 0;text-align:center;font-size:13px;font-weight:500;letter-spacing:.02em}</style>
{% endif %}`,
  schema: {
    name: "Announcement bar",
    settings: [
      { type: "text", id: "text", label: "Text", default: "Free shipping on orders over $50" },
      { type: "color", id: "bg", label: "Background", default: "#111827" },
      { type: "color", id: "fg", label: "Text colour", default: "#ffffff" },
    ],
  },
  defaultSettings: { text: "Free shipping on orders over $50", bg: "#111827", fg: "#ffffff" },
};

export const headerSection: ShopifySectionDefinition = {
  id: "header",
  name: "Header",
  category: "structural",
  description: "Store header with logo/name, navigation and cart link.",
  supportedTemplates: ["index", "product", "collection", "page", "cart"],
  liquid: `<header class="site-header">
  <div class="page-width site-header__inner">
    <a class="site-header__brand" href="{{ routes.root_url }}">
      {% if section.settings.logo %}
        <img src="{{ section.settings.logo | image_url: width: 320 }}" alt="{{ shop.name | escape }}" width="160" height="40">
      {% else %}
        {{ shop.name | escape }}
      {% endif %}
    </a>
    <nav class="site-header__nav" aria-label="Primary">
      {% assign menu = linklists[section.settings.menu] %}
      {% if menu.links.size > 0 %}
        {% for link in menu.links %}<a href="{{ link.url }}">{{ link.title | escape }}</a>{% endfor %}
      {% else %}
        <a href="{{ routes.all_products_collection_url }}">Shop</a>
      {% endif %}
    </nav>
    <a class="site-header__cart" href="{{ routes.cart_url }}">Cart ({{ cart.item_count }})</a>
  </div>
</header>
<style>
  #shopify-section-{{ section.id }} .site-header{border-bottom:1px solid rgba(0,0,0,.08);background:var(--color-background)}
  #shopify-section-{{ section.id }} .site-header__inner{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:64px}
  #shopify-section-{{ section.id }} .site-header__brand{font-family:var(--font-heading);font-weight:700;font-size:20px;text-decoration:none}
  #shopify-section-{{ section.id }} .site-header__nav{display:none;gap:22px}
  #shopify-section-{{ section.id }} .site-header__nav a{font-size:14px;text-decoration:none}
  #shopify-section-{{ section.id }} .site-header__cart{font-size:14px;font-weight:600;text-decoration:none}
  @media(min-width:800px){#shopify-section-{{ section.id }} .site-header__nav{display:flex}}
</style>`,
  schema: {
    name: "Header",
    settings: [
      { type: "image_picker", id: "logo", label: "Logo" },
      { type: "text", id: "menu", label: "Menu handle", default: "main-menu" },
    ],
  },
  defaultSettings: { menu: "main-menu" },
};

export const footerSection: ShopifySectionDefinition = {
  id: "footer",
  name: "Footer",
  category: "structural",
  description: "Store footer with menu blocks and copyright.",
  supportedTemplates: ["index", "product", "collection", "page", "cart"],
  liquid: `<footer class="site-footer section">
  <div class="page-width">
    <div class="site-footer__cols">
      <div class="site-footer__brand">
        <p class="site-footer__name">{{ shop.name | escape }}</p>
        {% if section.settings.tagline != blank %}<p class="site-footer__tag">{{ section.settings.tagline | escape }}</p>{% endif %}
      </div>
      {% for block in section.blocks %}
        <div class="site-footer__col" {{ block.shopify_attributes }}>
          {% if block.settings.title != blank %}<p class="site-footer__title">{{ block.settings.title | escape }}</p>{% endif %}
          <ul>{% for link in linklists[block.settings.menu].links %}<li><a href="{{ link.url }}">{{ link.title | escape }}</a></li>{% endfor %}</ul>
        </div>
      {% endfor %}
    </div>
    <p class="site-footer__copy">&copy; {{ 'now' | date: '%Y' }} {{ shop.name | escape }}. All rights reserved.</p>
  </div>
</footer>
<style>
  #shopify-section-{{ section.id }} .site-footer{background:var(--color-primary);color:#fff}
  #shopify-section-{{ section.id }} .site-footer__cols{display:grid;gap:calc(var(--space) * 3);grid-template-columns:1fr}
  @media(min-width:700px){#shopify-section-{{ section.id }} .site-footer__cols{grid-template-columns:1.4fr repeat(3,1fr)}}
  #shopify-section-{{ section.id }} .site-footer__name{font-family:var(--font-heading);font-weight:700;font-size:20px;margin:0}
  #shopify-section-{{ section.id }} .site-footer__tag{opacity:.75;max-width:260px}
  #shopify-section-{{ section.id }} .site-footer__title{font-weight:600;margin:0 0 10px}
  #shopify-section-{{ section.id }} .site-footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  #shopify-section-{{ section.id }} .site-footer a{opacity:.8;text-decoration:none;font-size:14px}
  #shopify-section-{{ section.id }} .site-footer__copy{margin-top:calc(var(--space) * 4);opacity:.6;font-size:12.5px}
</style>`,
  schema: {
    name: "Footer",
    settings: [{ type: "text", id: "tagline", label: "Tagline", default: "Considered products, made to last." }],
    blocks: [
      {
        type: "menu", name: "Menu column",
        settings: [
          { type: "text", id: "title", label: "Title", default: "Shop" },
          { type: "text", id: "menu", label: "Menu handle", default: "footer" },
        ],
      },
    ],
    max_blocks: 4,
    presets: [{ name: "Footer" }],
  },
  defaultSettings: { tagline: "Considered products, made to last." },
};
