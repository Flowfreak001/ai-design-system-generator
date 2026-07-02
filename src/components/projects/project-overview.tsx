import type { AutomationBrief, ProjectBrief } from "@/types";

export function ProjectOverview({
  brief,
  automation,
  description,
}: {
  brief: ProjectBrief | null;
  automation?: AutomationBrief | null;
  description?: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <p className="eyebrow">Brief</p>
        <dl className="mt-5 grid gap-4">
          <Row label="Business type" value={brief?.businessType} />
          <Row label="Goal / problem" value={brief?.goal ?? description} />
          <Row label="Target audience" value={brief?.targetAudience} />
          <RowList label="Key items" values={brief?.keyItems} />
          <RowList label="Brand / references" values={brief?.brandRefs} mono />
          <RowList label="Current tools" values={brief?.currentTools} />
          <Row label="Notes" value={brief?.notes} />
        </dl>
      </div>

      <div className="card p-6">
        <p className="eyebrow">{automation ? "Automation details" : "Delivery"}</p>
        {automation ? (
          <dl className="mt-5 grid gap-4">
            <Row label="Current process" value={automation.currentProcess} />
            <Row label="Main pain point" value={automation.mainPainPoint} />
            <Row label="Trigger source" value={automation.triggerSource} />
            <Row label="AI handles" value={automation.aiShouldDo} />
            <Row label="Human approval" value={automation.needsHumanApproval} />
          </dl>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Website/app delivery: generate the file set below, iterate with the
            client, and finish with the HANDOFF.md package. Versions and agent
            activity are tracked automatically.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function RowList({ label, values, mono }: { label: string; values?: string[]; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className={`max-w-[62%] text-right text-sm text-ink ${mono ? "font-mono text-xs break-all" : ""}`}>
        {values && values.length ? values.join(", ") : "—"}
      </dd>
    </div>
  );
}
