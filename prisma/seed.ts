// Sample content for local development. Wipes and recreates content tables,
// so it refuses to run against anything but a local database unless forced.
import { PrismaClient, type Section, type EventKind } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) && process.env.ALLOW_DESTRUCTIVE_SEED !== "1") {
  console.error("✗ Refusing to seed a non-local database. Set ALLOW_DESTRUCTIVE_SEED=1 if you really mean it.");
  process.exit(1);
}

const db = new PrismaClient();
const hash = (p: string) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(p, salt, 64).toString("hex")}`;
};
// Photos from Unsplash (free licence), resized into prisma/seed-images.
async function photo(file: string): Promise<string> {
  const data = readFileSync(join(process.cwd(), "prisma", "seed-images", file));
  // JPEG size lives in the SOF marker: baseline (FFC0) or progressive (FFC2).
  let sof = data.indexOf(Buffer.from([0xff, 0xc0]));
  if (sof < 0) sof = data.indexOf(Buffer.from([0xff, 0xc2]));
  const height = sof >= 0 ? data.readUInt16BE(sof + 5) : 1400;
  const width = sof >= 0 ? data.readUInt16BE(sof + 7) : 1400;
  const img = await db.image.create({ data: { mime: "image/jpeg", data, width, height }, select: { id: true } });
  return img.id;
}

const daysFromNow = (d: number, hour = 18) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  t.setHours(hour, 0, 0, 0);
  return t;
};

const stories: { title: string; slug: string; section: Section; dek: string; byline: string; featured?: boolean; ago: number; body: string; photo: string; credit: string }[] = [
  {
    title: "The night Lagos wore red, and 600 guests forgot their phones",
    slug: "the-night-lagos-wore-red", photo: "lagos-wore-red.jpg", credit: "Dennis Irorere / Unsplash",
    section: "WEDDINGS",
    featured: true,
    ago: 1,
    byline: "Tolu Bankole",
    dek: "Inside the Adeyemi–Okafor wedding: 14,000 hand-stitched sequins, a gele that took two hours, and the dance-floor moment everyone is still talking about.",
    body: `The invitation said *red, and only red*. By seven o'clock the ballroom looked like the inside of a ruby.

Six hundred guests arrived in every shade the colour allows: oxblood agbada, cherry lace, a crimson tulle cape that needed two nieces to carry it. The bride, Morenike, wore ivory for exactly forty minutes before changing into the dress everyone had come to see.

## 14,000 sequins, one seamstress

The second-outfit reveal was stitched by hand in a Yaba workshop over eleven weeks. "Every sequin faces the same way," her designer told us, "so when she turns, the whole dress flips colour at once."

> "I told the DJ: when she walks in, stop everything. Let the dress do the talking."

## The moment

At 10:40 the lights dropped, the band played the first bars of the couple's song, and not one phone went up. The couple had asked guests to leave the filming to the professionals, and for once, everyone listened.

**Planner:** Ivory & Oak Events · **Gele:** Adeola Wraps · **Photography:** Studio Ọ̀ṣọ́`,
  },
  {
    title: "The Silver Ball, Abuja: every look from the night",
    slug: "silver-ball-abuja-every-look", photo: "silver-ball.jpg", credit: "Filip Rankovic Grobgaard / Unsplash",
    section: "EVENTS",
    ago: 2,
    byline: "Hauwa Bello",
    dek: "Philanthropy, pearls and a surprise performance. ₦120m raised for girls' education.",
    body: `Abuja's most anticipated charity night returned to Maitama with a simple brief: silver, pearl and white.\n\n## The room\n\nFourteen chandeliers, three hundred guests and a string quartet that switched to Afrobeats at midnight.\n\n## The cause\n\nEvery naira raised goes to scholarships for girls in the FCT and Nasarawa. The final pledge came in at 11:52pm.`,
  },
  {
    title: "How to style one aso-ebi three different ways",
    slug: "style-one-aso-ebi-three-ways", photo: "aso-ebi-three-ways.jpg", credit: "Ibrahima Toure / Unsplash",
    section: "STYLE",
    ago: 3,
    byline: "Chidinma Eze",
    dek: "Tailors from Yaba share their cleverest cuts, so your fabric works for the wedding, the church and the after-party.",
    body: `Buying aso-ebi for every event adds up fast. The trick is to ask your tailor for a design that comes apart.\n\n## 1. The detachable peplum\n\nA fitted gown for the ceremony, then drop the peplum for dancing.\n\n## 2. Wrapper and blouse\n\nKeep the wrapper classic and let the blouse do the work.\n\n## 3. The jacket\n\nLeftover fabric becomes a cropped jacket to wear with jeans.`,
  },
  {
    title: "Owambe make-up that survives a seven-hour party",
    slug: "owambe-makeup-seven-hours", photo: "owambe-makeup.jpg", credit: "Raissa for Good Faces Agency / Unsplash",
    section: "BEAUTY",
    ago: 4,
    byline: "Ifeoma Nwosu",
    dek: "Setting sprays, blotting papers and the one-tap touch-up our favourite artists swear by.",
    body: `Lagos heat is the enemy. Here's how the pros keep a face flawless from the church service to the last dance.\n\n## Prep\n\nA mattifying primer on the T-zone only.\n\n## Set, then set again\n\nPowder, spray, powder. It sounds excessive. It works.`,
  },
  {
    title: "Lagos rooftop dinners worth dressing up for",
    slug: "lagos-rooftop-dinners", photo: "rooftop-dinners.jpg", credit: "Angelo Pantazis / Unsplash",
    section: "LIFESTYLE",
    ago: 5,
    byline: "Tolu Bankole",
    dek: "Six tables with a view and a strict dress code.",
    body: `When the sun goes down over the lagoon, these are the rooftops where Lagos goes to be seen.\n\n## Book ahead\n\nFriday tables go by Tuesday.`,
  },
  {
    title: "Seventy and fabulous: a Port Harcourt jubilee",
    slug: "seventy-and-fabulous-port-harcourt", photo: "seventy-and-fabulous.jpg", credit: "Tope A. Asokere / Unsplash",
    section: "EVENTS",
    ago: 6,
    byline: "Ebiere George",
    dek: "Three generations, one dance floor and a highlife band that played until 2am.",
    body: `Mama Ibinabo turned seventy and the whole of GRA knew about it.\n\n## Coral, everywhere\n\nThe family chose coral beads and gold george, and every grandchild wore a matching bow tie.`,
  },
  {
    title: "The rise of the second-outfit reveal",
    slug: "rise-of-the-second-outfit-reveal", photo: "second-outfit.jpg", credit: "Oyemike Princewill / Unsplash",
    section: "WEDDINGS",
    ago: 8,
    byline: "Chidinma Eze",
    dek: "Why brides now plan the evening look first, and the ceremony dress second.",
    body: `Ask any Lagos bridal designer: the reception dress is the one that goes viral.\n\n## Planning backwards\n\nBrides now start with the photo they want at 10pm and work back from there.`,
  },
  {
    title: "AMVCA after-party: the looks that owned the carpet",
    slug: "amvca-after-party-looks", photo: "amvca-after-party.jpg", credit: "Anshuman Khadotkar / Unsplash",
    section: "RED_CARPET",
    ago: 2,
    byline: "Hauwa Bello",
    dek: "Capes, crystals and one very brave sequin tuxedo.",
    body: `The awards were only the warm-up. Here's who turned the after-party carpet into a runway.\n\nVote on your favourites in **Hit or Miss** on the home page.`,
  },
];

const events: { title: string; city: string; venue: string; days: number; kind: EventKind; dressCode: string; colorA: string; colorB: string }[] = [
  { title: "Glitz & Style Owambe Awards", city: "Lagos", venue: "Eko Convention Centre, Victoria Island", days: 3, kind: "GALA", dressCode: "Red carpet: crimson & gold", colorA: "#C8102E", colorB: "#D4AF37" },
  { title: "Ruby Jubilee: The Okonkwos at 40", city: "Abuja", venue: "Transcorp Hilton, Maitama", days: 4, kind: "OWAMBE", dressCode: "Aso-ebi: ruby & ivory", colorA: "#9B111E", colorB: "#FFFFF0" },
  { title: "Afrofuture Fashion Night", city: "Accra", venue: "Kempinski Gold Coast City", days: 10, kind: "LAUNCH", dressCode: "Black tie, bold prints", colorA: "#111111", colorB: "#E08C97" },
  { title: "Tomi & Kunle's Traditional Engagement", city: "Lagos", venue: "Harbour Point, Wilmot Point Rd", days: 11, kind: "WEDDING", dressCode: "Aso-ebi: champagne & wine", colorA: "#E9CFAF", colorB: "#6E0B1C" },
  { title: "Garden City Wine & Jazz", city: "Port Harcourt", venue: "Hotel Presidential, GRA", days: 17, kind: "CONCERT", dressCode: "Smart casual, all white", colorA: "#FFFFFF", colorB: "#F8DDE0" },
  { title: "Savannah Couture Gala", city: "Nairobi", venue: "Sankara Hotel, Westlands", days: 18, kind: "GALA", dressCode: "Evening wear, earth & rose", colorA: "#A0522D", colorB: "#E08C97" },
];

const looks = [
  { name: "The Coral Crown", description: "Beaded coral crown, collar and a cloud of white fur. Royalty, no apologies.", hits: 412, misses: 88, photo: "look-coral-crown.jpg" },
  { name: "Midnight Gloves", description: "Black column gown, opera gloves and a sleek finger-wave bob.", hits: 260, misses: 171, photo: "look-midnight-gloves.jpg" },
  { name: "The Rose Suit", description: "Hot-pink tailoring over a black roll-neck, finished with mirrored shades.", hits: 198, misses: 203, photo: "look-rose-suit.jpg" },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@glitzandstyle.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "GlitzAndStyle!2026";

  await db.$transaction([db.story.deleteMany(), db.event.deleteMany(), db.look.deleteMany(), db.image.deleteMany()]);

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Glitz & Style Desk", role: "ADMIN", passwordHash: hash(password) },
  });
  await db.user.upsert({
    where: { email: "editor@glitzandstyle.local" },
    update: {},
    create: { email: "editor@glitzandstyle.local", name: "Tolu Bankole", role: "EDITOR", passwordHash: hash(password) },
  });

  for (const s of stories) {
    const { ago, photo: file, credit, ...data } = s;
    await db.story.create({
      data: { ...data, photoCredit: credit, coverImageId: await photo(file), status: "PUBLISHED", publishedAt: daysFromNow(-ago, 9), authorId: admin.id },
    });
  }
  await db.story.create({
    data: {
      title: "Draft: Accra's Chale Wote festival, in pictures",
      slug: "chale-wote-in-pictures",
      section: "LIFESTYLE",
      dek: "Street art, street style and a lot of glitter.",
      body: "Photos coming Monday.",
      byline: "Ama Mensah",
      photoCredit: "Prince Akachi / Unsplash",
      coverImageId: await photo("chale-wote.jpg"),
      status: "DRAFT",
      authorId: admin.id,
    },
  });
  for (const e of events) {
    const { days, ...data } = e;
    await db.event.create({ data: { ...data, startsAt: daysFromNow(days) } });
  }
  for (const [i, { photo: file, ...l }] of looks.entries()) await db.look.create({ data: { ...l, position: i, coverImageId: await photo(file) } });

  console.log(`✓ Seeded ${stories.length + 1} stories, ${events.length} events, ${looks.length} looks`);
  console.log(`✓ Sign in at /admin/login as ${email} (password from ADMIN_PASSWORD, default in README)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
