"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  connectWixByInstanceAction,
  discoverWixInstallsAction,
  connectDiscoveredWixAction,
} from "./wix-actions";
import type { WixInstall } from "@/lib/integrations/wix/installations";

/**
 * Connect Wix with zero hunting: "Find my Wix sites" lists where the app is
 * installed and the user clicks their site. Manual App-Instance-ID paste stays
 * as a fallback.
 */
export function WixConnectForm() {
  const [pending, start] = useTransition();
  const [installs, setInstalls] = useState<WixInstall[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const find = () =>
    start(async () => {
      setError(null);
      const res = await discoverWixInstallsAction();
      if (res?.error) setError(res.error);
      else setInstalls(res?.installs ?? []);
    });

  const pick = (inst: WixInstall) =>
    start(async () => {
      setError(null);
      const res = await connectDiscoveredWixAction(inst.instanceId, inst.siteId);
      if (res?.error) setError(res.error);
      // on success the page revalidates and shows "Connected"
    });

  const connectManual = (formData: FormData) =>
    start(async () => {
      setError(null);
      const res = await connectWixByInstanceAction(undefined, formData);
      if (res?.error) setError(res.error);
    });

  return (
    <div className="mt-3">
      {!manual ? (
        <>
          <Button variant="secondary" size="sm" disabled={pending} onClick={find}>
            {pending ? "Looking…" : installs ? "Refresh sites" : "Find my Wix sites"}
          </Button>

          {installs && installs.length > 0 && (
            <div className="mt-3 grid gap-2">
              {installs.map((i) => (
                <button
                  key={i.instanceId}
                  type="button"
                  disabled={pending}
                  onClick={() => pick(i)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-ink/25 hover:bg-panel disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink">{i.businessName || "Wix site"}</span>
                    {i.siteUrl && <span className="block truncate text-[11.5px] text-muted">{i.siteUrl}</span>}
                  </span>
                  <span className="shrink-0 text-[12px] font-medium text-accent">Connect →</span>
                </button>
              ))}
            </div>
          )}

          {installs && installs.length === 0 && (
            <p className="mt-2 text-[12.5px] text-muted">
              No installs found. Install the app on your Wix site first, then click “Find my Wix sites” again.
            </p>
          )}

          <button type="button" onClick={() => setManual(true)} className="mt-2 block text-[12px] text-muted underline hover:text-ink">
            Enter an App Instance ID manually
          </button>
        </>
      ) : (
        <form action={connectManual} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input name="instanceId" placeholder="App Instance ID" required className="h-9 sm:max-w-xs" />
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Verifying…" : "Connect"}</Button>
          <button type="button" onClick={() => setManual(false)} className="text-[12px] text-muted underline hover:text-ink">back</button>
        </form>
      )}

      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  );
}
