// Flowfreak platform domain types.
//
// Flowfreak is an AI platform to plan, build, optimize, and automate business
// websites. These types describe the five product modules (Studio, Library,
// SEO, Automations, MCP) plus the shared taxonomy (business categories, goals).
// They are intentionally backend-agnostic: today they're satisfied by mock data
// in `src/data/flowfreak.ts`; later they'll map onto Prisma models + AI agents.

export type ModuleKey = "studio" | "library" | "seo" | "automations" | "mcp";

/** A top-level Flowfreak product module shown on the dashboard + in nav. */
export type ProductModule = {
  key: ModuleKey;
  name: string;
  tagline: string;
  description: string;
  href: string;
  icon: string; // key into the shell ICONS map
  accent: "blue" | "pink" | "purple" | "orange";
  status: "live" | "beta" | "planned";
};

/** Industries Flowfreak builds for — drives Studio + Library recommendations. */
export type BusinessCategory =
  | "SaaS" | "Agency" | "Car Rental" | "Dental Clinic" | "Construction"
  | "Restaurant" | "Real Estate" | "E-commerce" | "Fitness" | "Accounting"
  | "Cleaning" | "Taxi Service" | "Healthcare" | "Education" | "Legal"
  | "Home Services";

/** What a website is trying to achieve — drives page + section selection. */
export type WebsiteGoal =
  | "Lead generation" | "Online booking" | "Product sales"
  | "Appointment booking" | "Portfolio showcase" | "Local SEO"
  | "Support/helpdesk" | "Brand awareness";

export type ItemStatus = "draft" | "ready" | "published" | "archived";

/** A website project a user is building in Flowfreak. */
export type Project = {
  id: string;
  name: string;
  businessType: BusinessCategory;
  goal: WebsiteGoal;
  status: "draft" | "in_progress" | "review" | "live";
  lastUpdated: string; // ISO date
  pages: number;
  progress: number; // 0–100
};

/** A reusable block/section/layout/template in Flowfreak Library. */
export type LibraryItem = {
  id: string;
  name: string;
  type: "section" | "block" | "layout" | "page-template" | "ui-pattern";
  industry: BusinessCategory | "Any";
  pageFit: string[];       // e.g. ["Home", "Pricing"]
  goalFit: WebsiteGoal[];
  style: string;           // e.g. "Minimal", "Bold", "Editorial"
  layout: string;          // e.g. "Split", "Grid", "Marquee"
  score: number;           // 0–100 quality/fit score
  description: string;
  tags: string[];
  status: ItemStatus;
};

/** A single SEO deliverable (page, blog, keyword cluster, meta set…). */
export type SeoTask = {
  id: string;
  title: string;
  type: "seo-page" | "blog" | "keyword-cluster" | "meta" | "content-plan";
  keyword: string;
  location?: string;
  status: "queued" | "generating" | "ready" | "published";
  volume?: number;         // est. monthly searches
  difficulty?: number;     // 0–100
  updatedAt: string;
};

export type WorkflowTrigger = { type: string; label: string };
export type WorkflowAction = { type: string; label: string };

/** An automation that reacts to a trigger and runs one or more actions. */
export type AutomationWorkflow = {
  id: string;
  name: string;
  description: string;
  category: "website" | "lead" | "support" | "agency";
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  status: "active" | "paused" | "draft";
  lastRun?: string;
  runs: number;
};

/** A capability Flowfreak exposes to external AI tools over MCP. */
export type McpTool = {
  id: string;
  name: string;
  description: string;
  inputExample: string;
  outputExample: string;
  status: "available" | "beta" | "planned";
};

/** Planned structure of a page before it's rendered into sections. */
export type PageBlueprint = {
  id: string;
  name: string;         // "Home", "Pricing"…
  goal: WebsiteGoal;
  sections: string[];   // ordered section names
};

/** A concrete section produced by Studio for a page. */
export type GeneratedSection = {
  id: string;
  name: string;
  kind: string;         // "hero", "features", "cta"…
  source: "template" | "ai" | "library";
};

/** Small numeric summary shown on the dashboard. */
export type Stat = {
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "pink" | "purple" | "orange";
};
