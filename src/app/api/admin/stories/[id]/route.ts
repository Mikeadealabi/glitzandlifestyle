import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { StorySchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  const { id } = await params;
  const parsed = StorySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const d = parsed.data;
  const existing = await db.story.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) return fail("That story no longer exists.", 404);
  const clash = await db.story.findUnique({ where: { slug: d.slug }, select: { id: true } });
  if (clash && clash.id !== id) return fail("Web address: another story already uses it. Change it slightly.");
  // First publish stamps the date; later edits and unpublish/republish keep the original date.
  const publishedAt = d.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
  await db.story.update({ where: { id }, data: { ...d, publishedAt } });
  return json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (g.error) return g.error;
  const { id } = await params;
  await db.story.delete({ where: { id } }).catch(() => null);
  return json({ ok: true });
}
