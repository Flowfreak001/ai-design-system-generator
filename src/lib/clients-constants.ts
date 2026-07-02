// Client-side-safe constants (no Prisma import).
export const CLIENT_STAGES = ["Onboarding", "Active", "Paused", "Completed"] as const;
export const CLIENT_SERVICES = [
  "SEO",
  "PPC",
  "Social Media",
  "Content",
  "Web Design",
  "Automation",
  "Other",
] as const;
