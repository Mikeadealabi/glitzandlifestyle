"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SECTIONS } from "@/lib/content";

export function SiteHeader({ today, activeSection, query }: { today: string; activeSection?: string; query?: string }) {
  const [open, setOpen] = useState(Boolean(query));
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="util">
        <div className="wrap">
          <span>{today}</span>
          <nav aria-label="Utility">
            <Link href="/#book">Advertise with us</Link>
            <Link href="/#book">Submit your event</Link>
            <Link href="/#cover-maker">Be the cover</Link>
          </nav>
        </div>
      </div>
      <header className="mast">
        <div className="wrap">
          <div className="issue">Events · Weddings · Red carpet · Lifestyle</div>
          <Link href="/" className="logo" aria-label="Glitz and Style Magazine, home">
            Glitz<span className="amp">&amp;</span>Style<small>Magazine</small>
          </Link>
          <div className="tag">Showcasing your events and lifestyle</div>
        </div>
      </header>
      <nav className="nav" aria-label="Sections">
        <div className="wrap">
          <div className="nav-links">
            {SECTIONS.map((s) => (
              <Link key={s.slug} href={`/?section=${s.slug}#stories`} aria-current={activeSection === s.slug ? "page" : undefined}>
                {s.label}
              </Link>
            ))}
            <Link href="/#studio">Aso-ebi</Link>
            <Link href="/#guestlist">The Guestlist</Link>
            <Link href="/#book">Get Covered</Link>
          </div>
          <button
            className="search-btn"
            type="button"
            aria-expanded={open}
            aria-controls="searchBar"
            onClick={() => {
              setOpen(!open);
              setTimeout(() => input.current?.focus(), 0);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            Search
          </button>
        </div>
      </nav>
      <div className="search-bar" id="searchBar" hidden={!open}>
        <form className="wrap" action="/" method="get" role="search">
          <input ref={input} name="q" type="search" defaultValue={query} placeholder="Search stories: weddings, gele, Abuja, galas…" aria-label="Search stories" />
          <button className="btn btn-red" type="submit">
            Search
          </button>
        </form>
      </div>
    </>
  );
}
