import { db } from "@/lib/db";
import { fail, guard, json } from "@/lib/api";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/webp", "image/jpeg", "image/png"];

// Magic bytes, so a renamed file can't pass as an image.
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) return fail("Choose a photo to upload.");
  if (file.size > MAX_BYTES) return fail("That photo is over 4 MB even after resizing. Try a smaller one.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(bytes);
  if (!mime || !TYPES.includes(mime)) return fail("Upload a JPG, PNG or WebP photo.");
  const width = Math.min(10000, Math.max(1, Number(form?.get("width")) || 1));
  const height = Math.min(10000, Math.max(1, Number(form?.get("height")) || 1));
  const img = await db.image.create({ data: { mime, data: Buffer.from(bytes), width, height }, select: { id: true } });
  return json(img, 201);
}
