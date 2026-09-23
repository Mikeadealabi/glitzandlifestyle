"use client";

import { useState } from "react";
import { send } from "@/components/admin/client";

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("next") !== fd.get("confirm")) return setMsg({ ok: false, text: "The two new passwords don't match." });
    setBusy(true);
    const r = await send("/api/admin/account", "POST", { current: fd.get("current"), next: fd.get("next") });
    setBusy(false);
    if (r.ok) {
      form.reset();
      setMsg({ ok: true, text: "Password changed. Other devices have been signed out." });
    } else setMsg({ ok: false, text: r.error });
  }

  return (
    <form className="panel" onSubmit={submit} style={{ display: "grid", gap: 14, maxWidth: 460 }}>
      <h2 style={{ fontSize: "1.5rem" }}>Change password</h2>
      <div className="field">
        <label htmlFor="current">Current password</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" />
      </div>
      <div className="field">
        <label htmlFor="next">New password</label>
        <input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" />
        <span className="help">At least 10 characters.</span>
      </div>
      <div className="field">
        <label htmlFor="confirm">New password again</label>
        <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      {msg ? (
        <p className={msg.ok ? "note" : "err"} role={msg.ok ? "status" : "alert"} style={msg.ok ? { color: "var(--ok)", fontWeight: 600, margin: 0 } : undefined}>
          {msg.text}
        </p>
      ) : null}
      <button className="btn btn-red" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
