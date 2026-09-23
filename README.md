# Glitz & Style Magazine

Events and lifestyle magazine site: stories, the Guestlist events calendar, Hit or Miss red-carpet voting, the aso-ebi colour studio, a reader cover maker, and event-coverage bookings that land in an admin inbox, email the desk and hand off to WhatsApp.

Next.js 15 · Prisma · Postgres. No other services are required; email (Resend) is optional.

## Run locally

Needs Node 20+ and Docker Desktop running.

```bash
npm install
npm run dev          # starts Postgres in Docker (port 5436), syncs the schema, seeds if empty
```

Open http://localhost:3020. The editor area is at http://localhost:3020/admin.

Sample logins from the seed (local only):

| Email | Role | Password |
| --- | --- | --- |
| admin@glitzandstyle.local | Admin | `GlitzAndStyle!2026` |
| editor@glitzandstyle.local | Editor | `GlitzAndStyle!2026` |

`npm run setup` re-seeds the sample content. The seed refuses to run against a non-local database.

## What editors can do (`/admin`)

- **Stories**: write in Markdown, add a cover photo (resized in the browser, stored in Postgres), save drafts, preview, publish, unpublish, and mark one as the cover story.
- **Guestlist events**: date/time in Lagos time, venue, dress code and its two colours. Past events drop off the front page on their own.
- **Hit or Miss looks**: the first three live looks show on the front page, and vote counts are kept.
- **Bookings**: every coverage request, with one-tap WhatsApp and email replies and a status (New, Contacted, Confirmed, Declined).
- **Team** (admins only): add editors with a temporary password, reset passwords, change roles, deactivate. Changes sign that person out right away.
- **Newsletter**: admins can download sign-ups as CSV from the Stories page.

## How a booking flows

1. The reader builds a package. The price shown is a preview; **the server recalculates it** from `src/lib/pricing.ts`, so it can't be changed in the browser.
2. The booking is saved and gets a reference like `GS-3F9A1C`.
3. The desk gets an email at `NOTIFY_EMAIL`, and the reader gets a copy if they gave an email.
4. The reader sees a **Send on WhatsApp** button that opens a chat with `WHATSAPP_NUMBER`, with the booking details already filled in.
5. In `/admin/bookings`, the desk replies on WhatsApp in one tap and updates the status.

Prices and add-ons live in `src/lib/pricing.ts`. They are placeholder figures until the events desk confirms real rates.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `SITE_URL` | yes in production | Public origin, used in emails and share links |
| `WHATSAPP_NUMBER` | yes | Events desk WhatsApp, digits only, e.g. `2348012345678` |
| `RESEND_API_KEY` | no | Without it, emails are printed to the server log instead of sent |
| `EMAIL_FROM` | with Resend | A sender on a domain verified in Resend |
| `NOTIFY_EMAIL` | recommended | Where booking alerts go (comma-separated) |

## Deploy (Netlify + hosted Postgres)

1. Create a Postgres database (Neon or Supabase). For serverless, use the **pooled** connection string with `?pgbouncer=true&connection_limit=1`.
2. From your machine, create the tables: `DATABASE_URL="<direct connection string>" npx prisma db push`.
3. Create the first admin: `DATABASE_URL="<direct connection string>" npm run admin:create -- you@example.com "a-long-password" ADMIN "Your Name"`.
4. `netlify sites:create`, then set the variables above, scoped to **Functions/Runtime** as well as Builds.
5. `netlify deploy --build --prod`, then check `/api/health`.

Do not run the seed against production.

## Notes

- Uploaded photos are stored in the database and cached by browsers for a year. That's fine for a magazine's volume; move them to object storage if uploads grow into the thousands.
- Replacing a cover photo leaves the old image row in place (no clean-up job yet).
- Admin changes go through API route handlers (`src/app/api/admin`), not Server Actions, and every one checks the session, role and request origin.
- Public forms have a honeypot field and a simple rate limit. The limit counts per server instance, so on serverless it is best-effort.
