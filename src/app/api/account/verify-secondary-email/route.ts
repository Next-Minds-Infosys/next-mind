import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import { User } from "@/db";
import { Role } from "@/lib/types";

/** Profile lives at a role-scoped route, not one shared /account/profile. */
function profilePathFor(role: string) {
  return role === Role.INSTRUCTOR ? "/instructor/profile" : "/admin/profile";
}

/**
 * The link mailed by requestSecondaryEmailVerification in
 * src/components/account/actions.ts. Deliberately does not require the
 * clicking browser to be signed in - the random token itself is the proof of
 * control, same as any other email-confirmation link.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    // No user to resolve a role for - /login is the safest generic landing
    // spot (it bounces an already-signed-in visitor to their dashboard).
    const redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("secondaryEmailError", "missing");
    return NextResponse.redirect(redirectTo);
  }

  const hashed = createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    where: { secondaryEmailToken: hashed, secondaryEmailTokenExpires: { [Op.gt]: new Date() } },
  });

  if (!user) {
    const redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("secondaryEmailError", "invalid");
    return NextResponse.redirect(redirectTo);
  }

  await user.update({
    secondaryEmailVerified: true,
    secondaryEmailToken: null,
    secondaryEmailTokenExpires: null,
  });

  const redirectTo = new URL(profilePathFor(user.role), request.url);
  redirectTo.searchParams.set("secondaryEmailVerified", "1");
  return NextResponse.redirect(redirectTo);
}
