// Password reset: token issuance + consumption. Server-only.
//
// A raw random token is emailed to the user (email delivery is deferred, so the
// request action surfaces the link directly). Only a SHA-256 hash of the token
// is stored, so a DB leak never exposes usable reset links.
import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Issue a reset token for `email`. Returns the reset path when the account
 * exists; returns `{}` otherwise (never reveals whether an email is registered).
 */
export async function createPasswordResetToken(email: string): Promise<{ resetPath?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return {};

  const raw = randomBytes(32).toString("hex");
  // Invalidate any outstanding tokens for this user, then store the new hash.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  return { resetPath: `/reset-password?token=${raw}` };
}

/** True when the token maps to a valid, unused, unexpired reset request. */
export async function isResetTokenValid(raw: string): Promise<boolean> {
  if (!raw) return false;
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  return Boolean(row && !row.usedAt && row.expiresAt > new Date());
}

/** Consume the token and set a new password. */
export async function resetPasswordWithToken(
  raw: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!row || row.usedAt || row.expiresAt <= new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  return { ok: true };
}
