// The element/block/section catalog. Pure data — the Add Elements panel and the
// export/handoff both read from here. "ready" items can be inserted today (they
// resolve to a real section component via insertName); "coming-soon" items are
// listed but disabled until in-section nesting lands.
//
// IMAGE RULE: media items list assetRoles only — grey placeholders by default,
// never auto-stock or copied reference imagery.

import type { ElementGroup, ElementItem, ElementKind } from "./types";

type Seed = Partial<ElementItem> & { id: string; name: string; kind: ElementKind; category: string; group: ElementGroup };

// Factory: fills sensible defaults so each entry stays terse.
function el(s: Seed): ElementItem {
  return {
    sectionType: undefined,
    variant: undefined,
    insertName: s.kind === "section" || s.kind === "block" ? s.insertName ?? s.name : undefined,
    componentName: undefined,
    description: "",
    icon: "div",
    bestFor: [],
    websiteTypes: [],
    industries: [],
    goals: [],
    styleTags: [],
    layoutTags: [],
    interactionTags: [],
    assetRoles: [],
    defaultProps: {},
    exportNotes: "",
    status: "coming-soon",
    ...s,
  };
}

// ── 1. ATOMIC ELEMENTS ────────────────────────────────────────────────────
// Small building blocks. Listed for custom-section building; insertion needs
// in-section nesting (not yet supported) → coming-soon, but discoverable.
const ATOMIC: ElementItem[] = [
  el({ id: "atom-div", name: "Div Block / Container", kind: "atomic", category: "Layout", group: "Layout", icon: "div", description: "A generic container to group and style child elements." }),
  el({ id: "atom-flex", name: "Flexbox / Row", kind: "atomic", category: "Layout", group: "Layout", icon: "flex", description: "A flex row/column for arranging elements." }),
  el({ id: "atom-grid", name: "Grid", kind: "atomic", category: "Layout", group: "Layout", icon: "grid", description: "A responsive grid container.", layoutTags: ["grid-based"] }),
  el({ id: "atom-heading", name: "Heading", kind: "atomic", category: "Typography", group: "Basic", icon: "heading", description: "A headline/title element." }),
  el({ id: "atom-paragraph", name: "Paragraph", kind: "atomic", category: "Typography", group: "Basic", icon: "paragraph", description: "A block of body copy." }),
  el({ id: "atom-button", name: "Button", kind: "atomic", category: "Actions", group: "Basic", icon: "button", description: "A call-to-action button.", goals: ["Drive primary CTA"] }),
  el({ id: "atom-image", name: "Image Placeholder", kind: "atomic", category: "Media", group: "Media", icon: "image", description: "A grey image placeholder — upload or add an AI prompt later.", assetRoles: ["image"] }),
  el({ id: "atom-icon", name: "Icon", kind: "atomic", category: "Media", group: "Basic", icon: "icon", description: "A single icon." }),
  el({ id: "atom-svg", name: "SVG", kind: "atomic", category: "Media", group: "Media", icon: "svg", description: "An inline SVG graphic." }),
  el({ id: "atom-divider", name: "Divider", kind: "atomic", category: "Layout", group: "Basic", icon: "divider", description: "A horizontal rule / separator." }),
  el({ id: "atom-spacer", name: "Spacer", kind: "atomic", category: "Layout", group: "Layout", icon: "spacer", description: "Adjustable vertical spacing." }),
  el({ id: "atom-badge", name: "Badge", kind: "atomic", category: "Typography", group: "Basic", icon: "badge", description: "A small pill/label badge." }),
  el({ id: "atom-label", name: "Label", kind: "atomic", category: "Typography", group: "Basic", icon: "label", description: "An eyebrow/label text." }),
  el({ id: "atom-video", name: "Video Placeholder", kind: "atomic", category: "Media", group: "Media", icon: "video", description: "A grey video placeholder.", assetRoles: ["video"] }),
  el({ id: "atom-youtube", name: "YouTube Embed Placeholder", kind: "atomic", category: "Media", group: "Media", icon: "youtube", description: "A placeholder for an embedded YouTube video.", assetRoles: ["video"] }),
  el({ id: "atom-lottie", name: "Lottie Placeholder", kind: "atomic", category: "Media", group: "Media", icon: "lottie", description: "A placeholder for a Lottie animation.", assetRoles: ["animation"] }),
  el({ id: "atom-code", name: "Code Block", kind: "atomic", category: "Content", group: "Content", icon: "code", description: "A formatted code snippet block." }),
  el({ id: "atom-html", name: "HTML Embed Placeholder", kind: "atomic", category: "Content", group: "Content", icon: "html", description: "A placeholder for custom HTML embed." }),
];

// ── 2. BLOCKS / WIDGETS ───────────────────────────────────────────────────
// Items that map cleanly to a whole section today are "ready" (insertName set).
// Card-level blocks that belong INSIDE a section are coming-soon until nesting.
const BLOCKS: ElementItem[] = [
  // Basic blocks
  el({ id: "blk-imagebox", name: "Image Box", kind: "block", category: "Basic", group: "Basic", icon: "image", description: "Image + heading + text stacked.", assetRoles: ["image"] }),
  el({ id: "blk-iconbox", name: "Icon Box", kind: "block", category: "Basic", group: "Basic", icon: "icon", description: "Icon + heading + text." }),
  el({ id: "blk-buttongroup", name: "Button Group", kind: "block", category: "Basic", group: "Basic", icon: "button", description: "A pair of primary/secondary CTAs." }),
  el({ id: "blk-trustbadges", name: "Trust Badge Row", kind: "block", category: "Marketing", group: "Marketing", icon: "logos", description: "A row of trust badges / guarantees.", insertName: "Social Proof", sectionType: "social-proof", goals: ["Build trust"], status: "ready" }),
  el({ id: "blk-logorow", name: "Logo Row", kind: "block", category: "Marketing", group: "Marketing", icon: "logos", description: "A row of client/partner logos.", insertName: "Logos", sectionType: "social-proof", goals: ["Build trust"], status: "ready" }),
  el({ id: "blk-statsrow", name: "Stats Row", kind: "block", category: "Marketing", group: "Marketing", icon: "stats", description: "Key numbers / metrics row.", insertName: "Stats", sectionType: "social-proof", status: "ready" }),
  el({ id: "blk-card", name: "Card", kind: "block", category: "Basic", group: "Basic", icon: "card", description: "A generic content card." }),
  el({ id: "blk-cardgrid", name: "Card Grid", kind: "block", category: "Layout", group: "Layout", icon: "cards", description: "A grid of cards.", layoutTags: ["grid-based", "card-based"] }),
  el({ id: "blk-featurecard", name: "Feature Card", kind: "block", category: "Marketing", group: "Marketing", icon: "card", description: "A single feature/benefit card." }),
  el({ id: "blk-servicecard", name: "Service Card", kind: "block", category: "Marketing", group: "Marketing", icon: "card", description: "A single service card.", assetRoles: ["image"] }),
  el({ id: "blk-processstep", name: "Process Step", kind: "block", category: "Content", group: "Content", icon: "process", description: "A numbered step in a process." }),
  el({ id: "blk-timelineitem", name: "Timeline Item", kind: "block", category: "Content", group: "Content", icon: "process", description: "A single timeline entry." }),
  el({ id: "blk-alert", name: "Alert Box", kind: "block", category: "Basic", group: "Basic", icon: "badge", description: "An inline alert / callout." }),
  el({ id: "blk-quote", name: "Quote / Blockquote", kind: "block", category: "Content", group: "Content", icon: "quote", description: "A pull quote / blockquote." }),
  el({ id: "blk-list", name: "List / Icon List", kind: "block", category: "Content", group: "Content", icon: "list", description: "A bulleted or icon list." }),
  el({ id: "blk-progress", name: "Progress Bar", kind: "block", category: "Basic", group: "Basic", icon: "stats", description: "A labelled progress bar." }),
  el({ id: "blk-counter", name: "Counter", kind: "block", category: "Marketing", group: "Marketing", icon: "stats", description: "An animated number counter." }),
  el({ id: "blk-social", name: "Social Icons", kind: "block", category: "Basic", group: "Basic", icon: "icon", description: "A row of social links." }),
  // Interactive blocks
  el({ id: "blk-accordion", name: "Accordion", kind: "block", category: "Interactive", group: "Interactive", icon: "accordion", description: "Expand/collapse panels.", insertName: "FAQ", sectionType: "faq", interactionTags: ["accordion"], status: "ready" }),
  el({ id: "blk-tabs", name: "Tabs", kind: "block", category: "Interactive", group: "Interactive", icon: "tabs", description: "Tabbed content.", insertName: "Feature Tabs", sectionType: "features", variant: "tabs", interactionTags: ["tabs"], status: "ready" }),
  el({ id: "blk-carousel", name: "Carousel", kind: "block", category: "Interactive", group: "Interactive", icon: "carousel", description: "A content slider.", interactionTags: ["carousel"] }),
  el({ id: "blk-imagecarousel", name: "Image Carousel", kind: "block", category: "Interactive", group: "Interactive", icon: "carousel", description: "A sliding image gallery.", assetRoles: ["image"], interactionTags: ["carousel"] }),
  el({ id: "blk-mediacarousel", name: "Media Carousel", kind: "block", category: "Interactive", group: "Interactive", icon: "carousel", description: "A mixed media slider.", assetRoles: ["image", "video"], interactionTags: ["carousel"] }),
  el({ id: "blk-expandpanel", name: "Expandable Image Panel", kind: "block", category: "Interactive", group: "Interactive", icon: "sticky", description: "Panels that expand on hover.", assetRoles: ["image"], interactionTags: ["hover-expand"] }),
  el({ id: "blk-flipbox", name: "Flip Box", kind: "block", category: "Interactive", group: "Interactive", icon: "card", description: "A card that flips on hover.", interactionTags: ["hover-expand"] }),
  el({ id: "blk-offcanvas", name: "Off Canvas Panel", kind: "block", category: "Interactive", group: "Pro / Advanced", icon: "sticky", description: "A slide-in side panel." }),
  el({ id: "blk-modal", name: "Modal Trigger", kind: "block", category: "Interactive", group: "Pro / Advanced", icon: "sticky", description: "A button that opens a modal." }),
  el({ id: "blk-dropdown", name: "Dropdown Menu", kind: "block", category: "Interactive", group: "Interactive", icon: "list", description: "A dropdown menu." }),
  el({ id: "blk-marquee", name: "Marquee Strip", kind: "block", category: "Interactive", group: "Interactive", icon: "marquee", description: "An infinite moving strip.", insertName: "Gallery", sectionType: "gallery", variant: "marquee", interactionTags: ["marquee"], status: "ready" }),
  el({ id: "blk-stickymedia", name: "Sticky Media", kind: "block", category: "Interactive", group: "Interactive", icon: "sticky", description: "Scroll-driven sticky expanding media.", insertName: "Sticky Media", sectionType: "scroll-media", assetRoles: ["media"], interactionTags: ["sticky-scroll"], status: "ready" }),
  el({ id: "blk-scrollreveal", name: "Scroll Reveal Block", kind: "block", category: "Interactive", group: "Interactive", icon: "sticky", description: "Content that reveals on scroll.", interactionTags: ["scroll-reveal"] }),
  // Content blocks
  el({ id: "blk-testimonialcard", name: "Testimonial Card", kind: "block", category: "Social Proof", group: "Marketing", icon: "quote", description: "A single testimonial card.", insertName: "Testimonials", sectionType: "testimonials", goals: ["Build trust"], status: "ready" }),
  el({ id: "blk-reviewcard", name: "Review Card", kind: "block", category: "Social Proof", group: "Marketing", icon: "quote", description: "A star-rated review card.", insertName: "Reviews", sectionType: "testimonials", goals: ["Build trust"], status: "ready" }),
  el({ id: "blk-blogcard", name: "Blog Card", kind: "block", category: "Content", group: "Content", icon: "card", description: "A blog post preview card.", assetRoles: ["image"] }),
  el({ id: "blk-casestudycard", name: "Case Study Card", kind: "block", category: "Content", group: "Content", icon: "card", description: "A case-study result card.", assetRoles: ["image"] }),
  el({ id: "blk-pricingcard", name: "Pricing Card", kind: "block", category: "Marketing", group: "Marketing", icon: "pricing", description: "A single pricing plan card.", insertName: "Pricing", sectionType: "pricing", goals: ["Buy product"], status: "ready" }),
  el({ id: "blk-teamcard", name: "Team Member Card", kind: "block", category: "Content", group: "Content", icon: "team", description: "A team member profile card.", assetRoles: ["avatar"] }),
  el({ id: "blk-faqitem", name: "FAQ Item", kind: "block", category: "Content", group: "Content", icon: "faq", description: "A single Q&A item." }),
  el({ id: "blk-contactinfo", name: "Contact Info Block", kind: "block", category: "Content", group: "Content", icon: "list", description: "Address / phone / email block." }),
  el({ id: "blk-locationcard", name: "Location Card", kind: "block", category: "Content", group: "Content", icon: "card", description: "A location / branch card.", assetRoles: ["map"] }),
  // Form blocks
  el({ id: "blk-contactform", name: "Contact Form", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "A contact form.", insertName: "Contact Form", sectionType: "contact-form", goals: ["Generate leads"], status: "ready" }),
  el({ id: "blk-quoteform", name: "Quote Form", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "A request-a-quote form.", insertName: "Quote Form", sectionType: "quote-form", goals: ["Request a quote"], status: "ready" }),
  el({ id: "blk-bookingform", name: "Booking Form", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "A booking / appointment form.", insertName: "Booking Form", sectionType: "booking-form", goals: ["Get bookings"], status: "ready" }),
  el({ id: "blk-newsletterform", name: "Newsletter Form", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "An email signup form.", insertName: "Newsletter", sectionType: "footer", goals: ["Subscribe / signup"], status: "ready" }),
  el({ id: "blk-searchform", name: "Search Form", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "A search input block." }),
  el({ id: "blk-loginform", name: "Login Form Placeholder", kind: "block", category: "Forms", group: "Forms", icon: "form", description: "A login form placeholder." }),
  el({ id: "blk-paybtn", name: "Payment Button Placeholder", kind: "block", category: "Ecommerce", group: "Ecommerce", icon: "button", description: "A generic payment button placeholder." }),
  el({ id: "blk-stripebtn", name: "Stripe Button Placeholder", kind: "block", category: "Ecommerce", group: "Ecommerce", icon: "button", description: "A Stripe checkout button placeholder." }),
  el({ id: "blk-paypalbtn", name: "PayPal Button Placeholder", kind: "block", category: "Ecommerce", group: "Ecommerce", icon: "button", description: "A PayPal button placeholder." }),
  // Media blocks
  el({ id: "blk-imageph", name: "Image Placeholder", kind: "block", category: "Media", group: "Media", icon: "image", description: "A standalone grey image block.", assetRoles: ["image"] }),
  el({ id: "blk-gallerygrid", name: "Gallery Grid", kind: "block", category: "Media", group: "Media", icon: "gallery", description: "A grid image gallery.", insertName: "Gallery", sectionType: "gallery", assetRoles: ["image"], status: "ready" }),
  el({ id: "blk-basicgallery", name: "Basic Gallery", kind: "block", category: "Media", group: "Media", icon: "gallery", description: "A simple image gallery.", insertName: "Gallery", sectionType: "gallery", assetRoles: ["image"], status: "ready" }),
  el({ id: "blk-videoblock", name: "Video Block", kind: "block", category: "Media", group: "Media", icon: "video", description: "A video feature block.", assetRoles: ["video"] }),
  el({ id: "blk-videoplaylist", name: "Video Playlist", kind: "block", category: "Media", group: "Pro / Advanced", icon: "video", description: "A video playlist block.", assetRoles: ["video"] }),
  el({ id: "blk-productmockup", name: "Product Mockup Placeholder", kind: "block", category: "Media", group: "Media", icon: "mockup", description: "A grey product mockup placeholder.", assetRoles: ["mockup"] }),
  el({ id: "blk-dashboardmockup", name: "Dashboard Mockup Placeholder", kind: "block", category: "Media", group: "Media", icon: "mockup", description: "A grey dashboard/app mockup placeholder.", insertName: "Dashboard Preview", sectionType: "dashboard", assetRoles: ["mockup"], status: "ready" }),
  el({ id: "blk-devicemockup", name: "Device Mockup Placeholder", kind: "block", category: "Media", group: "Media", icon: "mockup", description: "A grey device frame placeholder.", assetRoles: ["mockup"] }),
];

// ── 3. FULL SECTIONS ──────────────────────────────────────────────────────
// Complete, ready-made page sections. All ready (resolve to a section component).
const S = (id: string, name: string, category: string, group: ElementGroup, extra: Partial<ElementItem> = {}): ElementItem =>
  el({ id, name, kind: "section", category, group, icon: extra.icon ?? "hero", status: "ready", insertName: name, ...extra });

const SECTIONS: ElementItem[] = [
  // Hero
  S("sec-hero-centered", "Hero Centered", "Hero", "Basic", { icon: "hero", sectionType: "hero", variant: "centered", goals: ["Drive primary CTA"] }),
  S("sec-hero-split", "Hero Split", "Hero", "Basic", { icon: "hero", sectionType: "hero", variant: "split-visual", assetRoles: ["image"] }),
  S("sec-hero-image", "Hero With Image", "Hero", "Basic", { icon: "hero", sectionType: "hero", variant: "image", assetRoles: ["image"] }),
  S("sec-hero-booking", "Hero With Booking Form", "Hero", "Forms", { icon: "hero", sectionType: "hero", variant: "booking", goals: ["Get bookings"] }),
  S("sec-hero-saas", "SaaS Hero", "Hero", "Basic", { icon: "hero", sectionType: "hero", variant: "saas", websiteTypes: ["SaaS / Software", "AI Tool / Platform"] }),
  S("sec-hero-local", "Local Business Hero", "Hero", "Basic", { icon: "hero", sectionType: "hero", variant: "centered", websiteTypes: ["Local Service Business", "Booking Website"] }),
  // Features
  S("sec-feat-grid", "Feature Grid", "Features", "Marketing", { icon: "grid", sectionType: "features", variant: "grid", goals: ["Show product features"] }),
  S("sec-feat-split", "Feature Split", "Features", "Marketing", { icon: "flex", sectionType: "features", variant: "accordion-visual", assetRoles: ["image"] }),
  S("sec-feat-accordion", "Feature Accordion", "Features", "Interactive", { icon: "accordion", sectionType: "features", variant: "accordion-visual", interactionTags: ["accordion"] }),
  S("sec-feat-tabs", "Feature Tabs", "Features", "Interactive", { icon: "tabs", sectionType: "features", variant: "tabs", interactionTags: ["tabs"] }),
  S("sec-feat-dark", "Dark Feature Cards", "Features", "Marketing", { icon: "cards", sectionType: "features", variant: "icon-cards", styleTags: ["dark"] }),
  S("sec-feat-workflow", "Product Workflow", "Features", "Marketing", { icon: "process", sectionType: "features", insertName: "Process" }),
  // Services
  S("sec-svc-cards", "Service Cards", "Services", "Marketing", { icon: "cards", sectionType: "services", variant: "cards-3" }),
  S("sec-svc-grid", "Service Grid", "Services", "Marketing", { icon: "grid", sectionType: "services", variant: "grid-6" }),
  S("sec-svc-image", "Service Image Cards", "Services", "Marketing", { icon: "cards", sectionType: "services", variant: "image-cards", assetRoles: ["image"] }),
  S("sec-svc-split", "Service Split List", "Services", "Marketing", { icon: "list", sectionType: "services", insertName: "Services" }),
  // Forms
  S("sec-form-contact", "Contact Section", "Forms", "Forms", { icon: "form", sectionType: "contact-form", insertName: "Contact Form", goals: ["Generate leads"] }),
  S("sec-form-quote", "Quote Section", "Forms", "Forms", { icon: "form", sectionType: "quote-form", insertName: "Quote Form", goals: ["Request a quote"] }),
  S("sec-form-booking", "Booking Section", "Forms", "Forms", { icon: "form", sectionType: "booking-form", insertName: "Booking Form", goals: ["Get bookings"] }),
  S("sec-form-newsletter", "Newsletter Section", "Forms", "Forms", { icon: "form", insertName: "Newsletter", goals: ["Subscribe / signup"] }),
  // Social proof
  S("sec-sp-logos", "Logo Cloud", "Social Proof", "Marketing", { icon: "logos", sectionType: "social-proof", insertName: "Logos", goals: ["Build trust"] }),
  S("sec-sp-stats", "Review Stats", "Social Proof", "Marketing", { icon: "stats", sectionType: "social-proof", insertName: "Stats", goals: ["Build trust"] }),
  S("sec-sp-testi", "Testimonials", "Social Proof", "Marketing", { icon: "quote", sectionType: "testimonials", goals: ["Build trust"] }),
  S("sec-sp-cases", "Case Study Results", "Social Proof", "Marketing", { icon: "cards", sectionType: "showcase", insertName: "Case Studies" }),
  // Showcase
  S("sec-sh-portfolio", "Portfolio Grid", "Showcase", "Media", { icon: "gallery", sectionType: "gallery", insertName: "Portfolio", assetRoles: ["image"] }),
  S("sec-sh-gallery", "Gallery Showcase", "Showcase", "Media", { icon: "gallery", sectionType: "gallery", insertName: "Gallery", assetRoles: ["image"] }),
  S("sec-sh-expand", "Expandable Image Showcase", "Showcase", "Interactive", { icon: "sticky", sectionType: "scroll-media", insertName: "Sticky Media", assetRoles: ["media"], interactionTags: ["sticky-scroll"] }),
  S("sec-sh-templates", "Template Gallery", "Showcase", "Media", { icon: "gallery", sectionType: "showcase", insertName: "Showcase" }),
  S("sec-sh-product", "Product Showcase", "Showcase", "Media", { icon: "mockup", sectionType: "showcase", insertName: "Showcase", assetRoles: ["mockup"] }),
  // Conversion
  S("sec-cta-banner", "CTA Banner", "Conversion", "Marketing", { icon: "cta", sectionType: "cta", variant: "banner", goals: ["Drive primary CTA"] }),
  S("sec-cta-split", "Split CTA", "Conversion", "Marketing", { icon: "cta", sectionType: "cta", variant: "split", goals: ["Drive primary CTA"] }),
  S("sec-cta-final", "Final CTA", "Conversion", "Marketing", { icon: "cta", sectionType: "cta", variant: "gradient", goals: ["Drive primary CTA"] }),
  S("sec-cta-sales", "Contact Sales CTA", "Conversion", "Marketing", { icon: "cta", sectionType: "cta", insertName: "CTA", goals: ["Contact sales"] }),
  S("sec-cta-book", "Book Now CTA", "Conversion", "Marketing", { icon: "cta", sectionType: "cta", insertName: "Book Now", goals: ["Get bookings"] }),
  // Utility
  S("sec-util-faq", "FAQ Section", "Utility", "Utility", { icon: "faq", sectionType: "faq", insertName: "FAQ" }),
  S("sec-util-pricing", "Pricing Section", "Utility", "Utility", { icon: "pricing", sectionType: "pricing", insertName: "Pricing" }),
  S("sec-util-compare", "Comparison Section", "Utility", "Utility", { icon: "compare", sectionType: "comparison", insertName: "Comparison" }),
  S("sec-util-process", "Process / How It Works", "Utility", "Utility", { icon: "process", sectionType: "features", insertName: "How It Works" }),
  S("sec-util-footer", "Footer", "Utility", "Utility", { icon: "footer", sectionType: "footer", insertName: "Footer" }),
  S("sec-util-navbar", "Navbar", "Utility", "Utility", { icon: "navbar", sectionType: "navbar", insertName: "Navbar" }),
  S("sec-util-announce", "Announcement Bar", "Utility", "Utility", { icon: "badge", insertName: "Announcement Bar" }),
];

// Block display name → the "block" section variant that renders it. Flipping
// these to `ready` lets the block insert as a real theme-aware band.
const BLOCK_VARIANT: Record<string, string> = {
  "Image Box": "image-box", "Icon Box": "icon-box", "Button Group": "button-group",
  "Card": "card", "Card Grid": "card-grid", "Feature Card": "feature-card",
  "Service Card": "service-card", "Alert Box": "alert", "Quote / Blockquote": "quote",
  "Progress Bar": "progress", "Counter": "counter", "Social Icons": "social-icons",
  "List / Icon List": "icon-list", "Process Step": "process-step", "Timeline Item": "timeline",
  "Team Member Card": "team-card", "Blog Card": "blog-card", "Case Study Card": "case-study-card",
  "FAQ Item": "faq-item", "Contact Info Block": "contact-info", "Location Card": "location-card",
  "Image Placeholder": "image-placeholder", "Video Block": "video-block",
  "Product Mockup Placeholder": "product-mockup", "Device Mockup Placeholder": "device-mockup",
};
for (const item of BLOCKS) {
  const variant = BLOCK_VARIANT[item.name];
  if (variant && item.status !== "ready") {
    item.status = "ready";
    item.sectionType = "block";
    item.variant = variant;
    item.insertName = item.name;
    item.componentName = "BlockSection";
  }
}

export const ELEMENT_LIBRARY: ElementItem[] = [...SECTIONS, ...BLOCKS, ...ATOMIC];

export const getElementsByKind = (kind: ElementKind): ElementItem[] => ELEMENT_LIBRARY.filter((e) => e.kind === kind);
export const findElement = (id: string): ElementItem | undefined => ELEMENT_LIBRARY.find((e) => e.id === id);
export const isReady = (e: ElementItem): boolean => e.status === "ready" && Boolean(e.insertName);
