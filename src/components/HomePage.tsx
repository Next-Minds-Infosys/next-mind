"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
} from "lucide-react";
import { courses } from "@/data/courses";
import EnrollModal from "./EnrollModal";

const learningJourney = [
  {
    step: "01",
    title: "Start with Clarity",
    description:
      "Get personalized counseling to choose the right course for your career goals",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Learn by Doing",
    description:
      "Hands-on practical training with real-world projects and industry tools",
    icon: Users,
  },
  {
    step: "03",
    title: "Get Certified",
    description:
      "Earn industry-recognized certifications to boost your career prospects",
    icon: Award,
  },
  {
    step: "04",
    title: "Launch Your Career",
    description:
      "Job placement assistance and career guidance to land your dream job",
    icon: Award,
  },
];

const whyChoose = [
  {
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of real-world experience",
    icon: Users,
  },
  {
    title: "Flexible Learning",
    description:
      "Choose between physical classes in Kathmandu or online sessions from anywhere",
    icon: BookOpen,
  },
  {
    title: "Hands-on Projects",
    description: "Build a professional portfolio with real-world projects",
    icon: BookOpen,
  },
  {
    title: "Career Support",
    description:
      "Job placement assistance and interview preparation for all students",
    icon: Award,
  },
];

export default function HomePage() {
  const [enrollOpen, setEnrollOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white pt-16">
      <section
        id="home"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm mb-4">
                #1 IT Training Institute in Kathmandu
              </div>
              <h1 className="text-5xl md:text-6xl mb-6">
                Where Your{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Ambition
                </span>{" "}
                Meets{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Opportunities
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your career with industry-relevant IT training. Learn
                from experts, build real projects, and launch your tech career in
                Nepal and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setEnrollOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all text-center"
                >
                  Enroll Now
                </button>
                <a
                  href="#contact"
                  className="border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full hover:bg-teal-50 transition-all text-center"
                >
                  Free Counselling
                </a>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Phone size={20} className="text-teal-600" />
                  <span className="text-gray-700">+977-9XXXXXXXXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-teal-600" />
                  <span className="text-gray-700">info@nextminds.edu.np</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1573165265437-f5e267bb3db6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJVCUyMHRyYWluaW5nJTIwc3R1ZGVudHMlMjBsZWFybmluZyUyMGNvbXB1dGVyJTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzgwMzIzNjY2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="IT Training at Next Minds"
                width={1080}
                height={720}
                className="rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <div className="text-gray-600">Students Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Courses
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our industry-aligned programs designed for career success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-sm text-teal-600 bg-teal-50 px-3 py-1 rounded-full inline-block mb-4">
                  {course.category}
                </div>
                <h3 className="text-2xl mb-3">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tools.slice(0, 4).map((tool) => (
                    <span
                      key={tool}
                      className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Duration: {course.duration}
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Your Learning{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              A structured path from beginner to professional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningJourney.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                      <Icon size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 left-auto right-auto mx-auto w-12 h-12 bg-white border-4 border-teal-500 rounded-full flex items-center justify-center text-teal-600">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Next Minds
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              We provide everything you need to succeed in your IT career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChoose.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl mb-6">
                Get in{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ready to transform your career? Contact us today for a free
                counselling session.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">Location</h3>
                    <p className="text-gray-600">Kathmandu, Nepal</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">Phone</h3>
                    <p className="text-gray-600">+977-9XXXXXXXXX</p>
                    <p className="text-gray-600">+977-1-XXXXXXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">Email</h3>
                    <p className="text-gray-600">info@nextminds.edu.np</p>
                    <p className="text-gray-600">contact@nextminds.edu.np</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                {["Facebook", "Instagram", "LinkedIn", "YouTube"].map(
                  (platform) => (
                    <a
                      key={platform}
                      href="#"
                      aria-label={platform}
                      className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all"
                    >
                      <Share2 size={24} />
                    </a>
                  )
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Select Course Interest</option>
                    <option>MERN Stack Development</option>
                    <option>Python & Django</option>
                    <option>UI/UX Design</option>
                    <option>Flutter Development</option>
                    <option>Digital Marketing</option>
                    <option>Data Science & AI</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </div>
  );
}
