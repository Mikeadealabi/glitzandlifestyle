import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { LooksManager } from "@/components/admin/LooksManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hit or Miss looks", robots: { index: false } };

export default async function LooksAdmin() {
  const user = await requireUser();
  const looks = await db.look.findMany({ orderBy: [{ active: "desc" }, { position: "asc" }, { createdAt: "desc" }] });
  return (
    <AdminShell user={user} current="/admin/looks">
      <div className="admin-top">
        <div>
          <h1>Hit or Miss looks</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            The first three live looks (by position) show on the front page. Retire old looks to keep their vote counts.
          </p>
        </div>
      </div>
      <LooksManager looks={looks.map(({ id, name, description, coverImageId, active, position, hits, misses }) => ({ id, name, description, coverImageId, active, position, hits, misses }))} />
    </AdminShell>
  );
}
