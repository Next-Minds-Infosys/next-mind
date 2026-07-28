"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await signIn.email({ email, password });

    if (authError) {
      setError(authError.message || "Invalid email or password.");
      setLoading(false);
      return;
    }

    // Route based on role
    const role = (data?.user as Record<string, unknown>)?.role;
    router.push(role === "ADMIN" ? next : "/");
    router.refresh();
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/">
          <Image
            src="/next-minds-logo.png"
            alt="Next Minds"
            width={140}
            height={56}
            className="h-14 w-auto"
          />
        </Link>
      </div>

      <Card className="shadow-[0_8px_48px_rgba(20,184,166,0.15)] overflow-hidden">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />

        <CardHeader className="text-center pt-8 pb-2">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-200/50">
            <ShieldCheck size={22} />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Next Minds account</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nextminds.edu.np"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Next Minds Admin Portal &mdash;{" "}
            <Link href="/" className="text-teal-600 hover:underline">
              Back to site
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
