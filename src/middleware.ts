import { NextResponse, type NextRequest } from "next/server";

// Cheap first gate: no session cookie, no admin pages. Each page and API route
// still validates the session against the database.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!req.cookies.get("gs_session")) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
