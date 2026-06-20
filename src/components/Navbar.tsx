"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { courseNavItems } from "@/data/courses";
import EnrollModal from "./EnrollModal";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/next-minds-logo.png"
                  alt="Next Minds Logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Home
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setCoursesOpen(true)}
                onMouseLeave={() => setCoursesOpen(false)}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-teal-600 transition-colors">
                  Courses
                  <ChevronDown size={16} />
                </button>
                {coursesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    {courseNavItems.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                      >
                        {course.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/enterprise"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Enterprise
              </Link>
              <a
                href="#contact"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() => setEnrollOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
              >
                Enroll Now
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden py-4 space-y-4">
              <Link
                href="/"
                className="block text-gray-700 hover:text-teal-600"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <div className="space-y-2">
                <div className="text-gray-700">Courses</div>
                <div className="pl-4 space-y-2">
                  {courseNavItems.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block text-sm text-gray-600 hover:text-teal-600"
                      onClick={() => setMobileOpen(false)}
                    >
                      {course.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/enterprise"
                className="block text-gray-700 hover:text-teal-600"
                onClick={() => setMobileOpen(false)}
              >
                Enterprise
              </Link>
              <a
                href="#contact"
                className="block text-gray-700 hover:text-teal-600"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </a>
              <button
                onClick={() => {
                  setEnrollOpen(true);
                  setMobileOpen(false);
                }}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-full"
              >
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </nav>

      <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </>
  );
}
