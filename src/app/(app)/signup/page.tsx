import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "../auth-actions";

export const metadata: Metadata = { title: "Create your workspace" };

export default async function SignUpPage() {
  if (await auth()) redirect("/dashboard");
  return <AuthForm mode="signup" action={signUpAction} />;
}
