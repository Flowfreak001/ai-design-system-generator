// Dev seed — creates one demo project and generates its files.
// Run: npm run db:seed  (or: npx tsx scripts/seed.ts)
import "dotenv/config";
import { createProject } from "../src/lib/projects";
import { runGeneration } from "../src/lib/generation";

async function main() {
  const p = await createProject({
    name: "Aurora Marketing Site",
    clientName: "Aurora Inc.",
    businessName: "Aurora",
    businessType: "SaaS",
    websiteGoal: "Generate qualified sign-ups",
    targetAudience: "Freelancers and small studios",
    existingWebsiteUrl: undefined,
    servicesProducts: "Automated invoicing and expense tracking",
    referenceUrls: ["https://stripe.com", "https://linear.app"],
    competitorUrls: ["https://freshbooks.com"],
    brandColors: ["#6D5EF6", "#0E1017", "#22D3EE"],
    requiredPages: ["Home", "Pricing", "Features", "About", "Contact"],
    seoKeywords: ["freelancer invoicing", "expense tracking", "get paid faster"],
    platformTarget: "Claude Code",
    animationPreference: "Premium",
    notes: "Premium, trustworthy, developer-friendly tone.",
  });
  await runGeneration(p.id);
  console.log(`seeded project ${p.id} (${p.slug}) with generated files`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
