import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login?next=/register");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
