import { StatusBadge } from "./status-badge";

type Step = { id: string; agentName: string; status: string };
type Run = { id: string; status: string; steps: Step[] };
type Input = {
  websiteGoal: string | null;
  targetAudience: string | null;
  existingWebsiteUrl: string | null;
  referenceUrls: string[];
  competitorUrls: string[];
  brandColors: string[];
  requiredPages: string[];
  servicesProducts: string | null;
  seoKeywords: string[];
  platformTarget: string | null;
  animationPreference: string | null;
  notes: string | null;
} | null;

export function ProjectOverview({ input, run }: { input: Input; run?: Run }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input summary */}
      <div className="card p-6">
        <p className="eyebrow">Input summary</p>
        <dl className="mt-5 grid gap-4">
          <Row label="Website goal" value={input?.websiteGoal} />
          <Row label="Target audience" value={input?.targetAudience} />
          <Row label="Services / products" value={input?.servicesProducts} />
          <Row label="Platform target" value={input?.platformTarget} />
          <Row label="Animation" value={input?.animationPreference} />
          <RowList label="Required pages" values={input?.requiredPages} />
          <RowList label="SEO keywords" values={input?.seoKeywords} />
          <RowColors label="Brand colors" values={input?.brandColors} />
          <RowList label="Reference URLs" values={input?.referenceUrls} mono />
        </dl>
      </div>

      {/* Agent workflow */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Agent workflow</p>
          {run && <StatusBadge status={run.status} />}
        </div>
        {run ? (
          <ol className="mt-5 grid gap-3">
            {run.steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-line-strong font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm">{s.agentName}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 text-sm text-muted">
            No runs yet. Generate files to start the multi-agent pipeline.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function RowList({ label, values, mono }: { label: string; values?: string[]; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className={`max-w-[60%] text-right text-sm text-ink ${mono ? "font-mono text-xs break-all" : ""}`}>
        {values && values.length ? values.join(mono ? "\n" : ", ") : "—"}
      </dd>
    </div>
  );
}

function RowColors({ label, values }: { label: string; values?: string[] }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="flex items-center gap-1.5">
        {values && values.length ? (
          values.map((c) => (
            <span key={c} className="h-5 w-5 rounded border border-line-strong" style={{ background: c }} title={c} />
          ))
        ) : (
          <span className="text-sm text-ink">—</span>
        )}
      </dd>
    </div>
  );
}
