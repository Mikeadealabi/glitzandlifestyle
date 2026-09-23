"use client";

import { useState } from "react";

const FABRICS = [
  { n: "Wine & Champagne", t: "Damask & lace", c: ["#6E0B1C", "#E9CFAF", "#B08D57"], note: "The colour of the season. Deep wine damask wrapper with a champagne lace blouse reads regal at any hour.", p: ["Nude block heels", "Gold box clutch", "Berry lip, gold lid"] },
  { n: "Crimson & Ivory", t: "Sequin lace", c: ["#C8102E", "#FFFDF5", "#E9CFAF"], note: "Unmissable in photos. Keep the gele ivory so the red lace does the talking.", p: ["Ivory pointed pumps", "Pearl drop earrings", "Red lip, soft brown eye"] },
  { n: "Blush & Rose Gold", t: "Organza & beads", c: ["#F3B7C0", "#C98B6B", "#FFF1EE"], note: "Soft for day weddings. Layered organza catches daylight better than heavy lace.", p: ["Rose gold sandals", "Beaded wristlet", "Glossy pink lip"] },
  { n: "Coral & Gold", t: "Ankara & george", c: ["#E8584F", "#D4AF37", "#7A1E14"], note: "Joyful and loud, made for owambe dancing. Stiff george gele holds the shape all night.", p: ["Gold mules", "Coral bead necklace", "Bronze glow"] },
  { n: "Ruby & Emerald", t: "Aso-oke", c: ["#9B111E", "#0F6B4E", "#E9CFAF"], note: "Hand-woven aso-oke in jewel tones. Best for traditional engagements and chieftaincy events.", p: ["Emerald court shoes", "Coral beads, stacked", "Deep plum lip"] },
  { n: "Pearl & Silver", t: "Swiss voile", c: ["#F5F1EC", "#B9BCC4", "#6E0B1C"], note: "For the all-white brief. A wine-red clutch keeps it from looking washed out.", p: ["Silver slingbacks", "Wine-red clutch", "Dewy skin, nude lip"] },
];

export function AsoEbiStudio() {
  const [i, setI] = useState(0);
  const f = FABRICS[i];
  const [a, b, c] = f.c;
  return (
    <div className="studio">
      <div className="swatches" role="group" aria-label="Colour pairings">
        {FABRICS.map((x, k) => (
          <button key={x.n} className="sw" type="button" aria-pressed={k === i} onClick={() => setI(k)}>
            <span className="chips">
              {x.c.map((col) => (
                <span key={col} style={{ background: col }} />
              ))}
            </span>
            <b>{x.n}</b>
          </button>
        ))}
      </div>
      <div className="fabric-card">
        <div
          className="fabric"
          style={{
            background: `radial-gradient(circle at 70% 30%, rgba(255,255,255,.35), transparent 40%), repeating-radial-gradient(circle at 25% 60%, ${b}55 0 6px, transparent 6px 22px), repeating-linear-gradient(45deg, ${a} 0 14px, color-mix(in srgb, ${a} 82%, ${c}) 14px 28px), ${a}`,
          }}
        />
        <div className="fabric-body">
          <div className="eyebrow">{f.t}</div>
          <h3>{f.n}</h3>
          <p style={{ margin: 0, color: "var(--muted)" }}>{f.note}</p>
          <div className="pairs">
            {["Shoes", "Accessory", "Make-up"].map((h, k) => (
              <div key={h}>
                <b>{h}</b>
                {f.p[k]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
