"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { User } from "@/db";
import { Role } from "@/lib/types";
import { profileSchema, secondaryEmailSchema, parseInput } from "@/lib/schemas";
import { sendMail } from "@/lib/mailer";
import { deleteObject, keyBelongsToBatch } from "@/lib/s3";
import { isPublicMediaKey } from "@/lib/media-image";

/** Photo/username/secondary-email editing is a staff feature - students keep the read-only profile. */
const STAFF_ROLES = new Set<string>([Role.ADMIN, Role.EDITOR, Role.INSTRUCTOR]);

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
type Gate = { ok: true; session: Session } | { ok: false; error: string };

/**
 * Every action here re-checks the session and role itself rather than trusting
 * the page-level gate - the same rule every other "use server" action in this
 * app follows (see CLAUDE.md, Admin & Auth).
 */
async function requireStaffSession(): Promise<Gate> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in." };
  if (!STAFF_ROLES.has(session.user.role)) {
    return { ok: false, error: "Not available for this account." };
  }
  return { ok: true, session };
}

const AVATAR_PREFIX = "videos/teacher";
const TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * The profile editor is mounted at two role-scoped routes (/admin/profile for
 * ADMIN/EDITOR, /instructor/profile for INSTRUCTOR) instead of one shared
 * /account/profile - revalidating both is cheap and avoids needing to know
 * which one the caller is on.
 */
function revalidateProfile() {
  revalidatePath("/admin/profile");
  revalidatePath("/instructor/profile");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function updateProfile(data: unknown): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  const parsed = parseInput(profileSchema, data);
  if (!parsed.success) return { error: parsed.error };

  await User.update({ name: parsed.data.name }, { where: { id: gate.session.user.id } });
  revalidateProfile();
  return { success: true };
}

/**
 * Points the account at a photo already uploaded via /api/uploads (scope
 * "avatar"). The key is re-validated here rather than trusted from the
 * client - `keyBelongsToBatch` confirms it really was minted under this
 * user's own id before it becomes the account's public image.
 */
export async function updateAvatar(key: string): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  if (!keyBelongsToBatch(key, AVATAR_PREFIX, gate.session.user.id)) {
    return { error: "That upload does not belong to your account." };
  }

  const previous = await User.findByPk(gate.session.user.id, { attributes: ["image"] });
  await User.update({ image: key }, { where: { id: gate.session.user.id } });

  // Best-effort cleanup; a failed delete just leaves an orphaned object.
  if (previous?.image && previous.image !== key && isPublicMediaKey(previous.image)) {
    await deleteObject(previous.image).catch(() => {});
  }

  revalidateProfile();
  return { success: true };
}

export async function removeAvatar(): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  const previous = await User.findByPk(gate.session.user.id, { attributes: ["image"] });
  await User.update({ image: null }, { where: { id: gate.session.user.id } });

  if (previous?.image && isPublicMediaKey(previous.image)) {
    await deleteObject(previous.image).catch(() => {});
  }

  revalidateProfile();
  return { success: true };
}

/**
 * Stores the address as unverified and emails a confirmation link to it (not
 * to the account's primary inbox) - the whole point is proving the caller
 * actually controls that address before anything is sent there for real.
 */
export async function requestSecondaryEmailVerification(
  data: unknown,
): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  const parsed = parseInput(secondaryEmailSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const { secondaryEmail } = parsed.data;

  if (secondaryEmail === gate.session.user.email.toLowerCase()) {
    return { error: "That is already your primary email." };
  }
  if (await User.findOne({ where: { email: secondaryEmail } })) {
    return { error: "Another account already uses that address as its primary email." };
  }

  const token = randomBytes(32).toString("hex");
  await User.update(
    {
      secondaryEmail,
      secondaryEmailVerified: false,
      secondaryEmailToken: hashToken(token),
      secondaryEmailTokenExpires: new Date(Date.now() + TOKEN_TTL_MS),
    },
    { where: { id: gate.session.user.id } },
  );

  const verifyUrl = `${process.env.BETTER_AUTH_URL ?? ""}/api/account/verify-secondary-email?token=${token}`;
  try {
    await sendMail({
      to: secondaryEmail,
      subject: "Confirm your secondary email — Next Minds",
      html: `
        <p>Hi ${gate.session.user.name ?? ""},</p>
        <p>Confirm this address as the secondary email on your Next Minds account:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not send the verification email." };
  }

  revalidateProfile();
  return { success: true };
}

export async function resendSecondaryEmailVerification(): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  const user = await User.findByPk(gate.session.user.id, {
    attributes: ["secondaryEmail", "secondaryEmailVerified", "name"],
  });
  if (!user?.secondaryEmail || user.secondaryEmailVerified) {
    return { error: "There is no pending secondary email to verify." };
  }

  return requestSecondaryEmailVerification({ secondaryEmail: user.secondaryEmail });
}

export async function cancelSecondaryEmail(): Promise<{ success: true } | { error: string }> {
  const gate = await requireStaffSession();
  if (!gate.ok) return { error: gate.error };

  await User.update(
    {
      secondaryEmail: null,
      secondaryEmailVerified: false,
      secondaryEmailToken: null,
      secondaryEmailTokenExpires: null,
    },
    { where: { id: gate.session.user.id } },
  );
  revalidateProfile();
  return { success: true };
}
