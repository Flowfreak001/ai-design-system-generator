// Prebuilt premium sections — high-quality, industry-standard layouts inspired by
// modern grocery/lifestyle Shopify themes. LAYOUT + STYLE only: all copy/media are
// neutral placeholders (no brand names, no reference text). Each is real OS 2.0
// Liquid + a valid {% schema %}, theme-token styled, and passes the sanitizer +
// validator so any user edit stays export-safe.

import type { ShopifySectionDefinition, ShopifySettingField } from "../types";

const WRAP: ShopifySettingField[] = [
  { type: "color_scheme", id: "color_scheme", label: "Color scheme", default: "scheme-1" },
  { type: "range", id: "padding_top", label: "Top padding", min: 0, max: 140, step: 4, unit: "px", default: 64 },
  { type: "range", id: "padding_bottom", label: "Bottom padding", min: 0, max: 140, step: 4, unit: "px", default: 64 },
];

/* ── Split hero ─────────────────────────────────────────────────────────────── */
export const splitHeroSection: ShopifySectionDefinition = {
  id: "split-hero",
  name: "Split hero",
  category: "hero",
  description: "Editorial hero: eyebrow, star rating, large headline, button and a product image beside it.",
  supportedTemplates: ["index", "page", "collection"],
  liquid: `<div class="shx shx--v-{{ section.settings.variant | default: 'split' }} color-{{ section.settings.color_scheme }} section" data-animate style="--section-pt:{{ section.settings.padding_top }}px;--section-pb:{{ section.settings.padding_bottom }}px">
  <div class="shx__grid page-width shx--media-{{ section.settings.image_side }}">
    <div class="shx__text">
      {% if section.settings.eyebrow != blank %}<p class="shx__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
      {% if section.settings.show_rating %}
        <div class="shx__rating">
          <span class="shx__stars" style="--pct:{{ section.settings.rating | times: 20 }}%" aria-hidden="true"><span class="shx__stars-bg">★★★★★</span><span class="shx__stars-fg">★★★★★</span></span>
          {% if section.settings.rating_text != blank %}<span class="shx__rating-text">{{ section.settings.rating_text | escape }}</span>{% endif %}
        </div>
      {% endif %}
      {% if section.settings.heading != blank %}<h1 class="shx__heading">{{ section.settings.heading | escape }}</h1>{% endif %}
      {% if section.settings.subheading != blank %}<div class="shx__sub rte">{{ section.settings.subheading }}</div>{% endif %}
      {% if section.settings.button_label != blank %}<div class="shx__actions">{% render 'button', label: section.settings.button_label, url: section.settings.button_link %}</div>{% endif %}
    </div>
    <div class="shx__media">
      {% if section.settings.image %}<img src="{{ section.settings.image | image_url: width: 1400 }}" alt="{{ section.settings.image.alt | escape }}" loading="{% if section.index == 1 %}eager{% else %}lazy{% endif %}" width="{{ section.settings.image.width }}" height="{{ section.settings.image.height }}">{% else %}<div class="placeholder-media" style="aspect-ratio:1/1"></div>{% endif %}
    </div>
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .shx__grid{display:grid;gap:clamp(28px,5vw,64px);align-items:center}
  @media(min-width:800px){#shopify-section-{{ section.id }} .shx__grid{grid-template-columns:1fr 1fr}#shopify-section-{{ section.id }} .shx--media-left .shx__media{order:-1}}
  #shopify-section-{{ section.id }} .shx__eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:600;color:var(--color-secondary);margin:0 0 14px}
  #shopify-section-{{ section.id }} .shx__rating{display:flex;align-items:center;gap:10px;margin-bottom:18px}
  #shopify-section-{{ section.id }} .shx__stars{position:relative;display:inline-block;font-size:18px;line-height:1;letter-spacing:2px}
  #shopify-section-{{ section.id }} .shx__stars-bg{color:rgba(0,0,0,.16)}
  #shopify-section-{{ section.id }} .shx__stars-fg{position:absolute;inset:0;width:var(--pct);overflow:hidden;color:#f5a623;white-space:nowrap}
  #shopify-section-{{ section.id }} .shx__rating-text{font-size:14px;font-weight:600;opacity:.85}
  #shopify-section-{{ section.id }} .shx__heading{margin:0;font-size:clamp(40px,6.5vw,76px);line-height:1.02;letter-spacing:-0.035em}
  #shopify-section-{{ section.id }} .shx__sub{margin:18px 0 0;font-size:clamp(16px,1.6vw,19px);opacity:.85;max-width:44ch;line-height:1.6}
  #shopify-section-{{ section.id }} .shx__actions{margin-top:28px}
  #shopify-section-{{ section.id }} .shx__media img,#shopify-section-{{ section.id }} .shx__media .placeholder-media{width:100%;height:auto;border-radius:calc(var(--radius) * 1.5);object-fit:cover}
  #shopify-section-{{ section.id }} .shx--v-centered .shx__grid{grid-template-columns:1fr!important;max-width:760px;margin-inline:auto;text-align:center}
  #shopify-section-{{ section.id }} .shx--v-centered .shx__rating,#shopify-section-{{ section.id }} .shx--v-centered .shx__actions{justify-content:center}
  #shopify-section-{{ section.id }} .shx--v-centered .shx__sub{margin-inline:auto}
  #shopify-section-{{ section.id }} .shx--v-centered .shx__media{order:2;max-width:560px;margin-inline:auto}
  #shopify-section-{{ section.id }} .shx--v-minimal .shx__grid{grid-template-columns:1fr!important;max-width:640px}
  #shopify-section-{{ section.id }} .shx--v-minimal .shx__media{display:none}
</style>`,
  schema: {
    name: "Split hero", tag: "section", class: "section-split-hero",
    settings: [
      { type: "select", id: "variant", label: "Design", default: "split", options: [{ value: "split", label: "Split (image beside)" }, { value: "centered", label: "Centered (image below)" }, { value: "minimal", label: "Minimal (text only)" }] },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Fresh & seasonal" },
      { type: "checkbox", id: "show_rating", label: "Show rating", default: true },
      { type: "range", id: "rating", label: "Rating (stars)", min: 0, max: 5, step: 0.5, default: 5 },
      { type: "text", id: "rating_text", label: "Rating label", default: "Loved by 500+ shoppers" },
      { type: "text", id: "heading", label: "Heading", default: "Fresh. Organic. Delivered." },
      { type: "richtext", id: "subheading", label: "Text", default: "<p>Everyday essentials, sourced with care and brought straight to your door.</p>" },
      { type: "text", id: "button_label", label: "Button", default: "Shop now" },
      { type: "url", id: "button_link", label: "Button link" },
      { type: "image_picker", id: "image", label: "Image" },
      { type: "select", id: "image_side", label: "Image side", default: "right", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      ...WRAP,
    ],
    presets: [{ name: "Split hero" }],
  },
  variants: [{ id: "split", label: "Split" }, { id: "centered", label: "Centered" }, { id: "minimal", label: "Minimal" }],
  defaultSettings: { variant: "split", heading: "Fresh. Organic. Delivered.", eyebrow: "Fresh & seasonal", show_rating: true, rating: 5, image_side: "right", color_scheme: "scheme-1", button_label: "Shop now" },
};

/* ── Category cards ─────────────────────────────────────────────────────────── */
export const categoryCardsSection: ShopifySectionDefinition = {
  id: "category-cards",
  name: "Category cards",
  category: "collections",
  description: "Row of tall editorial cards — colored background, image, eyebrow, big title and a pill button (blocks).",
  supportedTemplates: ["index", "page", "collection"],
  liquid: `<div class="ccx ccx--v-{{ section.settings.variant | default: 'cards' }} color-{{ section.settings.color_scheme }} section" data-animate style="--section-pt:{{ section.settings.padding_top }}px;--section-pb:{{ section.settings.padding_bottom }}px">
  <div class="page-width">
    {% if section.settings.heading != blank %}<h2 class="ccx__h">{{ section.settings.heading | escape }}</h2>{% endif %}
    <div class="ccx__grid" style="--cols:{{ section.settings.columns }}">
      {% for block in section.blocks %}
        <a class="ccx__card" href="{{ block.settings.link | default: '#' }}" style="background:{{ block.settings.bg | default: '#eef1ec' }}" {{ block.shopify_attributes }}>
          <div class="ccx__media">{% if block.settings.image %}<img src="{{ block.settings.image | image_url: width: 900 }}" alt="{{ block.settings.title | escape }}" loading="lazy" width="{{ block.settings.image.width }}" height="{{ block.settings.image.height }}">{% else %}<div class="ccx__ph"></div>{% endif %}</div>
          <div class="ccx__body">
            {% if block.settings.eyebrow != blank %}<p class="ccx__eyebrow">{{ block.settings.eyebrow | escape }}</p>{% endif %}
            {% if block.settings.title != blank %}<p class="ccx__title">{{ block.settings.title | escape }}</p>{% endif %}
            {% if block.settings.button_label != blank %}<span class="ccx__btn">{{ block.settings.button_label | escape }}</span>{% endif %}
          </div>
        </a>
      {% endfor %}
    </div>
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .ccx__h{text-align:center;margin-bottom:calc(var(--space) * 4)}
  #shopify-section-{{ section.id }} .ccx__grid{display:grid;grid-template-columns:1fr;gap:clamp(16px,2vw,26px)}
  @media(min-width:640px){#shopify-section-{{ section.id }} .ccx__grid{grid-template-columns:repeat(var(--cols,3),minmax(0,1fr))}}
  #shopify-section-{{ section.id }} .ccx__card{display:flex;flex-direction:column;text-decoration:none;color:var(--color-text);border-radius:calc(var(--radius) * 1.6);padding:clamp(20px,2.4vw,32px);min-height:clamp(360px,40vw,520px);transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s ease}
  #shopify-section-{{ section.id }} .ccx__card:hover{transform:translateY(-6px);box-shadow:0 30px 60px -30px rgba(17,24,39,.4)}
  #shopify-section-{{ section.id }} .ccx__media{flex:1;display:flex;align-items:center;justify-content:center;padding:8px 0 20px}
  #shopify-section-{{ section.id }} .ccx__media img{max-width:82%;max-height:280px;width:auto;height:auto;object-fit:contain;mix-blend-mode:multiply}
  #shopify-section-{{ section.id }} .ccx__ph{width:70%;aspect-ratio:3/4;border-radius:var(--radius);background:rgba(0,0,0,.05)}
  #shopify-section-{{ section.id }} .ccx__body{text-align:center}
  #shopify-section-{{ section.id }} .ccx__eyebrow{margin:0 0 6px;font-size:14px;opacity:.7}
  #shopify-section-{{ section.id }} .ccx__title{margin:0 0 18px;font-family:var(--font-heading);font-weight:600;font-size:clamp(24px,2.6vw,34px);letter-spacing:-0.02em}
  #shopify-section-{{ section.id }} .ccx__btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 26px;border-radius:999px;background:var(--color-primary);color:var(--color-on-primary);font-weight:600;font-size:14px;transition:transform .18s ease}
  #shopify-section-{{ section.id }} .ccx__card:hover .ccx__btn{transform:translateY(-2px)}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__card{position:relative;overflow:hidden;justify-content:flex-end;color:#fff;padding:0}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__media{position:absolute;inset:0;padding:0}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__media img{max-width:100%;max-height:none;width:100%;height:100%;object-fit:cover;mix-blend-mode:normal}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__ph{width:100%;aspect-ratio:auto;height:100%;border-radius:0}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__body{position:relative;z-index:1;text-align:left;padding:clamp(20px,2.4vw,32px);background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,0))}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__title{color:#fff}
  #shopify-section-{{ section.id }} .ccx--v-overlay .ccx__eyebrow{opacity:.85}
</style>`,
  schema: {
    name: "Category cards", tag: "section", class: "section-category-cards", max_blocks: 4,
    settings: [
      { type: "select", id: "variant", label: "Design", default: "cards", options: [{ value: "cards", label: "Cards (product on color)" }, { value: "overlay", label: "Image overlay" }] },
      { type: "text", id: "heading", label: "Heading" },
      { type: "select", id: "columns", label: "Columns", default: "3", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
      ...WRAP,
    ],
    blocks: [{
      type: "card", name: "Card",
      settings: [
        { type: "image_picker", id: "image", label: "Image" },
        { type: "color", id: "bg", label: "Card background", default: "#eef1ec" },
        { type: "text", id: "eyebrow", label: "Eyebrow", default: "Fresh everyday" },
        { type: "text", id: "title", label: "Title", default: "Finest picks" },
        { type: "text", id: "button_label", label: "Button", default: "Show more" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
    presets: [{
      name: "Category cards",
      blocks: [
        { type: "card", settings: { bg: "#ece7dd", eyebrow: "Fresh everyday", title: "Finest Bread" } },
        { type: "card", settings: { bg: "#dbe8de", eyebrow: "Just arrived", title: "Superfoods" } },
        { type: "card", settings: { bg: "#dbe4ec", eyebrow: "Collection", title: "Pure Organic" } },
      ],
    }],
  },
  variants: [{ id: "cards", label: "Cards" }, { id: "overlay", label: "Overlay" }],
  defaultSettings: { variant: "cards", columns: "3", color_scheme: "scheme-1" },
};

export const PREBUILT_SECTIONS: ShopifySectionDefinition[] = [splitHeroSection, categoryCardsSection];
