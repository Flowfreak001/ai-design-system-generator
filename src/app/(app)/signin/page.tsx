import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "../auth-actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await auth()) redirect("/projects");
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-20">
      <AuthForm mode="signin" action={signInAction} />
    </div>
  );
}
