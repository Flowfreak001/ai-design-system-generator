"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AUTH_INPUT } from "@/components/auth/auth-shell";
import type { AuthFormState } from "@/app/(app)/auth-actions";

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5">{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className={AUTH_INPUT} />
    </div>
  );
}

function PasswordField({ isSignup }: { isSignup: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor="password" className="mb-1.5">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={`${AUTH_INPUT} pr-11`}
        />
        <PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />
      </div>
    </div>
  );
}

export function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      aria-pressed={show}
      title={show ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[6px] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
    >
      {show ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.9 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7-.5 1.1-1.4 2.3-2.6 3.3M6.1 6.6C4.2 7.9 2.9 9.7 2.5 11c.6 1.3 3.3 6 9.5 6 1 0 1.9-.1 2.7-.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )}
    </button>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      {children}
    </p>
  );
}

export function AuthForm({
  mode,
  action,
  notice,
}: {
  mode: "signin" | "signup";
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, undefined);
  const isSignup = mode === "signup";

  return (
    <AuthShell nav={{ href: isSignup ? "/signin" : "/signup", label: isSignup ? "Sign in" : "Sign up" }}>
      <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">
        {isSignup ? "Sign up for free" : "Sign in to Flowfreak"}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {isSignup ? (
          <>We recommend using your <span className="font-semibold text-body">work email</span> — it keeps work and life separate.</>
        ) : (
          <>Welcome back — sign in to your Flowfreak workspace.</>
        )}
      </p>

      {notice && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-success/30 bg-success-soft/60 px-3.5 py-2.5 text-[13px] text-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {notice}
        </p>
      )}

      <form action={formAction} className="mt-7 grid gap-4">
        {state?.error && <AuthError>{state.error}</AuthError>}

        {isSignup && (
          <>
            <Field label="Your name" name="name" placeholder="Alex Rivera" autoComplete="name" />
            <Field label="Agency / workspace name" name="agencyName" placeholder="Rivera Studio (optional)" required={false} />
          </>
        )}
        <Field label={isSignup ? "Work email" : "Email"} name="email" type="email" placeholder="you@studio.com" autoComplete="email" />
        <PasswordField isSignup={isSignup} />

        {!isSignup && (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-body">
              <input type="checkbox" name="remember" defaultChecked className="size-4 rounded border-line text-accent focus-visible:outline-accent" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-[13.5px] font-medium text-accent hover:underline">Forgot password?</Link>
          </div>
        )}

        <Button type="submit" disabled={pending} size="lg" className="mt-1 w-full disabled:opacity-60">
          {pending ? "One moment…" : "Continue with email"}
        </Button>
      </form>

      <p className="mt-6 text-[12px] leading-relaxed text-faint">
        By {isSignup ? "signing up" : "continuing"} you agree to Flowfreak&apos;s{" "}
        <span className="font-medium text-muted">Terms &amp; Conditions</span> and{" "}
        <span className="font-medium text-muted">Privacy Policy</span>.
      </p>
    </AuthShell>
  );
}
