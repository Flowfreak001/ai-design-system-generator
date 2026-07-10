"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  registerUser,
  authenticate,
  createSession,
  destroySession,
} from "@/lib/auth";
import { createPasswordResetToken, resetPasswordWithToken } from "@/lib/auth/password-reset";

export type AuthFormState = { error?: string } | undefined;
export type ResetRequestState = { error?: string; sent?: boolean; resetPath?: string } | undefined;
export type ResetState = { error?: string } | undefined;

const signUpSchema = z.object({
  name: z.string().min(1, "Your name is required"),
  agencyName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    agencyName: formData.get("agencyName") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await registerUser(parsed.data);
  if (result.error || !result.user) return { error: result.error ?? "Sign up failed." };

  await createSession(result.user);
  redirect("/dashboard");
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (result.error || !result.user) return { error: result.error ?? "Sign in failed." };

  await createSession(result.user);
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Always report success so the form never reveals whether an email exists.
  const { resetPath } = await createPasswordResetToken(parsed.data.email);
  return { sent: true, resetPath };
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!result.ok) return { error: result.error ?? "Could not reset password." };

  redirect("/signin?reset=1");
}
