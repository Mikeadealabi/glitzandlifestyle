import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, sectionLabel } from "@/lib/content";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stories", robots: { index: false } };

export default async function StoriesAdmin({ searchParams }: { searchParams: Promise<{ denied?: string; saved?: string; deleted?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const [stories, subscribers] = await Promise.all([
    db.story.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }], include: { author: { select: { name: true } } } }),
    db.subscriber.count(),
  ]);
  return (
    <AdminShell user={user} current="/admin">
      <div className="admin-top">
        <div>
          <h1>Stories</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            {stories.filter((s) => s.status === "PUBLISHED").length} published · {stories.filter((s) => s.status === "DRAFT").length} drafts ·{" "}
            {subscribers} newsletter subscribers
            {user.role === "ADMIN" && subscribers ? (
              <>
                {" "}
                · <a href="/api/admin/subscribers">Download list (CSV)</a>
              </>
            ) : null}
          </p>
        </div>
        <Link className="btn btn-red" href="/admin/stories/new">
          New story
        </Link>
      </div>
      {sp.denied ? <div className="flash">That page is for admins only.</div> : null}
      {sp.deleted ? <div className="flash">Story deleted.</div> : null}
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>Title</th>
              <th>Section</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stories.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/stories/${s.id}`}>{s.title}</Link>
                  {s.featured ? <span className="pill pub" style={{ marginLeft: 8 }}>Cover</span> : null}
                  <div className="note">
                    {s.byline}
                    {s.author ? ` · added by ${s.author.name}` : ""}
                  </div>
                </td>
                <td>{sectionLabel(s.section)}</td>
                <td>
                  <span className={`pill ${s.status === "PUBLISHED" ? "pub" : "draft"}`}>{s.status === "PUBLISHED" ? "Published" : "Draft"}</span>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(s.updatedAt)}</td>
                <td>
                  <Link href={`/stories/${s.slug}`} target="_blank">
                    {s.status === "PUBLISHED" ? "View" : "Preview"}
                  </Link>
                </td>
              </tr>
            ))}
            {stories.length === 0 ? (
              <tr>
                <td colSpan={5} className="note">
                  No stories yet. Start with &ldquo;New story&rdquo;.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
