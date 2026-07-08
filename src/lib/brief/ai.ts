// Flowfreak Brief — AI functions (deterministic mock fallbacks).
// When a real AI provider is wired up these become the network calls; today they
// return structured, realistic placeholders derived from the brief input so the
// whole notes → brief → sitemap → wireframe → scope → export flow works end to end.

import type {
  Brief,
  BriefScore,
  ScopeOfWork,
  SitemapNode,
  StructuredBrief,
  WireframePage,
} from "./types";
import { SCORE_CATEGORIES } from "./types";

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string; // key into an icon map in the UI
  tagline: string;
  websiteType: string;
  services: string[];
  pages: string[];
  features: string[];
  keywords: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  { id: "taxi", name: "Taxi / Transport", icon: "car", tagline: "Bookings, fleet, airport transfers", websiteType: "Booking site", services: ["Airport transfers", "City rides", "Corporate travel", "Event transport"], pages: ["Home", "Services", "Airport Transfers", "Pricing", "Book Now", "Contact"], features: ["Booking", "WhatsApp", "Payments", "Reviews"], keywords: ["airport taxi", "book a taxi", "minicab near me"] },
  { id: "flooring", name: "Flooring / Carpets", icon: "layers", tagline: "Showroom, quotes, installation", websiteType: "Lead generation", services: ["Carpet fitting", "Laminate flooring", "Vinyl & LVT", "Commercial flooring"], pages: ["Home", "Services", "Gallery", "Get a Quote", "About", "Contact"], features: ["Contact form", "Gallery", "Reviews", "WhatsApp"], keywords: ["flooring near me", "carpet fitters", "laminate installation"] },
  { id: "car-rental", name: "Car Rental", icon: "car", tagline: "Fleet, availability, bookings", websiteType: "Booking site", services: ["Economy hire", "Luxury hire", "Van rental", "Long-term lease"], pages: ["Home", "Fleet", "Pricing", "Locations", "Book Now", "Contact"], features: ["Booking", "Payments", "Login area", "Reviews"], keywords: ["car hire", "rent a car", "van rental near me"] },
  { id: "clinic", name: "Clinic / Healthcare", icon: "heart", tagline: "Appointments, treatments, trust", websiteType: "Booking site", services: ["General consultations", "Specialist care", "Diagnostics", "Follow-up care"], pages: ["Home", "Treatments", "Our Team", "Book Appointment", "FAQs", "Contact"], features: ["Booking", "Contact form", "Reviews", "Newsletter"], keywords: ["clinic near me", "book appointment", "private healthcare"] },
  { id: "construction", name: "Construction", icon: "hammer", tagline: "Projects, trust, quotes", websiteType: "Lead generation", services: ["New builds", "Extensions", "Renovations", "Project management"], pages: ["Home", "Services", "Projects", "About", "Get a Quote", "Contact"], features: ["Contact form", "Gallery", "Reviews"], keywords: ["builders near me", "home extension", "construction company"] },
  { id: "cleaning", name: "Cleaning", icon: "sparkle", tagline: "Recurring jobs, bookings", websiteType: "Booking site", services: ["Domestic cleaning", "Commercial cleaning", "End of tenancy", "Deep cleaning"], pages: ["Home", "Services", "Pricing", "Book Now", "Reviews", "Contact"], features: ["Booking", "Payments", "WhatsApp", "Reviews"], keywords: ["cleaners near me", "end of tenancy cleaning", "office cleaning"] },
  { id: "agency", name: "Agency", icon: "briefcase", tagline: "Portfolio, services, leads", websiteType: "Portfolio + lead gen", services: ["Brand & design", "Web development", "Marketing", "Consulting"], pages: ["Home", "Services", "Work", "About", "Contact"], features: ["Contact form", "Newsletter", "CRM"], keywords: ["design agency", "web design studio", "branding agency"] },
  { id: "saas", name: "SaaS", icon: "cloud", tagline: "Product, pricing, sign-ups", websiteType: "SaaS marketing site", services: ["Core product", "Integrations", "Enterprise plan", "Support"], pages: ["Home", "Features", "Pricing", "Docs", "Login", "Sign Up"], features: ["Login area", "Payments", "Newsletter", "CRM"], keywords: ["project management tool", "team software", "workflow app"] },
  { id: "ecommerce", name: "Ecommerce", icon: "cart", tagline: "Catalog, checkout, retention", websiteType: "Ecommerce", services: ["Product catalog", "Collections", "Gift cards", "Wholesale"], pages: ["Home", "Shop", "Product", "Cart", "Checkout", "Account"], features: ["Payments", "Login area", "Reviews", "Newsletter"], keywords: ["buy online", "shop", "best deals"] },
  { id: "restaurant", name: "Restaurant", icon: "utensils", tagline: "Menu, reservations, orders", websiteType: "Bookings + menu", services: ["Dine-in", "Takeaway", "Private events", "Catering"], pages: ["Home", "Menu", "Reservations", "About", "Gallery", "Contact"], features: ["Booking", "WhatsApp", "Gallery", "Reviews"], keywords: ["restaurant near me", "book a table", "order takeaway"] },
];

export const ALL_FEATURES = [
  "Contact form", "Booking", "Payments", "Blog", "Gallery", "Reviews",
  "WhatsApp", "CRM", "Newsletter", "Login area", "Other integrations",
];

const templateById = (id?: string) => INDUSTRY_TEMPLATES.find((t) => t.id === id);
const titleCase = (s: string) => s.replace(/\b\w/g, (m) => m.toUpperCase());
const g = (b: Brief, key: string) => (b.guided?.[key] || "").trim();
const splitList = (v: string) => v.split(/[,\n;]/).map((x) => x.trim()).filter(Boolean);

// Whole-word keyword signals per template (avoids "care" matching "car rental").
const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  taxi: ["taxi", "cab", "minicab", "transport", "transfer", "chauffeur", "airport"],
  flooring: ["floor", "flooring", "carpet", "laminate", "vinyl", "lvt", "tiling"],
  "car-rental": ["rental", "hire", "rent a car", "car hire", "van hire", "lease", "fleet"],
  clinic: ["clinic", "health", "healthcare", "dental", "dentist", "medical", "doctor", "gp", "physio", "cosmetic"],
  construction: ["construction", "builder", "building", "extension", "renovation", "contractor"],
  cleaning: ["cleaning", "cleaner", "janitorial", "tenancy"],
  agency: ["agency", "studio", "marketing", "branding", "consulting", "design"],
  saas: ["saas", "software", "app", "platform", "startup", "product"],
  ecommerce: ["ecommerce", "e-commerce", "shop", "store", "retail", "product catalog"],
  restaurant: ["restaurant", "cafe", "takeaway", "dining", "menu", "bistro", "catering"],
};

/** Pick the most likely industry template from guided fields or free text. */
function inferTemplate(b: Brief): IndustryTemplate {
  const explicit = templateById(g(b, "industryTemplate"));
  if (explicit) return explicit;
  // Industry field carries the strongest signal; free text is a weaker fallback.
  const strong = `${b.industry} ${g(b, "industry")}`.toLowerCase();
  const weak = `${b.rawInput} ${g(b, "services")}`.toLowerCase();
  const hit = (kw: string, hay: string) => new RegExp(`\\b${kw.replace(/[-\s]/g, "[-\\s]")}`, "i").test(hay);
  let best: IndustryTemplate | null = null;
  let bestScore = 0;
  for (const t of INDUSTRY_TEMPLATES) {
    const kws = TEMPLATE_KEYWORDS[t.id] ?? [];
    const score = kws.reduce((a, kw) => a + (hit(kw, strong) ? 3 : 0) + (hit(kw, weak) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best ?? INDUSTRY_TEMPLATES[6]; // agency default
}

/** extractStructuredBrief(input) — build a structured brief from any input. */
export function extractStructuredBrief(b: Brief): StructuredBrief {
  const t = inferTemplate(b);
  const businessName = b.businessName || g(b, "businessName") || "Client Business";
  const location = g(b, "location") || "London, UK";
  const services = splitList(g(b, "services")).length ? splitList(g(b, "services")) : t.services;
  const pagesInput = splitList(g(b, "pages")).length ? splitList(g(b, "pages")) : t.pages;
  const features = splitList(g(b, "features")).length ? splitList(g(b, "features")) : t.features;
  const goal = g(b, "primaryGoal") || "Generate qualified enquiries and bookings";
  const audience = g(b, "targetAudience") || `Local customers in ${location} looking for ${t.name.toLowerCase()} services`;

  const pages = pagesInput.map((name, i): StructuredBrief["pages"][number] => ({
    name: titleCase(name),
    type: /blog|faq|locations?|areas?/i.test(name) ? "seo" : i < 4 ? "core" : "optional",
    goal: /home/i.test(name) ? "Communicate value and drive the primary CTA" : /contact|book|quote/i.test(name) ? "Capture the lead" : `Explain ${name.toLowerCase()} and build trust`,
    cta: /contact|book|quote/i.test(name) ? "Submit enquiry" : "Get in touch",
    seoPriority: /home|service|location/i.test(name) ? "high" : /blog|faq/i.test(name) ? "medium" : "low",
  }));

  const locations = splitList(g(b, "seoLocations")).length ? splitList(g(b, "seoLocations")) : [location.split(",")[0]];

  return {
    business: {
      name: businessName,
      industry: g(b, "industry") || t.name,
      location,
      summary: `${businessName} is a ${t.name.toLowerCase()} business in ${location}. ${t.tagline}.`,
      targetAudience: audience,
    },
    project: {
      websiteType: g(b, "websiteType") || t.websiteType,
      primaryGoal: goal,
      secondaryGoals: ["Build trust and credibility", "Improve local SEO visibility", "Reduce time spent answering repeat questions"],
      primaryCta: /book/i.test(t.websiteType) ? "Book now" : "Request a quote",
      timeline: g(b, "timeline") || "4–6 weeks",
      budgetRange: g(b, "budgetRange") || "£2,000 – £5,000",
    },
    services,
    pages,
    features: {
      selected: features,
      integrations: splitList(g(b, "features")).filter((f) => /crm|calendar|payment|whatsapp/i.test(f)),
      technicalNotes: "Standard responsive build. No custom backend identified yet — confirm any integrations.",
    },
    seo: {
      targetLocations: locations,
      mainServices: services.slice(0, 4),
      keywords: t.keywords,
      contentOpportunities: locations.map((l) => `${services[0]} in ${l}`),
      blogIdeas: [`How to choose ${services[0].toLowerCase()}`, `${t.name} costs explained`, `${locations[0]} customer guide`],
      competitorNotes: splitList(g(b, "competitors")).join(", ") || "No competitors captured yet — ask the client for 2–3 examples.",
    },
    brand: {
      style: g(b, "designStyle") || "Clean, modern, trustworthy",
      tone: "Professional, approachable, reassuring",
      colors: ["Primary accent", "Neutral base", "Supporting tint"],
      typography: "Modern sans-serif for headings and body",
      references: splitList(g(b, "referenceWebsites")),
      doNotes: ["Keep layouts spacious and scannable", "Lead with proof and clear CTAs"],
      dontNotes: ["Avoid clutter and stock-heavy visuals", "Don't hide contact / booking actions"],
    },
    content: {
      availableAssets: splitList(g(b, "availableContent")).length ? splitList(g(b, "availableContent")) : ["Logo", "Some photos"],
      missingAssets: splitList(g(b, "missingContent")).length ? splitList(g(b, "missingContent")) : ["Service copy", "Testimonials", "Team photos"],
      copyNeeded: pages.slice(0, 5).map((p) => `${p.name} page copy`),
    },
    questions: {
      open: [
        { id: "q1", text: "Who owns writing the page copy — the client or the agency?", answered: false },
        { id: "q2", text: "Are there existing brand colours and fonts to follow?", answered: false },
      ],
      followUp: [
        { id: "f1", text: `Which ${locations.join(", ")} areas are the priority for SEO?`, answered: false },
        { id: "f2", text: "Do you need online payments at launch or later?", answered: false },
        { id: "f3", text: "Can you share 2–3 competitor or reference websites you like?", answered: false },
      ],
    },
    risks: {
      unclearScope: ["Payment / booking scope not fully confirmed"],
      missingContent: ["Testimonials and project photos not yet supplied"],
      technicalUnknowns: ["Any third-party integrations (CRM, calendar) to confirm"],
    },
    recommendations: {
      sitemap: [`Lead with a strong ${t.websiteType.toLowerCase()} structure`, "Add location pages for local SEO"],
      content: ["Collect 3–5 testimonials early", "Gather real project / product photography"],
      components: ["Hero with primary CTA", "Trust badges / logos", "Service grid", "Testimonials", "Sticky contact CTA"],
    },
  };
}

/** scoreBrief(brief) — completeness score per category + overall. */
export function scoreBrief(s: StructuredBrief): BriefScore {
  const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()));
  const pct = (parts: boolean[]) => Math.round((parts.filter(Boolean).length / parts.length) * 100);
  const categories = {
    "Business clarity": pct([has(s.business.name), has(s.business.industry), has(s.business.location), has(s.business.summary), has(s.business.targetAudience)]),
    "Goal clarity": pct([has(s.project.primaryGoal), has(s.project.secondaryGoals), has(s.project.primaryCta), has(s.project.websiteType)]),
    "Page clarity": pct([s.pages.length >= 3, s.pages.some((p) => has(p.goal)), s.pages.some((p) => has(p.cta)), s.pages.length >= 5]),
    "Feature clarity": pct([has(s.features.selected), s.features.selected.length >= 3, has(s.features.technicalNotes)]),
    "SEO clarity": pct([has(s.seo.targetLocations), has(s.seo.keywords), has(s.seo.contentOpportunities), has(s.seo.competitorNotes) && !/no competitors/i.test(s.seo.competitorNotes)]),
    "Brand clarity": pct([has(s.brand.style), has(s.brand.tone), has(s.brand.references)]),
    "Content readiness": pct([has(s.content.availableAssets), s.content.missingAssets.length <= 2, has(s.content.copyNeeded)]),
    "Technical clarity": pct([has(s.features.technicalNotes), s.risks.technicalUnknowns.length <= 1, has(s.project.timeline)]),
  } as BriefScore["categories"];
  const overall = Math.round(SCORE_CATEGORIES.reduce((a, c) => a + categories[c], 0) / SCORE_CATEGORIES.length);
  return { overall, categories };
}

/** generateMissingInfo(brief) — what's still weak, human-readable. */
export function generateMissingInfo(s: StructuredBrief, score: BriefScore): string[] {
  const out: string[] = [];
  for (const c of SCORE_CATEGORIES) if (score.categories[c] < 70) out.push(`${c} needs more detail (${score.categories[c]}%).`);
  if (s.content.missingAssets.length) out.push(`Missing assets: ${s.content.missingAssets.join(", ")}.`);
  if (/no competitors/i.test(s.seo.competitorNotes)) out.push("No competitor references captured.");
  return out.length ? out : ["Brief looks complete — review and export."];
}

/** generateFollowUpQuestions(brief) — client-facing questions. */
export function generateFollowUpQuestions(s: StructuredBrief): string[] {
  return [...s.questions.open.map((q) => q.text), ...s.questions.followUp.map((q) => q.text)];
}

/** generateClientSummary(brief) — one-paragraph summary. */
export function generateClientSummary(s: StructuredBrief): string {
  return `${s.business.name} needs a ${s.project.websiteType.toLowerCase()} whose main goal is to ${s.project.primaryGoal.toLowerCase()}. The audience is ${s.business.targetAudience.toLowerCase()}. We recommend ${s.pages.length} pages with "${s.project.primaryCta}" as the primary action, prioritising ${s.seo.targetLocations.join(", ")} for local SEO.`;
}

/** generateSitemap(brief) — nested page tree with services as children. */
export function generateSitemap(s: StructuredBrief): SitemapNode[] {
  const toNode = (p: StructuredBrief["pages"][number]): SitemapNode => ({
    name: p.name, goal: p.goal, cta: p.cta, seoPriority: p.seoPriority, required: p.type === "core",
  });
  return s.pages.map((p) => {
    const node = toNode(p);
    if (/services|treatments|fleet|shop|menu/i.test(p.name)) {
      node.children = s.services.slice(0, 4).map((svc) => ({
        name: svc, goal: `Convert interest in ${svc.toLowerCase()}`, cta: s.project.primaryCta, seoPriority: "medium", required: false,
      }));
    }
    return node;
  });
}

/** generateWireframePlan(brief, sitemap) — per-page section plans. */
export function generateWireframePlan(s: StructuredBrief): WireframePage[] {
  const homeSections = [
    { name: "Hero", purpose: "Communicate value + primary CTA", content: `${s.business.name} headline, subline, ${s.project.primaryCta}`, cta: s.project.primaryCta, component: "Hero", priority: "high" as const },
    { name: "Trust badges", purpose: "Build instant credibility", content: "Client logos, accreditations, ratings", cta: "—", component: "Logo strip", priority: "medium" as const },
    { name: "Services overview", purpose: "Show what's offered", content: s.services.slice(0, 4).join(", "), cta: "View services", component: "Feature grid", priority: "high" as const },
    { name: "Why choose us", purpose: "Differentiate", content: "3–4 reasons with icons", cta: "—", component: "Value grid", priority: "medium" as const },
    { name: "Gallery / proof", purpose: "Show real work", content: "Project or product photos", cta: "See more", component: "Gallery", priority: "medium" as const },
    { name: "Testimonials", purpose: "Social proof", content: "3–5 quotes with names", cta: "—", component: "Testimonials", priority: "high" as const },
    { name: "FAQ", purpose: "Handle objections + SEO", content: "6–8 common questions", cta: "—", component: "Accordion", priority: "low" as const },
    { name: "CTA", purpose: "Convert", content: "Strong closing call to action", cta: s.project.primaryCta, component: "CTA band", priority: "high" as const },
    { name: "Footer", purpose: "Navigation + contact", content: "Links, contact, hours, social", cta: "Contact", component: "Footer", priority: "low" as const },
  ];
  const inner = (p: StructuredBrief["pages"][number]) => [
    { name: "Page hero", purpose: `Introduce ${p.name}`, content: `${p.name} headline + intro`, cta: p.cta, component: "Slim hero", priority: p.seoPriority },
    { name: "Body content", purpose: p.goal, content: `Detailed ${p.name.toLowerCase()} content`, cta: "—", component: "Rich text", priority: "medium" as const },
    { name: "Supporting proof", purpose: "Reassure", content: "Testimonials / stats relevant to page", cta: "—", component: "Proof band", priority: "low" as const },
    { name: "CTA", purpose: "Convert", content: "Contextual call to action", cta: p.cta, component: "CTA band", priority: "high" as const },
  ];
  return s.pages.slice(0, 6).map((p) => ({
    page: p.name,
    sections: /home/i.test(p.name) ? homeSections : inner(p),
  }));
}

/** generateScopeOfWork(brief, sitemap, wireframe) — deliverable scope. */
export function generateScopeOfWork(s: StructuredBrief): ScopeOfWork {
  return {
    summary: `Design and build a ${s.project.websiteType.toLowerCase()} for ${s.business.name} (${s.pages.length} pages) focused on ${s.project.primaryGoal.toLowerCase()}. Timeline ${s.project.timeline}, budget ${s.project.budgetRange}.`,
    includedPages: s.pages.map((p) => p.name),
    includedFeatures: s.features.selected,
    contentResponsibility: [
      `Client provides: ${s.content.availableAssets.join(", ")}`,
      `Agency produces: ${s.content.copyNeeded.slice(0, 3).join(", ")}`,
      `Still needed: ${s.content.missingAssets.join(", ")}`,
    ],
    timelineAssumptions: [`${s.project.timeline} from content sign-off`, "Assumes one round of revisions per page", "Client feedback within 3 working days"],
    exclusions: ["Ongoing content writing beyond launch", "Paid ads / SEO retainer", "Custom backend / bespoke integrations unless scoped"],
    openQuestions: generateFollowUpQuestions(s).slice(0, 4),
    nextSteps: ["Confirm scope + timeline", "Collect outstanding content/assets", "Approve sitemap & wireframe", "Kick off design"],
  };
}

/** generateExportPrompts(brief, sitemap, wireframe) — tool-ready prompts. */
export function generateExportPrompts(b: Brief): {
  claude: string;
  lovable: string;
  cursor: string;
  json: string;
} {
  const s = b.structured!;
  const pageList = s.pages.map((p) => `- ${p.name} (${p.type}) → ${p.goal}`).join("\n");
  const base = `Business: ${s.business.name} — ${s.business.industry}, ${s.business.location}
Website type: ${s.project.websiteType}
Primary goal: ${s.project.primaryGoal}
Primary CTA: ${s.project.primaryCta}
Audience: ${s.business.targetAudience}
Services: ${s.services.join(", ")}
Features: ${s.features.selected.join(", ")}
Pages:
${pageList}
Brand: ${s.brand.style}; tone ${s.brand.tone}
SEO locations: ${s.seo.targetLocations.join(", ")}; keywords: ${s.seo.keywords.join(", ")}`;

  return {
    claude: `You are a senior web designer. Using the structured brief below, produce a component-based homepage and page plan for ${s.business.name}. Prioritise the primary CTA "${s.project.primaryCta}" and keep the layout clean.\n\n${base}`,
    lovable: `Build a responsive marketing website for ${s.business.name}. Generate the pages listed, wire the "${s.project.primaryCta}" CTA, and keep a ${s.brand.style.toLowerCase()} style.\n\n${base}`,
    cursor: `// Project brief for ${s.business.name}\n// Scaffold a Next.js + Tailwind site with these pages/sections.\n/*\n${base}\n*/`,
    json: JSON.stringify({ business: s.business, project: s.project, services: s.services, pages: s.pages, features: s.features, seo: s.seo, brand: s.brand, content: s.content }, null, 2),
  };
}

/** Full pipeline — used when a brief is first generated. */
export function runFullBrief(b: Brief): Brief {
  const structured = extractStructuredBrief(b);
  const score = scoreBrief(structured);
  const sitemap = generateSitemap(structured);
  const wireframe = generateWireframePlan(structured);
  const scope = generateScopeOfWork(structured);
  return { ...b, structured, score, sitemap, wireframe, scope, updatedAt: new Date().toISOString() };
}
