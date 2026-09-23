import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { EventSchema, lagosInputToDate } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = EventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const ok = await db.event
    .update({ where: { id: (await params).id }, data: { ...parsed.data, startsAt: lagosInputToDate(parsed.data.startsAt) } })
    .catch(() => null);
  return ok ? json({ ok: true }) : fail("That event no longer exists.", 404);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  await db.event.delete({ where: { id: (await params).id } }).catch(() => null);
  return json({ ok: true });
}
