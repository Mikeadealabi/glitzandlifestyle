"use client";

import { useState } from "react";

export function Newsletter() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: new FormData(form).get("email"), website: new FormData(form).get("website") }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      form.reset();
      setMsg("You're on the list. The Guestlist lands every Sunday morning.");
    } else setMsg(data.error ?? "That didn't go through. Check your connection and try again.");
  }

  return (
    <form onSubmit={submit}>
      <input type="email" id="newsEmail" name="email" required placeholder="Your email address" aria-label="Email address" />
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Adding…" : "Subscribe"}
      </button>
      {msg ? <p role="status">{msg}</p> : null}
    </form>
  );
}
