import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, Placeholder, Field, inputCls } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { SEO_TASKS, SEO_CHECKLIST } from "@/data/flowfreak";

export const metadata: Metadata = { title: "Flowfreak SEO" };

const STATUS: Record<string, string> = {
  ready: "border-success/25 bg-success-soft text-success",
  published: "border-info/25 bg-info-soft text-info",
  generating: "border-warning/25 bg-warning-soft text-warning",
  queued: "border-line bg-panel text-muted",
};

// Phase 5 will connect these generators to real SEO/content agents.
export default async function SEOPage() {
  await requireUser();
  return (
    <PageContainer>
      <PageHeader
        title="Flowfreak SEO"
        description="Generate SEO pages, blogs, keyword clusters, and content plans — then track them to publish."
        action={<Button disabled>Generate SEO page</Button>}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Generators */}
        <div className="grid gap-5">
          <Panel title="SEO page generator">
            <div className="grid gap-4">
              <Field label="Target keyword"><input placeholder="car hire nairobi" className={inputCls} /></Field>
              <Field label="Business / location"><input placeholder="Simba Car Hire · Nairobi" className={inputCls} /></Field>
              <Button disabled className="w-full">Generate page</Button>
            </div>
          </Panel>
          <Panel title="Also generate">
            <div className="grid gap-2">
              <Button variant="secondary" disabled className="justify-start">Blog topic ideas</Button>
              <Button variant="secondary" disabled className="justify-start">Meta title &amp; description</Button>
              <Button variant="secondary" disabled className="justify-start">Content plan (30 days)</Button>
            </div>
          </Panel>
          <Panel title="On-page SEO checklist" subtitle="Auto-checked when a page is generated.">
            <ul className="grid gap-2">
              {SEO_CHECKLIST.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-[13px]">
                  <span className={`grid h-5 w-5 place-items-center rounded-full ${c.done ? "bg-success text-white" : "border border-line text-faint"}`}>
                    {c.done ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : null}
                  </span>
                  <span className={c.done ? "text-body" : "text-muted"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Task list */}
        <Panel title="SEO tasks" subtitle="Pages, blogs, and clusters in progress." action={<span className="text-[12px] text-faint">{SEO_TASKS.length} items</span>}>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-panel/60 text-[11.5px] uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Task</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Volume</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SEO_TASKS.map((t) => (
                  <tr key={t.id} className="hover:bg-panel/40">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{t.title}</span>
                      <span className="block text-[12px] text-muted">{t.keyword}{t.location ? ` · ${t.location}` : ""}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.type}</td>
                    <td className="px-4 py-3 font-mono text-[12.5px] text-muted">{t.volume ? t.volume.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS[t.status] ?? STATUS.queued}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Placeholder label="Content preview" hint="Generated page/blog content will render here (Phase 5)." className="mt-4" />
        </Panel>
      </div>
    </PageContainer>
  );
}
