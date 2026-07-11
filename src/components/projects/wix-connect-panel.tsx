"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  discoverWixInstallsAction,
  connectWixToProjectAction,
  disconnectWixFromProjectAction,
  setWixClientIdAction,
} from "@/app/(app)/projects/[id]/wix-actions";
import type { WixInstall } from "@/lib/integrations/wix/installations";

/** Per-project Wix connection: pick which Wix site THIS project publishes to. */
export function WixConnectPanel({
  projectId,
  connected,
}: {
  projectId: string;
  connected: { instanceId: string; siteId: string | null; clientId: string | null } | null;
}) {
  const [pending, start] = useTransition();
  const [installs, setInstalls] = useState<WixInstall[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [isConnected, setIsConnected] = useState(Boolean(connected));
  const [clientId, setClientId] = useState(connected?.clientId ?? "");
  const [clientSaved, setClientSaved] = useState<boolean | null>(null);

  const saveClientId = (formData: FormData) =>
    start(async () => {
      setError(null); setClientSaved(null);
      const res = await setWixClientIdAction(projectId, String(formData.get("clientId") ?? ""));
      if (res?.error) setError(res.error);
      else setClientSaved(true);
    });

  const find = () =>
    start(async () => {
      setError(null);
      const res = await discoverWixInstallsAction();
      if (res?.error) setError(res.error);
      else setInstalls(res?.installs ?? []);
    });

  const pick = (i: WixInstall) =>
    start(async () => {
      setError(null);
      const res = await connectWixToProjectAction(projectId, i.instanceId, i.siteId);
      if (res?.error) setError(res.error);
      else { setIsConnected(true); setInstalls(null); }
    });

  const connectManual = (formData: FormData) =>
    start(async () => {
      setError(null);
      const res = await connectWixToProjectAction(projectId, String(formData.get("instanceId") ?? "").trim());
      if (res?.error) setError(res.error);
      else { setIsConnected(true); setManual(false); }
    });

  const disconnect = () => start(async () => { await disconnectWixFromProjectAction(projectId); setIsConnected(false); });

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold text-ink">Wix site for this project</p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {isConnected ? "Publishing goes to your connected Wix site." : "Connect a Wix site so Publish goes to your own account."}
          </p>
        </div>
        {isConnected && (
          <Button variant="secondary" size="sm" disabled={pending} onClick={disconnect}>Disconnect</Button>
        )}
      </div>

      {isConnected ? (
        <>
          <p className="mt-3 text-[12.5px] text-success">✓ Connected{connected?.siteId ? ` · site ${connected.siteId.slice(0, 8)}…` : ""}</p>
          <div className="mt-3 border-t border-line pt-3">
            <label className="text-[12.5px] font-medium text-ink">Headless client ID <span className="font-normal text-muted">(for checkout)</span></label>
            <p className="mt-0.5 text-[11.5px] text-muted">From your Wix site → Settings → Headless Settings → OAuth apps.</p>
            <form action={saveClientId} className="mt-2 flex flex-wrap items-center gap-2">
              <Input name="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" className="h-9 sm:max-w-xs" />
              <Button type="submit" size="sm" variant="secondary" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
              {clientSaved && <span className="text-[12px] text-success">Saved ✓</span>}
            </form>
          </div>
        </>
      ) : !manual ? (
        <div className="mt-3">
          <Button variant="secondary" size="sm" disabled={pending} onClick={find}>
            {pending ? "Looking…" : installs ? "Refresh sites" : "Find my Wix sites"}
          </Button>
          {installs && installs.length > 0 && (
            <div className="mt-3 grid gap-2">
              {installs.map((i) => (
                <button key={i.instanceId} type="button" disabled={pending} onClick={() => pick(i)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-ink/25 hover:bg-panel disabled:opacity-60">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink">{i.businessName || "Wix site"}</span>
                    {i.siteUrl && <span className="block truncate text-[11.5px] text-muted">{i.siteUrl}</span>}
                  </span>
                  <span className="shrink-0 text-[12px] font-medium text-accent">Use →</span>
                </button>
              ))}
            </div>
          )}
          {installs && installs.length === 0 && (
            <p className="mt-2 text-[12.5px] text-muted">No installs found. Install the app on your Wix site, then click again.</p>
          )}
          <button type="button" onClick={() => setManual(true)} className="mt-2 block text-[12px] text-muted underline hover:text-ink">Enter an App Instance ID manually</button>
        </div>
      ) : (
        <form action={connectManual} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input name="instanceId" placeholder="App Instance ID" required className="h-9 sm:max-w-xs" />
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Verifying…" : "Connect"}</Button>
          <button type="button" onClick={() => setManual(false)} className="text-[12px] text-muted underline hover:text-ink">back</button>
        </form>
      )}

      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  );
}
