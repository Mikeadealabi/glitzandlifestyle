"use client";

import { useState } from "react";
import type { BookingStatus } from "@prisma/client";
import { send } from "@/components/admin/client";

const LABELS: Record<BookingStatus, string> = { NEW: "New", CONTACTED: "Contacted", CONFIRMED: "Confirmed", DECLINED: "Declined" };

export function BookingStatusSelect({ id, status: initial }: { id: string; status: BookingStatus }) {
  const [status, setStatus] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");

  async function change(next: BookingStatus) {
    const prev = status;
    setStatus(next);
    setState("saving");
    const r = await send(`/api/admin/bookings/${id}`, "PATCH", { status: next });
    if (r.ok) setState("saved");
    else {
      setStatus(prev);
      setState(r.error);
    }
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span className={`pill ${status}`}>{LABELS[status]}</span>
      <select aria-label="Booking status" value={status} onChange={(e) => change(e.target.value as BookingStatus)} style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)" }}>
        {Object.entries(LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      {state === "saved" ? <span className="note">Saved</span> : state !== "idle" && state !== "saving" ? <span className="err">{state}</span> : null}
    </div>
  );
}
