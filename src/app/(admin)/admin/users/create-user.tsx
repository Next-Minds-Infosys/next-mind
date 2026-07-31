"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, MailCheck, TriangleAlert } from "lucide-react";
import {
  createUserSchema,
  type CreateUserFormValues,
  type CreateUserInput,
} from "@/lib/schemas";
import { createUser } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";

type Issued =
  | { email: string; delivery: "email"; emailed: true }
  | { email: string; delivery: "hand"; password: string }
  | { email: string; delivery: "email"; emailed: false; password: string; emailError: string };

export function CreateUser() {
  const router = useRouter();
  const [issued, setIssued] = useState<Issued | null>(null);
  const [serverError, setServerError] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues, unknown, CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", role: "STUDENT", delivery: "email" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    setIssued(null);
    const result = await createUser(values);
    if ("error" in result) return setServerError(result.error);
    setIssued(result);
    reset();
    router.refresh();
  });

  if (issued) {
    const password = "password" in issued ? issued.password : null;
    return (
      <div className="space-y-4">
        {issued.delivery === "email" && issued.emailed ? (
          <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-500/20">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <MailCheck size={15} /> Sent to {issued.email}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              The one-time password was emailed and is deliberately not shown here — it exists in
              one place only. They must change it at first sign-in.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-500/20">
            <p className="text-sm font-semibold text-gray-900">
              {issued.delivery === "hand" ? "Hand these over now" : "Email failed — hand these over"}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Stored hashed, so this is the only time it can be shown. It stops working once they
              set their own password.
            </p>

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{issued.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Password</dt>
                <dd className="font-mono font-medium text-gray-900">{password}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${issued.email} / ${password}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-950/5 hover:bg-gray-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy credentials"}
            </button>

            {"emailError" in issued && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-800">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                {issued.emailError}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIssued(null)}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Create another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={label}>Full name</label>
        <input {...register("name")} placeholder="Anjush Khanal" className={input} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className={label}>Email</label>
        <input {...register("email")} type="email" placeholder="name@gmail.com" className={input} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        <p className="mt-1 text-xs text-gray-500">They sign in with this address.</p>
      </div>

      <div>
        <label className={label}>Role</label>
        <select {...register("role")} className={input}>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Admins are not created here — promote an existing user in the table instead.
        </p>
      </div>

      <fieldset>
        <legend className={label}>Deliver the one-time password</legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="radio" value="email" {...register("delivery")} className="mt-0.5 accent-teal-600" />
            <span>
              Email it to them
              <span className="block text-xs text-gray-500">
                Sent to their inbox and never shown here.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="radio" value="hand" {...register("delivery")} className="mt-0.5 accent-teal-600" />
            <span>
              Show it once, I&apos;ll hand it over
              <span className="block text-xs text-gray-500">
                Nothing is emailed. Safer — it never sits in an inbox.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
      >
        {isSubmitting ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
