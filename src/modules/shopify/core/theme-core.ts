// The reusable Shopify theme skeleton: layout, global CSS/JS, snippets and
// locales. Section files + JSON templates + settings are added by the generator.
// Follows current Shopify theme architecture (Online Store 2.0, JSON templates).

import type { GeneratedThemeFile } from "../types";
import { themeCssVariables } from "./design-tokens";

const THEME_LIQUID = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="canonical" href="{{ canonical_url }}">
    {%- if settings.heading_font_stack contains 'http' -%}{%- endif -%}
    <title>{{ page_title }}{% if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif %}{% if current_page != 1 %} &ndash; Page {{ current_page }}{% endif %}{% unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless %}</title>
    {% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
    {{ content_for_header }}
    <style>
{{ '__CSS_VARS__' }}
    </style>
    {{ 'base.css' | asset_url | stylesheet_tag }}
  </head>
  <body class="template-{{ request.page_type | handle }}">
    {% section 'announcement-bar' %}
    {% section 'header' %}
    <main id="MainContent" role="main">
      {{ content_for_layout }}
    </main>
    {% section 'footer' %}
    {{ 'theme.js' | asset_url | script_tag }}
  </body>
</html>`;

const BASE_CSS = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--color-background);color:var(--color-text);font-family:var(--font-body);line-height:1.6;-webkit-font-smoothing:antialiased}
img,svg,video{display:block;max-width:100%;height:auto}
a{color:inherit}
h1,h2,h3,h4{font-family:var(--font-heading);line-height:1.1;letter-spacing:-0.02em;margin:0 0 .4em}
.page-width{width:100%;max-width:var(--page-width);margin-inline:auto;padding-inline:clamp(16px,4vw,32px)}
.section{padding-block:calc(var(--space) * 7)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;min-height:44px;padding:0 24px;border-radius:var(--radius);font-weight:600;font-size:15px;text-decoration:none;cursor:pointer;border:1px solid transparent;transition:filter .15s ease}
.btn:focus-visible{outline:2px solid var(--color-secondary);outline-offset:2px}
.btn--primary{background:var(--color-primary);color:#fff}
.btn--primary:hover{filter:brightness(1.08)}
.btn--secondary{background:transparent;color:var(--color-text);border-color:currentColor}
.card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:var(--radius);overflow:hidden}
.product-card__media{aspect-ratio:4/5;background:#f3f4f6;overflow:hidden}
.product-card__media img{width:100%;height:100%;object-fit:cover}
.product-card__title{margin:12px 12px 2px;font-size:15px;font-weight:600}
.product-card__price{margin:0 12px 14px;font-size:14px;color:#4b5563}
.grid{display:grid;gap:calc(var(--space) * 2)}
@media(min-width:600px){.grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:900px){.grid--4{grid-template-columns:repeat(4,minmax(0,1fr))}.grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;

const THEME_JS = `// Minimal progressive-enhancement JS for the generated theme.
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-accordion]').forEach(function(root){
    root.querySelectorAll('[data-accordion-trigger]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var open=btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded',String(!open));
        var panel=btn.nextElementSibling;
        if(panel){panel.hidden=open;}
      });
    });
  });
});`;

const PRODUCT_CARD_SNIPPET = `{% comment %} renders: a product card. params: product {% endcomment %}
<a class="product-card card" href="{{ product.url }}">
  <div class="product-card__media">
    {% if product.featured_image %}
      <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.featured_image.alt | escape }}" loading="lazy" width="600" height="750">
    {% endif %}
  </div>
  <p class="product-card__title">{{ product.title | escape }}</p>
  <p class="product-card__price">{{ product.price | money }}</p>
</a>`;

const PRICE_SNIPPET = `{% comment %} renders: price. params: price {% endcomment %}<span class="price">{{ price | money }}</span>`;

const LOCALES_EN = JSON.stringify(
  {
    general: { password_page: { login_form_heading: "Enter store using password" } },
    products: { product: { add_to_cart: "Add to cart", sold_out: "Sold out" } },
    sections: { header: { menu: "Menu" } },
  },
  null,
  2,
);

/** Static skeleton files common to every generated theme. */
export function themeCoreFiles(): GeneratedThemeFile[] {
  return [
    { path: "layout/theme.liquid", contents: THEME_LIQUID.replace("{{ '__CSS_VARS__' }}", themeCssVariables()) },
    { path: "assets/base.css", contents: BASE_CSS },
    { path: "assets/theme.js", contents: THEME_JS },
    { path: "snippets/product-card.liquid", contents: PRODUCT_CARD_SNIPPET },
    { path: "snippets/price.liquid", contents: PRICE_SNIPPET },
    { path: "locales/en.default.json", contents: LOCALES_EN },
    { path: "templates/404.json", contents: JSON.stringify({ sections: { main: { type: "main-404" } }, order: ["main"] }, null, 2) },
    { path: "sections/main-404.liquid", contents: `<div class="page-width section"><h1>404</h1><p>Page not found.</p></div>\n{% schema %}\n{"name":"404"}\n{% endschema %}` },
  ];
}
