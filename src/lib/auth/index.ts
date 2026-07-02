// Minimal session auth: bcryptjs-hashed passwords + a signed JWT in an
// httpOnly cookie (jose). No external provider needed; swap for Auth.js/OAuth
// later without changing call sites — pages/actions only use auth()/requireUser().

// Server-side only (imports next/headers; never import from client components).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";

const COOKIE = "pos_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  agencyId: string | null;
};

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    agencyId: user.agencyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Returns the session user or null. Safe to call anywhere server-side. */
export async function auth(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      name: (payload.name as string | null) ?? null,
      agencyId: (payload.agencyId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Redirects to /signin when unauthenticated. Use in gated pages/actions. */
export async function requireUser(): Promise<SessionUser> {
  const user = await auth();
  if (!user) redirect("/signin");
  return user;
}

// ---- credential flows ----------------------------------------------------

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  agencyName?: string;
}): Promise<{ error?: string; user?: SessionUser }> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const agency = await prisma.agency.create({
    data: { name: input.agencyName?.trim() || `${input.name.trim()}'s workspace` },
  });
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      agencyId: agency.id,
      role: "agency_owner",
    },
  });
  return {
    user: { id: user.id, email: user.email, name: user.name, agencyId: user.agencyId },
  };
}

export async function authenticate(
  email: string,
  password: string,
): Promise<{ error?: string; user?: SessionUser }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user?.passwordHash) return { error: "Invalid email or password." };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };
  return {
    user: { id: user.id, email: user.email, name: user.name, agencyId: user.agencyId },
  };
}
