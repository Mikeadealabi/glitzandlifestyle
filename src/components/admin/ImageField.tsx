"use client";

import { useState } from "react";
import { Art } from "@/components/Art";

const MAX_EDGE = 1800;

/** Shrink a photo in the browser so uploads stay small (a phone photo goes from ~5 MB to ~300 KB). */
async function resize(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (blob && blob.type === "image/webp") return { blob, width, height };
  // Older Safari can't encode WebP; JPEG everywhere.
  const jpg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!jpg) throw new Error("encode");
  return { blob: jpg, width, height };
}

export function ImageField({ value, onChange, seed, title, label = "Cover photo" }: { value: string | null; onChange: (id: string | null) => void; seed: string; title: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose a photo (JPG, PNG, WebP or HEIC).");
    setBusy(true);
    setError(null);
    try {
      const { blob, width, height } = await resize(file);
      const fd = new FormData();
      fd.append("file", blob, "cover");
      fd.append("width", String(width));
      fd.append("height", String(height));
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "upload");
      onChange(data.id);
    } catch (err) {
      setError(err instanceof Error && err.message !== "upload" && err.message !== "encode" ? err.message : "That photo couldn't be uploaded. Try a JPG or PNG.");
    }
    setBusy(false);
  }

  return (
    <div className="cover-pick">
      <span className="label">{label}</span>
      <Art seed={seed} title={title || "&"} imageId={value} />
      <div className="row-actions">
        <label className="btn btn-ghost btn-sm" style={{ position: "relative" }}>
          {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="sr-only" />
        </label>
        {value ? (
          <button type="button" className="linkish" onClick={() => onChange(null)}>
            Remove
          </button>
        ) : null}
      </div>
      {!value ? <span className="note">No photo yet: the site shows a red duotone with the title&apos;s first letter.</span> : null}
      {error ? <p className="err" role="alert">{error}</p> : null}
    </div>
  );
}
