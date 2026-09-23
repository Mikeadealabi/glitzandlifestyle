import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, revokeUserSessions } from "@/lib/auth";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { PasswordSchema } from "@/lib/schemas";

const Body = z.object({ role: z.enum(["ADMIN", "EDITOR"]).optional(), isActive: z.boolean().optional(), password: PasswordSchema.optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req, "ADMIN");
  if (g.error) return g.error;
  const { id } = await params;
  if (id === g.user.id) return fail("You can't change your own role or access here. Ask another admin.");
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const { password, ...rest } = parsed.data;
  const ok = await db.user
    .update({ where: { id }, data: { ...rest, ...(password ? { passwordHash: hashPassword(password) } : {}) } })
    .catch(() => null);
  if (!ok) return fail("That team member no longer exists.", 404);
  // Deactivation, demotion and password resets all take effect immediately.
  await revokeUserSessions(id);
  return json({ ok: true });
}
