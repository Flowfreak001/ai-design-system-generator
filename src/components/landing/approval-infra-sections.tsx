import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "./section";

const AI_CAPABILITIES = [
  "Classify enquiries",
  "Extract customer details",
  "Draft replies",
  "Summarize requests",
  "Recommend next action",
  "Wait for approval before sending",
];

export function ApprovalSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 sm:px-12 py-24 md:py-28">
      <SectionHeading
        eyebrow="AI agents with approval"
        title="Let AI prepare the work. Keep people in control."
        intro="AI drafts, classifies, summarizes, and prepares. Humans approve anything risky or customer-facing — by design, not as an afterthought."
        center
      />
      <Stagger className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AI_CAPABILITIES.map((c, i) => {
          const isApproval = i === AI_CAPABILITIES.length - 1;
          return (
            <StaggerItem key={c}>
              <div
                className={`card flex h-full items-center gap-3 px-4 py-3.5 ${
                  isApproval ? "border-warning/40 bg-warning-soft" : ""
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[11px] ${
                    isApproval ? "bg-warning/15 text-warning" : "bg-accent-soft text-accent"
                  }`}
                >
                  {isApproval ? "✓" : "✦"}
                </span>
                <span className={`text-sm ${isApproval ? "font-medium text-ink" : "text-body"}`}>{c}</span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

const INFRA = [
  { t: "Railway-ready MVP", d: "One service + Postgres to start." },
  { t: "Separate worker service", d: "Background jobs move off the request path." },
  { t: "PostgreSQL + Prisma", d: "A real, versioned data model." },
  { t: "Queue-ready architecture", d: "BullMQ switches on with one env var." },
  { t: "Scale agents later", d: "Move heavy AI workers to a VPS when volume grows." },
];

export function InfraSection() {
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-12 py-20 md:py-24">
        <SectionHeading
          eyebrow="Deployment & control"
          title="Start simple. Scale workers later when workflows grow."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {INFRA.map((c) => (
            <div key={c.t} className="rounded-xl border border-line bg-canvas px-4 py-4">
              <p className="text-sm font-semibold text-ink">{c.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
