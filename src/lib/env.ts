import "server-only";

/** Read at call time so a missing optional value never breaks the build. */
export const env = {
  get SITE_URL() {
    return (process.env.SITE_URL || "http://localhost:3020").replace(/\/$/, "");
  },
  get WHATSAPP_NUMBER() {
    return (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
  },
  get RESEND_API_KEY() {
    return process.env.RESEND_API_KEY || "";
  },
  get EMAIL_FROM() {
    return process.env.EMAIL_FROM || "Glitz & Style <onboarding@resend.dev>";
  },
  get NOTIFY_EMAIL() {
    return (process.env.NOTIFY_EMAIL || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};
