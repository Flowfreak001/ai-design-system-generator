// "Custom section" — the block-composer target. Users assemble a section on the
// canvas from primitive blocks (heading, text, image, button, spacer, divider,
// icon-feature). Each block maps 1:1 to a Shopify {% schema %} block, so ANY
// composition the user builds exports as a valid Online Store 2.0 section — the
// generator already emits blocks + block_order, and the sanitizer/validator
// guard every value. This is manual visual design that is always export-safe.

import type { ShopifySectionDefinition, ShopifySettingField } from "../types";

// Per-block style controls shared by most block types (align + spacing).
const ALIGN: ShopifySettingField = { type: "select", id: "align", label: "Alignment", default: "left", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] };
const SPACE_TOP: ShopifySettingField = { type: "range", id: "space_top", label: "Space above", min: 0, max: 80, step: 4, unit: "px", default: 0 };
const SPACE_BOTTOM: ShopifySettingField = { type: "range", id: "space_bottom", label: "Space below", min: 0, max: 80, step: 4, unit: "px", default: 16 };

export const customSection: ShopifySectionDefinition = {
  id: "custom-section",
  name: "Custom section",
  category: "custom",
  description: "Build your own section from blocks — heading, text, image, button, columns, spacer. Fully export-safe.",
  supportedTemplates: ["index", "page", "product", "collection", "cart", "search", "blog"],
  liquid: `<div class="cs color-{{ section.settings.color_scheme }} section" data-animate style="--section-pt:{{ section.settings.padding_top }}px;--section-pb:{{ section.settings.padding_bottom }}px;{% if section.settings.background != blank %}background:{{ section.settings.background }};{% endif %}">
  <div class="cs__inner cs__inner--{{ section.settings.content_width }} page-width">
    {% for block in section.blocks %}
      {% assign a = block.settings.align | default: 'left' %}
      {% capture sp %}margin-top:{{ block.settings.space_top | default: 0 }}px;margin-bottom:{{ block.settings.space_bottom | default: 16 }}px{% endcapture %}
      {% case block.type %}
        {% when 'heading' %}
          <div class="cs__b cs--{{ a }}" style="{{ sp }}" {{ block.shopify_attributes }}>
            {% if block.settings.eyebrow != blank %}<p class="cs__eyebrow">{{ block.settings.eyebrow | escape }}</p>{% endif %}
            {% assign lvl = block.settings.level | default: 'h2' %}
            <{{ lvl }} class="cs__heading" style="font-size:{{ block.settings.size | default: 36 }}px">{{ block.settings.text | escape }}</{{ lvl }}>
          </div>
        {% when 'text' %}
          <div class="cs__b cs__text cs--{{ a }} rte" style="{{ sp }}" {{ block.shopify_attributes }}>{{ block.settings.text }}</div>
        {% when 'image' %}
          <div class="cs__b cs__image cs--{{ a }}" style="{{ sp }}" {{ block.shopify_attributes }}>
            <div class="cs__image-wrap" style="max-width:{{ block.settings.max_width | default: 100 }}%;border-radius:{{ block.settings.radius | default: 12 }}px">
              {% if block.settings.image %}<img src="{{ block.settings.image | image_url: width: 1600 }}" alt="{{ block.settings.image.alt | escape }}" loading="lazy" width="{{ block.settings.image.width }}" height="{{ block.settings.image.height }}">{% else %}<div class="placeholder-media" style="aspect-ratio:{{ block.settings.ratio | default: '16/9' }}"></div>{% endif %}
            </div>
          </div>
        {% when 'button' %}
          <div class="cs__b cs__button cs--{{ a }}" style="{{ sp }}" {{ block.shopify_attributes }}>
            {% render 'button', label: block.settings.label, url: block.settings.link, style: block.settings.style %}
          </div>
        {% when 'feature' %}
          <div class="cs__b cs__feature cs--{{ a }}" style="{{ sp }}" {{ block.shopify_attributes }}>
            {% if block.settings.icon != blank %}<div class="cs__feature-icon">{{ block.settings.icon }}</div>{% endif %}
            {% if block.settings.title != blank %}<p class="cs__feature-title">{{ block.settings.title | escape }}</p>{% endif %}
            {% if block.settings.text != blank %}<div class="cs__feature-text rte">{{ block.settings.text }}</div>{% endif %}
          </div>
        {% when 'divider' %}
          <hr class="cs__b cs__divider" style="{{ sp }};border-top-width:{{ block.settings.thickness | default: 1 }}px;max-width:{{ block.settings.width | default: 100 }}%" {{ block.shopify_attributes }}>
        {% when 'spacer' %}
          <div class="cs__b" style="height:{{ block.settings.height | default: 32 }}px" {{ block.shopify_attributes }}></div>
      {% endcase %}
    {% endfor %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .cs__inner{display:flex;flex-direction:column}
  #shopify-section-{{ section.id }} .cs__inner--narrow{max-width:680px;margin-inline:auto}
  #shopify-section-{{ section.id }} .cs__inner--wide{max-width:100%}
  #shopify-section-{{ section.id }} .cs__b{margin:0}
  #shopify-section-{{ section.id }} .cs--center{text-align:center;align-items:center}
  #shopify-section-{{ section.id }} .cs--right{text-align:right;align-items:flex-end}
  #shopify-section-{{ section.id }} .cs__eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:600;color:var(--color-secondary);margin:0 0 10px}
  #shopify-section-{{ section.id }} .cs__heading{margin:0;line-height:1.06;letter-spacing:-0.02em}
  #shopify-section-{{ section.id }} .cs__text{max-width:70ch;line-height:1.65;opacity:.92}
  #shopify-section-{{ section.id }} .cs--center.cs__text,#shopify-section-{{ section.id }} .cs--center.cs__feature{margin-inline:auto}
  #shopify-section-{{ section.id }} .cs__image{display:flex;flex-direction:column}
  #shopify-section-{{ section.id }} .cs--center .cs__image-wrap{margin-inline:auto}
  #shopify-section-{{ section.id }} .cs--right .cs__image-wrap{margin-left:auto}
  #shopify-section-{{ section.id }} .cs__image-wrap{overflow:hidden}
  #shopify-section-{{ section.id }} .cs__image-wrap img{width:100%;height:auto;display:block}
  #shopify-section-{{ section.id }} .cs__feature{max-width:60ch}
  #shopify-section-{{ section.id }} .cs__feature-icon{font-size:30px;margin-bottom:10px}
  #shopify-section-{{ section.id }} .cs__feature-title{font-weight:600;font-size:18px;margin:0 0 6px}
  #shopify-section-{{ section.id }} .cs__feature-text{opacity:.85;line-height:1.6}
  #shopify-section-{{ section.id }} .cs__divider{width:100%;border:0;border-top:1px solid var(--color-border);margin-inline:0}
  #shopify-section-{{ section.id }} .cs--center.cs__divider{margin-inline:auto}
</style>`,
  schema: {
    name: "Custom section",
    tag: "section",
    class: "section-custom",
    max_blocks: 30,
    settings: [
      { type: "color_scheme", id: "color_scheme", label: "Color scheme", default: "scheme-1" },
      { type: "select", id: "content_width", label: "Content width", default: "normal", options: [{ value: "narrow", label: "Narrow" }, { value: "normal", label: "Normal" }, { value: "wide", label: "Wide" }] },
      { type: "color", id: "background", label: "Background (optional)" },
      { type: "range", id: "padding_top", label: "Top padding", min: 0, max: 140, step: 4, unit: "px", default: 56 },
      { type: "range", id: "padding_bottom", label: "Bottom padding", min: 0, max: 140, step: 4, unit: "px", default: 56 },
    ],
    blocks: [
      {
        type: "heading", name: "Heading",
        settings: [
          { type: "text", id: "eyebrow", label: "Eyebrow" },
          { type: "text", id: "text", label: "Heading", default: "A heading to grab attention" },
          { type: "select", id: "level", label: "Tag", default: "h2", options: [{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }] },
          { type: "range", id: "size", label: "Size", min: 18, max: 72, step: 2, unit: "px", default: 36 },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "text", name: "Text",
        settings: [
          { type: "richtext", id: "text", label: "Text", default: "<p>Use this space to describe a benefit, tell your story, or add supporting copy.</p>" },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "image", name: "Image",
        settings: [
          { type: "image_picker", id: "image", label: "Image" },
          { type: "select", id: "ratio", label: "Placeholder ratio", default: "16/9", options: [{ value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "1/1", label: "Square" }, { value: "3/4", label: "Portrait" }] },
          { type: "range", id: "max_width", label: "Max width", min: 20, max: 100, step: 5, unit: "%", default: 100 },
          { type: "range", id: "radius", label: "Corner radius", min: 0, max: 40, step: 2, unit: "px", default: 12 },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "button", name: "Button",
        settings: [
          { type: "text", id: "label", label: "Label", default: "Shop now" },
          { type: "url", id: "link", label: "Link" },
          { type: "select", id: "style", label: "Style", default: "primary", options: [{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }] },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "feature", name: "Icon feature",
        settings: [
          { type: "text", id: "icon", label: "Icon (emoji or text)", default: "★" },
          { type: "text", id: "title", label: "Title", default: "Free shipping" },
          { type: "richtext", id: "text", label: "Text", default: "<p>On all orders over $50.</p>" },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "divider", name: "Divider",
        settings: [
          { type: "range", id: "thickness", label: "Thickness", min: 1, max: 6, step: 1, unit: "px", default: 1 },
          { type: "range", id: "width", label: "Width", min: 10, max: 100, step: 5, unit: "%", default: 100 },
          ALIGN, SPACE_TOP, SPACE_BOTTOM,
        ],
      },
      {
        type: "spacer", name: "Spacer",
        settings: [
          { type: "range", id: "height", label: "Height", min: 8, max: 160, step: 4, unit: "px", default: 32 },
        ],
      },
    ],
    presets: [{
      name: "Custom section",
      blocks: [
        { type: "heading", settings: { eyebrow: "New in", text: "Build it exactly how you want" } },
        { type: "text", settings: {} },
        { type: "button", settings: {} },
      ],
    }],
  },
  defaultSettings: { color_scheme: "scheme-1", content_width: "normal", padding_top: 56, padding_bottom: 56 },
};
