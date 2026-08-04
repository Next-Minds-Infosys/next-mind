"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminUser } from "./actions";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await createAdminUser({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(result.email);
      setForm({ name: "", email: "", password: "", confirm: "" });
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-[0_8px_40px_rgba(20,184,166,0.12)] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />

          <CardHeader className="pt-8 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-200/50">
                <UserPlus size={20} />
              </div>
              <div>
                <CardTitle className="text-xl">Register New Admin</CardTitle>
                <CardDescription>Create an administrator account</CardDescription>
              </div>
            </div>
            <Badge variant="gradient" className="self-start mt-1">
              Role: Admin
            </Badge>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="mb-5 rounded-xl bg-teal-50 border border-teal-100 p-4 flex items-start gap-3"
                >
                  <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Admin created</p>
                    <p className="text-xs text-teal-600 mt-0.5">
                      <span className="font-medium">{success}</span> can now sign in with their
                      password.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@nextmindsinfosys.com"
                  className={inputClass}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength indicator */}
                {form.password && (
                  <div className="flex gap-1 mt-1">
                    {[8, 12, 16].map((threshold, i) => (
                      <div
                        key={threshold}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length >= threshold
                            ? i === 0
                              ? "bg-red-400"
                              : i === 1
                                ? "bg-yellow-400"
                                : "bg-teal-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {form.password.length < 8
                        ? "Too short"
                        : form.password.length < 12
                          ? "Fair"
                          : form.password.length < 16
                            ? "Good"
                            : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="confirm">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={inputClass}
                />
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={loading || (form.confirm.length > 0 && form.password !== form.confirm)}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating admin…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Admin Account
                  </>
                )}
              </Button>
            </form>

            <p className="mt-5 text-xs text-gray-400 text-center">
              The new admin will be able to sign in immediately at{" "}
              <Link href="/login" className="text-teal-600 hover:underline">
                /login
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
