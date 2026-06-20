"use client";

import { useState } from "react";
import { Rocket, X } from "lucide-react";

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enrollment submitted:", form);
    alert("Thank you for enrolling! We will contact you shortly.");
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-br from-teal-500 to-blue-600 px-8 pt-8 pb-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-4xl text-white">Start Your Journey!</h2>
            <Rocket className="text-white" size={32} />
          </div>
          <p className="text-white/90 text-lg">
            Transform your future with cutting-edge IT skills. Whether you&apos;re a
            beginner or looking to level up, we&apos;ve got the perfect course for you!
          </p>
        </div>

        <div className="bg-white px-8 py-8 rounded-b-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your Full Name"
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-lg mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-lg mb-2">Phone Number</label>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🇳🇵</span>
                  <span className="text-gray-600">+977</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  required
                  className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your Address"
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-lg mb-2">Course</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-600"
              >
                <option value="">Select a course</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg mb-2">Education Level</label>
              <select
                name="educationLevel"
                value={form.educationLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-600"
              >
                <option value="">Select your education level</option>
                <option value="SEE">SEE (10th Grade)</option>
                <option value="+2">+2 (12th Grade)</option>
                <option value="Bachelor">Bachelor&apos;s Degree</option>
                <option value="Master">Master&apos;s Degree</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-lg mb-3">Learning Format</label>
              <div className="flex gap-4">
                {["Physical", "Online", "Hybrid"].map((format) => (
                  <label key={format} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="learningFormat"
                      value={format}
                      checked={form.learningFormat === format}
                      onChange={handleChange}
                      className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg mb-3">Have a Laptop?</label>
              <div className="flex gap-6">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasLaptop"
                      value={option}
                      checked={form.hasLaptop === option}
                      onChange={handleChange}
                      className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-xl text-xl hover:shadow-lg transition-all"
            >
              Let&apos;s Go! 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
