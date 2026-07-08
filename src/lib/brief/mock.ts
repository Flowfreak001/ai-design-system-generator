// Flowfreak Brief — guided form config + seed sample briefs.

import type { Brief } from "./types";
import { runFullBrief } from "./ai";

export interface GuidedField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  group: string;
}

export const GUIDED_GROUPS = ["Client & business", "Project", "Content & pages", "SEO & brand", "Commercials"] as const;

export const GUIDED_FIELDS: GuidedField[] = [
  { key: "clientName", label: "Client name", type: "text", placeholder: "e.g. Sarah Khan", group: "Client & business" },
  { key: "businessName", label: "Business name", type: "text", placeholder: "e.g. Sunrise Dental", group: "Client & business" },
  { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Healthcare / dental", group: "Client & business" },
  { key: "location", label: "Location", type: "text", placeholder: "e.g. Manchester, UK", group: "Client & business" },
  { key: "existingWebsite", label: "Existing website", type: "text", placeholder: "https:// (or none)", group: "Client & business" },
  { key: "websiteType", label: "Website type", type: "select", options: ["Brochure", "Landing page", "Lead generation", "Booking site", "Ecommerce", "SaaS marketing site", "Portfolio"], group: "Project" },
  { key: "primaryGoal", label: "Primary website goal", type: "text", placeholder: "e.g. Get more appointment bookings", group: "Project" },
  { key: "targetAudience", label: "Target audience", type: "textarea", placeholder: "Who are the customers?", group: "Project" },
  { key: "services", label: "Services / products", type: "textarea", placeholder: "Comma or line separated", group: "Content & pages" },
  { key: "pages", label: "Required pages", type: "textarea", placeholder: "Home, Services, About, Contact…", group: "Content & pages" },
  { key: "features", label: "Required features", type: "textarea", placeholder: "Booking, Payments, Gallery…", group: "Content & pages" },
  { key: "availableContent", label: "Available content / assets", type: "textarea", placeholder: "Logo, photos, copy…", group: "Content & pages" },
  { key: "missingContent", label: "Missing content / assets", type: "textarea", placeholder: "Testimonials, team photos…", group: "Content & pages" },
  { key: "seoLocations", label: "SEO locations", type: "textarea", placeholder: "Areas to target", group: "SEO & brand" },
  { key: "competitors", label: "Competitors", type: "textarea", placeholder: "Competitor names or URLs", group: "SEO & brand" },
  { key: "designStyle", label: "Design style", type: "text", placeholder: "e.g. Clean, modern, premium", group: "SEO & brand" },
  { key: "referenceWebsites", label: "Reference websites", type: "textarea", placeholder: "Sites the client likes", group: "SEO & brand" },
  { key: "budgetRange", label: "Budget range", type: "select", options: ["Under £2,000", "£2,000 – £5,000", "£5,000 – £10,000", "£10,000+", "Not sure yet"], group: "Commercials" },
  { key: "timeline", label: "Timeline", type: "select", options: ["ASAP", "2–4 weeks", "4–6 weeks", "6–10 weeks", "Flexible"], group: "Commercials" },
  { key: "additionalNotes", label: "Additional notes", type: "textarea", placeholder: "Anything else worth capturing", group: "Commercials" },
];

function seed(partial: Omit<Brief, "structured" | "score" | "sitemap" | "wireframe" | "scope">): Brief {
  return { ...runFullBrief(partial as Brief), version: 0, generatedVersion: 0 };
}

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();

export const SAMPLE_BRIEFS: Brief[] = [
  seed({
    id: "sample-clinic",
    clientName: "Dr. Amelia Osei",
    businessName: "Riverside Dental Care",
    industry: "Healthcare / dental",
    status: "ready",
    inputMethod: "guided",
    createdAt: iso(6),
    updatedAt: iso(1),
    rawInput: "",
    guided: {
      clientName: "Dr. Amelia Osei", businessName: "Riverside Dental Care", industry: "Healthcare / dental",
      location: "Bristol, UK", websiteType: "Booking site", primaryGoal: "Increase new-patient appointment bookings",
      targetAudience: "Local families and professionals seeking private and NHS dental care",
      services: "Check-ups, Cosmetic dentistry, Implants, Invisalign, Emergency care",
      pages: "Home, Treatments, About, Our Team, Book Appointment, FAQs, Contact",
      features: "Booking, Contact form, Reviews, Newsletter",
      seoLocations: "Bristol, Clifton, Bedminster",
      designStyle: "Calm, clean, trustworthy", budgetRange: "£5,000 – £10,000", timeline: "4–6 weeks",
    },
  }),
  seed({
    id: "sample-flooring",
    clientName: "Marcus Reid",
    businessName: "Reid & Sons Flooring",
    industry: "Flooring / carpets",
    status: "in-review",
    inputMethod: "notes",
    createdAt: iso(3),
    updatedAt: iso(0),
    rawInput: "Met Marcus at the showroom. Family flooring business, 20 years. Wants more quote requests. Does carpets, laminate, LVT, commercial. Covers Leeds and surrounding. Has a logo and some job photos but no reviews collected. Budget maybe 3-4k. Wants it live before spring.",
  }),
  seed({
    id: "sample-taxi",
    clientName: "Priya Nair",
    businessName: "CityLink Cabs",
    industry: "Taxi / transport",
    status: "draft",
    inputMethod: "transcript",
    createdAt: iso(1),
    updatedAt: iso(0),
    transcriptSource: "Zoom call — 12 min",
    rawInput: "So basically we do airport runs mostly, some corporate accounts. The current site is really old, can't book online. We want people to book and pay online, and WhatsApp us. Gatwick and Heathrow are the big ones. Not much budget, want it quick.",
  }),
  seed({
    id: "sample-saas",
    clientName: "Elena Vasquez",
    businessName: "Cadence",
    industry: "SaaS",
    status: "in-review",
    inputMethod: "guided",
    createdAt: iso(2),
    updatedAt: iso(1),
    rawInput: "",
    guided: {
      clientName: "Elena Vasquez", businessName: "Cadence", industry: "SaaS / project management",
      location: "Remote", websiteType: "SaaS marketing site", primaryGoal: "Increase free-trial sign-ups",
      targetAudience: "Small product and ops teams that outgrew spreadsheets",
      services: "Core product, Integrations, Enterprise plan, Support",
      pages: "Home, Features, Pricing, Docs, Login, Sign Up",
      features: "Login area, Payments, Newsletter, CRM",
      designStyle: "Modern, confident, product-led", budgetRange: "£10,000+", timeline: "6–10 weeks",
    },
  }),
  {
    id: "sample-empty",
    clientName: "Tom Bright",
    businessName: "Bright Cleaning Co",
    industry: "Cleaning",
    status: "draft",
    inputMethod: "notes",
    createdAt: iso(0),
    updatedAt: iso(0),
    rawInput: "Quick call — domestic + office cleaning, wants online booking. Follow up needed.",
    version: 0,
    generatedVersion: 0,
  },
];
