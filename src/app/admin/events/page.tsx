import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateToLagosInput } from "@/lib/schemas";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventsManager } from "@/components/admin/EventsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guestlist events", robots: { index: false } };

export default async function EventsAdmin() {
  const user = await requireUser();
  const events = await db.event.findMany({ orderBy: { startsAt: "desc" } });
  return (
    <AdminShell user={user} current="/admin/events">
      <div className="admin-top">
        <div>
          <h1>Guestlist events</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            Upcoming events show on the front page. Past events drop off automatically.
          </p>
        </div>
      </div>
      <EventsManager
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          city: e.city,
          venue: e.venue,
          startsAt: dateToLagosInput(e.startsAt),
          kind: e.kind,
          dressCode: e.dressCode,
          colorA: e.colorA,
          colorB: e.colorB,
          published: e.published,
          past: e.startsAt.getTime() < Date.now(),
        }))}
      />
    </AdminShell>
  );
}
