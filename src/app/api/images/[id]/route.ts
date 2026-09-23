import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await db.image.findUnique({ where: { id }, select: { mime: true, data: true } });
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "content-type": img.mime,
      // Image rows are never edited in place (a new upload gets a new id), so cache hard.
      "cache-control": "public, max-age=31536000, immutable",
      // Let Netlify's edge keep a copy too, so each photo is read from the database once, not per visitor.
      "netlify-cdn-cache-control": "public, max-age=31536000, immutable, durable",
    },
  });
}
