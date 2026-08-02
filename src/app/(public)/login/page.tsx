import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata = { title: "Sign In — Next Minds Admin" };

// getSession reads the session cookie, so this page cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // This check moved out of proxy.ts. The edge can only see that a cookie
  // exists; this validates it against the database, so a stale cookie shows the
  // login form instead of bouncing between /login and /account forever.
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white flex items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
