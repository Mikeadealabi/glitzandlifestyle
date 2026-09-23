import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fmtDate, sectionLabel, SECTIONS } from "@/lib/content";
import { readMinutes, renderMarkdown } from "@/lib/markdown";
import { Art } from "@/components/Art";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyLink } from "@/components/CopyLink";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const story = await db.story.findUnique({ where: { slug } });
  if (!story) return null;
  if (story.status === "PUBLISHED") return { story, preview: false };
  // Drafts are visible to signed-in editors only, with a preview banner.
  return (await currentUser()) ? { story, preview: true } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).slug);
  if (!found) return { title: "Story not found" };
  const { story } = found;
  return {
    title: story.title,
    description: story.dek,
    robots: found.preview ? { index: false } : undefined,
    openGraph: {
      title: story.title,
      description: story.dek,
      type: "article",
      images: story.coverImageId ? [`/api/images/${story.coverImageId}`] : undefined,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();
  const { story, preview } = found;
  const related = await db.story.findMany({
    where: { status: "PUBLISHED", section: story.section, NOT: { id: story.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const url = `${(process.env.SITE_URL || "http://localhost:3020").replace(/\/$/, "")}/stories/${story.slug}`;
  const shareText = `${story.title} | Glitz & Style`;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
  const sec = SECTIONS.find((s) => s.key === story.section);

  return (
    <>
      {preview ? (
        <div className="preview-banner">
          Draft preview. Only signed-in editors can see this. <Link href={`/admin/stories/${story.id}`}>Back to editor</Link>
        </div>
      ) : null}
      <SiteHeader today={today} activeSection={sec?.slug} />
      <article>
        <header className="wrap article-head">
          <Link className="eyebrow" href={`/?section=${sec?.slug}#stories`} style={{ textDecoration: "none" }}>
            {sectionLabel(story.section)}
          </Link>
          <h1>{story.title}</h1>
          <p className="dek">{story.dek}</p>
          <div className="byline">
            <span>
              Words <b>{story.byline}</b>
            </span>
            {story.photoCredit ? (
              <span>
                Photography <b>{story.photoCredit}</b>
              </span>
            ) : null}
            <span>{story.publishedAt ? fmtDate(story.publishedAt) : "Not yet published"}</span>
            <span>{readMinutes(story.body)} min read</span>
          </div>
        </header>
        <figure className="wrap article-cover" style={{ margin: "0 auto" }}>
          <Art seed={story.id} title={story.title} imageId={story.coverImageId} priority />
          {story.photoCredit ? <figcaption>Photo: {story.photoCredit}</figcaption> : null}
        </figure>
        <div className="wrap">
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(story.body) }} />
          <div className="share">
            <span>Share</span>
            <a className="btn btn-wa btn-sm" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="btn btn-ghost btn-sm" href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
              X
            </a>
            <a className="btn btn-ghost btn-sm" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <CopyLink url={url} />
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="section" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="sec-head">
              <h2>
                More <em>{sectionLabel(story.section).toLowerCase()}</em>
              </h2>
            </div>
            <div className="stories">
              {related.map((s) => (
                <Link key={s.id} className="story" href={`/stories/${s.slug}`}>
                  <Art seed={s.id} title={s.title} imageId={s.coverImageId} label={sectionLabel(s.section)} />
                  <h3>{s.title}</h3>
                  <p>{s.dek}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <SiteFooter />
    </>
  );
}
