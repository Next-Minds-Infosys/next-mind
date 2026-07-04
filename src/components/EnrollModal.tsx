"use client";

import { useState } from "react";
import { Rocket, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const courseOptions = [
  "MERN Stack Development",
  "Python & Django",
  "UI/UX Design",
  "Flutter Development",
  "Digital Marketing",
  "Data Science & AI",
];

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourse?: string;
}

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
    educationLevel: "",
    learningFormat: "Physical",
    hasLaptop: "Yes",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      >
        {/* header */}
        <div className="sticky top-0 bg-gradient-to-br from-teal-500 to-blue-600 px-8 pt-8 pb-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-white">Start Your Journey!</h2>
            <Rocket className="text-white" size={28} />
          </div>
          <p className="text-white/85 text-sm leading-relaxed">
            Transform your future with cutting-edge IT skills. Whether you&apos;re a beginner or
            looking to level up, we&apos;ve got the perfect course for you!
          </p>
        </div>

        {/* form */}
        <div className="bg-white px-8 py-8 rounded-b-3xl">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-xl font-bold text-gray-800 mb-2">You&apos;re enrolled!</p>
              <p className="text-sm text-gray-500 mb-6">We&apos;ll contact you shortly with next steps.</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="Enter your full name" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Enter your email" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-500">
                  <span>🇳🇵</span>
                  <span>+977</span>
                </div>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="98XXXXXXXX" required className={`${inputClass} flex-1`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                placeholder="Enter your address" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
              <select name="course" value={form.course} onChange={handleChange} required
                className={`${inputClass} text-gray-600`}>
                <option value="">Select a course</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Education Level</label>
              <select name="educationLevel" value={form.educationLevel} onChange={handleChange} required
                className={`${inputClass} text-gray-600`}>
                <option value="">Select your education level</option>
                <option value="SEE">SEE (10th Grade)</option>
                <option value="+2">+2 (12th Grade)</option>
                <option value="Bachelor">Bachelor&apos;s Degree</option>
                <option value="Master">Master&apos;s Degree</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Format</label>
              <div className="flex gap-4">
                {["Physical", "Online", "Hybrid"].map((format) => (
                  <label key={format} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input type="radio" name="learningFormat" value={format}
                      checked={form.learningFormat === format} onChange={handleChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500" />
                    {format}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a Laptop?</label>
              <div className="flex gap-6">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input type="radio" name="hasLaptop" value={option}
                      checked={form.hasLaptop === option} onChange={handleChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500" />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
            <Button type="submit" size="lg" className="w-full mt-2" disabled={submitting}>
              {submitting ? "Submitting…" : "Let's Go! 🚀"}
            </Button>
          </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
