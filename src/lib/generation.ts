// Mock multi-agent generation pipeline. Creates an AgentRun with one AgentStep
// per agent, runs the corresponding file generator, and persists each artifact
// as a GeneratedFile (with a FileVersion). Deterministic for now — real AI
// agents replace the generators later without changing this orchestration.

import { prisma } from "@/lib/db/client";
import { generators } from "@/lib/generators";
import { toGenerationInput } from "@/lib/projects";
import type { AgentName, OutputFileName } from "@/types";

// Which agent produces which file.
const AGENT_OUTPUTS: { agent: AgentName; file: OutputFileName }[] = [
  { agent: "Brand Strategist", file: "BRAND.md" },
  { agent: "Design Systems", file: "DESIGN.md" },
  { agent: "Creative Director", file: "CREATIVE.md" },
  { agent: "Prompt Engineer", file: "PROMPT_CLAUDE_CODE.md" },
];

export async function runGeneration(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { input: true },
  });
  if (!project) throw new Error("Project not found");

  const input = toGenerationInput(project);

  const run = await prisma.agentRun.create({
    data: { projectId, status: "RUNNING", startedAt: new Date() },
  });

  try {
    for (const { agent, file } of AGENT_OUTPUTS) {
      const step = await prisma.agentStep.create({
        data: {
          agentRunId: run.id,
          agentName: agent,
          status: "RUNNING",
          startedAt: new Date(),
          input: { file },
        },
      });

      const artifact = generators[file](input);

      // Upsert the file; bump version + snapshot history when regenerating.
      const existing = await prisma.generatedFile.findUnique({
        where: { projectId_fileName: { projectId, fileName: file } },
      });
      const version = (existing?.version ?? 0) + 1;

      const saved = await prisma.generatedFile.upsert({
        where: { projectId_fileName: { projectId, fileName: file } },
        create: {
          projectId,
          fileName: artifact.fileName,
          fileType: artifact.fileType,
          content: artifact.content,
          status: "READY",
          version,
        },
        update: {
          content: artifact.content,
          fileType: artifact.fileType,
          status: "READY",
          version,
        },
      });

      await prisma.fileVersion.create({
        data: {
          generatedFileId: saved.id,
          version,
          content: artifact.content,
          changeNote: version === 1 ? "Initial generation" : "Regenerated",
        },
      });

      await prisma.agentStep.update({
        where: { id: step.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          output: { fileName: file, version },
        },
      });
    }

    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "READY" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "FAILED", completedAt: new Date(), error: message },
    });
    await prisma.project.update({ where: { id: projectId }, data: { status: "FAILED" } });
    throw err;
  }

  return run.id;
}
