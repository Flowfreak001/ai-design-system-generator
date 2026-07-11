"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectWixByInstanceAction, type WixConnectState } from "./wix-actions";

/** Connect Wix by pasting the App Instance ID (Client Credentials, no redirect). */
export function WixConnectForm() {
  const [state, action, pending] = useActionState<WixConnectState, FormData>(connectWixByInstanceAction, undefined);
  return (
    <form action={action} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input name="instanceId" placeholder="App Instance ID (from your Wix app)" required className="h-9 sm:max-w-xs" />
      <Button type="submit" size="sm" disabled={pending}>{pending ? "Verifying…" : "Connect"}</Button>
      {state?.error && <span className="text-[12px] text-danger">{state.error}</span>}
    </form>
  );
}
