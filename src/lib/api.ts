import "server-only";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import type { ZodError } from "zod";
import { currentUser, type SessionUser } from "@/lib/auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export function zodMessage(err: ZodError): string {
  const i = err.issues[0];
  return i ? `${i.path.join(".") || "Form"}: ${i.message}` : "Check the form and try again.";
}

/** Reject cross-site writes: the Origin header must match the host serving the request. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // some same-origin requests omit it; the SameSite=Lax cookie still applies
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

type Guarded = { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse };

/** For admin API routes: origin, session and role checked in one place. */
export async function guard(req: Request, role?: Role): Promise<Guarded> {
  if (!sameOrigin(req)) return { error: fail("Cross-site request blocked.", 403) };
  const user = await currentUser();
  if (!user) return { error: fail("Your session has ended. Sign in again.", 401) };
  if (role === "ADMIN" && user.role !== "ADMIN") return { error: fail("Only admins can do that.", 403) };
  return { user };
}

/** Best-effort limiter for public forms (each serverless instance keeps its own window). */
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, key: string, max: number, windowMs: number): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > max;
}
