"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper, Rocket, X } from "lucide-react";
import type { PublicCourse } from "@/db/queries";
import { enrollSchema, type EnrollInput, type EnrollFormValues } from "@/lib/schemas";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourse?: string;
  courses: Pick<PublicCourse, "id" | "title">[];
}

const fieldClass =
  "w-full rounded-xl border border-nm-border bg-nm-surface px-3.5 py-2.5 text-sm text-nm-navy outline-none transition-colors placeholder:text-nm-muted focus:border-nm-teal focus:ring-2 focus:ring-nm-teal/15";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-nm-muted";
const errorClass = "mt-1 text-xs text-red-600";

export default function EnrollModal({
  isOpen,
  onClose,
  preSelectedCourse = "",
  courses,
}: EnrollModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [prevOpen, setPrevOpen] = useState(isOpen);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnrollFormValues, unknown, EnrollInput>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      course: preSelectedCourse,
      educationLevel: "",
      learningFormat: "Physical",
      hasLaptop: "Yes",
    },
  });

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSubmitted(false);
      setSubmitError("");
      if (preSelectedCourse) setValue("course", preSelectedCourse);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      reset();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
      >
        <div className="nm-gradient relative p-6 text-white sm:p-8">
          <DialogClose
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </DialogClose>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Rocket className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-xl font-bold text-white sm:text-2xl">
            Start Your Journey!
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-white/80">
            Transform your future with cutting-edge IT skills. Whether you&apos;re a beginner or
            looking to level up, we&apos;ve got the perfect course for you!
          </DialogDescription>
        </div>

        {submitted ? (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-nm-green/10">
              <PartyPopper className="h-7 w-7 text-nm-green" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold text-nm-navy">
              Application Received!
            </h3>
            <p className="mb-6 text-sm text-nm-muted">
              Our counsellor will contact you within 2 hours to confirm your enrollment.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="nm-gradient w-full rounded-xl py-3 font-bold text-white transition-all active:scale-[0.98]"
            >
              Got it!
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-6 sm:p-8" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("fullName")}
                  className={fieldClass}
                />
                {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={fieldClass}
                />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-nm-border bg-nm-surface px-3 text-sm font-semibold text-nm-navy">
                    🇳🇵 +977
                  </div>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    {...register("phone")}
                    className={fieldClass}
                  />
                </div>
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  placeholder="Enter your address"
                  {...register("address")}
                  className={fieldClass}
                />
                {errors.address && <p className={errorClass}>{errors.address.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Course</label>
                <select {...register("course")} className={cn(fieldClass, "cursor-pointer")}>
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.course && <p className={errorClass}>{errors.course.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Education Level</label>
                <select {...register("educationLevel")} className={cn(fieldClass, "cursor-pointer")}>
                  <option value="">Select your education level</option>
                  <option>+2 / High School</option>
                  <option>Bachelor&apos;s Degree</option>
                  <option>Master&apos;s Degree</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <fieldset>
              <legend className={labelClass}>Learning Format</legend>
              <div className="flex flex-wrap gap-2">
                {(["Physical", "Online", "Hybrid"] as const).map((opt) => (
                  <div key={opt} className="relative">
                    <input
                      type="radio"
                      id={`learningFormat-${opt}`}
                      value={opt}
                      {...register("learningFormat")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`learningFormat-${opt}`}
                      className="block cursor-pointer rounded-xl border border-nm-border bg-nm-surface px-4 py-2 text-sm font-medium text-nm-body transition-colors peer-checked:border-nm-teal peer-checked:bg-nm-teal/10 peer-checked:text-nm-teal-ink peer-focus-visible:ring-2 peer-focus-visible:ring-nm-teal/30"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelClass}>Have a Laptop?</legend>
              <div className="flex flex-wrap gap-2">
                {(["Yes", "No"] as const).map((opt) => (
                  <div key={opt} className="relative">
                    <input
                      type="radio"
                      id={`hasLaptop-${opt}`}
                      value={opt}
                      {...register("hasLaptop")}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`hasLaptop-${opt}`}
                      className="block cursor-pointer rounded-xl border border-nm-border bg-nm-surface px-4 py-2 text-sm font-medium text-nm-body transition-colors peer-checked:border-nm-teal peer-checked:bg-nm-teal/10 peer-checked:text-nm-teal-ink peer-focus-visible:ring-2 peer-focus-visible:ring-nm-teal/30"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {submitError && <p className="text-center text-sm text-red-600">{submitError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="nm-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-lg shadow-nm-teal/20 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Let's Go!"
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
