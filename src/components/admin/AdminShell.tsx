import Link from "next/link";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Stories" },
  { href: "/admin/events", label: "Guestlist events" },
  { href: "/admin/looks", label: "Hit or Miss looks" },
  { href: "/admin/bookings", label: "Bookings", badge: true },
  { href: "/admin/team", label: "Team", adminOnly: true },
  { href: "/admin/account", label: "Your account" },
];

/** Presentational frame for admin pages. Each page checks the session itself and passes the user in. */
export async function AdminShell({ user, current, children }: { user: SessionUser; current: string; children: React.ReactNode }) {
  const newBookings = await db.booking.count({ where: { status: "NEW" } });
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link href="/" className="logo" title="View the site">
          Glitz<span className="amp">&amp;</span>Style
        </Link>
        <nav aria-label="Admin">
          {NAV.filter((n) => !n.adminOnly || user.role === "ADMIN").map((n) => (
            <Link key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}>
              {n.label}
              {n.badge && newBookings ? <span className="count">{newBookings}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="who">
          <span>
            {user.name} · {user.role === "ADMIN" ? "Admin" : "Editor"}
          </span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
