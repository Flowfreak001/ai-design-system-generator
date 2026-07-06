import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Panel, Field, inputCls } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/data/flowfreak";

export const metadata: Metadata = { title: "Settings" };

// Phase 8 will wire real profile, workspace, billing, and API-key settings.
export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your profile, workspace, and platform modules." />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="grid gap-4">
            <Field label="Name"><input defaultValue={user.name ?? ""} placeholder="Your name" className={inputCls} /></Field>
            <Field label="Email"><input defaultValue={user.email} disabled className={`${inputCls} opacity-70`} /></Field>
            <Button disabled className="w-fit">Save changes</Button>
          </div>
        </Panel>

        <Panel title="Workspace">
          <div className="grid gap-4">
            <Field label="Workspace name"><input placeholder="Flowfreak Workspace" className={inputCls} /></Field>
            <Field label="Default industry"><input placeholder="Agency" className={inputCls} /></Field>
            <Button disabled className="w-fit">Save workspace</Button>
          </div>
        </Panel>

        <Panel title="Modules" subtitle="Enable or disable Flowfreak modules." className="lg:col-span-2">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {MODULES.map((m) => (
              <li key={m.key} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{m.name}</p>
                  <p className="text-[12px] text-muted">{m.tagline}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${m.status === "live" ? "border-success/25 bg-success-soft text-success" : m.status === "beta" ? "border-brand-purple/25 bg-accent-soft text-brand-purple" : "border-line bg-panel text-muted"}`}>{m.status}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Danger zone" className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-muted">Deleting the workspace removes all projects, files, and automations.</p>
            <Button variant="destructive" disabled>Delete workspace</Button>
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
