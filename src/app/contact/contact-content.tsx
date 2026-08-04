"use client";

import { useState } from "react";
import { contact } from "@/lib/contact";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors, gradient, heroGradient } from "@/lib/theme";
import { contactSchema, type ContactInput, type ContactFormValues } from "@/lib/schemas";

const contactInfo = [
  { icon: "📍", label: "Address", value: contact.address.full },
  { icon: "📞", label: "Phone", value: contact.phoneDisplay },
  { icon: "📧", label: "Email", value: contact.email },
  { icon: "🕐", label: "Hours", value: contact.hours },
];

const quickLinks = [
  { label: "📅 Book Free Counselling", href: "/courses" },
  { label: "🏢 Enterprise Enquiry", href: "/enterprise" },
  { label: "🎓 Browse Courses", href: "/courses" },
];

const inputStyle = {
  border: `1.5px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.navy,
};

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", courseInterest: "", message: "" },
  });

  // The "Subject" select maps onto the courseInterest column.
  const subject = useWatch({ control, name: "courseInterest" });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      reset();
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  const focus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.teal;
  };
  const blur = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.border;
  };

  return (
    <>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section className="py-20 px-6" style={{ background: heroGradient }}>
          <div className="max-w-7xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: `${colors.teal}20`,
                borderColor: `${colors.teal}40`,
                color: colors.teal,
              }}
            >
              Get In Touch
            </div>
            <h1
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              We&apos;d Love to <span style={{ color: colors.teal }}>Hear From You</span>
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Questions about a course? Interested in enterprise training? Just want to say hi?
              We&apos;re here.
            </p>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_420px] gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold mb-6" style={{ color: colors.navy }}>
                Send Us a Message
              </h2>

              {sent ? (
                <div
                  className="rounded-2xl p-12 text-center"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-bold text-xl mb-2" style={{ color: colors.navy }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: colors.muted }}>We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(
                      [
                        { key: "name", label: "Full Name", type: "text", ph: "Your name" },
                        { key: "email", label: "Email", type: "email", ph: "your@email.com" },
                      ] as const
                    ).map((f) => (
                      <div key={f.key}>
                        <label
                          className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                          style={{ color: colors.muted }}
                        >
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.ph}
                          {...register(f.key)}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={inputStyle}
                          onFocus={focus}
                        />
                        {errors[f.key] && (
                          <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                            {errors[f.key]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: colors.muted }}
                    >
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+977-98XXXXXXXX"
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={focus}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: colors.muted }}
                    >
                      Subject
                    </label>
                    <select
                      {...register("courseInterest")}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none transition-all cursor-pointer"
                      style={{
                        ...inputStyle,
                        color: subject ? colors.navy : colors.muted,
                      }}
                      onFocus={focus}
                      onBlur={blur}
                    >
                      <option value="">Select a subject</option>
                      <option>Course Enquiry</option>
                      <option>Enrollment Help</option>
                      <option>Enterprise Training</option>
                      <option>Scholarship / Financial Aid</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: colors.muted }}
                    >
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tell us what's on your mind…"
                      {...register("message")}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                      style={inputStyle}
                      onFocus={focus}
                    />
                  </div>

                  {submitError && (
                    <p className="text-sm" style={{ color: "#dc2626" }}>
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-bold px-8 py-4 rounded-xl text-white transition-all active:scale-[0.98]"
                    style={{ background: gradient, boxShadow: `0 4px 20px ${colors.teal}40` }}
                  >
                    Send Message →
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold mb-6" style={{ color: colors.navy }}>
                Contact Info
              </h2>

              {contactInfo.map((c) => (
                <div
                  key={c.label}
                  className="flex gap-4 items-start p-5 rounded-2xl"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div className="text-2xl">{c.icon}</div>
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wide mb-0.5"
                      style={{ color: colors.muted }}
                    >
                      {c.label}
                    </div>
                    <div className="font-semibold" style={{ color: colors.navy }}>
                      {c.value}
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="rounded-2xl overflow-hidden h-48 flex items-center justify-center"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">📍</div>
                  <p className="text-sm font-semibold" style={{ color: colors.navy }}>
                    New Baneshwor
                  </p>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    Kathmandu, Nepal
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: heroGradient }}>
                <h3 className="font-bold text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {quickLinks.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="block text-sm py-2 px-4 rounded-lg transition-all"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${colors.teal}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
