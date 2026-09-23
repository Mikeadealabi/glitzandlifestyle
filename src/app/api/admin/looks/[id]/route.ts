import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { LookSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = LookSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const ok = await db.look.update({ where: { id: (await params).id }, data: parsed.data }).catch(() => null);
  return ok ? json({ ok: true }) : fail("That look no longer exists.", 404);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  await db.look.delete({ where: { id: (await params).id } }).catch(() => null);
  return json({ ok: true });
}
