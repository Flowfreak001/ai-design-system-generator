import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "../auth-actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (await auth()) redirect("/dashboard");
  const { reset } = await searchParams;
  return (
    <AuthForm
      mode="signin"
      action={signInAction}
      notice={reset ? "Your password was updated — sign in with your new password." : undefined}
    />
  );
}
