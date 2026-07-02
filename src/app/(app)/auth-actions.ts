"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  registerUser,
  authenticate,
  createSession,
  destroySession,
} from "@/lib/auth";

export type AuthFormState = { error?: string } | undefined;

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
  redirect("/projects");
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
  redirect("/projects");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
