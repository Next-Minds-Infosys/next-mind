"use server";

import { revalidatePath } from "next/cache";
import { Batch, BatchStudent, Invoice, Message, Submission, User } from "@/db";
import { sequelize } from "@/db/sequelize";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { createUserSchema, parseInput, roleSchema, updateUserSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { hashPassword } from "better-auth/crypto";

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

  const parsed = parseInput(roleSchema, role);
  if (!parsed.success) return { error: parsed.error };

  // You cannot change your own role - otherwise an admin can lock themselves
  // out with one mis-click and no way back short of SQL.
  if (userId === session.user.id) {
    return { error: "You cannot change your own role." };
  }

  const target = await User.findByPk(userId);
  if (!target) return { error: "User not found." };

  // Never leave the system without an admin.
  if (target.role === Role.ADMIN && parsed.data !== Role.ADMIN) {
    const admins = await User.count({ where: { role: Role.ADMIN } });
    if (admins <= 1) return { error: "This is the last admin - promote someone else first." };
  }

  await target.update({ role: parsed.data });
  revalidatePath("/admin/users");
  return { success: true };
}


/**
 * better-auth's internals. `$context` is not in the public typings, so it is
 * narrowed to just the two calls used here rather than cast to `any`.
 */
interface AuthContext {
  password: { hash: (p: string) => Promise<string> };
  internalAdapter: {
    createUser: (d: {
      email: string;
      name: string;
      emailVerified: boolean;
    }) => Promise<{ id: string }>;
    createAccount: (d: {
      userId: string;
      providerId: string;
      accountId: string;
      password: string;
    }) => Promise<{ id: string }>;
  };
}

const authContext = () =>
  (auth as unknown as { $context: Promise<AuthContext> }).$context;

/** Ambiguous characters (0/O, 1/l/I) are excluded - these get read aloud and retyped. */
function generatePassword(length = 14) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export type CreateUserResult =
  | { success: true; email: string; delivery: "email"; emailed: true }
  // The password is only ever returned for hand-off, or when the email failed
  // and it would otherwise be lost.
  | { success: true; email: string; delivery: "hand"; password: string }
  | { success: true; email: string; delivery: "email"; emailed: false; password: string; emailError: string }
  | { error: string };

/**
 * Creates an account on the user's behalf and returns the generated password
 * once. It is stored hashed, so this is the only moment it can be shown - the
 * caller must copy it or have it emailed.
 */
export async function createUser(data: unknown): Promise<CreateUserResult> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

  const parsed = parseInput(createUserSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const { name, email, role, delivery } = parsed.data;

  if (await User.findOne({ where: { email } })) {
    return { error: "An account with that email already exists." };
  }

  const password = generatePassword();

  let createdId: string;
  try {
    // Deliberately NOT auth.api.signUpEmail. That endpoint signs the new user
    // in and returns a Set-Cookie; since the nextCookies() plugin now forwards
    // cookies from server actions, it replaced the acting admin's session with
    // the new account's - the admin was silently logged in as the person they
    // had just created, and bounced to the forced password-change screen.
    // internalAdapter writes the same rows without touching sessions.
    const ctx = await authContext();
    const hash = await ctx.password.hash(password);
    const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true });
    await ctx.internalAdapter.createAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
    createdId = user.id;
  } catch {
    return { error: "Could not create the account. The email may already be registered." };
  }

  // Role is applied here rather than at creation: it is `input: false` on the
  // auth model, which is what stops a visitor self-assigning one.
  // The password has been seen by an admin (and possibly sat in an inbox), so
  // it is compromised by definition - force a reset before first real use.
  await User.update(
    { role, emailVerified: true, mustChangePassword: true },
    { where: { id: createdId } },
  );

  revalidatePath("/admin/users");

  if (delivery === "hand") {
    // Never mailed, so the admin must read it off the screen now.
    return { success: true, email, delivery: "hand", password };
  }

  {
    try {
      await sendMail({
        to: email,
        subject: "Your Next Minds account",
        html: `
          <h2>Welcome to Next Minds</h2>
          <p>Hi ${name}, an account has been created for you.</p>
          <table cellpadding="8" style="border-collapse:collapse">
            <tr><td><strong>Email</strong></td><td>${email}</td></tr>
            <tr><td><strong>Temporary password</strong></td><td><code>${password}</code></td></tr>
            <tr><td><strong>Role</strong></td><td>${role}</td></tr>
          </table>
          <p>Sign in at <a href="${process.env.BETTER_AUTH_URL ?? ""}/login">${process.env.BETTER_AUTH_URL ?? "the portal"}/login</a>
          and change your password.</p>
        `,
      });
      // Delivered. Deliberately not returned to the browser - leaving it on
      // screen after mailing it doubles the number of places it exists.
      return { success: true, email, delivery: "email", emailed: true };
    } catch (e) {
      // The account exists but nothing was delivered, so the password has to be
      // shown or it is lost and the account is unreachable.
      return {
        success: true,
        email,
        delivery: "email",
        emailed: false,
        password,
        emailError: e instanceof Error ? e.message : "Could not send the email.",
      };
    }
  }
}

export async function updateUser(
  userId: string,
  data: unknown,
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

  const parsed = parseInput(updateUserSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const { name, email } = parsed.data;

  const target = await User.findByPk(userId);
  if (!target) return { error: "User not found." };

  // Email is the login identifier, so a collision would silently break sign-in
  // for one of the two accounts.
  const clash = await User.findOne({ where: { email } });
  if (clash && clash.id !== userId) return { error: "Another account already uses that email." };

  await target.update({ name, email });
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Issues a fresh one-time password. Same rule as creation: it is shown exactly
 * once, and the account is unusable until the holder replaces it.
 */
export type ResetPasswordResult =
  | { success: true; email: string; password: string }
  | { error: string };

export async function resetUserPassword(userId: string): Promise<ResetPasswordResult> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

  const target = await User.findByPk(userId);
  if (!target) return { error: "User not found." };

  const password = generatePassword();
  const hash = await hashPassword(password);

  // Account and Session are better-auth's tables - there is no Sequelize model
  // for them, so they are touched with raw SQL rather than inventing one.
  const [, meta] = await sequelize.query(
    `UPDATE "Account" SET password = :hash, "updatedAt" = now()
     WHERE "userId" = :userId AND "providerId" = 'credential'`,
    { replacements: { hash, userId } },
  );
  if (((meta as { rowCount?: number }).rowCount ?? 0) !== 1) {
    return { error: "That account has no password login to reset." };
  }

  // Old sessions were issued against the previous credential - drop them.
  await sequelize.query(`DELETE FROM "Session" WHERE "userId" = :userId`, {
    replacements: { userId },
  });
  await target.update({ mustChangePassword: true });

  revalidatePath("/admin/users");
  return { success: true, email: target.email, password };
}

export interface UserImpact {
  batchesTaught: number;
  enrolledIn: number;
  submissions: number;
  messages: number;
  invoices: number;
}

/** What deleting this account destroys. Submissions and messages cascade. */
export async function userImpact(userId: string): Promise<UserImpact | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };
  const [batchesTaught, enrolledIn, submissions, messages, invoices] = await Promise.all([
    Batch.count({ where: { instructorId: userId } }),
    BatchStudent.count({ where: { userId } }),
    Submission.count({ where: { userId } }),
    Message.count({ where: { authorId: userId } }),
    Invoice.count({ where: { userId } }),
  ]);
  return { batchesTaught, enrolledIn, submissions, messages, invoices };
}

export async function deleteUser(userId: string): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

  if (userId === session.user.id) return { error: "You cannot delete your own account." };

  const target = await User.findByPk(userId);
  if (!target) return { error: "User not found." };

  if (target.role === Role.ADMIN) {
    const admins = await User.count({ where: { role: Role.ADMIN } });
    if (admins <= 1) return { error: "This is the last admin - promote someone else first." };
  }

  // Invoice.userId is ON DELETE RESTRICT: the database would reject this with a
  // raw constraint error. Catch it here and say something useful instead.
  const invoices = await Invoice.count({ where: { userId } });
  if (invoices > 0) {
    return {
      error: `This user has ${invoices} invoice${invoices === 1 ? "" : "s"}. Cancel or delete them in Billing first.`,
    };
  }

  await target.destroy();
  revalidatePath("/admin/users");
  return { success: true };
}
