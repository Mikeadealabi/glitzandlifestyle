import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { fail, guard, json, zodMessage } from "@/lib/api";
import { PasswordSchema } from "@/lib/schemas";

const Body = z.object({
  name: z.string().trim().min(2, "Add their name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: PasswordSchema,
});

export async function POST(req: Request) {
  const g = await guard(req, "ADMIN");
  if (g.error) return g.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const { password, ...d } = parsed.data;
  if (await db.user.findUnique({ where: { email: d.email }, select: { id: true } })) return fail("Someone with that email is already on the team.");
  const u = await db.user.create({ data: { ...d, passwordHash: hashPassword(password) }, select: { id: true } });
  return json(u, 201);
}
