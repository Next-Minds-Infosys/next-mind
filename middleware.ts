import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Already authenticated → send away from login page
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Unauthenticated → redirect to login, preserving the intended destination
  if (!sessionCookie && (pathname.startsWith("/admin") || pathname.startsWith("/account"))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Include /login so we can redirect authenticated users away from it
  matcher: ["/login", "/admin/:path*", "/account/:path*"],
};
