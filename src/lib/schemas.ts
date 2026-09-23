import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #C8102E");

export const StorySchema = z.object({
  title: z.string().trim().min(3, "Add a headline").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Add a web address")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  dek: z.string().trim().max(300).default(""),
  body: z.string().max(60_000).default(""),
  section: z.enum(["EVENTS", "WEDDINGS", "RED_CARPET", "STYLE", "BEAUTY", "LIFESTYLE"]),
  byline: z.string().trim().min(2, "Add a byline").max(80),
  photoCredit: z.string().trim().max(80).default(""),
  coverImageId: z.string().max(40).nullable().default(null),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const EventSchema = z.object({
  title: z.string().trim().min(3, "Add the event name").max(120),
  city: z.string().trim().min(2, "Add the city").max(60),
  venue: z.string().trim().min(2, "Add the venue").max(160),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick the date and start time"),
  kind: z.enum(["WEDDING", "OWAMBE", "GALA", "LAUNCH", "CONCERT"]),
  dressCode: z.string().trim().min(2, "Add the dress code").max(80),
  colorA: hex,
  colorB: hex,
  published: z.boolean().default(true),
});

export const LookSchema = z.object({
  name: z.string().trim().min(2, "Name the look").max(80),
  description: z.string().trim().min(2, "Describe the look").max(200),
  coverImageId: z.string().max(40).nullable().default(null),
  active: z.boolean().default(true),
  position: z.number().int().min(0).max(99).default(0),
});

export const PasswordSchema = z.string().min(10, "Use at least 10 characters").max(200);

/** Event times are entered and shown in Lagos time (WAT, UTC+1, no daylight saving). */
export const lagosInputToDate = (v: string) => new Date(`${v}:00+01:00`);
export const dateToLagosInput = (d: Date) => new Date(d.getTime() + 3600e3).toISOString().slice(0, 16);
