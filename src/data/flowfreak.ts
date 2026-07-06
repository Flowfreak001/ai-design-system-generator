// Mock data for the Flowfreak platform foundation. Everything here is static and
// backend-free — it defines the shape of the product so the UI can be built and
// reviewed before real AI/DB work lands. Each export maps 1:1 to a future data
// source (Prisma query or AI agent output) without changing consumer code.

import type {
  ProductModule, Project, LibraryItem, SeoTask, AutomationWorkflow, McpTool,
  BusinessCategory, WebsiteGoal,
} from "@/types/flowfreak";

// ---- Shared taxonomy --------------------------------------------------------

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  "SaaS", "Agency", "Car Rental", "Dental Clinic", "Construction", "Restaurant",
  "Real Estate", "E-commerce", "Fitness", "Accounting", "Cleaning",
  "Taxi Service", "Healthcare", "Education", "Legal", "Home Services",
];

export const WEBSITE_GOALS: WebsiteGoal[] = [
  "Lead generation", "Online booking", "Product sales", "Appointment booking",
  "Portfolio showcase", "Local SEO", "Support/helpdesk", "Brand awareness",
];

export const STUDIO_STYLES = ["Minimal", "Bold", "Editorial", "Corporate", "Playful", "Luxury"] as const;
export const COMMON_PAGES = ["Home", "About", "Services", "Pricing", "Contact", "Blog", "Booking", "Gallery"] as const;

// ---- Product modules --------------------------------------------------------

export const MODULES: ProductModule[] = [
  {
    key: "studio", name: "Flowfreak Studio", tagline: "Plan & build",
    description: "Create wireframes, pages, and full websites from a short brief.",
    href: "/studio", icon: "studio", accent: "purple", status: "beta",
  },
  {
    key: "library", name: "Flowfreak Library", tagline: "Reusable blocks",
    description: "Browse industry sections, UI patterns, layouts, and page templates.",
    href: "/library", icon: "library", accent: "blue", status: "live",
  },
  {
    key: "seo", name: "Flowfreak SEO", tagline: "Rank & grow",
    description: "Generate SEO pages, blogs, keywords, and content plans.",
    href: "/seo", icon: "seo", accent: "orange", status: "planned",
  },
  {
    key: "automations", name: "Flowfreak Automations", tagline: "Run on autopilot",
    description: "Automate website, lead, support, and agency workflows.",
    href: "/automations", icon: "automations", accent: "pink", status: "planned",
  },
  {
    key: "mcp", name: "Flowfreak MCP", tagline: "Connect your tools",
    description: "Bring Flowfreak intelligence into Claude, Cursor, Lovable, and VS Code.",
    href: "/mcp", icon: "mcp", accent: "purple", status: "planned",
  },
];

// ---- Projects ---------------------------------------------------------------

export const PROJECTS: Project[] = [
  { id: "p1", name: "Simba Car Hire", businessType: "Car Rental", goal: "Online booking", status: "in_progress", lastUpdated: "2026-07-05", pages: 6, progress: 62 },
  { id: "p2", name: "Bloom Dental Clinic", businessType: "Dental Clinic", goal: "Appointment booking", status: "review", lastUpdated: "2026-07-04", pages: 5, progress: 80 },
  { id: "p3", name: "Nomad Coffee Roasters", businessType: "E-commerce", goal: "Product sales", status: "draft", lastUpdated: "2026-07-06", pages: 7, progress: 28 },
  { id: "p4", name: "Peak Fitness Studio", businessType: "Fitness", goal: "Lead generation", status: "live", lastUpdated: "2026-06-28", pages: 8, progress: 100 },
];

// ---- Library items (sample for module previews) -----------------------------

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: "l1", name: "Split Hero + Booking", type: "section", industry: "Car Rental", pageFit: ["Home"], goalFit: ["Online booking"], style: "Bold", layout: "Split", score: 94, description: "Hero with an inline booking widget and trust bar.", tags: ["hero", "booking", "conversion"], status: "ready" },
  { id: "l2", name: "Clinic Services Grid", type: "section", industry: "Dental Clinic", pageFit: ["Services"], goalFit: ["Appointment booking"], style: "Minimal", layout: "Grid", score: 90, description: "Service cards with icons and short outcomes.", tags: ["services", "grid"], status: "ready" },
  { id: "l3", name: "Pricing Tiers", type: "block", industry: "SaaS", pageFit: ["Pricing"], goalFit: ["Product sales"], style: "Corporate", layout: "Columns", score: 88, description: "Three-tier pricing with feature comparison.", tags: ["pricing", "saas"], status: "ready" },
  { id: "l4", name: "Local SEO Landing", type: "page-template", industry: "Home Services", pageFit: ["Landing"], goalFit: ["Local SEO", "Lead generation"], style: "Minimal", layout: "Stacked", score: 86, description: "Location page template optimised for local intent.", tags: ["seo", "local", "landing"], status: "draft" },
  { id: "l5", name: "Marquee Logo Wall", type: "ui-pattern", industry: "Any", pageFit: ["Home", "About"], goalFit: ["Brand awareness"], style: "Editorial", layout: "Marquee", score: 82, description: "Auto-scrolling logo/social-proof strip.", tags: ["logos", "proof"], status: "ready" },
  { id: "l6", name: "Restaurant Menu Board", type: "section", industry: "Restaurant", pageFit: ["Menu"], goalFit: ["Online booking"], style: "Luxury", layout: "Two-column", score: 84, description: "Menu categories with prices and dietary tags.", tags: ["menu", "food"], status: "ready" },
];

// ---- SEO tasks --------------------------------------------------------------

export const SEO_TASKS: SeoTask[] = [
  { id: "s1", title: "Car hire in Nairobi", type: "seo-page", keyword: "car hire nairobi", location: "Nairobi", status: "ready", volume: 3200, difficulty: 34, updatedAt: "2026-07-05" },
  { id: "s2", title: "Emergency dentist near me", type: "seo-page", keyword: "emergency dentist", location: "London", status: "generating", volume: 8100, difficulty: 52, updatedAt: "2026-07-06" },
  { id: "s3", title: "10 tips before renting a car", type: "blog", keyword: "car rental tips", status: "queued", volume: 1400, difficulty: 21, updatedAt: "2026-07-06" },
  { id: "s4", title: "Dental implants keyword cluster", type: "keyword-cluster", keyword: "dental implants", status: "ready", volume: 12000, difficulty: 61, updatedAt: "2026-07-03" },
  { id: "s5", title: "Homepage meta set", type: "meta", keyword: "coffee subscription", status: "published", updatedAt: "2026-07-02" },
];

export const SEO_CHECKLIST = [
  { label: "Title tag within 60 characters", done: true },
  { label: "Meta description within 155 characters", done: true },
  { label: "Single H1 with primary keyword", done: true },
  { label: "Internal links to key pages", done: false },
  { label: "Structured data (JSON-LD)", done: false },
  { label: "Image alt text", done: false },
];

// ---- Automation workflows ---------------------------------------------------

export const AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: "a1", name: "New enquiry → CRM + reply", description: "Capture form leads, add to CRM, send an instant reply.",
    category: "lead", trigger: { type: "form_submit", label: "Contact form submitted" },
    actions: [{ type: "create_lead", label: "Create CRM lead" }, { type: "send_email", label: "Send auto-reply" }],
    status: "active", lastRun: "2026-07-06", runs: 214,
  },
  {
    id: "a2", name: "Booking reminder", description: "Send SMS + email reminders 24h before an appointment.",
    category: "website", trigger: { type: "booking_created", label: "Booking created" },
    actions: [{ type: "wait", label: "Wait until 24h before" }, { type: "send_sms", label: "Send SMS reminder" }],
    status: "active", lastRun: "2026-07-05", runs: 98,
  },
  {
    id: "a3", name: "Support triage", description: "Classify inbound support messages and route by urgency.",
    category: "support", trigger: { type: "message_received", label: "Support message received" },
    actions: [{ type: "ai_classify", label: "Classify urgency" }, { type: "assign", label: "Route to agent" }],
    status: "paused", lastRun: "2026-07-01", runs: 42,
  },
  {
    id: "a4", name: "Weekly agency report", description: "Compile project + SEO metrics into a client-ready report.",
    category: "agency", trigger: { type: "schedule", label: "Every Monday 9am" },
    actions: [{ type: "collect_metrics", label: "Collect metrics" }, { type: "generate_report", label: "Generate report" }],
    status: "draft", runs: 0,
  },
];

// ---- MCP tools --------------------------------------------------------------

export const MCP_TOOLS: McpTool[] = [
  { id: "m1", name: "generate_wireframe", description: "Return a page blueprint (sections + order) for a business + goal.", inputExample: `{ "businessType": "Car Rental", "goal": "Online booking" }`, outputExample: `{ "pages": ["Home","Fleet","Booking"], "sections": {"Home": ["hero","fleet","cta"]} }`, status: "beta" },
  { id: "m2", name: "search_library", description: "Find reusable sections that fit an industry, page, and goal.", inputExample: `{ "industry": "Dental Clinic", "page": "Services" }`, outputExample: `[{ "id": "l2", "name": "Clinic Services Grid", "score": 90 }]`, status: "available" },
  { id: "m3", name: "generate_seo_page", description: "Draft an SEO-optimised page for a keyword + location.", inputExample: `{ "keyword": "car hire nairobi", "location": "Nairobi" }`, outputExample: `{ "title": "...", "h1": "...", "body": "..." }`, status: "planned" },
  { id: "m4", name: "create_automation", description: "Define a trigger→action workflow from a plain-language brief.", inputExample: `{ "brief": "Email me when a booking is made" }`, outputExample: `{ "trigger": "booking_created", "actions": ["send_email"] }`, status: "planned" },
];

export const MCP_CLIENTS = [
  { name: "Claude", connected: true },
  { name: "Cursor", connected: true },
  { name: "Lovable", connected: false },
  { name: "VS Code", connected: false },
];
