"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { User } from "@/db";

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: true; email: string } | { error: string }> {
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

  const existing = await User.findOne({ where: { email } });
  if (existing) return { error: "A user with that email already exists." };

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    await User.update({ role: "ADMIN", emailVerified: true }, { where: { id: result.user.id } });

    return { success: true, email };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    return { error: msg };
  }
}
