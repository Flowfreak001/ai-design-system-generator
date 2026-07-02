// Mock generation pipeline. Produces the type-specific file set from real
// project input, records an AgentRun with step-by-step activity, versions
// every file, and (for automation projects) creates a mock Workflow with
// nodes + edges. Worker-ready: called via the queue, never assumed inline.

import { prisma } from "@/lib/db/client";
import { generateForProject } from "@/lib/generators";
import { toGenerationInput } from "@/lib/projects";

export async function runGeneration(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true },
  });
  if (!project) throw new Error("Project not found");

  const input = toGenerationInput(project);

  const run = await prisma.agentRun.create({
    data: {
      projectId,
      name: input.type === "AUTOMATION_WORKFLOW" ? "Automation planning run" : "Project scoping run",
      status: "running",
      input: { projectType: input.type },
    },
  });

  const step = (title: string, detail: string) =>
    prisma.agentStep.create({
      data: { runId: run.id, title, status: "completed", detail },
    });

  try {
    await step("Read project input", `Loaded brief for "${project.name}" (${project.inputs.length} input group(s)).`);
    await step("Identified project type", `Project type: ${input.type === "AUTOMATION_WORKFLOW" ? "Automation Workflow" : "Website / App"}.`);

    const artifacts = generateForProject(input);
    await step("Created project brief", `Drafted ${artifacts[0].name} from client goals and audience.`);

    // Persist files + versions (version bump on regenerate).
    for (const a of artifacts) {
      const existing = await prisma.generatedFile.findUnique({
        where: { projectId_name: { projectId, name: a.name } },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });
      const version = (existing?.versions[0]?.version ?? 0) + 1;

      const saved = await prisma.generatedFile.upsert({
        where: { projectId_name: { projectId, name: a.name } },
        create: { projectId, name: a.name, type: a.type, content: a.content },
        update: { content: a.content, type: a.type },
      });
      await prisma.fileVersion.create({
        data: { fileId: saved.id, version, content: a.content },
      });
    }
    await step("Generated files", `Produced ${artifacts.length} files: ${artifacts.map((a) => a.name).join(", ")}.`);
    await step("Saved file versions", "Snapshotted a version for every generated file.");

    // Automation projects also get a mock workflow blueprint.
    if (input.type === "AUTOMATION_WORKFLOW") {
      await createMockWorkflow(projectId, input.brief.businessType, input.automation?.triggerSource);
      await step("Drafted workflow blueprint", "Created the enquiry-to-approval workflow with nodes and edges.");
    }

    await step("Prepared handoff foundation", "HANDOFF.md drafted; ready for delivery checklist.");

    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "completed", output: { files: artifacts.map((a) => a.name) } },
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "IN_PROGRESS" },
    });
  } catch (err) {
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "failed", output: { error: err instanceof Error ? err.message : String(err) } },
    });
    throw err;
  }

  return run.id;
}

/** The MVP mock workflow: Trigger → AI Classify → Condition → Lead → Approval → End. */
async function createMockWorkflow(projectId: string, businessType?: string, triggerSource?: string) {
  // One blueprint per generation; replace previous mock blueprint if rerun.
  await prisma.workflow.deleteMany({ where: { projectId } });

  const workflow = await prisma.workflow.create({
    data: {
      projectId,
      name: "New enquiry workflow",
      description: `Enquiry-to-approval flow for a ${businessType?.trim() || "service business"}.`,
    },
  });

  const defs = [
    { type: "TRIGGER", title: `New enquiry received${triggerSource ? ` (${triggerSource})` : ""}` },
    { type: "AI_CLASSIFY", title: "Extract customer details and urgency" },
    { type: "CONDITION", title: "Is it urgent?" },
    { type: "CREATE_LEAD", title: "Create lead record" },
    { type: "HUMAN_APPROVAL", title: "Owner reviews AI-drafted reply" },
    { type: "SEND_EMAIL", title: "Send approved reply" },
    { type: "END", title: "Workflow completed" },
  ] as const;

  const nodes = [];
  for (let i = 0; i < defs.length; i++) {
    nodes.push(
      await prisma.workflowNode.create({
        data: {
          workflowId: workflow.id,
          type: defs[i].type,
          title: defs[i].title,
          position: { order: i },
        },
      }),
    );
  }

  // Linear chain, plus a labeled "urgent" branch off the condition.
  for (let i = 0; i < nodes.length - 1; i++) {
    await prisma.workflowEdge.create({
      data: {
        workflowId: workflow.id,
        sourceId: nodes[i].id,
        targetId: nodes[i + 1].id,
        label: defs[i].type === "CONDITION" ? "No — routine" : null,
      },
    });
  }
  // Urgent branch: condition → approval directly (owner alerted immediately).
  await prisma.workflowEdge.create({
    data: {
      workflowId: workflow.id,
      sourceId: nodes[2].id,
      targetId: nodes[4].id,
      label: "Yes — alert owner",
    },
  });

  return workflow.id;
}
