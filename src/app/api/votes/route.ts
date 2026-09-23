import { z } from "zod";
import { db } from "@/lib/db";
import { fail, json, rateLimited, sameOrigin } from "@/lib/api";

const Body = z.object({ lookId: z.string().min(1).max(40), vote: z.enum(["hit", "miss"]) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (rateLimited(req, "vote", 30, 60 * 60_000)) return fail("You've voted a lot this hour. Try again later.", 429);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid vote.");
  const { lookId, vote } = parsed.data;
  const look = await db.look
    .update({
      where: { id: lookId, active: true },
      data: vote === "hit" ? { hits: { increment: 1 } } : { misses: { increment: 1 } },
      select: { hits: true, misses: true },
    })
    .catch(() => null);
  if (!look) return fail("Voting on that look has closed.", 404);
  return json(look);
}
