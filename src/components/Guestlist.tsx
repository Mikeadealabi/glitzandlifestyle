"use client";

import { useState } from "react";

type Ev = { id: string; title: string; city: string; venue: string; day: string; month: string; time: string; kind: string; dressCode: string; colorA: string; colorB: string };

export function Guestlist({ events }: { events: Ev[] }) {
  const cities = ["All", ...Array.from(new Set(events.map((e) => e.city)))];
  const [city, setCity] = useState("All");
  const shown = events.filter((e) => city === "All" || e.city === city);

  function getCovered(kind: string) {
    window.dispatchEvent(new CustomEvent("gs:book", { detail: kind }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <div className="sec-head">
        <div>
          <div className="eyebrow">The Guestlist</div>
          <h2>
            Where to be <em>seen</em> next
          </h2>
          <p>Galas, weddings, launches and owambes across the continent, with the dress code so you arrive right.</p>
        </div>
        {events.length ? (
          <div className="tabs" role="group" aria-label="Filter by city">
            {cities.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={c === city} onClick={() => setCity(c)}>
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="events">
        {shown.length === 0 ? <p className="empty">No upcoming events listed yet. Hosting one? Tell us below.</p> : null}
        {shown.map((e) => (
          <div className="event" key={e.id}>
            <div className="date">
              <b>{e.day}</b>
              <span>{e.month}</span>
            </div>
            <div>
              <h3>{e.title}</h3>
              <div className="ev-meta">
                <span>{e.city}</span>
                <span>{e.venue}</span>
                <span>{e.time}</span>
              </div>
              <span className="dress">
                <i style={{ background: e.colorA }} />
                <i style={{ background: e.colorB }} />
                {e.dressCode}
              </span>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => getCovered(e.kind)}>
              Hosting? Get covered
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
