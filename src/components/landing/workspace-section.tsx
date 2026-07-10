import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const ELEMENTS = [
  "Project brief",
  "Generated files",
  "Notes and decisions",
  "Prompt library",
  "Agent runs",
  "File versions",
  "Handoff checklist",
];

const WEBSITE_FILES = ["PROJECT_BRIEF.md", "SCOPE.md", "DESIGN.md", "CONTENT.md", "BUILD_PROMPT.md", "HANDOFF.md"];
const AUTOMATION_FILES = ["WORKFLOW_AUDIT.md", "AUTOMATION_BLUEPRINT.md", "TOOLS_STACK.md", "CLIENT_PROPOSAL.md", "BUILD_PLAN.md", "HANDOFF.md"];

export function WorkspaceSection() {
  return (
    <section id="agency" className="border-y border-line bg-surface scroll-mt-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Agency Project OS"
              title="Keep every client project organized from brief to delivery."
              intro="This is the part workflow tools skip: the project itself — files, decisions, versions, and the handoff your client actually receives."
            />
            <ul className="mt-8 flex flex-wrap gap-2">
              {ELEMENTS.map((e) => (
                <li key={e} className="rounded-full border border-line bg-panel px-3 py-1 text-[13px] text-body">
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2">
            <StaggerItem>
              <FileCard title="Website / App project" files={WEBSITE_FILES} />
            </StaggerItem>
            <StaggerItem>
              <FileCard title="Automation project" files={AUTOMATION_FILES} />
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function FileCard({ title, files }: { title: string; files: string[] }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-3 grid gap-1.5">
        {files.map((f) => (
          <li
            key={f}
            className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-1.5"
          >
            <span className="font-mono text-[11.5px] text-body">{f}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-success">ready</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
