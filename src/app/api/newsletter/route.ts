import { z } from "zod";
import { db } from "@/lib/db";
import { fail, json, rateLimited, sameOrigin } from "@/lib/api";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(120), website: z.string().nullish() });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (rateLimited(req, "news", 5, 10 * 60_000)) return fail("Too many attempts. Try again in a few minutes.", 429);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Enter a valid email address.");
  if (!parsed.data.website) await db.subscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: { email: parsed.data.email } });
  return json({ ok: true });
}
