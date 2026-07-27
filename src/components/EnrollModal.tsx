"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PublicCourse } from "@/db/queries";
import { colors, gradient } from "@/lib/theme";
import { enrollSchema, type EnrollInput, type EnrollFormValues } from "@/lib/schemas";

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourse?: string;
  courses: Pick<PublicCourse, "id" | "title">[];
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.navy,
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  cursor: "pointer",
};

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const focus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.teal;
  };
  const labelClass = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(13,45,82,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: colors.card, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="p-6 text-white" style={{ background: gradient }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            ✕
          </button>
          <div className="text-2xl mb-1">🚀</div>
          <h2 className="font-display font-bold text-xl">Start Your Journey!</h2>
          <p className="text-sm opacity-80 mt-1">
            Transform your future with cutting-edge IT skills. Whether you&apos;re a beginner or
            looking to level up, we&apos;ve got the perfect course for you!
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: colors.navy }}>
              Application Received!
            </h3>
            <p className="text-sm mb-6" style={{ color: colors.muted }}>
              Our counsellor will contact you within 2 hours to confirm your enrollment.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-bold px-8 py-3 rounded-xl text-white w-full"
              style={{ background: gradient }}
            >
              Got it! 🚀
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6 space-y-4" noValidate>
            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your Full Name"
                {...register("fullName")}
                style={inputStyle}
                onFocus={focus}
              />
              {errors.fullName && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                {...register("email")}
                style={inputStyle}
                onFocus={focus}
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Phone Number
              </label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-2 px-3 rounded-xl text-sm font-semibold flex-shrink-0"
                  style={{
                    border: `1.5px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.navy,
                  }}
                >
                  🇳🇵 +977
                </div>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  {...register("phone")}
                  style={inputStyle}
                  onFocus={focus}
                />
              </div>
              {errors.phone && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Address
              </label>
              <input
                type="text"
                placeholder="Enter your Address"
                {...register("address")}
                style={inputStyle}
                onFocus={focus}
              />
              {errors.address && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Course
              </label>
              <select {...register("course")} style={selectStyle} onFocus={focus}>
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
              {errors.course && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.course.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Education Level
              </label>
              <select {...register("educationLevel")} style={selectStyle} onFocus={focus}>
                <option value="">Select your education level</option>
                <option>+2 / High School</option>
                <option>Bachelor&apos;s Degree</option>
                <option>Master&apos;s Degree</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: colors.muted }}
              >
                Learning Format
              </label>
              <div className="flex gap-5">
                {["Physical", "Online", "Hybrid"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    <input
                      type="radio"
                      value={opt}
                      {...register("learningFormat")}
                      className="accent-[#00bdb8] w-4 h-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: colors.muted }}
              >
                Have a Laptop?
              </label>
              <div className="flex gap-5">
                {["Yes", "No"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    <input
                      type="radio"
                      value={opt}
                      {...register("hasLaptop")}
                      className="accent-[#00bdb8] w-4 h-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-center" style={{ color: "#dc2626" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold py-4 rounded-xl text-white text-base transition-all active:scale-[0.98] mt-2 disabled:opacity-60"
              style={{ background: gradient, boxShadow: `0 4px 20px ${colors.teal}40` }}
            >
              {isSubmitting ? "Submitting…" : "Let's Go! 🚀"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
