"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { send } from "@/components/admin/client";

type U = { id: string; name: string; email: string; role: Role; isActive: boolean };

function tempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const a = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(a, (n) => chars[n % chars.length]).join("");
}

export function TeamManager({ users, meId }: { users: U[]; meId: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = tempPassword();
    setBusy(true);
    setError(null);
    const r = await send("/api/admin/users", "POST", { name: fd.get("name"), email: fd.get("email"), role: fd.get("role"), password });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setAdding(false);
    setNotice(`Added ${fd.get("email")}. Their temporary password is ${password}. Send it to them privately; they should change it under Your account after signing in.`);
    router.refresh();
  }

  async function update(u: U, patch: Partial<Pick<U, "role" | "isActive">> & { password?: string }) {
    setBusy(true);
    setError(null);
    const r = await send(`/api/admin/users/${u.id}`, "PATCH", patch);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    if (patch.password) setNotice(`New temporary password for ${u.email}: ${patch.password}. They've been signed out everywhere.`);
    else router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {notice ? (
        <div className="flash" role="status" style={{ userSelect: "all" }}>
          {notice}
        </div>
      ) : null}
      {adding ? (
        <form className="panel" onSubmit={add} style={{ display: "grid", gap: 14, maxWidth: 560 }}>
          <h2 style={{ fontSize: "1.5rem" }}>Add a team member</h2>
          <div className="field">
            <label htmlFor="tm-name">Name</label>
            <input id="tm-name" name="name" required maxLength={80} />
          </div>
          <div className="field">
            <label htmlFor="tm-email">Email</label>
            <input id="tm-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="tm-role">Role</label>
            <select id="tm-role" name="role" defaultValue="EDITOR">
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <p className="note" style={{ margin: 0 }}>
            We&apos;ll create a temporary password for you to pass on.
          </p>
          <div className="row-actions">
            <button className="btn btn-red" type="submit" disabled={busy}>
              Add
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button className="btn btn-red" type="button" onClick={() => setAdding(true)}>
            Add team member
          </button>
        </div>
      )}
      {error ? <p className="err" role="alert">{error}</p> : null}
      <div className="table-wrap">
        <table className="list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={u.isActive ? undefined : { opacity: 0.55 }}>
                <td>
                  <strong>{u.name}</strong>
                  {u.id === meId ? <span className="note"> (you)</span> : null}
                  <div className="note">{u.email}</div>
                </td>
                <td>{u.role === "ADMIN" ? "Admin" : "Editor"}</td>
                <td>
                  <span className={`pill ${u.isActive ? "pub" : "draft"}`}>{u.isActive ? "Active" : "Deactivated"}</span>
                </td>
                <td>
                  {u.id === meId ? null : (
                    <div className="row-actions">
                      <button className="linkish" type="button" disabled={busy} onClick={() => update(u, { role: u.role === "ADMIN" ? "EDITOR" : "ADMIN" })}>
                        Make {u.role === "ADMIN" ? "editor" : "admin"}
                      </button>
                      <button className="linkish" type="button" disabled={busy} onClick={() => update(u, { password: tempPassword() })}>
                        Reset password
                      </button>
                      <button className="linkish" type="button" disabled={busy} onClick={() => update(u, { isActive: !u.isActive })}>
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
