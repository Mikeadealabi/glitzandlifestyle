import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { TeamManager } from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team", robots: { index: false } };

export default async function TeamAdmin() {
  const user = await requireUser("ADMIN");
  const users = await db.user.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }], select: { id: true, name: true, email: true, role: true, isActive: true } });
  return (
    <AdminShell user={user} current="/admin/team">
      <div className="admin-top">
        <div>
          <h1>Team</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            Editors write and publish stories, events and looks, and handle bookings. Admins can also manage the team.
          </p>
        </div>
      </div>
      <TeamManager users={users} meId={user.id} />
    </AdminShell>
  );
}
