import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, json, rateLimited, sameOrigin } from "@/lib/api";

const Body = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (rateLimited(req, "login", 8, 15 * 60_000)) return fail("Too many sign-in attempts. Wait 15 minutes and try again.", 429);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Enter your email and password.");
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Same message for unknown email, wrong password and deactivated account.
  if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash))
    return fail("That email and password don't match an active editor account.", 401);
  await createSession(user.id);
  return json({ ok: true });
}
