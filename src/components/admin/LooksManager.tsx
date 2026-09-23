"use client";

import { useState } from "react";
import { send } from "@/components/admin/client";
import { ImageField } from "@/components/admin/ImageField";

type Look = { id?: string; name: string; description: string; coverImageId: string | null; active: boolean; position: number; hits?: number; misses?: number };
const blank: Look = { name: "", description: "", coverImageId: null, active: true, position: 0 };

export function LooksManager({ looks }: { looks: Look[] }) {
  const [editing, setEditing] = useState<Look | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Look>(k: K, v: Look[K]) => setEditing((p) => (p ? { ...p, [k]: v } : p));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    const { id, hits: _h, misses: _m, ...body } = editing;
    const r = id ? await send(`/api/admin/looks/${id}`, "PATCH", body) : await send("/api/admin/looks", "POST", body);
    if (r.ok) window.location.reload();
    else {
      setError(r.error);
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const r = await send(`/api/admin/looks/${id}`, "DELETE");
    if (r.ok) window.location.reload();
    else {
      setError(r.error);
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {editing ? (
        <form className="panel editor" onSubmit={save} style={{ gridTemplateColumns: "1fr 280px" }}>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <h2 style={{ fontSize: "1.5rem" }}>{editing.id ? "Edit look" : "New look"}</h2>
            <div className="field">
              <label htmlFor="lk-name">Name of the look</label>
              <input id="lk-name" required value={editing.name} placeholder="The Crimson Cape" onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="lk-desc">One-line description</label>
              <input id="lk-desc" required value={editing.description} maxLength={200} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid2">
              <div className="field">
                <label htmlFor="lk-pos">Position (0 shows first)</label>
                <input id="lk-pos" type="number" min={0} max={99} value={editing.position} onChange={(e) => set("position", Number(e.target.value) || 0)} />
              </div>
              <label className="addon" htmlFor="lk-active" style={{ alignSelf: "end" }}>
                <input id="lk-active" type="checkbox" checked={editing.active} onChange={(e) => set("active", e.target.checked)} />
                <span>Open for voting</span>
              </label>
            </div>
            {error ? <p className="err" role="alert">{error}</p> : null}
            <div className="row-actions">
              <button className="btn btn-red" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save look"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
          <ImageField value={editing.coverImageId} onChange={(id) => set("coverImageId", id)} seed={(editing.id ?? "new") + "look"} title={editing.name} label="Photo of the look" />
        </form>
      ) : (
        <div>
          <button className="btn btn-red" type="button" onClick={() => setEditing({ ...blank })}>
            Add look
          </button>
          {error ? <p className="err" role="alert">{error}</p> : null}
        </div>
      )}
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>Look</th>
              <th>Votes</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {looks.map((l) => {
              const total = (l.hits ?? 0) + (l.misses ?? 0);
              return (
                <tr key={l.id}>
                  <td>
                    <strong>{l.name}</strong>
                    <div className="note">{l.description}</div>
                  </td>
                  <td style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {total ? `${Math.round(((l.hits ?? 0) / total) * 100)}% hit · ${total}` : "No votes yet"}
                  </td>
                  <td>
                    <span className={`pill ${l.active ? "pub" : "draft"}`}>{l.active ? `Live · #${l.position}` : "Retired"}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="linkish" type="button" onClick={() => setEditing(l)}>
                        Edit
                      </button>
                      <button className="linkish" type="button" disabled={busy} onClick={() => (confirmId === l.id ? remove(l.id!) : setConfirmId(l.id!))}>
                        {confirmId === l.id ? "Confirm delete" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
