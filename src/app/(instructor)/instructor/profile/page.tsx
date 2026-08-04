import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { User } from "@/db";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordDialog } from "@/components/account/change-password-dialog";

export default async function InstructorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ secondaryEmailVerified?: string; secondaryEmailError?: string }>;
}) {
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  const [user, params] = await Promise.all([
    User.findByPk(session.user.id, {
      attributes: ["name", "email", "image", "secondaryEmail", "secondaryEmailVerified", "role"],
    }),
    searchParams,
  ]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <p className="text-sm font-medium text-teal-600">Account</p>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your photo, name, and secondary email.</p>
      </div>

      {params.secondaryEmailVerified && (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700 ring-1 ring-teal-600/10">
          Secondary email confirmed.
        </p>
      )}
      {params.secondaryEmailError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-600/10">
          {params.secondaryEmailError === "expired"
            ? "That verification link has expired — request a new one below."
            : "That verification link is invalid — request a new one below."}
        </p>
      )}

      <ProfileForm
        userId={session.user.id}
        name={user.name ?? ""}
        email={user.email}
        image={user.image}
        secondaryEmail={user.secondaryEmail}
        secondaryEmailVerified={user.secondaryEmailVerified}
        role={user.role}
      />

      <ChangePasswordDialog
        trigger={
          <button
            type="button"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Change password →
          </button>
        }
      />
    </div>
  );
}
