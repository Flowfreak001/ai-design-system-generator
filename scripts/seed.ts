// Dev seed — creates one demo project with generated files.
// Run: npm run db:seed  (or: npx tsx scripts/seed.ts)
import "dotenv/config";
import { createProject, generateMockFiles } from "../src/lib/projects";

async function main() {
  const p = await createProject({
    name: "Aurora Fintech",
    clientName: "Aurora",
    brief: {
      businessName: "Aurora",
      industry: "Fintech",
      audience: "Freelancers",
      goals: [],
      tone: ["trustworthy", "modern"],
      notes: "Landing page for a fintech app targeting freelancers.",
    },
    referenceUrls: [{ url: "https://stripe.com", type: "REFERENCE" }],
  });
  const count = await generateMockFiles(p.id);
  console.log(`seeded project ${p.id} with ${count} files`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
