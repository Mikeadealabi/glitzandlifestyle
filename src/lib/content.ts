import type { Section } from "@prisma/client";

export const SECTIONS: { key: Section; slug: string; label: string }[] = [
  { key: "EVENTS", slug: "events", label: "Events" },
  { key: "WEDDINGS", slug: "weddings", label: "Weddings" },
  { key: "RED_CARPET", slug: "red-carpet", label: "Red Carpet" },
  { key: "STYLE", slug: "style", label: "Style" },
  { key: "BEAUTY", slug: "beauty", label: "Beauty" },
  { key: "LIFESTYLE", slug: "lifestyle", label: "Lifestyle" },
];
export const sectionLabel = (k: Section) => SECTIONS.find((s) => s.key === k)?.label ?? k;
export const sectionBySlug = (slug?: string) => SECTIONS.find((s) => s.slug === slug);

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const imageUrl = (id?: string | null) => (id ? `/api/images/${id}` : null);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
