"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: true; email: string } | { error: string }> {
  // Verify caller is an existing admin
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const { password } = data;

  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with that email already exists." };

  try {
    // Use better-auth's own sign-up flow so the Account row is hashed the
    // way better-auth expects for later sign-ins.
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "ADMIN", emailVerified: true },
    });

    return { success: true, email };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    return { error: msg };
  }
}
