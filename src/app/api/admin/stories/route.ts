import { db } from "@/lib/db";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { StorySchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const parsed = StorySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const d = parsed.data;
  if (await db.story.findUnique({ where: { slug: d.slug }, select: { id: true } }))
    return fail("Web address: another story already uses it. Change it slightly.");
  const story = await db.story.create({
    data: { ...d, authorId: g.user.id, publishedAt: d.status === "PUBLISHED" ? new Date() : null },
    select: { id: true },
  });
  return json(story, 201);
}
