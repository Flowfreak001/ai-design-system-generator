import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = { title: "Password recovery" };

export default async function ForgotPasswordPage() {
  if (await auth()) redirect("/dashboard");
  return <PasswordRecoveryForm />;
}
