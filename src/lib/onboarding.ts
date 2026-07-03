// Onboarding option sets + dynamic feature suggestion for /projects/new.
// Shared by the wizard (UI) and validators. Feature suggestions are derived
// from the selected industry + website type, never hardcoded to one layout.

export const WEBSITE_TYPES = [
  "Marketing website",
  "Landing page",
  "SaaS platform",
  "Directory platform",
  "Marketplace",
  "Booking website",
  "Ecommerce",
  "Client portal",
  "Dashboard",
  "Blog / content site",
  "Custom",
] as const;

export const GOAL_OPTIONS = [
  "Generate leads",
  "Get bookings",
  "Sell products",
  "Collect enquiries",
  "Showcase services",
  "Build trust",
  "Improve SEO",
  "Share content / blogs",
  "Manage customers",
  "Create dashboard / app flow",
] as const;

// Canonical feature set. Suggestions below are always a subset of these.
export const FEATURE_OPTIONS = [
  "Contact form",
  "Quote request form",
  "Booking form",
  "Calendar booking",
  "WhatsApp button",
  "Call button",
  "Service cards",
  "Service detail pages",
  "Pricing section",
  "FAQ section",
  "Testimonials",
  "Gallery / portfolio",
  "Blog section",
  "Reviews section",
  "Newsletter signup",
  "Login area",
  "Dashboard",
  "Search / filters",
  "Listings",
  "Payment / checkout",
  "Map / location section",
] as const;

export const PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Service detail pages",
  "Contact",
  "Booking / enquiry form",
  "Pricing",
  "FAQ",
  "Blog",
  "Portfolio / case studies",
  "Testimonials",
  "Login / dashboard",
  "Other",
] as const;

export const REFERENCE_LEARN_OPTIONS = [
  "Colors",
  "Typography",
  "Layout",
  "Animation",
  "Sections",
  "Forms",
  "Overall style",
] as const;

type Feature = (typeof FEATURE_OPTIONS)[number];

/** Order a suggested subset the same way FEATURE_OPTIONS is ordered. */
function ordered(set: Set<string>): Feature[] {
  return FEATURE_OPTIONS.filter((f) => set.has(f));
}

/**
 * Suggest the most relevant features for a given industry + website type.
 * Everything returned is a member of FEATURE_OPTIONS so the UI can pre-select
 * chips; the user can still toggle any feature or add custom ones.
 */
export function suggestFeatures(industry?: string, websiteType?: string): Feature[] {
  const ind = (industry ?? "").toLowerCase();
  const wt = (websiteType ?? "").toLowerCase();
  const set = new Set<string>();
  const add = (...fs: Feature[]) => fs.forEach((f) => set.add(f));

  // --- Baseline by website type -------------------------------------------
  if (wt.includes("landing")) {
    add("Contact form", "Service cards", "Pricing section", "Testimonials", "FAQ section", "Newsletter signup");
  } else if (wt.includes("saas")) {
    add("Service cards", "Pricing section", "Login area", "Dashboard", "Testimonials", "FAQ section", "Newsletter signup");
  } else if (wt.includes("directory")) {
    add("Listings", "Search / filters", "Map / location section", "Reviews section", "Contact form", "FAQ section");
  } else if (wt.includes("marketplace")) {
    add("Listings", "Search / filters", "Payment / checkout", "Reviews section", "Login area", "Contact form");
  } else if (wt.includes("booking")) {
    add("Booking form", "Calendar booking", "Pricing section", "Service cards", "Reviews section", "FAQ section", "Map / location section");
  } else if (wt.includes("ecommerce")) {
    add("Listings", "Payment / checkout", "Search / filters", "Reviews section", "Newsletter signup", "FAQ section");
  } else if (wt.includes("portal")) {
    add("Login area", "Dashboard", "Contact form", "Service detail pages", "Search / filters");
  } else if (wt.includes("dashboard")) {
    add("Login area", "Dashboard", "Search / filters", "Listings");
  } else if (wt.includes("blog") || wt.includes("content")) {
    add("Blog section", "Newsletter signup", "Search / filters", "Contact form", "Reviews section");
  } else {
    // Marketing website / custom default
    add("Contact form", "Service cards", "Service detail pages", "Testimonials", "FAQ section", "Gallery / portfolio");
  }

  // --- Augment by industry keywords ---------------------------------------
  const has = (...keys: string[]) => keys.some((k) => ind.includes(k));

  if (has("car rental", "car hire", "rental", "hire", "vehicle", "taxi", "transport", "travel", "tour")) {
    add("Booking form", "Calendar booking", "Service cards", "Pricing section", "Contact form", "FAQ section", "Reviews section", "Map / location section");
  }
  if (has("plumb", "electric", "trade", "hvac", "roof", "clean", "handyman", "contractor", "repair", "landscap", "builder", "construction", "pest", "locksmith")) {
    add("Quote request form", "Call button", "Service cards", "Testimonials", "FAQ section", "Gallery / portfolio", "Map / location section");
  }
  if (has("restaurant", "cafe", "food", "catering", "bar", "bakery")) {
    add("Booking form", "Gallery / portfolio", "Reviews section", "Map / location section", "Call button", "WhatsApp button");
  }
  if (has("real estate", "property", "estate", "letting", "realtor")) {
    add("Listings", "Search / filters", "Map / location section", "Contact form", "Gallery / portfolio");
  }
  if (has("clinic", "dental", "medical", "health", "salon", "spa", "therapy", "beauty", "fitness", "gym", "wellness")) {
    add("Booking form", "Calendar booking", "Service cards", "Testimonials", "FAQ section", "Call button", "Map / location section");
  }
  if (has("law", "legal", "account", "consult", "agency", "finance", "insurance", "advisor")) {
    add("Contact form", "Service detail pages", "Testimonials", "FAQ section", "Newsletter signup");
  }
  if (has("shop", "store", "retail", "ecommerce", "boutique", "fashion", "product")) {
    add("Listings", "Payment / checkout", "Search / filters", "Reviews section", "Newsletter signup");
  }
  if (has("saas", "software", "app", "platform", "tech", "startup")) {
    add("Pricing section", "Login area", "Dashboard", "Testimonials", "FAQ section");
  }

  return ordered(set);
}

/** Rough accuracy signal for the review step, from how much evidence is given. */
export function estimateAccuracy(opts: {
  hasMainReference: boolean;
  referenceCount: number;
  featureCount: number;
  pageCount: number;
}): { level: "Low" | "Medium" | "High" | "Very High"; note: string } {
  let score = 0;
  if (opts.hasMainReference) score += 2;
  score += Math.min(opts.referenceCount, 3);
  if (opts.featureCount >= 4) score += 1;
  if (opts.pageCount >= 4) score += 1;

  if (score >= 6) return { level: "Very High", note: "Strong reference evidence + clear scope." };
  if (score >= 4) return { level: "High", note: "Good references and a defined scope." };
  if (score >= 2) return { level: "Medium", note: "Some references — add more pages for a truer system." };
  return { level: "Low", note: "Add a main reference site to improve accuracy." };
}
