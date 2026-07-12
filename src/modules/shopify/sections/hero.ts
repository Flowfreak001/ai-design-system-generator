import type { ShopifySectionDefinition } from "../types";

export const heroSection: ShopifySectionDefinition = {
  id: "hero-banner",
  name: "Hero banner",
  category: "hero",
  description: "Full-width hero with heading, subtext, image and up to two buttons.",
  supportedTemplates: ["index", "page", "collection"],
  liquid: `<div class="hero hero--{{ section.settings.height }} hero--align-{{ section.settings.alignment }}" style="--hero-overlay: {{ section.settings.overlay_opacity }}%">
  {% if section.settings.image %}
    <img class="hero__image" src="{{ section.settings.image | image_url: width: 2200 }}" alt="{{ section.settings.image.alt | escape }}" loading="{% if section.index == 1 %}eager{% else %}lazy{% endif %}" width="2200" height="1100">
  {% endif %}
  <div class="hero__inner page-width">
    {% if section.settings.eyebrow != blank %}<p class="hero__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.heading != blank %}<h1 class="hero__heading">{{ section.settings.heading | escape }}</h1>{% endif %}
    {% if section.settings.subheading != blank %}<div class="hero__sub">{{ section.settings.subheading }}</div>{% endif %}
    {% if section.settings.button_label != blank or section.settings.button2_label != blank %}
      <div class="hero__actions">
        {% if section.settings.button_label != blank %}<a class="btn btn--primary" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label | escape }}</a>{% endif %}
        {% if section.settings.button2_label != blank %}<a class="btn btn--secondary" href="{{ section.settings.button2_link | default: '#' }}">{{ section.settings.button2_label | escape }}</a>{% endif %}
      </div>
    {% endif %}
  </div>
</div>
<style>
  #shopify-section-{{ section.id }} .hero{position:relative;overflow:hidden;background:linear-gradient(155deg,var(--color-primary),color-mix(in srgb,var(--color-primary) 78%,var(--color-secondary)));color:#fff}
  #shopify-section-{{ section.id }} .hero__image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #shopify-section-{{ section.id }} .hero__image + .hero__inner::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,calc(var(--hero-overlay)/100 + .15)),rgba(0,0,0,calc(var(--hero-overlay)/100 - .1)))}
  #shopify-section-{{ section.id }} .hero__inner{position:relative;display:flex;flex-direction:column;gap:18px;padding-block:clamp(72px,13vw,150px);max-width:680px}
  #shopify-section-{{ section.id }} .hero--small .hero__inner{padding-block:clamp(52px,8vw,92px)}
  #shopify-section-{{ section.id }} .hero--large .hero__inner{padding-block:clamp(104px,17vw,220px)}
  #shopify-section-{{ section.id }} .hero--align-center .hero__inner{align-items:center;text-align:center;max-width:760px;margin-inline:auto}
  #shopify-section-{{ section.id }} .hero__eyebrow{margin:0;text-transform:uppercase;letter-spacing:.2em;font-size:12px;font-weight:600;opacity:.82}
  #shopify-section-{{ section.id }} .hero__heading{margin:0;color:#fff;font-size:clamp(38px,6.4vw,68px);line-height:1.03;letter-spacing:-0.03em}
  #shopify-section-{{ section.id }} .hero__sub{max-width:540px;font-size:clamp(16px,2vw,20px);opacity:.9;line-height:1.55}
  #shopify-section-{{ section.id }} .hero__actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
</style>`,
  schema: {
    name: "Hero banner",
    class: "section-hero",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow" },
      { type: "text", id: "heading", label: "Heading", default: "Designed for everyday living" },
      { type: "richtext", id: "subheading", label: "Subheading", default: "<p>Tell customers what makes your store worth their time.</p>" },
      { type: "image_picker", id: "image", label: "Background image" },
      { type: "range", id: "overlay_opacity", label: "Image overlay", min: 0, max: 80, step: 5, unit: "%", default: 30 },
      { type: "select", id: "height", label: "Height", default: "medium", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
      { type: "select", id: "alignment", label: "Alignment", default: "left", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
      { type: "header", content: "Buttons" },
      { type: "text", id: "button_label", label: "Primary button", default: "Shop now" },
      { type: "url", id: "button_link", label: "Primary link" },
      { type: "text", id: "button2_label", label: "Secondary button" },
      { type: "url", id: "button2_link", label: "Secondary link" },
    ],
    presets: [{ name: "Hero banner" }],
  },
  defaultSettings: { heading: "Designed for everyday living", height: "medium", alignment: "left", overlay_opacity: 30, button_label: "Shop now" },
};
