import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoryEditor } from "@/components/admin/StoryEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit story", robots: { index: false } };

export default async function EditStory({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const story = await db.story.findUnique({ where: { id: (await params).id } });
  if (!story) notFound();
  return (
    <AdminShell user={user} current="/admin">
      <div className="admin-top">
        <h1>Edit story</h1>
      </div>
      <StoryEditor
        story={{
          id: story.id,
          title: story.title,
          slug: story.slug,
          dek: story.dek,
          body: story.body,
          section: story.section,
          byline: story.byline,
          photoCredit: story.photoCredit,
          coverImageId: story.coverImageId,
          featured: story.featured,
          status: story.status,
        }}
      />
    </AdminShell>
  );
}
