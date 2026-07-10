"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AUTH_INPUT } from "@/components/auth/auth-shell";
import { AuthError, PasswordToggle } from "@/components/auth/auth-form";
import { resetPasswordAction, type ResetState } from "@/app/(app)/auth-actions";

export function ResetPasswordForm({ token, valid }: { token: string; valid: boolean }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(resetPasswordAction, undefined);
  const [show, setShow] = useState(false);

  if (!valid) {
    return (
      <AuthShell nav={{ href: "/signin", label: "Sign in" }}>
        <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">Link expired</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          This password reset link is invalid or has expired. Request a fresh one to continue.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-flex w-full items-center justify-center rounded-[6px] bg-accent px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell nav={{ href: "/signin", label: "Sign in" }}>
      <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">Set a new password</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Choose a strong password — at least 8 characters.</p>

      <form action={formAction} className="mt-6 grid gap-4">
        {state?.error && <AuthError>{state.error}</AuthError>}
        <input type="hidden" name="token" value={token} />

        <div>
          <Label htmlFor="password" className="mb-1.5">New password</Label>
          <div className="relative">
            <Input id="password" name="password" type={show ? "text" : "password"} required autoComplete="new-password" placeholder="At least 8 characters" className={`${AUTH_INPUT} pr-11`} />
            <PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />
          </div>
        </div>
        <div>
          <Label htmlFor="confirm" className="mb-1.5">Confirm password</Label>
          <Input id="confirm" name="confirm" type={show ? "text" : "password"} required autoComplete="new-password" placeholder="Re-enter your password" className={AUTH_INPUT} />
        </div>

        <Button type="submit" disabled={pending} size="lg" className="mt-1 w-full disabled:opacity-60">
          {pending ? "Saving…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
