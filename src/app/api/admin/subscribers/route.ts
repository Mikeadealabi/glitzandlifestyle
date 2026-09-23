import { db } from "@/lib/db";
import { guard } from "@/lib/api";

export async function GET(req: Request) {
  const g = await guard(req, "ADMIN");
  if (g.error) return g.error;
  const rows = await db.subscriber.findMany({ orderBy: { createdAt: "asc" } });
  const csv = ["email,subscribed_at", ...rows.map((r) => `${r.email},${r.createdAt.toISOString()}`)].join("\n");
  return new Response(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="glitz-subscribers.csv"' },
  });
}
