// Copy stories, events, looks and their photos from one database to another,
// e.g. the local sample content up to the hosted database.
//
//   SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... npx tsx scripts/copy-content.ts <author-email>
//
// Additive only: rows that already exist in the target (same id, or a story with
// the same web address) are skipped, nothing is deleted, and users/bookings are not copied.
// Stories are credited to <author-email>, which must already exist in the target.
import { PrismaClient } from "@prisma/client";

const [authorEmail] = process.argv.slice(2);
const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;
if (!sourceUrl || !targetUrl || !authorEmail) {
  console.error("Usage: SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... npx tsx scripts/copy-content.ts <author-email>");
  process.exit(1);
}

const src = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const dst = new PrismaClient({ datasources: { db: { url: targetUrl } } });

async function main() {
  const author = await dst.user.findUnique({ where: { email: authorEmail.toLowerCase() }, select: { id: true } });
  if (!author) throw new Error(`No user ${authorEmail} in the target database.`);

  const [stories, events, looks] = await Promise.all([src.story.findMany(), src.event.findMany(), src.look.findMany()]);
  const imageIds = new Set([...stories, ...looks].map((r) => r.coverImageId).filter((id): id is string => Boolean(id)));

  let images = 0;
  for (const id of imageIds) {
    if (await dst.image.findUnique({ where: { id }, select: { id: true } })) continue;
    const img = await src.image.findUnique({ where: { id } });
    if (!img) continue;
    await dst.image.create({ data: img });
    images++;
  }

  let copiedStories = 0;
  for (const { authorId: _a, ...s } of stories) {
    const clash = await dst.story.findFirst({ where: { OR: [{ id: s.id }, { slug: s.slug }] }, select: { id: true } });
    if (clash) continue;
    await dst.story.create({ data: { ...s, authorId: author.id } });
    copiedStories++;
  }

  let copiedEvents = 0;
  for (const e of events) {
    if (await dst.event.findUnique({ where: { id: e.id }, select: { id: true } })) continue;
    await dst.event.create({ data: e });
    copiedEvents++;
  }

  let copiedLooks = 0;
  for (const l of looks) {
    if (await dst.look.findUnique({ where: { id: l.id }, select: { id: true } })) continue;
    await dst.look.create({ data: l });
    copiedLooks++;
  }

  console.log(`✓ Copied ${copiedStories}/${stories.length} stories, ${copiedEvents}/${events.length} events, ${copiedLooks}/${looks.length} looks, ${images} photos.`);
}

main()
  .catch((e) => {
    console.error("✗", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => Promise.all([src.$disconnect(), dst.$disconnect()]));
