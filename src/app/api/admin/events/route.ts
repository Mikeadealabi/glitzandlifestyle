import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { EventSchema, lagosInputToDate } from "@/lib/schemas";

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = EventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const ev = await db.event.create({ data: { ...parsed.data, startsAt: lagosInputToDate(parsed.data.startsAt) }, select: { id: true } });
  return json(ev, 201);
}
