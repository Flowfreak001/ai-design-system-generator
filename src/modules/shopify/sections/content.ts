import type { ShopifySectionDefinition } from "../types";

export const imageWithTextSection: ShopifySectionDefinition = {
  id: "image-with-text",
  name: "Image with text",
  category: "content",
  description: "Two-column image + text block with an optional button; image side is configurable.",
  supportedTemplates: ["index", "page", "product", "collection"],
  liquid: `<div class="iwt page-width section iwt--{{ section.settings.image_position }}">
  <div class="iwt__media">
    {% if section.settings.image %}
      <img src="{{ section.settings.image | image_url: width: 1200 }}" alt="{{ section.settings.image.alt | escape }}" loading="lazy" width="1200" height="900">
    {% else %}
      <div class="iwt__placeholder" aria-hidden="true"></div>
    {% endif %}
  </div>
  <div class="iwt__text">
    {% if section.settings.eyebrow != blank %}<p class="iwt__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
    {% if section.settings.body != blank %}<div class="iwt__body">{{ section.settings.body }}</div>{% endif %}
    {% if section.settings.button_label != blank %}<a class="btn btn--primary" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label | escape }}</a>{% endif %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .iwt{display:grid;gap:calc(var(--space) * 4);align-items:center}
  @media(min-width:800px){#shopify-section-{{ section.id }} .iwt{grid-template-columns:1fr 1fr}#shopify-section-{{ section.id }} .iwt--right .iwt__media{order:2}}
  #shopify-section-{{ section.id }} .iwt__media img,#shopify-section-{{ section.id }} .iwt__placeholder{width:100%;border-radius:var(--radius);aspect-ratio:4/3;object-fit:cover;background:#eef0f3}
  #shopify-section-{{ section.id }} .iwt__eyebrow{margin:0 0 8px;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:600;color:var(--color-secondary)}
  #shopify-section-{{ section.id }} h2{font-size:clamp(26px,3.4vw,40px)}
  #shopify-section-{{ section.id }} .iwt__body{max-width:520px;opacity:.86;margin-bottom:20px}
</style>`,
  schema: {
    name: "Image with text",
    class: "section-iwt",
    settings: [
      { type: "image_picker", id: "image", label: "Image" },
      { type: "select", id: "image_position", label: "Image position", default: "left", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Built with care" },
      { type: "richtext", id: "body", label: "Text", default: "<p>Describe a product benefit, your story, or what sets you apart.</p>" },
      { type: "text", id: "button_label", label: "Button" },
      { type: "url", id: "button_link", label: "Button link" },
    ],
    presets: [{ name: "Image with text" }],
  },
  defaultSettings: { heading: "Built with care", image_position: "left" },
};

export const featuredCollectionSection: ShopifySectionDefinition = {
  id: "featured-collection",
  name: "Featured collection",
  category: "products",
  description: "Product grid pulled from a chosen collection, with heading and 'view all' link.",
  supportedTemplates: ["index", "page"],
  liquid: `<div class="fc page-width section">
  <div class="fc__head">
    <div>
      {% if section.settings.eyebrow != blank %}<p class="fc__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
      {% if section.settings.heading != blank %}<h2>{{ section.settings.heading | escape }}</h2>{% endif %}
    </div>
    {% assign coll = collections[section.settings.collection] %}
    {% unless coll.products_count > 0 %}{% assign coll = collections.all %}{% endunless %}
    {% if section.settings.show_view_all %}
      <a class="fc__all" href="{{ coll.url | default: routes.all_products_collection_url }}">{{ section.settings.view_all_label | default: 'View all' }}</a>
    {% endif %}
  </div>
  <div class="grid grid--{{ section.settings.columns }}">
    {% comment %} Falls back to the automatic all-products collection so a new store shows products immediately. {% endcomment %}
    {% if coll.products_count > 0 %}
      {% for product in coll.products limit: section.settings.products_to_show %}
        {% render 'product-card', product: product %}
      {% endfor %}
    {% else %}
      {% for i in (1..section.settings.products_to_show) %}
        <div class="card"><div class="product-card__media"></div><p class="product-card__title">Product title</p><p class="product-card__price">$0.00</p></div>
      {% endfor %}
    {% endif %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .fc__head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:calc(var(--space) * 3)}
  #shopify-section-{{ section.id }} .fc__eyebrow{margin:0 0 6px;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:600;color:var(--color-secondary)}
  #shopify-section-{{ section.id }} h2{font-size:clamp(24px,3vw,36px)}
  #shopify-section-{{ section.id }} .fc__all{font-weight:600;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
</style>`,
  schema: {
    name: "Featured collection",
    class: "section-fc",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Shop our favourites" },
      { type: "collection", id: "collection", label: "Collection" },
      { type: "range", id: "products_to_show", label: "Products to show", min: 2, max: 12, step: 1, default: 4 },
      { type: "select", id: "columns", label: "Columns", default: "4", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
      { type: "checkbox", id: "show_view_all", label: "Show 'view all'", default: true },
      { type: "text", id: "view_all_label", label: "'View all' label", default: "View all" },
    ],
    presets: [{ name: "Featured collection" }],
  },
  defaultSettings: { heading: "Shop our favourites", products_to_show: 4, columns: "4", show_view_all: true },
};

export const faqSection: ShopifySectionDefinition = {
  id: "faq",
  name: "FAQ",
  category: "content",
  description: "Accessible accordion of question/answer blocks.",
  supportedTemplates: ["index", "page", "product"],
  liquid: `<div class="faq page-width section">
  {% if section.settings.heading != blank %}<h2 class="faq__heading">{{ section.settings.heading | escape }}</h2>{% endif %}
  <div class="faq__list" data-accordion>
    {% for block in section.blocks %}
      <div class="faq__item" {{ block.shopify_attributes }}>
        <button class="faq__q" type="button" aria-expanded="false" data-accordion-trigger>
          <span>{{ block.settings.question | escape }}</span>
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__a" hidden>{{ block.settings.answer }}</div>
      </div>
    {% endfor %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .faq{max-width:820px}
  #shopify-section-{{ section.id }} .faq__heading{font-size:clamp(24px,3vw,36px);margin-bottom:calc(var(--space) * 2)}
  #shopify-section-{{ section.id }} .faq__item{border-top:1px solid rgba(0,0,0,.1)}
  #shopify-section-{{ section.id }} .faq__q{width:100%;display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 0;background:none;border:0;cursor:pointer;font-size:17px;font-weight:600;color:inherit;text-align:left}
  #shopify-section-{{ section.id }} .faq__q[aria-expanded="true"] .faq__icon{transform:rotate(45deg)}
  #shopify-section-{{ section.id }} .faq__icon{transition:transform .2s ease;font-size:22px;line-height:1}
  #shopify-section-{{ section.id }} .faq__a{padding:0 0 20px;opacity:.86;line-height:1.6}
</style>`,
  schema: {
    name: "FAQ",
    class: "section-faq",
    settings: [{ type: "text", id: "heading", label: "Heading", default: "Frequently asked questions" }],
    blocks: [
      {
        type: "question", name: "Question",
        settings: [
          { type: "text", id: "question", label: "Question", default: "What is your return policy?" },
          { type: "richtext", id: "answer", label: "Answer", default: "<p>Explain the answer here.</p>" },
        ],
      },
    ],
    max_blocks: 20,
    presets: [{
      name: "FAQ",
      blocks: [
        { type: "question", settings: { question: "What is your return policy?" } },
        { type: "question", settings: { question: "How long does shipping take?" } },
        { type: "question", settings: { question: "Do you ship internationally?" } },
      ],
    }],
  },
  defaultSettings: { heading: "Frequently asked questions" },
};
