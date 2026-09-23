"use client";

import { useEffect, useRef } from "react";

type Sequin = { x: number; y: number; state: number; flip: number; r: number; j: number };
const RED = [200, 16, 46];
const CHAMP = [233, 207, 175];

/** Flip-sequin panel: swipe right to turn sequins champagne, left to turn them red. */
export function SequinWall() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reset = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seq: Sequin[] = [];
    let W = 0;
    let H = 0;
    let last: { x: number; y: number } | null = null;
    let raf = 0;

    function build() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = W < 340 ? 13 : 15;
      seq = [];
      for (let y = s / 2, row = 0; y < H + s; y += s * 0.86, row++)
        for (let x = row % 2 ? s : s / 2; x < W + s; x += s) {
          const band = Math.abs(x / W - (y / H) * 0.9 - 0.05) < 0.06;
          seq.push({ x, y, state: band ? 1 : 0, flip: band ? 1 : 0, r: s * 0.46, j: Math.random() });
        }
    }

    function draw(ts: number) {
      const tm = ts / 1000;
      const lx = (reduce ? 0.3 : 0.5 + Math.cos(tm * 0.35) * 0.45) * W;
      const ly = (reduce ? 0.3 : 0.4 + Math.sin(tm * 0.5) * 0.35) * H;
      ctx.clearRect(0, 0, W, H);
      for (const q of seq) {
        q.flip += (q.state - q.flip) * (reduce ? 1 : 0.18);
        const sx = Math.abs(Math.cos(q.flip * Math.PI));
        const col = q.flip < 0.5 ? RED : CHAMP;
        const d = Math.hypot(q.x - lx, q.y - ly) / Math.max(W, H);
        const shine = Math.max(0, 1 - d * 2.2) * (0.6 + 0.4 * Math.sin(tm * 3 + q.j * 9));
        const k = 0.55 + shine * 0.7;
        const ch = (v: number) => Math.min(255, v * k + shine * 60) | 0;
        ctx.fillStyle = `rgb(${ch(col[0])},${ch(col[1])},${ch(col[2])})`;
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, Math.max(0.6, q.r * sx), q.r, 0, 0, Math.PI * 2);
        ctx.fill();
        if (shine > 0.55) {
          ctx.fillStyle = `rgba(255,255,255,${(shine - 0.55) * 1.6})`;
          ctx.beginPath();
          ctx.arc(q.x - q.r * 0.3 * sx, q.y - q.r * 0.3, q.r * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    }

    function move(e: PointerEvent) {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (last && Math.abs(x - last.x) > 1) {
        const dir = x > last.x ? 1 : 0;
        for (const q of seq) if ((q.x - x) ** 2 + (q.y - y) ** 2 < 900) q.state = dir;
        if (reduce) draw(0);
      }
      last = { x, y };
    }
    const leave = () => (last = null);

    reset.current = () => {
      build();
      if (reduce) draw(0);
    };
    const ro = new ResizeObserver(() => reset.current());
    ro.observe(cv);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", leave);
    build();
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="stage">
      <div className="arch">
        <canvas ref={canvas} aria-label="Interactive sequin wall. Drag across it to flip the sequins." />
        <div className="caption">
          <span>The Sequin Wall</span>
          <strong>Swipe to flip the sequins</strong>
        </div>
      </div>
      <div className="stage-note">
        <span>Swipe right for champagne, left for red.</span>
        <button type="button" onClick={() => reset.current()}>
          Reset
        </button>
      </div>
    </div>
  );
}
