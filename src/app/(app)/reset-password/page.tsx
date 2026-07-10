import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isResetTokenValid } from "@/lib/auth/password-reset";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  if (await auth()) redirect("/dashboard");
  const { token = "" } = await searchParams;
  const valid = await isResetTokenValid(token);
  return <ResetPasswordForm token={token} valid={valid} />;
}
