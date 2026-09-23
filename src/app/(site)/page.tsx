import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fmtDate, sectionBySlug, sectionLabel, SECTIONS } from "@/lib/content";
import { readMinutes } from "@/lib/markdown";
import { Art } from "@/components/Art";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SequinWall } from "@/components/SequinWall";
import { HitOrMiss } from "@/components/HitOrMiss";
import { Guestlist } from "@/components/Guestlist";
import { AsoEbiStudio } from "@/components/AsoEbiStudio";
import { CoverMaker } from "@/components/CoverMaker";
import { BookingForm } from "@/components/BookingForm";

export const dynamic = "force-dynamic";

const TZ = "Africa/Lagos";

export default async function Home({ searchParams }: { searchParams: Promise<{ section?: string; q?: string }> }) {
  const sp = await searchParams;
  const section = sectionBySlug(sp.section);
  const q = (sp.q ?? "").trim().slice(0, 80);

  const where: Prisma.StoryWhereInput = {
    status: "PUBLISHED",
    ...(section ? { section: section.key } : {}),
    ...(q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { dek: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] }
      : {}),
  };
  const [cover, stories, latest, events, looks] = await Promise.all([
    db.story.findFirst({ where: { status: "PUBLISHED", featured: true }, orderBy: { publishedAt: "desc" } }),
    db.story.findMany({ where, orderBy: { publishedAt: "desc" }, take: 13 }),
    db.story.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 7, select: { slug: true, title: true } }),
    db.event.findMany({ where: { published: true, startsAt: { gte: new Date(Date.now() - 12 * 3600e3) } }, orderBy: { startsAt: "asc" }, take: 12 }),
    db.look.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "desc" }], take: 3 }),
  ]);
  const hero = cover ?? latest[0];
  const heroFull = hero ? (cover ?? (await db.story.findUnique({ where: { slug: hero.slug } }))) : null;

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const guestEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    city: e.city,
    venue: e.venue,
    kind: e.kind,
    dressCode: e.dressCode,
    colorA: e.colorA,
    colorB: e.colorB,
    day: e.startsAt.toLocaleDateString("en-GB", { day: "2-digit", timeZone: TZ }),
    month: e.startsAt.toLocaleDateString("en-GB", { month: "short", timeZone: TZ }),
    time: e.startsAt.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }),
  }));
  const ticker = latest.map((s) => (
    <Link key={s.slug} href={`/stories/${s.slug}`}>
      {s.title}
    </Link>
  ));

  return (
    <>
      <SiteHeader today={today} activeSection={section?.slug} query={q} />
      {latest.length ? (
        <div className="ticker" aria-label="Top stories">
          <div className="ticker-label">
            <span className="pulse" aria-hidden="true" />
            Top Stories
          </div>
          <div className="ticker-track">
            <div className="ticker-inner">
              {ticker}
              <span aria-hidden="true" style={{ display: "contents" }}>
                {latest.map((s) => (
                  <Link key={s.slug + "-2"} href={`/stories/${s.slug}`} tabIndex={-1}>
                    {s.title}
                  </Link>
                ))}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {!section && !q && heroFull ? (
        <section className="hero">
          <div className="wrap">
            <div>
              <div className="eyebrow">Cover story · {sectionLabel(heroFull.section)}</div>
              <h1>
                <Link href={`/stories/${heroFull.slug}`}>{heroFull.title}</Link>
              </h1>
              <p className="dek">{heroFull.dek}</p>
              <div className="byline">
                <span>
                  Words <b>{heroFull.byline}</b>
                </span>
                {heroFull.photoCredit ? (
                  <span>
                    Photography <b>{heroFull.photoCredit}</b>
                  </span>
                ) : null}
                <span>{readMinutes(heroFull.body)} min read</span>
              </div>
              <div className="hero-ctas">
                <Link className="btn btn-red" href={`/stories/${heroFull.slug}`}>
                  Read the cover story
                </Link>
                <a className="btn btn-ghost" href="#book">
                  Get your event covered
                </a>
              </div>
            </div>
            <SequinWall />
          </div>
        </section>
      ) : null}

      <section className="section" id="stories" style={{ paddingTop: section || q ? 48 : 24 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">{q ? "Search" : "Main stories"}</div>
              <h2>
                {q ? (
                  <>
                    Results for <em>&ldquo;{q}&rdquo;</em>
                  </>
                ) : section ? (
                  <>
                    The latest in <em>{section.label.toLowerCase()}</em>
                  </>
                ) : (
                  <>
                    This week in <em>glitz</em>
                  </>
                )}
              </h2>
            </div>
            <nav className="tabs" aria-label="Filter stories by section">
              <Link className="chip" href="/#stories" aria-current={!section && !q ? "page" : undefined}>
                All
              </Link>
              {SECTIONS.map((s) => (
                <Link key={s.slug} className="chip" href={`/?section=${s.slug}#stories`} aria-current={section?.slug === s.slug ? "page" : undefined}>
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="stories">
            {stories.length === 0 ? (
              <p className="empty">
                {q ? <>No stories match &ldquo;{q}&rdquo;. Try &ldquo;wedding&rdquo;, &ldquo;gele&rdquo; or &ldquo;Abuja&rdquo;.</> : "No stories in this section yet."}
              </p>
            ) : null}
            {stories.map((s, i) => (
              <Link key={s.id} className={`story${i === 0 ? " lead" : ""}`} href={`/stories/${s.slug}`}>
                <Art seed={s.id} title={s.title} imageId={s.coverImageId} label={sectionLabel(s.section)} priority={i === 0} />
                <div className="meta">
                  {s.publishedAt ? fmtDate(s.publishedAt) : ""} · {readMinutes(s.body)} min
                </div>
                <h3>{s.title}</h3>
                <p>{s.dek}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section carpet" id="carpet">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Red carpet · Hit or miss</div>
              <h2>You be the judge</h2>
              <p>This week&apos;s standout looks. Vote, then see how the rest of the room voted.</p>
            </div>
          </div>
          <HitOrMiss looks={looks.map(({ id, name, description, coverImageId, hits, misses }) => ({ id, name, description, coverImageId, hits, misses }))} />
        </div>
      </section>

      <section className="section" id="guestlist">
        <div className="wrap">
          <Guestlist events={guestEvents} />
        </div>
      </section>

      <section className="section" id="studio" style={{ background: "var(--paper)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Aso-ebi colour studio</div>
              <h2>
                Pick your party&apos;s <em>palette</em>
              </h2>
              <p>Choosing the aso-ebi is half the celebration. Tap a colour pairing to see the fabric, the gele and what to wear with it.</p>
            </div>
          </div>
          <AsoEbiStudio />
        </div>
      </section>

      <section className="section" id="cover-maker">
        <CoverMaker />
      </section>

      <section className="section book" id="book">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Get your event covered</div>
              <h2>
                We bring the <em>cameras</em>, you bring the glamour
              </h2>
              <p>Build a coverage package for your event. The price updates as you go, and our events desk confirms within 24 hours.</p>
            </div>
          </div>
          <BookingForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
