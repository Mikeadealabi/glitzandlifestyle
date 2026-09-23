const PALETTES = [
  ["#C8102E", "#F8DDE0", "#6E0B1C"],
  ["#E9CFAF", "#C8102E", "#2A0A10"],
  ["#6E0B1C", "#E08C97", "#FFF1EE"],
  ["#F3B7C0", "#C8102E", "#8C1A2B"],
  ["#2A0A10", "#C8102E", "#E9CFAF"],
  ["#FFE3E6", "#E08C97", "#6E0B1C"],
];

function seedOf(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * A story or look picture. Uses the uploaded photo when there is one, otherwise a
 * generated red-and-blush duotone with the title's initial, so a story never shows a
 * broken or empty frame.
 */
export function Art({ seed, title, imageId, label, priority }: { seed: string; title: string; imageId?: string | null; label?: string; priority?: boolean }) {
  const i = seedOf(seed);
  const [a, b, c] = PALETTES[i % PALETTES.length];
  const x = 20 + (i % 60);
  const y = 15 + ((i >> 3) % 55);
  const style = imageId
    ? undefined
    : {
        background: `radial-gradient(circle at ${x}% ${y}%, ${b} 0 18%, transparent 46%), radial-gradient(ellipse at ${100 - x}% 100%, ${c} 0 30%, transparent 70%), linear-gradient(${120 + (i % 180)}deg, ${a}, ${c})`,
      };
  const glyph = title.replace(/^[^A-Za-z0-9]+/, "").charAt(0).toUpperCase() || "&";
  return (
    <div className="art" style={style}>
      {imageId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/images/${imageId}`} alt="" loading={priority ? "eager" : "lazy"} />
      ) : (
        <span className="glyph" aria-hidden="true">
          {glyph}
        </span>
      )}
      {label ? <span className="sec">{label}</span> : null}
    </div>
  );
}
