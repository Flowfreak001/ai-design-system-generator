// The reusable Shopify theme skeleton: layout, global CSS/JS, snippets, section
// groups and locales. Section files + JSON templates + settings are added by the
// generator. Online Store 2.0: JSON templates + header/footer section groups.

import type { GeneratedThemeFile } from "../types";
import { themeCssVariables } from "./design-tokens";

const THEME_LIQUID = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="canonical" href="{{ canonical_url }}">
    <title>{{ page_title }}{% if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif %}{% if current_page != 1 %} &ndash; Page {{ current_page }}{% endif %}{% unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless %}</title>
    {% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
    <meta property="og:site_name" content="{{ shop.name }}">
    <meta property="og:title" content="{{ page_title | escape }}">
    <meta property="og:type" content="website">
    {{ content_for_header }}
    <style>
{{ '__CSS_VARS__' }}
    </style>
    {{ 'base.css' | asset_url | stylesheet_tag }}
    {% render 'meta-tags' %}
  </head>
  <body class="template-{{ request.page_type | handle }} button-{{ settings.button_style }} card-{{ settings.card_style }}{% unless settings.animations_reveal %} no-animate{% endunless %}">
    <a class="skip-link btn" href="#MainContent">{{ 'general.accessibility.skip_to_content' | t }}</a>
    {% sections 'header-group' %}
    <main id="MainContent" role="main">
      {{ content_for_layout }}
    </main>
    {% sections 'footer-group' %}
    <script src="{{ 'theme.js' | asset_url }}" defer="defer"></script>
  </body>
</html>`;

const BASE_CSS = `*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--color-background);color:var(--color-text);font-family:var(--font-body);font-size:calc(16px * var(--body-scale));line-height:1.65;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img,svg,video{display:block;max-width:100%;height:auto}
a{color:inherit}
::selection{background:var(--color-primary);color:var(--color-on-primary)}
h1,h2,h3,h4,h5,h6{font-family:var(--font-heading);line-height:1.06;letter-spacing:-0.021em;margin:0 0 .4em;text-wrap:balance;font-weight:600}
h1{font-size:calc(clamp(34px,5.4vw,60px) * var(--heading-scale));letter-spacing:-0.03em}
h2{font-size:calc(clamp(26px,3.6vw,40px) * var(--heading-scale))}
h3{font-size:calc(clamp(20px,2.2vw,26px) * var(--heading-scale))}
h4{font-size:calc(clamp(17px,1.6vw,20px) * var(--heading-scale))}
p{margin:0 0 1em;text-wrap:pretty}
.page-width{width:100%;max-width:var(--page-width);margin-inline:auto;padding-inline:clamp(20px,5vw,44px)}
.section{padding-top:var(--section-pt,clamp(56px,9vw,112px));padding-bottom:var(--section-pb,clamp(56px,9vw,112px))}
.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:600;color:var(--color-secondary);margin:0 0 12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;min-height:50px;padding:0 30px;border-radius:var(--radius);font-weight:600;font-size:15px;letter-spacing:.005em;text-decoration:none;cursor:pointer;border:1px solid transparent;transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s ease,background .18s ease,color .18s ease,border-color .18s ease;will-change:transform}
.btn:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}
.btn:active{transform:translateY(0)}
.btn--primary{background:var(--color-primary);color:var(--color-on-primary)}
.btn--primary:hover{transform:translateY(-2px);box-shadow:0 12px 24px -12px color-mix(in srgb,var(--color-primary) 60%,transparent)}
.btn--secondary{background:transparent;color:var(--color-text);border-color:var(--color-border)}
.btn--secondary:hover{border-color:var(--color-text);transform:translateY(-2px)}
body.button-outline .btn--primary{background:transparent;color:var(--color-primary);border-color:currentColor}
body.button-outline .btn--primary:hover{background:var(--color-primary);color:var(--color-on-primary)}
.card{background:var(--color-background);border-radius:var(--radius);overflow:hidden;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease}
body.card-bordered .card{border:1px solid var(--color-border)}
body.card-elevated .card{box-shadow:0 1px 2px rgba(17,24,39,.04),0 12px 32px -20px rgba(17,24,39,.28)}
body.card-elevated .card:hover{transform:translateY(-4px);box-shadow:0 2px 4px rgba(17,24,39,.05),0 24px 48px -24px rgba(17,24,39,.35)}
.placeholder-media{width:100%;aspect-ratio:4/3;background:linear-gradient(135deg,#eef0f3,#e2e5ea);border-radius:var(--radius)}
.product-card{display:block;text-decoration:none;color:inherit;position:relative}
.product-card__media{aspect-ratio:4/5;background:#f3f4f6;overflow:hidden;border-radius:var(--radius);position:relative}
.product-card__media img{width:100%;height:100%;object-fit:cover;transition:transform .55s cubic-bezier(.22,1,.36,1)}
.product-card:hover .product-card__media img{transform:scale(1.045)}
.product-card__title{margin:14px 2px 3px;font-size:15px;font-weight:500;letter-spacing:-0.01em;line-height:1.35}
.product-card:hover .product-card__title{text-decoration:underline;text-underline-offset:3px}
.product-card__price{margin:0 2px 4px;font-size:14px;color:var(--color-text);opacity:.7;font-variant-numeric:tabular-nums}
.grid{display:grid;gap:clamp(16px,2.2vw,28px)}
.grid--2{grid-template-columns:1fr}.grid--3{grid-template-columns:repeat(2,minmax(0,1fr))}.grid--4{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:750px){.grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid--4{grid-template-columns:repeat(4,minmax(0,1fr))}}
.rte>*:last-child{margin-bottom:0}
.skip-link{position:absolute;left:-999px}.skip-link:focus{left:12px;top:12px;z-index:100}
[data-animate]{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
[data-animate].is-visible{opacity:1;transform:none}
body.no-animate [data-animate]{opacity:1;transform:none}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}[data-animate]{opacity:1!important;transform:none!important}*{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;

const THEME_JS = `// Progressive-enhancement JS for the generated theme.
document.addEventListener('DOMContentLoaded',function(){
  // Accordions
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
  // Reveal on scroll
  if(!document.body.classList.contains('no-animate') && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:0.08});
    document.querySelectorAll('[data-animate]').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('[data-animate]').forEach(function(el){ el.classList.add('is-visible'); });
  }
  // Collection filter drawer (tablet/mobile).
  document.querySelectorAll('[data-filter-open]').forEach(function(btn){
    var wrap=btn.closest('.cx');if(!wrap)return;
    var drawer=wrap.querySelector('[data-filter-drawer]');var overlay=wrap.querySelector('[data-filter-overlay]');
    function set(open){ if(drawer)drawer.classList.toggle('is-open',open); if(overlay)overlay.classList.toggle('is-open',open); document.body.style.overflow=open?'hidden':''; }
    btn.addEventListener('click',function(){set(true);});
    wrap.querySelectorAll('[data-filter-close]').forEach(function(c){c.addEventListener('click',function(){set(false);});});
    if(overlay)overlay.addEventListener('click',function(){set(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  });
  // Product gallery — thumbnail swaps the main image.
  document.querySelectorAll('[data-gallery]').forEach(function(g){
    var main=g.querySelector('[data-main-image]');
    g.querySelectorAll('[data-thumb]').forEach(function(t){
      t.addEventListener('click',function(){
        if(main&&t.dataset.full){main.src=t.dataset.full;}
        g.querySelectorAll('[data-thumb]').forEach(function(x){x.classList.remove('is-active');});
        t.classList.add('is-active');
      });
    });
  });
  // Quantity steppers
  document.querySelectorAll('[data-qty]').forEach(function(q){
    var input=q.querySelector('[data-qty-input]');
    if(!input)return;
    var minus=q.querySelector('[data-qty-minus]');var plus=q.querySelector('[data-qty-plus]');
    if(minus)minus.addEventListener('click',function(){input.value=Math.max(1,(parseInt(input.value,10)||1)-1);});
    if(plus)plus.addEventListener('click',function(){input.value=(parseInt(input.value,10)||1)+1;});
  });
  // Slideshow (basic dots + autoplay)
  document.querySelectorAll('[data-slideshow]').forEach(function(root){
    var slides=root.querySelectorAll('[data-slide]');var dots=root.querySelectorAll('[data-dot]');var i=0;
    function go(n){slides.forEach(function(s,k){s.style.opacity=k===n?'1':'0';s.style.pointerEvents=k===n?'auto':'none';});dots.forEach(function(d,k){d.setAttribute('aria-current',String(k===n));});i=n;}
    dots.forEach(function(d,k){d.addEventListener('click',function(){go(k);});});
    if(slides.length>1){go(0);setInterval(function(){go((i+1)%slides.length);},6000);}
  });
});`;

const PRODUCT_CARD_SNIPPET = `{% comment %} renders: a product card. params: product {% endcomment %}
<a class="product-card" href="{{ product.url }}">
  <div class="product-card__media">
    {% if product.featured_image %}
      {% render 'image', image: product.featured_image, sizes: '(min-width:750px) 25vw, 50vw' %}
    {% else %}<div class="placeholder-media"></div>{% endif %}
  </div>
  <p class="product-card__title">{{ product.title | escape }}</p>
  <p class="product-card__price">{% render 'price', price: product.price %}</p>
</a>`;

const PRICE_SNIPPET = `{% comment %} renders: price. params: price {% endcomment %}<span class="price">{{ price | money }}</span>`;

const IMAGE_SNIPPET = `{% comment %} renders a responsive image. params: image, sizes, class {% endcomment %}
{%- if image -%}
<img src="{{ image | image_url: width: 1500 }}"
  srcset="{{ image | image_url: width: 400 }} 400w, {{ image | image_url: width: 800 }} 800w, {{ image | image_url: width: 1200 }} 1200w, {{ image | image_url: width: 1600 }} 1600w"
  sizes="{{ sizes | default: '100vw' }}"
  alt="{{ image.alt | escape }}" loading="lazy" width="{{ image.width }}" height="{{ image.height }}" class="{{ class }}">
{%- else -%}<div class="placeholder-media {{ class }}"></div>{%- endif -%}`;

const BUTTON_SNIPPET = `{% comment %} renders a button. params: label, url, style {% endcomment %}{%- if label != blank -%}<a class="btn btn--{{ style | default: 'primary' }}" href="{{ url | default: '#' }}">{{ label | escape }}</a>{%- endif -%}`;

const META_TAGS_SNIPPET = `{%- if template contains 'product' and product -%}
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":{{ product.title | json }},"description":{{ product.description | strip_html | truncate: 300 | json }},"image":{{ product.featured_image | image_url: width: 1200 | prepend: 'https:' | json }},"offers":{"@type":"Offer","price":{{ product.price | divided_by: 100.0 | json }},"priceCurrency":{{ cart.currency.iso_code | json }},"availability":"{% if product.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}"}}</script>
{%- else -%}
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":{{ shop.name | json }},"url":{{ shop.url | json }}}</script>
{%- endif -%}`;

const LOCALES_EN = JSON.stringify(
  {
    general: {
      accessibility: { skip_to_content: "Skip to content", next: "Next", previous: "Previous" },
      password_page: { login_form_heading: "Enter store using password" },
      search: { search: "Search", placeholder: "Search", results: "Results" },
      newsletter: { subscribe: "Subscribe", email: "Email address" },
      pagination: { next: "Next", previous: "Previous" },
    },
    products: { product: { add_to_cart: "Add to cart", sold_out: "Sold out", quantity: "Quantity", regular_price: "Regular price" } },
    cart: { general: { title: "Your cart", subtotal: "Subtotal", checkout: "Check out", empty: "Your cart is empty", remove: "Remove" } },
    sections: { header: { menu: "Menu", cart: "Cart" } },
    blogs: { article: { read_more: "Read more" } },
  },
  null,
  2,
);

const HEADER_GROUP = JSON.stringify(
  {
    type: "header",
    name: "Header group",
    sections: {
      "announcement-bar": { type: "announcement-bar", settings: {} },
      header: { type: "header", settings: {} },
    },
    order: ["announcement-bar", "header"],
  },
  null,
  2,
);

const FOOTER_GROUP = JSON.stringify(
  { type: "footer", name: "Footer group", sections: { footer: { type: "footer", settings: {} } }, order: ["footer"] },
  null,
  2,
);

// Password page (new stores are password-protected by default — without this the
// storefront can appear blank). Uses its own minimal layout.
const PASSWORD_LAYOUT = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ shop.name }}</title>
    {{ content_for_header }}
    <style>{{ '__CSS_VARS__' }}</style>
    {{ 'base.css' | asset_url | stylesheet_tag }}
  </head>
  <body class="template-password">{{ content_for_layout }}</body>
</html>`;
const PASSWORD_TEMPLATE = `<div class="page-width section" style="max-width:460px;margin:0 auto;text-align:center">
  <h1>{{ shop.name }}</h1>
  <p style="opacity:.75">Opening soon.</p>
  {% form 'storefront_password' %}
    {% if form.errors %}<p style="color:#c0392b">{{ form.errors.translated_fields.password | capitalize }} {{ form.errors.messages.password }}</p>{% endif %}
    <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
      <input type="password" name="password" placeholder="Store password" required style="border:1px solid var(--color-border);border-radius:var(--radius);padding:11px 14px">
      <button type="submit" class="btn btn--primary">Enter</button>
    </div>
  {% endform %}
</div>`;

const GIFT_CARD_TEMPLATE = `<div class="page-width section" style="max-width:460px;margin:0 auto;text-align:center">
  <h1>{{ shop.name }} gift card</h1>
  <p style="font-size:34px;font-weight:700;margin:8px 0">{{ gift_card.balance | money }}</p>
  {% if gift_card.expired %}<p style="color:#c0392b">Expired {{ gift_card.expires_on | date: '%b %d, %Y' }}</p>{% endif %}
  <p>Code: <strong>{{ gift_card.code | format_code }}</strong></p>
  <a class="btn btn--primary" href="{{ shop.url }}" style="margin-top:12px">Shop now</a>
</div>`;

/** Static skeleton files common to every generated theme. */
export function themeCoreFiles(): GeneratedThemeFile[] {
  return [
    { path: "layout/theme.liquid", contents: THEME_LIQUID.replace("{{ '__CSS_VARS__' }}", themeCssVariables()) },
    { path: "assets/base.css", contents: BASE_CSS },
    { path: "assets/theme.js", contents: THEME_JS },
    { path: "snippets/product-card.liquid", contents: PRODUCT_CARD_SNIPPET },
    { path: "snippets/price.liquid", contents: PRICE_SNIPPET },
    { path: "snippets/image.liquid", contents: IMAGE_SNIPPET },
    { path: "snippets/button.liquid", contents: BUTTON_SNIPPET },
    { path: "snippets/meta-tags.liquid", contents: META_TAGS_SNIPPET },
    { path: "sections/header-group.json", contents: HEADER_GROUP },
    { path: "sections/footer-group.json", contents: FOOTER_GROUP },
    { path: "locales/en.default.json", contents: LOCALES_EN },
    { path: "templates/404.json", contents: JSON.stringify({ sections: { main: { type: "main-404" } }, order: ["main"] }, null, 2) },
    { path: "sections/main-404.liquid", contents: `<div class="page-width section" style="text-align:center"><h1>404</h1><p>Page not found.</p><a class="btn btn--primary" href="{{ routes.root_url }}">Continue shopping</a></div>\n{% schema %}\n{"name":"404"}\n{% endschema %}` },
    // Password page (its own layout) — new stores are password-protected by default.
    { path: "layout/password.liquid", contents: PASSWORD_LAYOUT.replace("{{ '__CSS_VARS__' }}", themeCssVariables()) },
    { path: "templates/password.liquid", contents: PASSWORD_TEMPLATE },
    // Gift card page (top-level only — customer account pages omitted, matching
    // Shopify's current Horizon theme, and to avoid nested template folders).
    { path: "templates/gift_card.liquid", contents: GIFT_CARD_TEMPLATE },
  ];
}
