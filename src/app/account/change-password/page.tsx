import { requireUser } from "@/lib/access";
import { User } from "@/db";
import { ChangePasswordForm } from "./form";

// Session-dependent: never prerender.
export const dynamic = "force-dynamic";

// Belt and braces with robots.txt: nothing behind a login should be indexed.
export const metadata = { robots: { index: false, follow: false } };


export default async function ChangePasswordPage() {
  // requireUser, not requireRole - requireRole redirects here, which would loop.
  const session = await requireUser();
  const user = await User.findByPk(session.user.id, { attributes: ["mustChangePassword"] });
  const forced = Boolean(user?.mustChangePassword);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full rounded-2xl bg-white p-8 ring-1 ring-gray-950/5">
        <h1 className="text-xl font-semibold text-gray-900">
          {forced ? "Set your own password" : "Change password"}
        </h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          {forced
            ? "Your account was created with a temporary password that someone else has seen. Choose your own before continuing."
            : "Pick a new password for your account."}
        </p>
        <ChangePasswordForm forced={forced} />
      </div>
    </div>
  );
}
