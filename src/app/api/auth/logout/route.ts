import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

// A plain form POST, answered with a relative redirect so it works behind any host or proxy.
export async function POST() {
  await endSession();
  return new NextResponse(null, { status: 303, headers: { location: "/admin/login?signedout=1" } });
}
