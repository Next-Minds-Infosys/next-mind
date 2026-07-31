"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/db";
import { auth, getSession } from "@/lib/auth";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };
  if (newPassword === currentPassword) {
    return { error: "Choose a password different from the temporary one." };
  }

  try {
    // better-auth verifies the current password itself; it is never compared here.
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    return { error: "That current password is not correct." };
  }

  await User.update({ mustChangePassword: false }, { where: { id: session.user.id } });

  // Redirect from the action rather than returning success and letting the
  // client push. revokeOtherSessions rotates the session, and the new cookie
  // only exists on the response - Next's post-action re-render of this page
  // still reads the old token from the request and would bounce to /login.
  // Redirecting short-circuits that re-render, so the browser navigates with
  // the fresh cookie already set. /account resolves the dashboard by role.
  redirect("/account");
}
