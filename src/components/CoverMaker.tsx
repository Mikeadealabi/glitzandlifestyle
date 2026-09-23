"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const OCCASIONS = ["Birthday Special", "Wedding Edition", "Owambe Issue", "Graduation Glow", "Launch Night"];

/** Reader-made covers. Everything happens in the browser; the photo is never uploaded. */
export function CoverMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [name, setName] = useState("Adaeze at 40");
  const [line, setLine] = useState("Forty, fabulous & fully sequinned");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);

  const draw = useCallback(() => {
    const cx = canvas.current?.getContext("2d");
    if (!cx) return;
    const w = 600;
    const h = 780;
    const display = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "Georgia";
    const body = getComputedStyle(document.body).getPropertyValue("--font-body").trim() || "sans-serif";
    cx.clearRect(0, 0, w, h);
    if (img) {
      const s = Math.max(w / img.width, h / img.height);
      cx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
    } else {
      const g = cx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#C8102E");
      g.addColorStop(1, "#3D0610");
      cx.fillStyle = g;
      cx.fillRect(0, 0, w, h);
      for (let y = 8, r = 0; y < h; y += 15, r++)
        for (let x = r % 2 ? 15 : 7; x < w; x += 16) {
          const d = Math.hypot(x - 420, y - 260) / 500;
          cx.fillStyle = `rgba(255,${200 + ((x * y) % 50)},190,${Math.max(0.04, 0.5 - d * 0.5)})`;
          cx.beginPath();
          cx.arc(x, y, 5.5, 0, 7);
          cx.fill();
        }
      cx.fillStyle = "rgba(255,255,255,.08)";
      cx.font = `italic 520px ${display}, Georgia, serif`;
      cx.textAlign = "center";
      cx.fillText("&", 330, 690);
    }
    const v = cx.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, "rgba(20,4,8,.55)");
    v.addColorStop(0.28, "rgba(20,4,8,0)");
    v.addColorStop(0.6, "rgba(20,4,8,0)");
    v.addColorStop(1, "rgba(20,4,8,.85)");
    cx.fillStyle = v;
    cx.fillRect(0, 0, w, h);
    cx.textAlign = "center";
    cx.fillStyle = "#fff";
    cx.font = `800 104px ${display}, Georgia, serif`;
    cx.fillText("Glitz", 190, 112);
    cx.fillStyle = "#FF8A9C";
    cx.font = `italic 400 104px ${display}, Georgia, serif`;
    cx.fillText("&", 318, 112);
    cx.fillStyle = "#fff";
    cx.font = `800 104px ${display}, Georgia, serif`;
    cx.fillText("Style", 452, 112);
    cx.font = `600 15px ${body}, sans-serif`;
    cx.fillStyle = "rgba(255,255,255,.85)";
    cx.fillText(occasion.toUpperCase().split("").join(String.fromCharCode(8202)), 300, 146);
    cx.textAlign = "left";
    cx.font = `700 13px ${body}, sans-serif`;
    ["EXCLUSIVE", "THE GUESTLIST", "EVERY LOOK", "FROM THE NIGHT"].forEach((s, i) => {
      cx.fillStyle = i % 2 ? "#fff" : "#FF8A9C";
      cx.fillText(s, 32, 230 + i * 22);
    });
    cx.fillStyle = "#C8102E";
    cx.fillRect(32, h - 230, 120, 6);
    cx.fillStyle = "#fff";
    cx.font = `italic 600 58px ${display}, Georgia, serif`;
    cx.fillText(name || "Your name", 32, h - 170, 536);
    cx.font = `500 26px ${body}, sans-serif`;
    cx.fillStyle = "rgba(255,255,255,.92)";
    const words = line.split(" ");
    let cur = "";
    let row = 0;
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (cx.measureText(test).width > 420 && cur) {
        cx.fillText(cur, 32, h - 126 + row++ * 32);
        cur = word;
      } else cur = test;
    }
    cx.fillText(cur, 32, h - 126 + row * 32);
    cx.fillStyle = "#fff";
    cx.fillRect(w - 112, h - 78, 80, 50);
    cx.fillStyle = "#111";
    for (let i = 0, x = w - 106; x < w - 38; i++) {
      const bw = 1 + ((i * 7) % 3);
      cx.fillRect(x, h - 72, bw, 32);
      x += bw + 1 + (i % 2);
    }
  }, [img, name, line, occasion]);

  useEffect(() => {
    draw();
    document.fonts?.ready.then(draw);
  }, [draw]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = URL.createObjectURL(f);
    setFileName(f.name);
  }

  return (
    <div className="wrap coverwrap">
      <div>
        <div className="eyebrow">Be the cover</div>
        <h2 style={{ fontSize: "clamp(2rem,4.4vw,3.2rem)", margin: "10px 0 14px" }}>
          Your big night, <em style={{ color: "var(--crimson)" }}>on our cover</em>
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "48ch", margin: "0 0 22px" }}>
          Birthday, wedding, graduation or launch. Add a photo and your headline, and we set it as a Glitz &amp; Style cover to share with your guests.
        </p>
        <div className="form">
          <label className="upload" htmlFor="photo">
            <input type="file" id="photo" accept="image/*" onChange={pick} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: "var(--crimson)", flex: "none" }}>
              <rect x="3" y="5" width="18" height="15" rx="2" />
              <circle cx="12" cy="12.5" r="3.5" />
              <path d="M8 5l1.5-2h5L16 5" />
            </svg>
            <span>
              <b>{fileName ? "Photo added" : "Add your photo"}</b>
              <br />
              <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                {fileName ? `${fileName}. Tap to change.` : "Portrait shots work best. It stays on your device."}
              </span>
            </span>
          </label>
          <div className="field">
            <label htmlFor="cvName">Cover star</label>
            <input id="cvName" value={name} maxLength={28} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cvLine">Headline</label>
            <input id="cvLine" value={line} maxLength={44} onChange={(e) => setLine(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cvEvent">Occasion</label>
            <select id="cvEvent" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {OCCASIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="cv">
        <canvas id="cover" ref={canvas} width={600} height={780} aria-label="Preview of your magazine cover" />
        <p className="hint">Right-click or long-press the cover to save it, then share it with your guests.</p>
      </div>
    </div>
  );
}
