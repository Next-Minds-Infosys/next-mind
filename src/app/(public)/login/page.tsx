import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = { title: "Sign In — Next Minds Admin" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white flex items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
