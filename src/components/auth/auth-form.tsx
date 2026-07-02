"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { AuthFormState } from "@/app/(app)/auth-actions";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand";

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
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputCls}
      />
    </div>
  );
}

export function AuthForm({
  mode,
  action,
}: {
  mode: "signin" | "signup";
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    undefined,
  );
  const isSignup = mode === "signup";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="text-center">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white">
          ◆
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {isSignup ? "Create your workspace" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup
            ? "Free to start — projects, files, and workflows in one place."
            : "Sign in to your Project OS workspace."}
        </p>
      </div>

      <form action={formAction} className="card mt-8 grid gap-4 p-6">
        {state?.error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {state.error}
          </p>
        )}

        {isSignup && (
          <>
            <Field label="Your name" name="name" placeholder="Alex Rivera" autoComplete="name" />
            <Field
              label="Agency / workspace name"
              name="agencyName"
              placeholder="Rivera Studio (optional)"
              required={false}
            />
          </>
        )}
        <Field label="Email" name="email" type="email" placeholder="you@studio.com" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder={isSignup ? "At least 8 characters" : "••••••••"}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        <Button type="submit" disabled={pending} className="mt-1 disabled:opacity-50">
          {pending ? "One moment…" : isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/signin" className="text-brand hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-brand hover:underline">
              Create a workspace
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
