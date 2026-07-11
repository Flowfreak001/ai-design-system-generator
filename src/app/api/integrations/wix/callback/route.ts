import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { saveWixConnection } from "@/lib/integrations/wix/connection-store";

// Wix redirects here after the user approves the app. We capture the app
// instanceId (durable) and store it against the agency.
export async function GET(req: Request) {
  const home = origin();
  const user = await auth();
  if (!user?.agencyId) return NextResponse.redirect(new URL("/signin", home));

  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  // Modern Wix apps hand back an `instance` token (payload after the first "."
  // is base64url JSON containing instanceId). Older flows pass instanceId direct.
  const instanceId = url.searchParams.get("instanceId") ?? decodeInstanceId(url.searchParams.get("instance"));

  const jar = await cookies();
  const expected = jar.get("wix_oauth_state")?.value;
  jar.delete("wix_oauth_state");
  if (!state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/account?wix=badstate", home));
  }
  if (!instanceId) {
    return NextResponse.redirect(new URL("/account?wix=error", home));
  }

  await saveWixConnection(user.agencyId, instanceId, url.searchParams.get("siteId"));
  return NextResponse.redirect(new URL("/account?wix=connected", home));
}

function origin(): string {
  try { return new URL(process.env.WIX_APP_CALLBACK_URL || "http://localhost:3000").origin; } catch { return "http://localhost:3000"; }
}

/** Decode the instanceId from a Wix `instance` token (signature.base64Payload). */
function decodeInstanceId(instance: string | null): string | null {
  if (!instance) return null;
  try {
    const payload = instance.includes(".") ? instance.split(".")[1] : instance;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { instanceId?: string };
    return json.instanceId ?? null;
  } catch {
    return null;
  }
}
