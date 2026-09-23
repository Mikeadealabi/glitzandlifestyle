// Shared by the booking form (live estimate) and the API (authoritative total).
// The server always recomputes; the figure in the browser is only a preview.

export const EVENT_KINDS = {
  WEDDING: { label: "Wedding", base: 850_000 },
  OWAMBE: { label: "Birthday / Owambe", base: 450_000 },
  GALA: { label: "Corporate gala / awards", base: 1_200_000 },
  LAUNCH: { label: "Product or brand launch", base: 900_000 },
  CONCERT: { label: "Concert / show", base: 1_000_000 },
} as const;
export type EventKindKey = keyof typeof EVENT_KINDS;

export const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Elsewhere in Nigeria", "Outside Nigeria"] as const;
const CITY_MULT: Record<string, number> = { Lagos: 1, "Outside Nigeria": 1.45 };

export const ADDONS = [
  { id: "video", label: "Cinematic highlight film", price: 350_000 },
  { id: "reels", label: "Same-night Instagram & TikTok reels", price: 180_000 },
  { id: "host", label: "Red-carpet host & interviews", price: 250_000 },
  { id: "booth", label: "360° glam booth", price: 220_000 },
  { id: "feature", label: "Full magazine feature (print + web)", price: 400_000 },
  { id: "cover", label: "Cover placement, Owambe issue", price: 950_000 },
  { id: "live", label: "Live stream to YouTube", price: 300_000 },
] as const;

export const BASE_HOURS = 6;
export const HOUR_RATE = 65_000;

export type Quote = { lines: { label: string; amount: number | null }[]; total: number; tier: string };

export function quote(kind: EventKindKey, city: string, hours: number, addons: readonly string[]): Quote {
  const mult = CITY_MULT[city] ?? 1.12;
  const lines: Quote["lines"] = [
    {
      label: `${EVENT_KINDS[kind].label} base (${BASE_HOURS} hrs, lead photographer)`,
      amount: Math.round(EVENT_KINDS[kind].base * mult),
    },
  ];
  if (hours !== BASE_HOURS)
    lines.push({
      label: `${hours > BASE_HOURS ? "Extra" : "Fewer"} hours (${Math.abs(hours - BASE_HOURS)})`,
      amount: (hours - BASE_HOURS) * HOUR_RATE,
    });
  for (const a of ADDONS) if (addons.includes(a.id)) lines.push({ label: a.label, amount: a.price });
  if (mult !== 1) lines.push({ label: "Travel & logistics", amount: null });
  const total = lines.reduce((s, l) => s + (l.amount ?? 0), 0);
  const tier = total >= 3_000_000 ? "Platinum cover feature" : total >= 1_500_000 ? "Gold feature" : "Silver spotlight";
  return { lines, total, tier };
}

export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
