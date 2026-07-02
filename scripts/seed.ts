// Dev seed — one project of each type, with generated files.
// Run: npm run db:seed
import "dotenv/config";
import { createProject } from "../src/lib/projects";
import { registerUser } from "../src/lib/auth";
import { createClient } from "../src/lib/clients";
import { runGeneration } from "../src/lib/generation";

async function main() {
  // Demo login: demo@projectos.dev / demo-password-123
  const reg = await registerUser({
    name: "Demo Owner",
    email: "demo@projectos.dev",
    password: "demo-password-123",
    agencyName: "Demo Agency",
  });
  if (reg.error || !reg.user?.agencyId) throw new Error(reg.error ?? "seed user failed");
  const agencyId = reg.user.agencyId;

  const aurora = await createClient(agencyId, {
    name: "Aurora Inc.", type: "SaaS", website: "https://aurora.example",
    contactName: "Maya Chen", contactEmail: "maya@aurora.example",
    stage: "Active", services: ["Web Design", "Content"],
  });
  const acme = await createClient(agencyId, {
    name: "Acme Plumbing", type: "Plumber", website: "https://acmeplumbing.example",
    contactName: "Ravi Patel", contactEmail: "ravi@acmeplumbing.example",
    stage: "Onboarding", services: ["Automation", "SEO"],
  });

  const site = await createProject({
    name: "Aurora Marketing Site",
    businessId: aurora.id,
    clientName: "Aurora Inc.",
    type: "WEBSITE_APP",
    businessType: "SaaS",
    goal: "Generate qualified sign-ups",
    targetAudience: "Freelancers and small studios",
    keyItems: ["Home", "Pricing", "Features", "About", "Contact"],
    brandRefs: ["#6D5EF6", "https://linear.app"],
    currentTools: ["Stripe", "Notion"],
    notes: "Premium, trustworthy, developer-friendly tone.",
    currentProcess: undefined,
    mainPainPoint: undefined,
    triggerSource: undefined,
    aiShouldDo: undefined,
    needsHumanApproval: undefined,
  }, agencyId);
  await runGeneration(site.id);
  console.log(`seeded WEBSITE_APP project ${site.id}`);

  const auto = await createProject({
    name: "Acme Plumbing — Enquiry Automation",
    businessId: acme.id,
    clientName: "Acme Plumbing",
    type: "AUTOMATION_WORKFLOW",
    businessType: "Plumber",
    goal: "Stop losing emergency calls and quote requests",
    targetAudience: "Homeowners and landlords in the metro area",
    keyItems: ["Emergency enquiry workflow", "Quote follow-up", "Review requests"],
    brandRefs: [],
    currentTools: ["WhatsApp Business", "Google Calendar"],
    notes: "Owner answers everything personally today.",
    currentProcess: "Calls and WhatsApp messages answered by the owner between jobs",
    mainPainPoint: "Enquiries missed while on site; quotes never followed up",
    triggerSource: "Website form / WhatsApp",
    aiShouldDo: "Read enquiries, classify urgency, draft replies, schedule follow-ups",
    needsHumanApproval: "All outgoing replies and quotes",
  }, agencyId);
  await runGeneration(auto.id);
  console.log(`seeded AUTOMATION_WORKFLOW project ${auto.id}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
