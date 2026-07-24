"use client";

import { useEffect, useState } from "react";
import { courses } from "@/data/courses";
import { colors, gradient } from "@/lib/theme";

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourse?: string;
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
}: EnrollModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    course: preSelectedCourse,
    education: "",
    format: "Physical",
    laptop: "Yes",
  });
  const [submitted, setSubmitted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSubmitted(false);
      setForm((f) => ({ ...f, course: preSelectedCourse || f.course }));
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const focus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.teal;
  };
  const blur = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.border;
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
            Transform your future with cutting-edge IT skills. Whether
            you&apos;re a beginner or looking to level up, we&apos;ve got the
            perfect course for you!
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: colors.navy }}>
              Application Received!
            </h3>
            <p className="text-sm mb-6" style={{ color: colors.muted }}>
              Our counsellor will contact you within 2 hours to confirm your
              enrollment.
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your Full Name"
                required
                value={form.fullName}
                onChange={onChange("fullName")}
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                required
                value={form.email}
                onChange={onChange("email")}
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
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
                  required
                  value={form.phone}
                  onChange={onChange("phone")}
                  style={inputStyle}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Address
              </label>
              <input
                type="text"
                placeholder="Enter your Address"
                required
                value={form.address}
                onChange={onChange("address")}
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Course
              </label>
              <select
                required
                value={form.course}
                onChange={onChange("course")}
                style={selectStyle}
                onFocus={focus}
                onBlur={blur}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} style={{ color: colors.muted }}>
                Education Level
              </label>
              <select
                required
                value={form.education}
                onChange={onChange("education")}
                style={selectStyle}
                onFocus={focus}
                onBlur={blur}
              >
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
                      name="format"
                      value={opt}
                      checked={form.format === opt}
                      onChange={() => setForm((f) => ({ ...f, format: opt }))}
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
                      name="laptop"
                      value={opt}
                      checked={form.laptop === opt}
                      onChange={() => setForm((f) => ({ ...f, laptop: opt }))}
                      className="accent-[#00bdb8] w-4 h-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full font-bold py-4 rounded-xl text-white text-base transition-all active:scale-[0.98] mt-2"
              style={{ background: gradient, boxShadow: `0 4px 20px ${colors.teal}40` }}
            >
              Let&apos;s Go! 🚀
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
