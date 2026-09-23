import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { fail, json, rateLimited, sameOrigin, zodMessage } from "@/lib/api";
import { sendEmail } from "@/lib/email";
import { ADDONS, CITIES, EVENT_KINDS, naira, quote, type EventKindKey } from "@/lib/pricing";
import { toWhatsAppNumber, waLink } from "@/lib/whatsapp";

const Body = z.object({
  kind: z.enum(Object.keys(EVENT_KINDS) as [EventKindKey, ...EventKindKey[]]),
  city: z.enum(CITIES),
  hours: z.number().int().min(2).max(12),
  addons: z.array(z.enum(ADDONS.map((a) => a.id) as [string, ...string[]])).max(ADDONS.length),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone: z
    .string()
    .trim()
    .refine((p) => toWhatsAppNumber(p).length >= 10 && toWhatsAppNumber(p).length <= 15, "Enter a phone number we can reach on WhatsApp"),
  email: z.string().trim().email("Enter a valid email, or leave it empty").max(120).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the event date"),
  notes: z.string().trim().max(1000).default(""),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (rateLimited(req, "booking", 5, 10 * 60_000)) return fail("Too many requests. Please wait a few minutes and try again.", 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const b = parsed.data;
  // Bots fill every field; people never see this one. Pretend success, save nothing.
  if (b.website) return json({ ref: "GS-000000", total: 0, tier: "", whatsappUrl: null, emailed: false });

  const eventDate = new Date(`${b.eventDate}T12:00:00+01:00`);
  if (eventDate.getTime() < Date.now() - 24 * 3600e3) return fail("Event date: pick a date that hasn't passed.");

  const q = quote(b.kind, b.city, b.hours, b.addons);
  const ref = "GS-" + randomBytes(3).toString("hex").toUpperCase();
  const booking = await db.booking.create({
    data: {
      ref,
      name: b.name,
      phone: b.phone,
      email: b.email || null,
      kind: b.kind,
      city: b.city,
      eventDate,
      hours: b.hours,
      addons: b.addons,
      notes: b.notes,
      totalNaira: q.total,
      tier: q.tier,
    },
  });

  const when = eventDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const extras = ADDONS.filter((a) => b.addons.includes(a.id)).map((a) => a.label);
  const summary = [
    `Coverage request ${ref}`,
    `${EVENT_KINDS[b.kind].label} in ${b.city}, ${when}`,
    `${b.hours} hours${extras.length ? ` + ${extras.join(", ")}` : ""}`,
    `Estimate: ${naira(q.total)} (${q.tier})`,
  ];

  const teamText = [
    ...summary,
    "",
    `Name: ${b.name}`,
    `Phone / WhatsApp: ${b.phone}  →  https://wa.me/${toWhatsAppNumber(b.phone)}`,
    `Email: ${b.email || "not given"}`,
    b.notes ? `Notes: ${b.notes}` : "",
    "",
    `Open in the inbox: ${env.SITE_URL}/admin/bookings#${booking.id}`,
  ].join("\n");
  const tasks: Promise<boolean>[] = [];
  if (env.NOTIFY_EMAIL.length)
    tasks.push(sendEmail({ to: env.NOTIFY_EMAIL, subject: `New booking ${ref}: ${EVENT_KINDS[b.kind].label}, ${b.city}`, text: teamText, replyTo: b.email }));
  else console.log(`[booking] ${teamText}`);
  if (b.email)
    tasks.push(
      sendEmail({
        to: b.email,
        subject: `We've got your request, ${b.name.split(" ")[0]} (${ref})`,
        text: [
          `Thank you for choosing Glitz & Style.`,
          "",
          ...summary,
          "",
          "Our events desk will confirm availability and the final price within 24 hours.",
          env.WHATSAPP_NUMBER ? `Prefer WhatsApp? Message us: https://wa.me/${env.WHATSAPP_NUMBER}` : "",
        ].join("\n"),
      }),
    );
  const results = await Promise.all(tasks);
  const emailed = Boolean(b.email) && results[results.length - 1] === true;

  const whatsappUrl = env.WHATSAPP_NUMBER
    ? waLink(env.WHATSAPP_NUMBER, `Hello Glitz & Style! I just requested coverage.\n\n${summary.join("\n")}\n\nName: ${b.name}`)
    : null;

  return json({ ref, total: q.total, tier: q.tier, whatsappUrl, emailed }, 201);
}
