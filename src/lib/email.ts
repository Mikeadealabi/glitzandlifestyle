import "server-only";
import { env } from "@/lib/env";

type Mail = { to: string | string[]; subject: string; text: string; replyTo?: string };

/**
 * Sends through Resend when RESEND_API_KEY is set, otherwise logs to the server
 * console so every flow works locally. Never throws: a failed email must not
 * lose a booking that is already saved.
 */
export async function sendEmail({ to, subject, text, replyTo }: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email:console] to=${[to].flat().join(",")} subject=${JSON.stringify(subject)}\n${text}\n`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status} ${await res.text().catch(() => "")}`);
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}
