"use client";

import { useEffect, useState } from "react";
import { Art } from "@/components/Art";

type Look = { id: string; name: string; description: string; coverImageId: string | null; hits: number; misses: number };
type Vote = "hit" | "miss";
const KEY = "gs-votes";

function readVotes(): Record<string, Vote> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function HitOrMiss({ looks: initial }: { looks: Look[] }) {
  const [looks, setLooks] = useState(initial);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setVotes(readVotes()), []);

  async function vote(id: string, v: Vote) {
    setError(null);
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lookId: id, vote: v }),
    }).catch(() => null);
    if (!res?.ok) {
      setError("Your vote didn't go through. Try again in a moment.");
      return;
    }
    const updated: Look = await res.json();
    setLooks((ls) => ls.map((l) => (l.id === id ? { ...l, hits: updated.hits, misses: updated.misses } : l)));
    const next = { ...votes, [id]: v };
    setVotes(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  if (!looks.length) return <p style={{ color: "#d9b3b9" }}>New looks are coming after this weekend&apos;s events.</p>;

  return (
    <>
      <div className="looks">
        {looks.map((l, i) => {
          const v = votes[l.id];
          const total = l.hits + l.misses;
          const pct = total ? Math.round((l.hits / total) * 100) : 0;
          return (
            <article className="look" key={l.id}>
              <Art seed={l.id + "look"} title={l.name} imageId={l.coverImageId} label={`Look ${i + 1}`} />
              <div className="look-body">
                <h3>{l.name}</h3>
                <p>{l.description}</p>
                {v ? (
                  <div className="result">
                    <div className="row">
                      <span>Hit</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <div className="row" style={{ opacity: 0.75 }}>
                      <span>You said {v}</span>
                      <span>{total.toLocaleString()} votes</span>
                    </div>
                  </div>
                ) : (
                  <div className="votes">
                    <button className="hit" type="button" onClick={() => vote(l.id, "hit")}>
                      Hit
                    </button>
                    <button type="button" onClick={() => vote(l.id, "miss")}>
                      Miss
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {error ? <p className="err" role="alert">{error}</p> : null}
    </>
  );
}
