// Edit-schema registry: which fields / items / media roles / motion presets the
// Section Settings drawer shows for each section kind. Adding a new prebuilt
// section later = add an entry here (+ defaults) — the drawer adapts by itself.

import type { FieldDef, ItemFieldDef, SectionEditSchema } from "./types";

const t = (key: FieldDef["key"], label: string, placeholder?: string): FieldDef => ({ key, label, kind: "text", placeholder });
const ta = (key: FieldDef["key"], label: string, placeholder?: string): FieldDef => ({ key, label, kind: "textarea", placeholder });
const href = (key: FieldDef["key"], label: string): FieldDef => ({ key, label, kind: "href", placeholder: "/page or https://…" });
const it = (key: string, label: string, kind: ItemFieldDef["kind"] = "text", placeholder?: string): ItemFieldDef => ({ key, label, kind, placeholder });

const HEADER_FIELDS: FieldDef[] = [t("eyebrow", "Eyebrow"), t("title", "Title"), t("subtitle", "Subtitle"), ta("description", "Description")];
const CTA_FIELDS: FieldDef[] = [
  t("primaryButtonLabel", "Primary button label"), href("primaryButtonHref", "Primary button link"),
  t("secondaryButtonLabel", "Secondary button label"), href("secondaryButtonHref", "Secondary button link"),
];

export const SECTION_EDIT_SCHEMAS: SectionEditSchema[] = [
  {
    kinds: ["hero"], label: "Hero",
    fields: [...HEADER_FIELDS, ...CTA_FIELDS],
    mediaRoles: ["hero visual"],
    motionPresets: ["none", "scroll-reveal", "sticky-expanding-media"],
  },
  {
    kinds: ["services", "features", "usecases", "integrations", "workflow"], label: "Services / Features",
    fields: [t("eyebrow", "Eyebrow"), t("title", "Section title"), t("subtitle", "Section subtitle"), ta("description", "Description")],
    items: {
      label: "Items", itemNoun: "item",
      fields: [it("title", "Title"), it("text", "Description", "textarea"), it("href", "Link", "href")],
      defaultItem: { title: "New item", text: "Describe this item." },
    },
    mediaRoles: ["supporting visual"],
    motionPresets: ["none", "hover-lift", "scroll-reveal", "accordion", "tabs"],
  },
  {
    kinds: ["faq"], label: "FAQ",
    fields: [t("title", "Section title"), t("subtitle", "Section subtitle")],
    items: {
      label: "Questions", itemNoun: "question",
      fields: [it("title", "Question"), it("text", "Answer", "textarea")],
      defaultItem: { title: "A new question?", text: "A clear, concise answer." },
    },
    mediaRoles: [],
    motionPresets: ["none", "accordion", "scroll-reveal"],
  },
  {
    kinds: ["cta"], label: "CTA",
    fields: [t("title", "Title"), t("subtitle", "Subtitle"), ...CTA_FIELDS],
    mediaRoles: ["background visual"],
    motionPresets: ["none", "scroll-reveal", "hover-lift"],
  },
  {
    kinds: ["footer"], label: "Footer",
    fields: [t("title", "Logo text"), ta("description", "Copyright / tagline")],
    items: {
      label: "Footer links", itemNoun: "link",
      fields: [it("title", "Label"), it("href", "Link", "href"), it("text", "Column", "text", "Product / Company / Legal…")],
      defaultItem: { title: "New link", href: "#", text: "Company" },
    },
    mediaRoles: ["logo"],
    motionPresets: ["none"],
  },
  {
    kinds: ["form", "booking"], label: "Form",
    fields: [t("title", "Form title"), t("subtitle", "Form subtitle"), t("primaryButtonLabel", "Submit button label"), ta("description", "Success message / notes")],
    items: {
      label: "Form fields", itemNoun: "field",
      fields: [it("title", "Field label"), it("text", "Placeholder / type")],
      defaultItem: { title: "New field", text: "text" },
    },
    mediaRoles: ["side visual"],
    motionPresets: ["none", "scroll-reveal"],
  },
  {
    kinds: ["testimonials"], label: "Testimonials",
    fields: [t("title", "Section title"), t("subtitle", "Section subtitle")],
    items: {
      label: "Testimonials", itemNoun: "testimonial",
      fields: [it("text", "Quote", "textarea"), it("title", "Name"), it("href", "Role / company")],
      defaultItem: { text: "“A short, credible quote.”", title: "Full Name", href: "Role, Company" },
    },
    mediaRoles: ["avatar"],
    motionPresets: ["none", "carousel", "marquee", "scroll-reveal"],
  },
  {
    kinds: ["pricing"], label: "Pricing",
    fields: [t("title", "Section title"), t("subtitle", "Section subtitle")],
    items: {
      label: "Plans", itemNoun: "plan",
      fields: [it("title", "Plan name"), it("icon", "Price", "text", "$29/mo"), it("text", "Features (one per line)", "textarea"), it("href", "Button link", "href")],
      defaultItem: { title: "New plan", icon: "$0/mo", text: "Feature one\nFeature two" },
    },
    mediaRoles: [],
    motionPresets: ["none", "hover-lift", "scroll-reveal"],
  },
  {
    kinds: ["gallery", "showcase", "scrollmedia"], label: "Gallery / Showcase",
    fields: [t("title", "Section title"), t("subtitle", "Section subtitle")],
    items: {
      label: "Gallery items", itemNoun: "image",
      fields: [it("title", "Caption"), it("text", "Notes", "textarea")],
      defaultItem: { title: "New image", text: "" },
    },
    mediaRoles: ["gallery image"],
    motionPresets: ["none", "marquee", "hover-expand", "sticky-scroll", "sticky-expanding-media", "carousel"],
  },
  {
    kinds: ["socialproof"], label: "Social Proof",
    fields: [t("title", "Section title"), t("subtitle", "Section subtitle")],
    items: {
      label: "Stats / logos", itemNoun: "entry",
      fields: [it("title", "Value / name", "text", "10k+ or Client name"), it("text", "Label", "text", "Active users")],
      defaultItem: { title: "10k+", text: "Happy customers" },
    },
    mediaRoles: ["logo"],
    motionPresets: ["none", "marquee", "scroll-reveal"],
  },
  {
    kinds: ["navbar"], label: "Navbar",
    fields: [t("title", "Logo text"), t("primaryButtonLabel", "CTA label"), href("primaryButtonHref", "CTA link")],
    items: {
      label: "Nav links", itemNoun: "link",
      fields: [it("title", "Label"), it("href", "Link", "href")],
      defaultItem: { title: "New link", href: "#" },
    },
    mediaRoles: ["logo"],
    motionPresets: ["none"],
  },
];

const GENERIC: SectionEditSchema = {
  kinds: ["generic", "block", "comparison", "directory", "dashboard"], label: "Section",
  fields: [...HEADER_FIELDS, ...CTA_FIELDS],
  items: {
    label: "Items", itemNoun: "item",
    fields: [it("title", "Title"), it("text", "Text", "textarea")],
    defaultItem: { title: "New item", text: "Describe this item." },
  },
  mediaRoles: ["image"],
  motionPresets: ["none", "hover-lift", "scroll-reveal", "marquee", "sticky-scroll"],
};

/** Resolve the edit schema for a sectionKind() value (generic fallback). */
export function getEditSchema(kind: string): SectionEditSchema {
  return SECTION_EDIT_SCHEMAS.find((s) => s.kinds.includes(kind)) ?? GENERIC;
}
