"use client";

import { useState } from "react";
import type { Section, StoryStatus } from "@prisma/client";
import { SECTIONS, slugify } from "@/lib/content";
import { send } from "@/components/admin/client";
import { ImageField } from "@/components/admin/ImageField";

type StoryInput = {
  id?: string;
  title?: string;
  slug?: string;
  dek?: string;
  body?: string;
  section?: Section;
  byline?: string;
  photoCredit?: string;
  coverImageId?: string | null;
  featured?: boolean;
  status?: StoryStatus;
};

export function StoryEditor({ story }: { story: StoryInput }) {
  const [s, setS] = useState({
    title: story.title ?? "",
    slug: story.slug ?? "",
    dek: story.dek ?? "",
    body: story.body ?? "",
    section: story.section ?? ("EVENTS" as Section),
    byline: story.byline ?? "",
    photoCredit: story.photoCredit ?? "",
    coverImageId: story.coverImageId ?? null,
    featured: story.featured ?? false,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(story.slug));
  const [status, setStatus] = useState<StoryStatus>(story.status ?? "DRAFT");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((p) => ({ ...p, [k]: v }));

  async function save(nextStatus: StoryStatus) {
    setBusy(true);
    setMsg(null);
    const payload = { ...s, slug: s.slug || slugify(s.title), status: nextStatus };
    const r = story.id
      ? await send(`/api/admin/stories/${story.id}`, "PATCH", payload)
      : await send<{ id: string }>("/api/admin/stories", "POST", payload);
    setBusy(false);
    if (!r.ok) return setMsg({ kind: "err", text: r.error });
    if (!story.id) {
      window.location.href = `/admin/stories/${(r.data as { id: string }).id}?created=1`;
      return;
    }
    setStatus(nextStatus);
    setMsg({
      kind: "ok",
      text: nextStatus === "PUBLISHED" ? (status === "PUBLISHED" ? "Changes are live." : "Published. It's on the front page now.") : status === "PUBLISHED" ? "Unpublished. It's a draft again." : "Draft saved.",
    });
  }

  async function remove() {
    if (!story.id) return;
    setBusy(true);
    const r = await send(`/api/admin/stories/${story.id}`, "DELETE");
    if (r.ok) window.location.href = "/admin?deleted=1";
    else {
      setBusy(false);
      setMsg({ kind: "err", text: r.error });
    }
  }

  const slug = s.slug || slugify(s.title);
  return (
    <div className="editor">
      <div className="panel">
        <div className="field">
          <label htmlFor="title">Headline</label>
          <input
            id="title"
            value={s.title}
            maxLength={160}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            style={{ fontSize: "1.3rem", fontFamily: "var(--display)" }}
          />
        </div>
        <div className="field">
          <label htmlFor="dek">Standfirst</label>
          <textarea id="dek" rows={2} maxLength={300} value={s.dek} onChange={(e) => set("dek", e.target.value)} />
          <span className="help">One or two sentences under the headline. Also used when the story is shared on WhatsApp and social.</span>
        </div>
        <div className="field">
          <label htmlFor="body">Story</label>
          <textarea id="body" rows={22} value={s.body} onChange={(e) => set("body", e.target.value)} />
          <span className="help">
            Leave a blank line between paragraphs. <code>## Heading</code> for a subheading, <code>&gt; quote</code> for a pull quote, <code>**bold**</code>,{" "}
            <code>*italic*</code>, <code>[link text](https://…)</code>.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div className="panel">
          <div className="row-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span className={`pill ${status === "PUBLISHED" ? "pub" : "draft"}`}>{status === "PUBLISHED" ? "Published" : "Draft"}</span>
            {story.id ? (
              <a href={`/stories/${slug}`} target="_blank" rel="noreferrer" className="linkish">
                {status === "PUBLISHED" ? "View live" : "Preview"}
              </a>
            ) : null}
          </div>
          <button className="btn btn-red" type="button" disabled={busy} onClick={() => save("PUBLISHED")}>
            {status === "PUBLISHED" ? "Update live story" : "Publish"}
          </button>
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => save("DRAFT")}>
            {status === "PUBLISHED" ? "Unpublish (back to draft)" : "Save draft"}
          </button>
          {msg ? (
            <p className={msg.kind === "err" ? "err" : "note"} role={msg.kind === "err" ? "alert" : "status"} style={msg.kind === "ok" ? { color: "var(--ok)", fontWeight: 600 } : undefined}>
              {msg.text}
            </p>
          ) : null}
        </div>
        <div className="panel">
          <div className="field">
            <label htmlFor="section">Section</label>
            <select id="section" value={s.section} onChange={(e) => set("section", e.target.value as Section)}>
              {SECTIONS.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
          <label className="addon" htmlFor="featured">
            <input id="featured" type="checkbox" checked={s.featured} onChange={(e) => set("featured", e.target.checked)} />
            <span>
              Cover story
              <small>Leads the front page. The newest published cover story wins.</small>
            </span>
          </label>
          <div className="field">
            <label htmlFor="byline">Byline</label>
            <input id="byline" value={s.byline} maxLength={80} onChange={(e) => set("byline", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="credit">Photo credit</label>
            <input id="credit" value={s.photoCredit} maxLength={80} placeholder="e.g. Studio Ọ̀ṣọ́" onChange={(e) => set("photoCredit", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="slug">Web address</label>
            <input
              id="slug"
              value={s.slug}
              maxLength={80}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
            <span className="help">/stories/{slug || "…"}</span>
          </div>
        </div>
        <div className="panel">
          <ImageField value={s.coverImageId} onChange={(id) => set("coverImageId", id)} seed={story.id ?? "new"} title={s.title} />
        </div>
        {story.id ? (
          <div className="panel">
            {confirmDelete ? (
              <>
                <p style={{ margin: 0, fontSize: ".9rem" }}>Delete this story for good? This can&apos;t be undone.</p>
                <div className="row-actions">
                  <button className="btn btn-red btn-sm" type="button" disabled={busy} onClick={remove}>
                    Yes, delete
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setConfirmDelete(false)}>
                    Keep it
                  </button>
                </div>
              </>
            ) : (
              <button className="linkish" type="button" onClick={() => setConfirmDelete(true)}>
                Delete story
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
