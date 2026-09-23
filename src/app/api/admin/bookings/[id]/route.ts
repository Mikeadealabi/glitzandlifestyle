import { z } from "zod";
import { db } from "@/lib/db";
import { fail, guard, json } from "@/lib/api";

const Body = z.object({ status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "DECLINED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Pick a valid status.");
  const ok = await db.booking.update({ where: { id: (await params).id }, data: parsed.data }).catch(() => null);
  return ok ? json({ ok: true }) : fail("That booking no longer exists.", 404);
}
