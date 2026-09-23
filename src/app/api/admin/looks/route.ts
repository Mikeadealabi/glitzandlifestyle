import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { LookSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = LookSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  return json(await db.look.create({ data: parsed.data, select: { id: true } }), 201);
}
