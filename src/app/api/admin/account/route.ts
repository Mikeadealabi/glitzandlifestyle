import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword, revokeUserSessions, verifyPassword } from "@/lib/auth";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { PasswordSchema } from "@/lib/schemas";

const Body = z.object({ current: z.string().min(1, "Enter your current password"), next: PasswordSchema });

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const user = await db.user.findUnique({ where: { id: g.user.id } });
  if (!user || !verifyPassword(parsed.data.current, user.passwordHash)) return fail("Your current password isn't right.");
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(parsed.data.next) } });
  // Sign out every other device, then give this one a fresh session.
  await revokeUserSessions(user.id);
  await createSession(user.id);
  return json({ ok: true });
}
