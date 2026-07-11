import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { wixInstallUrl, isWixAppConfigured } from "@/lib/integrations/wix/oauth";

// Kick off the Wix app install/authorize flow for the signed-in agency.
export async function GET() {
  const user = await auth();
  if (!user?.agencyId) return NextResponse.redirect(new URL("/signin", process.env.WIX_APP_CALLBACK_URL || "http://localhost:3000"));
  if (!isWixAppConfigured()) return NextResponse.redirect(new URL("/account?wix=unconfigured", origin()));

  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("wix_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });

  return NextResponse.redirect(wixInstallUrl(state));
}

function origin(): string {
  try { return new URL(process.env.WIX_APP_CALLBACK_URL || "http://localhost:3000").origin; } catch { return "http://localhost:3000"; }
}
