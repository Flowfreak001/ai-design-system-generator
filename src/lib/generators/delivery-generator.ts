// File generators. Two sets keyed by project type, each producing structured,
// professional markdown from the actual project input — no vague filler.
// Deterministic templates for the MVP; real AI agents can replace individual
// generators later without changing the orchestration.

import type { GenerationInput, GeneratedArtifact } from "@/types";
import { suggestWorkflows } from "@/lib/workflow-suggestions";

type Generator = (input: GenerationInput) => GeneratedArtifact;

// ---- helpers ------------------------------------------------------------

const orNa = (v?: string | null) => (v && v.trim() ? v.trim() : "_Not specified_");
const list = (items: string[], fallback = "- _Not specified_") =>
  items.length ? items.map((i) => `- ${i}`).join("\n") : fallback;
const inline = (items: string[], fallback = "not specified") =>
  items.length ? items.join(", ") : fallback;

const who = (i: GenerationInput) => i.clientName || i.projectName;

// =====================================================================
// WEBSITE_APP generators
// =====================================================================

const projectBrief: Generator = (i) => ({
  name: "PROJECT_BRIEF.md",
  type: "markdown",
  content: `# Project Brief — ${i.projectName}

## Client
${orNa(i.clientName)} ${i.brief.businessType ? `(${i.brief.businessType})` : ""}

## Goal
${orNa(i.brief.goal)}

## Target audience
${orNa(i.brief.targetAudience)}

## Key pages / features
${list(i.brief.keyItems)}

## Brand / references
${list(i.brief.brandRefs)}

## Current tools
${list(i.brief.currentTools, "- None recorded")}

## Notes
${orNa(i.brief.notes)}
`,
});

const scope: Generator = (i) => ({
  name: "SCOPE.md",
  type: "markdown",
  content: `# Scope of Work — ${i.projectName}

## In scope
${list(i.brief.keyItems, "- Core pages/features to be confirmed with client")}

## Out of scope (until agreed separately)
- Ongoing content production
- Paid advertising / campaign management
- Third-party integrations beyond those listed in the brief
- Post-launch feature requests not in this document

## Deliverables
- Production-ready build of the items above
- Design system + content aligned to DESIGN.md and CONTENT.md
- Handoff documentation (HANDOFF.md)

## Assumptions
- Client provides brand assets and timely feedback
- One consolidated revision round per milestone
- Goal to optimize for: ${orNa(i.brief.goal)}
`,
});

const design: Generator = (i) => ({
  name: "DESIGN.md",
  type: "markdown",
  content: `# Design Direction — ${i.projectName}

## Audience
Design for ${i.brief.targetAudience?.trim() || "the client's core audience"} — every layout and copy decision is validated against them first.

## Visual references
${list(i.brief.brandRefs, "- No references supplied — propose 2–3 directions before build")}

## Rules
- Clear hierarchy, generous whitespace, consistent spacing rhythm
- Accessible contrast (WCAG AA), visible focus states, ≥44px touch targets
- Mobile-first, responsive at 640 / 768 / 1024 / 1280

## Components
Buttons (primary/secondary), cards, forms with visible labels + inline
validation, sticky navigation, structured footer.

## Do / Don't
**Do:** one idea per section, restrained palette, purposeful motion.
**Don't:** clutter, random colors, flashy animation, template look.
`,
});

const content: Generator = (i) => ({
  name: "CONTENT.md",
  type: "markdown",
  content: `# Content Plan — ${i.projectName}

## Voice
Confident, clear, specific. Write for ${i.brief.targetAudience?.trim() || "the target audience"}; lead with outcomes, not adjectives.

## Page/feature content requirements
${list(
    i.brief.keyItems.map((k) => `${k} — headline, supporting copy, one clear CTA`),
    "- Confirm page list with client",
  )}

## Conversion message
Primary goal: ${orNa(i.brief.goal)}. Every page ends with a single, unambiguous next step.

## Content to request from client
- Logo + brand assets
- Testimonials / proof points
- Team / about material
- Any legal or compliance copy
`,
});

const buildPrompt: Generator = (i) => ({
  name: "BUILD_PROMPT.md",
  type: "prompt",
  content: `# Build Prompt — ${i.projectName}

Use this prompt with your AI build tool (Claude Code, Cursor, v0, …):

\`\`\`
Build a production-ready website/app for ${who(i)}${i.brief.businessType ? `, a ${i.brief.businessType}` : ""}.
Goal: ${i.brief.goal?.trim() || "convert visitors"}. Audience: ${i.brief.targetAudience?.trim() || "core customers"}.

Pages/features: ${inline(i.brief.keyItems, "confirm with the brief")}.
Follow DESIGN.md and CONTENT.md exactly. References: ${inline(i.brief.brandRefs, "none — keep neutral premium")}.

Rules: mobile-first responsive, WCAG AA, semantic HTML, one h1 per page,
fast (optimized images, no layout shift), no template look, no flashy animation.
\`\`\`

## What not to do
- Don't invent brand colors not in the references
- Don't add pages/features outside SCOPE.md
- Don't ship placeholder copy

## Output expectations
Componentized, typed, production-ready code matching the design system.
`,
});

const websiteHandoff: Generator = (i) => ({
  name: "HANDOFF.md",
  type: "markdown",
  content: `# Handoff — ${i.projectName}

## What's being delivered
${list(i.brief.keyItems, "- See SCOPE.md")}

## Access & credentials to hand over
- Hosting / deployment access
- Domain / DNS
- Analytics
- CMS or admin accounts (if applicable)

## Documentation included
PROJECT_BRIEF.md · SCOPE.md · DESIGN.md · CONTENT.md · BUILD_PROMPT.md

## Aftercare
- 14-day post-launch fix window (bugs only, per SCOPE.md)
- Change requests are quoted separately

## Sign-off
Client: ${orNa(i.clientName)}  ·  Date: ____________
`,
});

// =====================================================================
// AUTOMATION_WORKFLOW generators
// =====================================================================

const workflowAudit: Generator = (i) => ({
  name: "WORKFLOW_AUDIT.md",
  type: "markdown",
  content: `# Workflow Audit — ${who(i)}

## Business
${orNa(i.clientName)} ${i.brief.businessType ? `(${i.brief.businessType})` : ""}

## Current process
${orNa(i.automation?.currentProcess)}

## Main pain point
${orNa(i.automation?.mainPainPoint)}

## Where enquiries come from (trigger source)
${orNa(i.automation?.triggerSource)}

## Current tools
${list(i.brief.currentTools, "- None recorded")}

## Time/lead leaks identified
- Enquiries answered late or missed entirely
- Manual re-typing of customer details
- No systematic follow-up on unanswered quotes
- Owner attention pulled into routine replies

## Automation opportunity
${orNa(i.automation?.aiShouldDo)}
`,
});

const automationBlueprint: Generator = (i) => {
  const suggestions = suggestWorkflows(i.brief.businessType);
  return {
    name: "AUTOMATION_BLUEPRINT.md",
    type: "markdown",
    content: `# Automation Blueprint — ${who(i)}

## Core flow
\`\`\`
Trigger (${i.automation?.triggerSource?.trim() || "new enquiry"})
↓
AI reads and classifies the enquiry
↓
Condition: urgent / routine
↓
Create lead record
↓
Draft customer reply
↓
Human approval (${i.automation?.needsHumanApproval?.trim() || "owner reviews drafts"})
↓
Send reply / schedule
↓
Follow-up if no response
\`\`\`

## What AI handles
${orNa(i.automation?.aiShouldDo)}

## What stays human
${orNa(i.automation?.needsHumanApproval)}

## Suggested workflows for a ${i.brief.businessType?.trim() || "service business"}
${suggestions.map((s) => `- **${s.name}** — ${s.description}`).join("\n")}
`,
  };
};

const toolsStack: Generator = (i) => ({
  name: "TOOLS_STACK.md",
  type: "markdown",
  content: `# Tools & Stack — ${who(i)}

## Already in use
${list(i.brief.currentTools, "- None recorded — greenfield setup")}

## Recommended stack
- **This platform** — workflow runs, approvals, lead records, follow-ups
- **Email** — existing business inbox (connected later)
- **Calendar** — existing booking calendar (connected later)

## Explicitly not required
- n8n / Make / Zapier — the workflow engine here replaces them for this scope
- New CRM — leads live in this workspace until volume justifies more

## Integration order
1. Enquiry capture (form/webhook)
2. Approval notifications
3. Email sending
4. Calendar/booking (phase 2)
`,
});

const clientProposal: Generator = (i) => ({
  name: "CLIENT_PROPOSAL.md",
  type: "markdown",
  content: `# Proposal — Automation for ${who(i)}

## The problem
${i.automation?.mainPainPoint?.trim() || "Manual admin is eating hours and leads are slipping through."}

## What we'll build
An automated enquiry-to-reply pipeline: every enquiry from ${i.automation?.triggerSource?.trim() || "your channels"} is read, classified, and answered with a drafted reply you approve — plus automatic follow-ups so no lead goes cold.

## What changes for you
- Enquiries answered in minutes, not hours
- Every lead captured in one place
- You approve replies; the system does the typing
- Follow-ups happen without anyone remembering

## Scope
${list(i.brief.keyItems, "- Core enquiry workflow (see AUTOMATION_BLUEPRINT.md)")}

## Next step
Approve this proposal and we begin with the highest-impact workflow first.

— Prepared for ${orNa(i.clientName)}
`,
});

const buildPlan: Generator = (i) => ({
  name: "BUILD_PLAN.md",
  type: "markdown",
  content: `# Build Plan — ${who(i)}

## Phase 1 — Capture (week 1)
- Connect trigger source: ${orNa(i.automation?.triggerSource)}
- Lead record creation + classification rules

## Phase 2 — Respond (week 2)
- AI reply drafting for common enquiry types
- Human approval queue: ${i.automation?.needsHumanApproval?.trim() || "owner approves all outgoing replies"}

## Phase 3 — Follow up (week 3)
- No-response follow-up sequence
- Review/feedback request after completion

## Phase 4 — Handoff
- Owner training, HANDOFF.md walkthrough, tune classification rules

## Success criteria
Directly addresses: ${orNa(i.automation?.mainPainPoint)}
`,
});

const automationHandoff: Generator = (i) => ({
  name: "HANDOFF.md",
  type: "markdown",
  content: `# Handoff — ${who(i)} automation

## What's live
- Enquiry capture from: ${orNa(i.automation?.triggerSource)}
- AI classification + drafted replies
- Approval queue (${i.automation?.needsHumanApproval?.trim() || "owner approval on outgoing replies"})
- Follow-up sequence

## How to operate it
1. New enquiries appear as leads automatically
2. Review drafted replies in the approval queue
3. Approve or edit — the system sends and schedules follow-ups

## Documentation included
WORKFLOW_AUDIT.md · AUTOMATION_BLUEPRINT.md · TOOLS_STACK.md · CLIENT_PROPOSAL.md · BUILD_PLAN.md

## Aftercare
- 30 days of tuning included (classification + reply quality)
- New workflows quoted separately

## Sign-off
Client: ${orNa(i.clientName)}  ·  Date: ____________
`,
});

// ---- registry -----------------------------------------------------------

const WEBSITE_GENERATORS: Generator[] = [
  projectBrief,
  scope,
  design,
  content,
  buildPrompt,
  websiteHandoff,
];

const AUTOMATION_GENERATORS: Generator[] = [
  workflowAudit,
  automationBlueprint,
  toolsStack,
  clientProposal,
  buildPlan,
  automationHandoff,
];

export function generateForProject(input: GenerationInput): GeneratedArtifact[] {
  const set = input.type === "AUTOMATION_WORKFLOW" ? AUTOMATION_GENERATORS : WEBSITE_GENERATORS;
  return set.map((g) => g(input));
}
