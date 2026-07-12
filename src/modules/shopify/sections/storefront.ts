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
  `<section class="page-width section mp" data-animate>
  <div class="mp__grid">
    <div class="mp__media">
      {% if product.featured_image %}{% render 'image', image: product.featured_image, sizes: '(min-width:750px) 50vw, 100vw' %}{% else %}<div class="placeholder-media" style="aspect-ratio:1/1"></div>{% endif %}
      {% if product.images.size > 1 %}<div class="mp__thumbs">{% for image in product.images limit: 5 %}{% render 'image', image: image, sizes: '120px' %}{% endfor %}</div>{% endif %}
    </div>
    <div class="mp__info">
      {% if section.settings.show_vendor and product.vendor != blank %}<p class="eyebrow">{{ product.vendor }}</p>{% endif %}
      <h1>{{ product.title | escape }}</h1>
      <p class="mp__price">{{ product.price | money }}{% if product.compare_at_price > product.price %} <s>{{ product.compare_at_price | money }}</s>{% endif %}</p>
      {% form 'product', product %}
        {%- comment -%} A single variant <select name="id"> works without JS — each option is a real variant. {%- endcomment -%}
        {% if product.has_only_default_variant %}
          <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
        {% else %}
          <label class="mp__opt"><span>Options</span>
            <select name="id">
              {% for variant in product.variants %}
                <option value="{{ variant.id }}"{% if variant == product.selected_or_first_available_variant %} selected{% endif %}{% unless variant.available %} disabled{% endunless %}>{{ variant.title }}{% unless variant.available %} — {{ 'products.product.sold_out' | t }}{% endunless %}</option>
              {% endfor %}
            </select>
          </label>
        {% endif %}
        <label class="mp__opt"><span>{{ 'products.product.quantity' | t }}</span><input type="number" name="quantity" value="1" min="1"></label>
        <button type="submit" name="add" class="btn btn--primary" {% unless product.available %}disabled{% endunless %}>{% if product.available %}{{ 'products.product.add_to_cart' | t }}{% else %}{{ 'products.product.sold_out' | t }}{% endif %}</button>
      {% endform %}
      {% if product.description != blank %}<div class="mp__desc rte">{{ product.description }}</div>{% endif %}
      {% for block in section.blocks %}
        {% if block.type == 'text' %}<div class="mp__block" {{ block.shopify_attributes }}><h3>{{ block.settings.heading | escape }}</h3><div class="rte">{{ block.settings.body }}</div></div>{% endif %}
      {% endfor %}
    </div>
  </div>
</section>
<style>
  #shopify-section-{{ section.id }} .mp__grid{display:grid;gap:calc(var(--space) * 4)}
  @media(min-width:750px){#shopify-section-{{ section.id }} .mp__grid{grid-template-columns:1fr 1fr;align-items:start}}
  #shopify-section-{{ section.id }} .mp__thumbs{display:flex;gap:8px;margin-top:10px}
  #shopify-section-{{ section.id }} .mp__thumbs img{width:70px;border-radius:var(--radius)}
  #shopify-section-{{ section.id }} .mp__price{font-size:22px;font-weight:600;margin:6px 0 18px}
  #shopify-section-{{ section.id }} .mp__price s{opacity:.5;font-weight:400;margin-left:8px}
  #shopify-section-{{ section.id }} .mp__opt{display:block;margin-bottom:14px;font-weight:600}
  #shopify-section-{{ section.id }} .mp__opt select,#shopify-section-{{ section.id }} .mp__opt input{display:block;margin-top:6px;min-height:44px;border:1px solid var(--color-border);border-radius:var(--radius);padding:0 12px;font-size:15px;width:100%;max-width:240px}
  #shopify-section-{{ section.id }} .mp__desc{margin-top:22px;opacity:.9;line-height:1.7}
  #shopify-section-{{ section.id }} .mp__block{margin-top:20px;border-top:1px solid var(--color-border);padding-top:16px}
</style>`,
  [
    { type: "checkbox", id: "show_vendor", label: "Show vendor", default: false },
  ],
);
mainProductSection.schema.blocks = [{ type: "text", name: "Text block", settings: [{ type: "text", id: "heading", label: "Heading", default: "Details" }, { type: "richtext", id: "body", label: "Body", default: "<p>Shipping, materials, or care.</p>" }] }];

export const mainCollectionSection = s(
  "main-collection", "Collection", "collection",
  `<section class="page-width section" data-animate>
  <header style="margin-bottom:calc(var(--space) * 3)">
    <h1>{{ collection.title | escape }}</h1>
    {% if collection.description != blank %}<div class="rte" style="max-width:640px;opacity:.85">{{ collection.description }}</div>{% endif %}
  </header>
  {% paginate collection.products by section.settings.per_page %}
    <div class="grid grid--{{ section.settings.columns }}">
      {% for product in collection.products %}{% render 'product-card', product: product %}{% else %}<p>No products in this collection yet.</p>{% endfor %}
    </div>
    {% if paginate.pages > 1 %}<nav class="pagination" style="margin-top:calc(var(--space) * 3);text-align:center">{{ paginate | default_pagination }}</nav>{% endif %}
  {% endpaginate %}
</section>`,
  [
    { type: "range", id: "per_page", label: "Products per page", min: 8, max: 24, step: 4, default: 12 },
    { type: "select", id: "columns", label: "Columns", default: "4", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
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
