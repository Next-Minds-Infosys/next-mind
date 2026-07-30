import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = ["/admin", "/account", "/instructor", "/student"];

/**
 * Cheap first pass only. This runs on the edge and deliberately does not read
 * the user's role - that would need a database round-trip on every request.
 * It only bounces anonymous visitors to the login page.
 *
 * Role enforcement is server-side in src/lib/access.ts, called by each route
 * group's layout. A signed-in STUDENT hitting /admin gets past this middleware
 * and is stopped there.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Deliberately NOT redirecting away from /login here. This can only see that
  // a cookie exists, not that it is still valid, and a stale cookie made the two
  // rules below fight each other: /login -> /account -> requireUser finds no
  // session -> /login, forever. The login page does that redirect itself with a
  // real session check (src/app/(public)/login/page.tsx).
  // Unauthenticated → login, preserving the intended destination
  if (!sessionCookie && PROTECTED.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
