"use client";

import { useEffect, useMemo, useState } from "react";
import { ADDONS, BASE_HOURS, CITIES, EVENT_KINDS, naira, quote, type EventKindKey } from "@/lib/pricing";

type Done = { ref: string; total: number; tier: string; whatsappUrl: string | null; emailed: boolean };

export function BookingForm() {
  const [kind, setKind] = useState<EventKindKey>("WEDDING");
  const [city, setCity] = useState<string>("Lagos");
  const [hours, setHours] = useState(BASE_HOURS);
  const [addons, setAddons] = useState<string[]>(["reels", "feature"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const q = useMemo(() => quote(kind, city, hours, addons), [kind, city, hours, addons]);

  // "Hosting? Get covered" on a Guestlist event preselects its type.
  useEffect(() => {
    const h = (e: Event) => {
      const k = (e as CustomEvent<string>).detail as EventKindKey;
      if (k in EVENT_KINDS) setKind(k);
    };
    window.addEventListener("gs:book", h);
    return () => window.removeEventListener("gs:book", h);
  }, []);

  const toggle = (id: string) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        city,
        hours,
        addons,
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email") || undefined,
        eventDate: fd.get("eventDate"),
        notes: fd.get("notes") || "",
        website: fd.get("website"),
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) {
      setError(data.error ?? "We couldn't send your request. Check your connection and try again.");
      return;
    }
    setDone(data as Done);
  }

  return (
    <form className="builder" onSubmit={submit}>
      <div className="panel">
        <div className="grid2">
          <div className="field">
            <label htmlFor="evType">Event type</label>
            <select id="evType" value={kind} onChange={(e) => setKind(e.target.value as EventKindKey)}>
              {Object.entries(EVENT_KINDS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="evCity">City</label>
            <select id="evCity" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="hours">Coverage hours: {hours}</label>
          <input type="range" id="hours" min={2} max={12} value={hours} onChange={(e) => setHours(+e.target.value)} />
        </div>
        <div className="addons">
          <label className="addon" htmlFor="x-photo">
            <input type="checkbox" id="x-photo" checked disabled />
            <span>
              Lead photographer + assistant<small>Included</small>
            </span>
          </label>
          {ADDONS.map((a) => (
            <label className="addon" htmlFor={`x-${a.id}`} key={a.id}>
              <input type="checkbox" id={`x-${a.id}`} checked={addons.includes(a.id)} onChange={() => toggle(a.id)} />
              <span>
                {a.label}
                <small>+ {naira(a.price)}</small>
              </span>
            </label>
          ))}
        </div>
        <div className="grid2" style={{ marginTop: 18 }}>
          <div className="field">
            <label htmlFor="bkName">Your name</label>
            <input id="bkName" name="name" required maxLength={80} autoComplete="name" placeholder="e.g. Funmi Adeyemi" />
          </div>
          <div className="field">
            <label htmlFor="bkPhone">WhatsApp number</label>
            <input id="bkPhone" name="phone" required type="tel" autoComplete="tel" placeholder="0803 000 0000" />
          </div>
          <div className="field">
            <label htmlFor="bkEmail">Email (optional)</label>
            <input id="bkEmail" name="email" type="email" autoComplete="email" placeholder="For your copy of the quote" />
          </div>
          <div className="field">
            <label htmlFor="bkDate">Event date</label>
            <input id="bkDate" name="eventDate" type="date" required min={today} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="bkNotes">Anything we should know? (optional)</label>
          <textarea id="bkNotes" name="notes" rows={3} maxLength={1000} placeholder="Venue, guest count, colours, VIPs attending…" />
        </div>
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>
      <aside className="panel quote" aria-live="polite">
        <span className="tier">{q.tier}</span>
        <div className="total">{naira(q.total)}</div>
        <div className="note">Estimated package price</div>
        <ul className="lines">
          {q.lines.map((l) => (
            <li key={l.label}>
              <span>{l.label}</span>
              <span>{l.amount === null ? "incl." : naira(l.amount)}</span>
            </li>
          ))}
        </ul>
        {done ? (
          <div className="ok" role="status">
            <strong>Request {done.ref} received.</strong>
            <span>
              Our events desk will confirm within 24 hours{done.emailed ? " and we've emailed you a copy" : ""}. For a faster reply, send your
              details on WhatsApp now.
            </span>
            {done.whatsappUrl ? (
              <a className="btn btn-wa" href={done.whatsappUrl} target="_blank" rel="noopener noreferrer">
                Send on WhatsApp
              </a>
            ) : null}
          </div>
        ) : (
          <button className="btn btn-red" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Sending…" : "Request coverage"}
          </button>
        )}
        {error ? <p className="err" role="alert">{error}</p> : null}
        <p className="note" style={{ marginTop: 12 }}>
          Final price is confirmed by the events desk after we know your venue and guest count.
        </p>
      </aside>
    </form>
  );
}
