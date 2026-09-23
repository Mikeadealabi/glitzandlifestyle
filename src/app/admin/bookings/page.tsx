import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/content";
import { ADDONS, EVENT_KINDS, naira } from "@/lib/pricing";
import { toWhatsAppNumber, waLink } from "@/lib/whatsapp";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingStatusSelect } from "@/components/admin/BookingStatusSelect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings", robots: { index: false } };

const FILTERS = ["OPEN", "NEW", "CONTACTED", "CONFIRMED", "DECLINED", "ALL"] as const;

export default async function BookingsAdmin({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const user = await requireUser();
  const requested = (await searchParams).show;
  const show = FILTERS.find((f) => f === requested) ?? "OPEN";
  const where =
    show === "ALL" ? {} : show === "OPEN" ? { status: { in: ["NEW", "CONTACTED"] as ("NEW" | "CONTACTED")[] } } : { status: show };
  const bookings = await db.booking.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <AdminShell user={user} current="/admin/bookings">
      <div className="admin-top">
        <div>
          <h1>Bookings</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            Coverage requests from the website. Reply on WhatsApp, then update the status so the team knows who has it.
          </p>
        </div>
        <nav className="tabs" aria-label="Filter bookings">
          {FILTERS.map((f) => (
            <a key={f} className="chip" href={`/admin/bookings?show=${f}`} aria-current={show === f ? "page" : undefined}>
              {f === "OPEN" ? "Open" : f[0] + f.slice(1).toLowerCase()}
            </a>
          ))}
        </nav>
      </div>
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>Request</th>
              <th>Client</th>
              <th>Package</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const first = b.name.split(" ")[0];
              const reply = waLink(
                toWhatsAppNumber(b.phone),
                `Hello ${first}, this is the Glitz & Style events desk about your coverage request ${b.ref} for ${fmtDate(b.eventDate)}.`,
              );
              return (
                <tr key={b.id} id={b.id}>
                  <td style={{ minWidth: 200 }}>
                    <strong>
                      {EVENT_KINDS[b.kind].label}, {b.city}
                    </strong>
                    <div className="note">
                      {b.ref} · event {fmtDate(b.eventDate)}
                    </div>
                    <div className="note">received {b.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}</div>
                    {b.notes ? <p style={{ margin: "8px 0 0", fontSize: ".85rem", whiteSpace: "pre-wrap" }}>&ldquo;{b.notes}&rdquo;</p> : null}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <strong>{b.name}</strong>
                    <div className="note">{b.phone}</div>
                    {b.email ? <div className="note">{b.email}</div> : null}
                    <div className="row-actions" style={{ marginTop: 8 }}>
                      <a className="btn btn-wa btn-sm" href={reply} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                      {b.email ? (
                        <a className="btn btn-ghost btn-sm" href={`mailto:${b.email}?subject=${encodeURIComponent(`Your Glitz & Style booking ${b.ref}`)}`}>
                          Email
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ minWidth: 200 }}>
                    <strong style={{ fontVariantNumeric: "tabular-nums" }}>{naira(b.totalNaira)}</strong>
                    <div className="note">
                      {b.tier} · {b.hours} hrs
                    </div>
                    <div className="note">{ADDONS.filter((a) => b.addons.includes(a.id)).map((a) => a.label).join(", ") || "Photography only"}</div>
                  </td>
                  <td>
                    <BookingStatusSelect id={b.id} status={b.status} />
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="note">
                  No {show === "ALL" ? "" : show === "OPEN" ? "open " : show.toLowerCase() + " "}bookings.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
