import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, Placeholder, Field, inputCls } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { BUSINESS_CATEGORIES, WEBSITE_GOALS, STUDIO_STYLES, COMMON_PAGES } from "@/data/flowfreak";

export const metadata: Metadata = { title: "Flowfreak Studio" };

// Phase 3 will replace the placeholder generator with real wireframe logic.
export default async function StudioPage() {
  await requireUser();
  return (
    <PageContainer>
      <PageHeader
        title="Flowfreak Studio"
        description="Describe the business and goal — Studio plans the pages and sections, then builds the wireframe."
        action={<Button disabled>Generate wireframe</Button>}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Brief input */}
        <Panel title="Website brief" subtitle="A few inputs are enough to start.">
          <div className="grid gap-4">
            <Field label="What are you building?">
              <textarea rows={3} placeholder="e.g. A booking website for a car rental company in Nairobi." className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business category">
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select…</option>
                  {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Primary goal">
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select…</option>
                  {WEBSITE_GOALS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Style">
              <div className="flex flex-wrap gap-2">
                {STUDIO_STYLES.map((s) => (
                  <span key={s} className="cursor-default rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] text-body">{s}</span>
                ))}
              </div>
            </Field>
            <Field label="Pages">
              <div className="flex flex-wrap gap-2">
                {COMMON_PAGES.map((p) => (
                  <span key={p} className="cursor-default rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] text-body">{p}</span>
                ))}
              </div>
            </Field>
            <Button disabled className="w-full">Generate wireframe →</Button>
          </div>
        </Panel>

        {/* Generated structure preview */}
        <Panel title="Generated structure" subtitle="A preview of pages and sections will appear here.">
          <Placeholder
            label="No wireframe yet"
            hint="Fill in the brief and run Generate. The page/section blueprint renders here (Phase 3)."
            className="min-h-[360px]"
          />
        </Panel>
      </div>
    </PageContainer>
  );
}
