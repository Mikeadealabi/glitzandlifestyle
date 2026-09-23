import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoryEditor } from "@/components/admin/StoryEditor";

export const metadata = { title: "New story", robots: { index: false } };

export default async function NewStory() {
  const user = await requireUser();
  return (
    <AdminShell user={user} current="/admin">
      <div className="admin-top">
        <h1>New story</h1>
      </div>
      <StoryEditor story={{ byline: user.name }} />
    </AdminShell>
  );
}
