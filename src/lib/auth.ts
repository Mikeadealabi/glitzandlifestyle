import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Sessions are an opaque random token in an httpOnly cookie; only its SHA-256
 * hash is stored, so signing out or deactivating an editor revokes access at once.
 */
export const SESSION_COOKIE = "gs_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 14;

export type SessionUser = { id: string; email: string; name: string; role: Role };

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, 64);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.session.create({ data: { userId, tokenHash: sha(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await db.session.findUnique({
    where: { tokenHash: sha(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
  });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now() || !row.user.isActive) {
    await db.session.delete({ where: { id: row.id } }).catch(() => {});
    return null;
  }
  const { isActive: _active, ...user } = row.user;
  return user;
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha(token) } });
  store.delete(SESSION_COOKIE);
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

/** For admin pages: signed-out visitors go to the login page, editors away from admin-only pages. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin?denied=1");
  return user;
}
