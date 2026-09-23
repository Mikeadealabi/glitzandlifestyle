"use client";

import { useState } from "react";
import { EVENT_KINDS } from "@/lib/pricing";
import { send } from "@/components/admin/client";

type Ev = { id?: string; title: string; city: string; venue: string; startsAt: string; kind: string; dressCode: string; colorA: string; colorB: string; published: boolean; past?: boolean };
const blank: Ev = { title: "", city: "Lagos", venue: "", startsAt: "", kind: "WEDDING", dressCode: "", colorA: "#C8102E", colorB: "#E9CFAF", published: true };

export function EventsManager({ events }: { events: Ev[] }) {
  const [editing, setEditing] = useState<Ev | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    const { id, past: _past, ...body } = editing;
    const r = id ? await send(`/api/admin/events/${id}`, "PATCH", body) : await send("/api/admin/events", "POST", body);
    if (r.ok) window.location.reload();
    else {
      setError(r.error);
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const r = await send(`/api/admin/events/${id}`, "DELETE");
    if (r.ok) window.location.reload();
    else {
      setError(r.error);
      setBusy(false);
    }
  }

  const set = <K extends keyof Ev>(k: K, v: Ev[K]) => setEditing((p) => (p ? { ...p, [k]: v } : p));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {editing ? (
        <form className="panel" onSubmit={save} style={{ display: "grid", gap: 14 }}>
          <h2 style={{ fontSize: "1.5rem" }}>{editing.id ? "Edit event" : "New event"}</h2>
          <div className="grid2">
            <div className="field">
              <label htmlFor="ev-title">Event name</label>
              <input id="ev-title" required value={editing.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-when">Date and start time (Lagos time)</label>
              <input id="ev-when" type="datetime-local" required value={editing.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-city">City</label>
              <input id="ev-city" required value={editing.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-venue">Venue</label>
              <input id="ev-venue" required value={editing.venue} onChange={(e) => set("venue", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-kind">Type</label>
              <select id="ev-kind" value={editing.kind} onChange={(e) => set("kind", e.target.value)}>
                {Object.entries(EVENT_KINDS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ev-dress">Dress code</label>
              <input id="ev-dress" required value={editing.dressCode} placeholder="Aso-ebi: champagne & wine" onChange={(e) => set("dressCode", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-ca">Dress-code colours</label>
              <div className="row-actions">
                <input id="ev-ca" type="color" value={editing.colorA} onChange={(e) => set("colorA", e.target.value.toUpperCase())} style={{ width: 64, padding: 2 }} aria-label="First colour" />
                <input type="color" value={editing.colorB} onChange={(e) => set("colorB", e.target.value.toUpperCase())} style={{ width: 64, padding: 2 }} aria-label="Second colour" />
              </div>
            </div>
            <label className="addon" htmlFor="ev-pub" style={{ alignSelf: "end" }}>
              <input id="ev-pub" type="checkbox" checked={editing.published} onChange={(e) => set("published", e.target.checked)} />
              <span>Show on the front page</span>
            </label>
          </div>
          {error ? <p className="err" role="alert">{error}</p> : null}
          <div className="row-actions">
            <button className="btn btn-red" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save event"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button className="btn btn-red" type="button" onClick={() => setEditing({ ...blank })}>
            Add event
          </button>
          {error ? <p className="err" role="alert">{error}</p> : null}
        </div>
      )}
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>Dress code</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} style={e.past ? { opacity: 0.55 } : undefined}>
                <td style={{ whiteSpace: "nowrap" }}>{e.startsAt.replace("T", " ")}</td>
                <td>
                  <strong>{e.title}</strong>
                  <div className="note">
                    {e.city} · {e.venue}
                  </div>
                </td>
                <td>{e.dressCode}</td>
                <td>
                  <span className={`pill ${e.published && !e.past ? "pub" : "draft"}`}>{e.past ? "Past" : e.published ? "Live" : "Hidden"}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="linkish" type="button" onClick={() => setEditing(e)}>
                      Edit
                    </button>
                    <button className="linkish" type="button" disabled={busy} onClick={() => (confirmId === e.id ? remove(e.id!) : setConfirmId(e.id!))}>
                      {confirmId === e.id ? "Confirm delete" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="note">
                  No events yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
