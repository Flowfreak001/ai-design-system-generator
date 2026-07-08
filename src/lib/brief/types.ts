// Flowfreak Brief — domain types.
// Self-contained module: turns client meeting notes / transcripts / guided
// answers into a structured website project brief. No DB/auth changes — briefs
// live in a client-side store (see store.ts) with mock AI fallbacks (see ai.ts).

export type BriefStatus = "draft" | "in-review" | "ready" | "exported";
export type InputMethod = "guided" | "notes" | "transcript" | "template";

export interface BusinessInfo {
  name: string;
  industry: string;
  location: string;
  summary: string;
  targetAudience: string;
}

export interface ProjectInfo {
  websiteType: string;
  primaryGoal: string;
  secondaryGoals: string[];
  primaryCta: string;
  timeline: string;
  budgetRange: string;
}

export type SeoPriority = "high" | "medium" | "low";
export type PageType = "core" | "optional" | "seo";

export interface BriefPage {
  name: string;
  type: PageType;
  goal: string;
  cta: string;
  seoPriority: SeoPriority;
  notes?: string;
}

export interface FeatureSet {
  selected: string[];
  integrations: string[];
  technicalNotes: string;
}

export interface SeoInfo {
  targetLocations: string[];
  mainServices: string[];
  keywords: string[];
  contentOpportunities: string[];
  blogIdeas: string[];
  competitorNotes: string;
}

export interface BrandInfo {
  style: string;
  tone: string;
  colors: string[];
  typography: string;
  references: string[];
  doNotes: string[];
  dontNotes: string[];
}

export interface ContentInfo {
  availableAssets: string[];
  missingAssets: string[];
  copyNeeded: string[];
}

export interface QuestionItem {
  id: string;
  text: string;
  answered: boolean;
  answer?: string;
}

export interface QuestionsInfo {
  open: QuestionItem[];
  followUp: QuestionItem[];
}

export interface RiskInfo {
  unclearScope: string[];
  missingContent: string[];
  technicalUnknowns: string[];
}

export interface Recommendations {
  sitemap: string[];
  content: string[];
  components: string[];
}

export interface StructuredBrief {
  /** User-edited client summary; overrides the generated one when present. */
  summaryOverride?: string;
  business: BusinessInfo;
  project: ProjectInfo;
  services: string[];
  pages: BriefPage[];
  features: FeatureSet;
  seo: SeoInfo;
  brand: BrandInfo;
  content: ContentInfo;
  questions: QuestionsInfo;
  risks: RiskInfo;
  recommendations: Recommendations;
}

export const SCORE_CATEGORIES = [
  "Business clarity",
  "Goal clarity",
  "Page clarity",
  "Feature clarity",
  "SEO clarity",
  "Brand clarity",
  "Content readiness",
  "Technical clarity",
] as const;
export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

export interface BriefScore {
  overall: number;
  categories: Record<ScoreCategory, number>;
}

export interface SitemapNode {
  name: string;
  goal: string;
  cta: string;
  seoPriority: SeoPriority;
  required: boolean;
  children?: SitemapNode[];
}

export interface WireframeSection {
  name: string;
  purpose: string;
  content: string;
  cta: string;
  component: string;
  priority: SeoPriority;
}

export interface WireframePage {
  page: string;
  sections: WireframeSection[];
}

export interface ScopeOfWork {
  summary: string;
  includedPages: string[];
  includedFeatures: string[];
  contentResponsibility: string[];
  timelineAssumptions: string[];
  exclusions: string[];
  openQuestions: string[];
  nextSteps: string[];
}

export interface Brief {
  id: string;
  clientName: string;
  businessName: string;
  industry: string;
  status: BriefStatus;
  inputMethod: InputMethod;
  createdAt: string;
  updatedAt: string;
  rawInput: string;
  transcriptSource?: string;
  guided?: Record<string, string>;
  structured?: StructuredBrief;
  score?: BriefScore;
  sitemap?: SitemapNode[];
  wireframe?: WireframePage[];
  scope?: ScopeOfWork;
}

export const WORKSPACE_TABS = [
  "Summary",
  "Goals",
  "Pages",
  "Features",
  "SEO",
  "Brand",
  "Questions",
  "Sitemap",
  "Wireframe",
  "Scope",
  "Export",
] as const;
export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];
