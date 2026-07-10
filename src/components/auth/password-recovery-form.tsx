"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AUTH_INPUT } from "@/components/auth/auth-shell";
import { AuthError } from "@/components/auth/auth-form";
import { requestPasswordResetAction, type ResetRequestState } from "@/app/(app)/auth-actions";

function BackLink() {
  return (
    <Link href="/signin" className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-accent">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Back to Sign in
    </Link>
  );
}

export function PasswordRecoveryForm() {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(requestPasswordResetAction, undefined);

  if (state?.sent) {
    return (
      <AuthShell nav={{ href: "/signin", label: "Sign in" }}>
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">Check your email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          If an account exists for that address, we&apos;ve sent a link to reset your password. The link expires in 1 hour.
        </p>

        {state.resetPath && (
          <div className="mt-6 rounded-xl border border-line bg-panel/50 p-4">
            <p className="text-[13px] text-muted">Email delivery isn&apos;t set up yet, so continue with this secure link:</p>
            <LinkButton href={state.resetPath} size="lg" className="mt-3 w-full">Reset your password</LinkButton>
          </div>
        )}

        <BackLink />
      </AuthShell>
    );
  }

  return (
    <AuthShell nav={{ href: "/signin", label: "Sign in" }}>
      <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">Password recovery</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Enter the email you use for Flowfreak.</p>

      <form action={formAction} className="mt-6 grid gap-4">
        {state?.error && <AuthError>{state.error}</AuthError>}
        <div>
          <Label htmlFor="email" className="mb-1.5">Your work email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="Enter your email address" className={AUTH_INPUT} />
        </div>
        <Button type="submit" disabled={pending} size="lg" className="mt-1 w-full disabled:opacity-60">
          {pending ? "One moment…" : "Continue"}
        </Button>
      </form>

      <BackLink />
    </AuthShell>
  );
}
