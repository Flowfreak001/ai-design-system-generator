// "main" sections for the required storefront templates (product, collection,
// cart, search, blog, article, page, list-collections). Real Online Store 2.0
// Liquid bound to Shopify objects. The generator injects the matching main
// section into each template automatically — they aren't in the "Add section"
// menu.

import type { ShopifySectionDefinition } from "../types";

const s = (id: string, name: string, template: ShopifySectionDefinition["supportedTemplates"][number], liquid: string, settings: ShopifySectionDefinition["schema"]["settings"] = []): ShopifySectionDefinition => ({
  id, name, category: "storefront",
  description: `Main section for the ${template} template.`,
  supportedTemplates: [template],
  liquid,
  // enabled_on locks the section to its template (Shopify OS 2.0) and, with no
  // preset, prevents it being added/removed elsewhere — it's the template core.
  schema: { name, tag: "section", settings, enabled_on: { templates: [template] } },
  defaultSettings: {},
});

export const mainProductSection = s(
  "main-product", "Product", "product",
  `<section class="page-width section mp mp--v-{{ section.settings.variant | default: 'rail' }}" data-animate>
  <div class="mp__grid">
    <div class="mp__media" data-gallery>
      {% if product.images.size > 1 %}
        <div class="mp__thumbs">
          {% for image in product.images limit: 6 %}
            <button type="button" class="mp__thumb{% if forloop.first %} is-active{% endif %}" data-thumb data-full="{{ image | image_url: width: 1400 }}" aria-label="View image {{ forloop.index }}"><img src="{{ image | image_url: width: 200 }}" alt="{{ image.alt | escape }}" loading="lazy" width="200" height="200"></button>
          {% endfor %}
        </div>
      {% endif %}
      <div class="mp__stage">
        {% if product.featured_image %}<img data-main-image src="{{ product.featured_image | image_url: width: 1400 }}" alt="{{ product.featured_image.alt | escape }}" width="{{ product.featured_image.width }}" height="{{ product.featured_image.height }}">{% else %}<div class="placeholder-media" style="aspect-ratio:1/1"></div>{% endif %}
      </div>
    </div>
    <div class="mp__info">
      {% if product.vendor != blank %}<p class="mp__vendor">{{ product.vendor }}</p>{% endif %}
      <h1 class="mp__title">{{ product.title | escape }}</h1>
      <div class="mp__pricerow">
        <span class="mp__price">{{ product.price | money }}</span>
        {% if product.compare_at_price > product.price %}<s class="mp__compare">{{ product.compare_at_price | money }}</s>{% endif %}
        {% unless product.available %}<span class="mp__badge mp__badge--out">{{ 'products.product.sold_out' | t }}</span>{% else %}{% if product.compare_at_price > product.price %}<span class="mp__badge mp__badge--sale">Sale</span>{% endif %}{% endunless %}
      </div>
      <p class="mp__tax">Taxes included. <a href="{{ routes.root_url }}policies/shipping-policy">Shipping</a> calculated at checkout.</p>
      {% if product.description != blank %}<div class="mp__lead rte">{{ product.description | strip_html | truncatewords: 40 }}</div>{% endif %}
      <hr class="mp__rule">
      <p class="mp__stock mp__stock--{% if product.available %}in{% else %}out{% endif %}"><span class="mp__dot"></span>{% if product.available %}In stock{% else %}Out of stock{% endif %}</p>
      {% form 'product', product %}
        {% unless product.has_only_default_variant %}
          <label class="mp__opt"><span>Options</span>
            <select name="id">
              {% for variant in product.variants %}<option value="{{ variant.id }}"{% if variant == product.selected_or_first_available_variant %} selected{% endif %}{% unless variant.available %} disabled{% endunless %}>{{ variant.title }}{% unless variant.available %} — {{ 'products.product.sold_out' | t }}{% endunless %}</option>{% endfor %}
            </select>
          </label>
        {% else %}<input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">{% endunless %}
        <span class="mp__qlabel">{{ 'products.product.quantity' | t }}</span>
        <div class="mp__qty" data-qty>
          <button type="button" data-qty-minus aria-label="Decrease">–</button>
          <input type="number" name="quantity" value="1" min="1" data-qty-input aria-label="Quantity">
          <button type="button" data-qty-plus aria-label="Increase">+</button>
        </div>
        {% if section.settings.size_chart_url != blank %}<a class="mp__sizechart" href="{{ section.settings.size_chart_url }}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3"/></svg>Size chart</a>{% endif %}
        <div class="mp__actions">
          <button type="submit" name="add" class="btn btn--primary mp__add" {% unless product.available %}disabled{% endunless %}>{% if product.available %}{{ 'products.product.add_to_cart' | t }}{% else %}{{ 'products.product.sold_out' | t }}{% endif %}</button>
          {% if product.available %}{{ form | payment_button }}{% endif %}
        </div>
      {% endform %}
      {% assign feature_blocks = section.blocks | where: 'type', 'feature' %}
      {% if feature_blocks.size > 0 %}
        <ul class="mp__features">
          {% for block in feature_blocks %}<li {{ block.shopify_attributes }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 6 9 17l-5-5"/></svg>{{ block.settings.text | escape }}</li>{% endfor %}
        </ul>
      {% endif %}
      <div class="mp__rows" data-accordion>
        {% for block in section.blocks %}
          {% if block.type == 'collapsible_row' %}
            <div class="mp__row" {{ block.shopify_attributes }}>
              <button class="mp__row-t" type="button" aria-expanded="false" data-accordion-trigger><span>{{ block.settings.heading | escape }}</span><span class="mp__row-ic" aria-hidden="true">+</span></button>
              <div class="mp__row-c rte" hidden>{{ block.settings.body }}</div>
            </div>
          {% endif %}
        {% endfor %}
      </div>
      {% if section.settings.show_share %}
        <div class="mp__share">Share:
          <a href="https://www.facebook.com/sharer/sharer.php?u={{ shop.url }}{{ product.url }}" aria-label="Share on Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9c0-.6.4-1 1-1z"/></svg></a>
          <a href="https://twitter.com/intent/tweet?url={{ shop.url }}{{ product.url }}" aria-label="Share on X" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 3h3l-7 8 8 10h-6l-5-6-5 6H-.5l8-9L0 3h6l4 5 5-5h3z" transform="translate(1)"/></svg></a>
          <a href="https://pinterest.com/pin/create/button/?url={{ shop.url }}{{ product.url }}" aria-label="Share on Pinterest" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-4 19.2c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2.9.5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-1.9-1.3-3.4-3.7-3.4a4.3 4.3 0 0 0-4.5 4.3c0 .8.3 1.7.6 2.1l-.3 1c0 .2-.2.3-.4.2-1.3-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.2 2.6A10 10 0 1 0 12 2z"/></svg></a>
        </div>
      {% endif %}
    </div>
  </div>
</section>
<style>
  #shopify-section-{{ section.id }} .mp__grid{display:grid;gap:clamp(28px,4vw,56px)}
  @media(min-width:900px){#shopify-section-{{ section.id }} .mp__grid{grid-template-columns:1.05fr .95fr;align-items:start}
    #shopify-section-{{ section.id }} .mp__info{position:sticky;top:24px}}
  #shopify-section-{{ section.id }} .mp__media{display:flex;flex-direction:column;gap:14px}
  #shopify-section-{{ section.id }} .mp__stage{order:1;background:#f4f4f5;border-radius:calc(var(--radius) * 1.4);overflow:hidden;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center}
  #shopify-section-{{ section.id }} .mp__stage img{width:100%;height:100%;object-fit:contain;padding:6%}
  #shopify-section-{{ section.id }} .mp__thumbs{order:2;display:flex;gap:10px;flex-wrap:wrap}
  /* Variant differences that apply at EVERY width (so the choice is always visible). */
  #shopify-section-{{ section.id }} .mp--v-grid .mp__thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  #shopify-section-{{ section.id }} .mp--v-grid .mp__thumb{width:auto;height:auto;aspect-ratio:1/1}
  #shopify-section-{{ section.id }} .mp--v-spotlight .mp__thumbs{justify-content:center}
  #shopify-section-{{ section.id }} .mp--v-spotlight .mp__stage{border-radius:0}
  @media(min-width:800px){
    #shopify-section-{{ section.id }} .mp--v-rail .mp__media{display:grid;grid-template-columns:82px 1fr}
    #shopify-section-{{ section.id }} .mp--v-rail .mp__stage{grid-column:2;grid-row:1}
    #shopify-section-{{ section.id }} .mp--v-rail .mp__thumbs{grid-column:1;grid-row:1;flex-direction:column;flex-wrap:nowrap}
    /* Grid variant: editorial big image spanning + 3-up thumb collage below. */
    #shopify-section-{{ section.id }} .mp--v-grid .mp__stage{aspect-ratio:16/10}
  }
  #shopify-section-{{ section.id }} .mp__thumb{padding:0;border:1px solid var(--color-border);border-radius:var(--radius);overflow:hidden;width:74px;height:74px;flex:0 0 auto;background:#f4f4f5;cursor:pointer;transition:border-color .15s}
  #shopify-section-{{ section.id }} .mp__thumb.is-active{border-color:var(--color-primary);border-width:2px}
  #shopify-section-{{ section.id }} .mp__thumb img{width:100%;height:100%;object-fit:contain;padding:8%}
  #shopify-section-{{ section.id }} .mp__vendor{text-transform:lowercase;letter-spacing:.02em;font-size:13px;font-weight:500;color:var(--color-secondary);margin:0 0 8px}
  #shopify-section-{{ section.id }} .mp__title{font-size:clamp(28px,3.4vw,44px);margin:0 0 14px}
  #shopify-section-{{ section.id }} .mp__pricerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  #shopify-section-{{ section.id }} .mp__price{font-size:22px;font-weight:600}
  #shopify-section-{{ section.id }} .mp__compare{opacity:.5;font-size:18px}
  #shopify-section-{{ section.id }} .mp__badge{font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px}
  #shopify-section-{{ section.id }} .mp__badge--sale{background:var(--color-secondary);color:#fff}
  #shopify-section-{{ section.id }} .mp__badge--out{background:rgba(0,0,0,.08)}
  #shopify-section-{{ section.id }} .mp__tax{font-size:13px;opacity:.65;margin:6px 0 0}
  #shopify-section-{{ section.id }} .mp__tax a{text-decoration:underline}
  #shopify-section-{{ section.id }} .mp__lead{margin:16px 0;line-height:1.7;opacity:.9}
  #shopify-section-{{ section.id }} .mp__rule{border:0;border-top:1px solid var(--color-border);margin:18px 0}
  #shopify-section-{{ section.id }} .mp__stock{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;margin:0 0 18px}
  #shopify-section-{{ section.id }} .mp__stock .mp__dot{width:10px;height:10px;border-radius:2px}
  #shopify-section-{{ section.id }} .mp__stock--in{color:#1a7f37}#shopify-section-{{ section.id }} .mp__stock--in .mp__dot{background:#1a7f37}
  #shopify-section-{{ section.id }} .mp__stock--out{color:#8a6d1a}#shopify-section-{{ section.id }} .mp__stock--out .mp__dot{background:#8a6d1a}
  #shopify-section-{{ section.id }} .mp__opt{display:block;margin-bottom:14px;font-weight:600}
  #shopify-section-{{ section.id }} .mp__opt select{display:block;margin-top:6px;min-height:48px;border:1px solid var(--color-border);border-radius:var(--radius);padding:0 12px;font-size:15px;width:100%;max-width:280px}
  #shopify-section-{{ section.id }} .mp__qlabel{display:block;font-weight:600;font-size:15px;margin-bottom:8px}
  #shopify-section-{{ section.id }} .mp__qty{display:inline-flex;align-items:center;background:var(--color-background);border-radius:var(--radius);overflow:hidden;margin-bottom:14px}
  #shopify-section-{{ section.id }} .mp__qty button{width:48px;min-height:52px;border:0;background:rgba(0,0,0,.04);font-size:18px;cursor:pointer;color:inherit}
  #shopify-section-{{ section.id }} .mp__qty input{width:56px;min-height:52px;border:0;background:rgba(0,0,0,.04);text-align:center;font-size:16px;-moz-appearance:textfield}
  #shopify-section-{{ section.id }} .mp__qty input::-webkit-outer-spin-button,#shopify-section-{{ section.id }} .mp__qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
  #shopify-section-{{ section.id }} .mp__sizechart{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;margin:0 0 18px;text-decoration:none}
  #shopify-section-{{ section.id }} .mp__actions{display:grid;grid-template-columns:1fr;gap:12px}
  @media(min-width:520px){#shopify-section-{{ section.id }} .mp__actions{grid-template-columns:1fr 1fr}}
  #shopify-section-{{ section.id }} .mp__actions .shopify-payment-button{margin:0}
  #shopify-section-{{ section.id }} .mp__features{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:12px}
  #shopify-section-{{ section.id }} .mp__features li{display:flex;align-items:center;gap:10px;font-size:15px}
  #shopify-section-{{ section.id }} .mp__features svg{flex:0 0 auto;color:var(--color-primary)}
  #shopify-section-{{ section.id }} .mp__rows{margin-top:24px;border-top:1px solid var(--color-border)}
  #shopify-section-{{ section.id }} .mp__row{border-bottom:1px solid var(--color-border)}
  #shopify-section-{{ section.id }} .mp__row-t{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 0;background:none;border:0;cursor:pointer;font-size:16px;font-weight:600;color:inherit;text-align:left}
  #shopify-section-{{ section.id }} .mp__row-ic{font-size:22px;line-height:1;transition:transform .2s}
  #shopify-section-{{ section.id }} .mp__row-t[aria-expanded="true"] .mp__row-ic{transform:rotate(45deg)}
  #shopify-section-{{ section.id }} .mp__row-c{padding:0 0 18px;opacity:.86;line-height:1.7}
  #shopify-section-{{ section.id }} .mp__share{display:flex;align-items:center;gap:14px;margin-top:24px;font-weight:600;font-size:14px}
  #shopify-section-{{ section.id }} .mp__share a{display:inline-flex;color:inherit}
</style>`,
  [
    { type: "select", id: "variant", label: "Design", default: "rail", options: [{ value: "rail", label: "Thumbnail rail" }, { value: "grid", label: "Editorial grid" }, { value: "spotlight", label: "Spotlight" }] },
    { type: "checkbox", id: "show_share", label: "Show share buttons", default: true },
    { type: "url", id: "size_chart_url", label: "Size chart link" },
  ],
);
mainProductSection.variants = [{ id: "rail", label: "Thumbnail rail" }, { id: "grid", label: "Editorial grid" }, { id: "spotlight", label: "Spotlight" }];
mainProductSection.defaultSettings = { variant: "rail" };
mainProductSection.schema.blocks = [
  {
    type: "feature", name: "Feature (checkmark)",
    settings: [{ type: "text", id: "text", label: "Feature text", default: "Add a key selling point" }],
  },
  {
    type: "collapsible_row", name: "Collapsible row",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Description" },
      { type: "richtext", id: "body", label: "Content", default: "<p>Add product details, materials, care, or shipping information here.</p>" },
    ],
  },
];

export const mainCollectionSection = s(
  "main-collection", "Collection", "collection",
  `<section class="page-width section cx" data-animate>
  <nav class="cx__crumbs" aria-label="Breadcrumb"><a href="{{ routes.root_url }}">Home</a> / <a href="{{ routes.all_products_collection_url }}">Collections</a> / <span>{{ collection.title | escape }}</span></nav>
  <h1 class="cx__title">{{ collection.title | escape }}</h1>
  {% if collection.description != blank %}<div class="cx__desc rte">{{ collection.description }}</div>{% endif %}
  {% paginate collection.products by section.settings.per_page %}
    <div class="cx__toolbar">
      <button type="button" class="cx__filter-btn" data-filter-open aria-label="Open filters">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
        Filters
      </button>
      <p class="cx__count">{{ collection.products_count }} products</p>
    </div>
    <div class="cx__layout">
      <div class="cx__overlay" data-filter-overlay></div>
      <aside class="cx__side" data-filter-drawer>
        <div class="cx__side-head"><span>Filters</span><button type="button" class="cx__side-close" data-filter-close aria-label="Close filters"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
        <form method="get" class="cx__filters">
          {% if section.settings.show_sort %}
            <div class="cx__group">
              <label class="cx__label" for="SortBy">Sort by</label>
              <select id="SortBy" name="sort_by" class="cx__select" onchange="this.form.submit()">
                {% assign cur = collection.sort_by | default: collection.default_sort_by %}
                {% for opt in collection.sort_options %}<option value="{{ opt.value }}"{% if opt.value == cur %} selected{% endif %}>{{ opt.name }}</option>{% endfor %}
              </select>
            </div>
          {% endif %}
          {% for filter in collection.filters %}
            <div class="cx__group">
              <p class="cx__label">{{ filter.label | escape }}</p>
              {% if filter.type == 'price_range' %}
                <div class="cx__price">
                  <input type="number" name="{{ filter.min_value.param_name }}" value="{{ filter.min_value.value }}" placeholder="{{ 0 | money_without_currency }}" min="0" max="{{ filter.range_max | money_without_currency | round }}">
                  <span>to</span>
                  <input type="number" name="{{ filter.max_value.param_name }}" value="{{ filter.max_value.value }}" placeholder="{{ filter.range_max | money_without_currency | round }}" min="0" max="{{ filter.range_max | money_without_currency | round }}">
                </div>
              {% else %}
                <ul class="cx__values">
                  {% for v in filter.values %}
                    <li><label class="cx__check"><input type="checkbox" name="{{ v.param_name }}" value="{{ v.value }}"{% if v.active %} checked{% endif %}> <span>{{ v.label | escape }} ({{ v.count }})</span></label></li>
                  {% endfor %}
                </ul>
              {% endif %}
            </div>
          {% endfor %}
          <noscript><button type="submit" class="btn btn--secondary">Apply</button></noscript>
        </form>
      </aside>
      <div class="cx__main">
        <p class="cx__count">{{ collection.products_count }} products</p>
        <div class="grid grid--{{ section.settings.columns }}">
          {% for product in collection.products %}
            <div class="pcard card">
              <a class="pcard__media" href="{{ product.url }}">
                {% if product.featured_image %}{% render 'image', image: product.featured_image, sizes: '(min-width:990px) 30vw, 50vw' %}{% else %}<div class="placeholder-media"></div>{% endif %}
                {% unless product.available %}<span class="pcard__badge pcard__badge--out">Sold out</span>{% elsif product.compare_at_price > product.price %}<span class="pcard__badge pcard__badge--sale">On sale</span>{% endunless %}
              </a>
              <div class="pcard__body">
                <div class="pcard__price">{% if product.price_varies %}From {% endif %}{{ product.price | money }}{% if product.compare_at_price > product.price %} <s>{{ product.compare_at_price | money }}</s>{% endif %}</div>
                <a class="pcard__title" href="{{ product.url }}">{{ product.title | escape }}</a>
                <a class="pcard__buy btn btn--secondary" href="{{ product.url }}">Buy now</a>
              </div>
            </div>
          {% else %}
            <p>No products match these filters.</p>
          {% endfor %}
        </div>
        {% if paginate.pages > 1 %}<nav class="cx__pager">{{ paginate | default_pagination }}</nav>{% endif %}
      </div>
    </div>
  {% endpaginate %}
</section>
<style>
  #shopify-section-{{ section.id }} .cx__crumbs{font-size:13px;opacity:.6;margin-bottom:12px}
  #shopify-section-{{ section.id }} .cx__crumbs a{text-decoration:none}
  #shopify-section-{{ section.id }} .cx__title{font-size:clamp(34px,5vw,56px);margin:0 0 6px}
  #shopify-section-{{ section.id }} .cx__desc{max-width:640px;opacity:.85;margin-bottom:28px}
  #shopify-section-{{ section.id }} .cx__layout{display:grid;gap:clamp(24px,4vw,48px)}
  #shopify-section-{{ section.id }} .cx__toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
  #shopify-section-{{ section.id }} .cx__filter-btn{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 20px;border:1px solid var(--color-border);border-radius:999px;background:var(--color-background);font-weight:600;font-size:14px;cursor:pointer;color:inherit}
  #shopify-section-{{ section.id }} .cx__side-head{display:none;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:14px;border-bottom:1px solid var(--color-border)}
  #shopify-section-{{ section.id }} .cx__side-head span{font-size:18px;font-weight:600}
  #shopify-section-{{ section.id }} .cx__side-close{background:none;border:0;cursor:pointer;color:inherit;padding:6px;display:inline-flex}
  #shopify-section-{{ section.id }} .cx__overlay{display:none}
  @media(min-width:990px){
    #shopify-section-{{ section.id }} .cx__layout{grid-template-columns:250px 1fr;align-items:start}
    #shopify-section-{{ section.id }} .cx__toolbar{display:none}
  }
  @media(max-width:989px){
    #shopify-section-{{ section.id }} .cx__main .cx__count{display:none}
    #shopify-section-{{ section.id }} .cx__overlay{display:block;position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.42);opacity:0;pointer-events:none;transition:opacity .3s ease}
    #shopify-section-{{ section.id }} .cx__overlay.is-open{opacity:1;pointer-events:auto}
    #shopify-section-{{ section.id }} .cx__side{position:fixed;top:0;left:0;bottom:0;z-index:61;width:min(340px,86vw);background:var(--color-background);padding:20px;overflow-y:auto;transform:translateX(-100%);transition:transform .32s cubic-bezier(.22,1,.36,1);box-shadow:0 0 40px rgba(0,0,0,.15)}
    #shopify-section-{{ section.id }} .cx__side.is-open{transform:none}
    #shopify-section-{{ section.id }} .cx__side-head{display:flex}
  }
  #shopify-section-{{ section.id }} .cx__group{padding:16px 0;border-top:1px solid var(--color-border)}
  #shopify-section-{{ section.id }} .cx__group:first-child{border-top:0;padding-top:0}
  #shopify-section-{{ section.id }} .cx__label{font-weight:600;font-size:14px;margin:0 0 10px;display:block}
  #shopify-section-{{ section.id }} .cx__select{width:100%;min-height:46px;border:1px solid var(--color-border);border-radius:var(--radius);padding:0 12px;font-size:14px}
  #shopify-section-{{ section.id }} .cx__price{display:flex;align-items:center;gap:8px}
  #shopify-section-{{ section.id }} .cx__price input{width:100%;min-height:44px;border:1px solid var(--color-border);border-radius:var(--radius);padding:0 10px;font-size:14px}
  #shopify-section-{{ section.id }} .cx__values{list-style:none;margin:0;padding:0;display:grid;gap:9px;max-height:230px;overflow:auto}
  #shopify-section-{{ section.id }} .cx__check{display:flex;align-items:center;gap:9px;font-size:14px;cursor:pointer}
  #shopify-section-{{ section.id }} .cx__count{opacity:.6;font-size:14px;margin:0 0 18px}
  #shopify-section-{{ section.id }} .pcard{display:flex;flex-direction:column;border:1px solid var(--color-border)}
  #shopify-section-{{ section.id }} .pcard__media{position:relative;display:block;aspect-ratio:1/1;overflow:hidden}
  #shopify-section-{{ section.id }} .pcard__media img{width:100%;height:100%;object-fit:cover}
  #shopify-section-{{ section.id }} .pcard__badge{position:absolute;top:12px;right:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:5px 9px;border-radius:6px;color:#fff}
  #shopify-section-{{ section.id }} .pcard__badge--sale{background:#e2483d}
  #shopify-section-{{ section.id }} .pcard__badge--out{background:#6b7280}
  #shopify-section-{{ section.id }} .pcard__body{display:flex;flex-direction:column;gap:6px;padding:16px 16px 18px}
  #shopify-section-{{ section.id }} .pcard__price{font-size:14px;opacity:.75;font-variant-numeric:tabular-nums}
  #shopify-section-{{ section.id }} .pcard__price s{opacity:.6;margin-left:4px}
  #shopify-section-{{ section.id }} .pcard__title{font-size:19px;font-weight:600;letter-spacing:-0.01em;text-decoration:none;margin-bottom:8px}
  #shopify-section-{{ section.id }} .pcard__buy{margin-top:auto;justify-content:center}
  #shopify-section-{{ section.id }} .cx__pager{margin-top:36px;display:flex;justify-content:center;gap:8px}
</style>`,
  [
    { type: "range", id: "per_page", label: "Products per page", min: 8, max: 24, step: 4, default: 12 },
    { type: "select", id: "columns", label: "Columns", default: "3", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
    { type: "checkbox", id: "show_sort", label: "Show sort", default: true },
  ],
);

export const mainListCollectionsSection = s(
  "main-list-collections", "List collections", "list-collections",
  `<section class="page-width section" data-animate>
  <h1 style="margin-bottom:calc(var(--space) * 3)">{{ page_title }}</h1>
  <div class="grid grid--3">
    {% for collection in collections %}
      <a class="card" href="{{ collection.url }}">
        <div class="product-card__media">{% if collection.featured_image %}{% render 'image', image: collection.featured_image %}{% else %}<div class="placeholder-media"></div>{% endif %}</div>
        <p class="product-card__title" style="padding:12px">{{ collection.title | escape }}</p>
      </a>
    {% endfor %}
  </div>
</section>`,
);

export const mainCartSection = s(
  "main-cart", "Cart", "cart",
  `<section class="page-width section" data-animate style="max-width:900px">
  <h1>{{ 'cart.general.title' | t }}</h1>
  {% if cart.item_count == 0 %}
    <p style="opacity:.7">{{ 'cart.general.empty' | t }}</p>
    <a class="btn btn--primary" href="{{ routes.all_products_collection_url }}">Continue shopping</a>
  {% else %}
  {% form 'cart', cart %}
    <ul class="cart__items" style="list-style:none;padding:0;margin:24px 0">
      {% for item in cart.items %}
        <li class="cart__item" style="display:flex;gap:16px;align-items:center;padding:14px 0;border-bottom:1px solid var(--color-border)">
          <div style="width:64px;flex:0 0 64px">{% if item.image %}{% render 'image', image: item.image, sizes: '64px' %}{% endif %}</div>
          <div style="flex:1"><a href="{{ item.url }}">{{ item.product.title | escape }}</a></div>
          <div>{{ item.quantity }} &times; {{ item.final_price | money }}</div>
          <div><strong>{{ item.final_line_price | money }}</strong></div>
        </li>
      {% endfor %}
    </ul>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
      <p style="font-size:18px;margin:0">{{ 'cart.general.subtotal' | t }} <strong>{{ cart.total_price | money }}</strong></p>
      <button type="submit" name="checkout" class="btn btn--primary">{{ 'cart.general.checkout' | t }}</button>
    </div>
  {% endform %}
  {% endif %}
</section>`,
);

export const mainSearchSection = s(
  "main-search", "Search", "search",
  `<section class="page-width section" data-animate>
  <form action="{{ routes.search_url }}" method="get" role="search" style="display:flex;gap:8px;max-width:560px;margin-bottom:calc(var(--space) * 3)">
    <input type="search" name="q" value="{{ search.terms | escape }}" placeholder="{{ 'general.search.placeholder' | t }}" style="flex:1;min-height:46px;border:1px solid var(--color-border);border-radius:var(--radius);padding:0 14px">
    <button type="submit" class="btn btn--primary">{{ 'general.search.search' | t }}</button>
  </form>
  {% if search.performed %}
    <p style="opacity:.7;margin-bottom:16px">{{ search.results_count }} {{ 'general.search.results' | t }}</p>
    <div class="grid grid--4">{% for item in search.results %}{% if item.object_type == 'product' %}{% render 'product-card', product: item %}{% endif %}{% endfor %}</div>
  {% endif %}
</section>`,
);

export const mainBlogSection = s(
  "main-blog", "Blog", "blog",
  `<section class="page-width section" data-animate>
  <h1 style="margin-bottom:calc(var(--space) * 3)">{{ blog.title | escape }}</h1>
  <div class="grid grid--3">
    {% for article in blog.articles %}
      <a class="card" href="{{ article.url }}">
        <div class="product-card__media" style="aspect-ratio:16/10">{% if article.image %}{% render 'image', image: article.image %}{% else %}<div class="placeholder-media"></div>{% endif %}</div>
        <div style="padding:14px"><p class="eyebrow">{{ article.published_at | date: '%b %d, %Y' }}</p><p class="product-card__title" style="margin:0">{{ article.title | escape }}</p></div>
      </a>
    {% endfor %}
  </div>
</section>`,
);

export const mainArticleSection = s(
  "main-article", "Article", "article",
  `<article class="page-width section" data-animate style="max-width:760px">
  <p class="eyebrow">{{ article.published_at | date: '%b %d, %Y' }}</p>
  <h1>{{ article.title | escape }}</h1>
  {% if article.image %}<div style="margin:20px 0;border-radius:var(--radius);overflow:hidden">{% render 'image', image: article.image %}</div>{% endif %}
  <div class="rte" style="line-height:1.8">{{ article.content }}</div>
</article>`,
);

export const mainPageSection = s(
  "main-page", "Page", "page",
  `<section class="page-width section" data-animate style="max-width:820px">
  <h1>{{ page.title | escape }}</h1>
  <div class="rte" style="line-height:1.8">{{ page.content }}</div>
</section>`,
);

export const STOREFRONT_SECTIONS: ShopifySectionDefinition[] = [
  mainProductSection, mainCollectionSection, mainListCollectionsSection, mainCartSection,
  mainSearchSection, mainBlogSection, mainArticleSection, mainPageSection,
];
