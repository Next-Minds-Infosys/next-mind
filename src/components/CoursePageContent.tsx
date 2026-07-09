"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { Course } from "@/data/courses";
import EnrollModal from "./EnrollModal";

const tabs = [
  "overview",
  "who-is-this-for",
  "skills",
  "curriculum",
  "why-us",
  "faq",
];

function formatTabLabel(tab: string) {
  return tab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface CoursePageProps {
  course: Course;
}

export default function CoursePageContent({ course }: CoursePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollOpen, setEnrollOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="text-sm text-teal-600 bg-teal-50 px-3 py-1 rounded-full inline-block mb-4">
                {course.category}
              </div>
              <h1 className="text-4xl md:text-5xl mb-6">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">
                {course.detailedDescription}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => setEnrollOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
                >
                  Enroll Now !!!
                </button>
                <button className="border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full hover:bg-teal-50 transition-all">
                  Download Syllabus
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: "1000+", label: "Students" },
                  { value: "4.8/5", label: "Rating" },
                  { value: "500+", label: "Placements" },
                  { value: "80+", label: "Partners" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 bg-white rounded-lg shadow"
                  >
                    <div className="text-2xl bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">
              <div className="aspect-video bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white">
                <BookOpen size={64} />
              </div>
              <h3 className="text-2xl mb-4">{course.title}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Layers size={20} className="text-teal-600" />
                  <span>Level: {course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={20} className="text-teal-600" />
                  <span>Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={20} className="text-teal-600" />
                  <span>Category: {course.category}</span>
                </div>
              </div>
              <div className="text-3xl mb-6 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                {course.price}
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setEnrollOpen(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all"
                >
                  Enroll Now
                </button>
                <button className="w-full border-2 border-teal-500 text-teal-600 px-6 py-3 rounded-full hover:bg-teal-50 transition-all">
                  Download Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {course.highlights.map((highlight) => (
              <div key={highlight.title} className="text-center">
                <h4 className="mb-2">{highlight.title}</h4>
                <p className="text-sm text-gray-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-600 hover:text-teal-600"
                }`}
              >
                {formatTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-16">
            <section id="overview">
              <h2 className="text-3xl mb-6">Course Overview</h2>
              <p className="text-gray-600 mb-6">{course.detailedDescription}</p>
              <h3 className="text-2xl mb-4">What You Will Achieve</h3>
              <ul className="space-y-3">
                {course.whatYouWillLearn.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle
                      size={24}
                      className="text-teal-600 flex-shrink-0 mt-1"
                    />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="who-is-this-for">
              <h2 className="text-3xl mb-6">Who Is This Course For?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {course.whoIsThisFor.map((item) => (
                  <div
                    key={item.title}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                      <Users size={24} />
                    </div>
                    <h3 className="text-xl mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="skills">
              <h2 className="text-3xl mb-6">Skills You Will Learn</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {course.skillsYouWillLearn.map((skill) => (
                  <div
                    key={skill}
                    className="bg-teal-50 text-teal-700 px-4 py-3 rounded-lg text-center"
                  >
                    {skill}
                  </div>
                ))}
              </div>
              <h3 className="text-2xl mt-12 mb-6">
                Platforms & Tools You&apos;ll Master
              </h3>
              <div className="flex flex-wrap gap-4">
                {course.tools.map((tool) => (
                  <div
                    key={tool}
                    className="bg-white border border-gray-200 px-6 py-3 rounded-lg"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </section>

            <section id="curriculum">
              <h2 className="text-3xl mb-6">Course Curriculum</h2>
              <p className="text-gray-600 mb-6">
                Our comprehensive curriculum is designed by industry experts to
                ensure you gain practical, job-ready skills.
              </p>
              <div className="space-y-3">
                {course.curriculum.map((module) => (
                  <div
                    key={module.module}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-teal-50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {module.module}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg">{module.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="why-us">
              <h2 className="text-3xl mb-6">How We Make Learning Different</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Expert Instructors",
                    description:
                      "Learn from professionals working in top tech companies",
                    icon: Users,
                  },
                  {
                    title: "Hands-On Projects",
                    description: "Build real-world projects for your portfolio",
                    icon: BookOpen,
                  },
                  {
                    title: "Industry Certification",
                    description:
                      "Earn recognized certificates to boost your career",
                    icon: Award,
                  },
                  {
                    title: "Lifetime Access",
                    description: "Access course materials and updates forever",
                    icon: Clock,
                  },
                  {
                    title: "Career Support",
                    description:
                      "Resume building, interview prep, and job placement",
                    icon: Users,
                  },
                  {
                    title: "Flexible Schedule",
                    description: "Weekend and evening batches available",
                    icon: Users,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-xl mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="faq">
              <h2 className="text-3xl mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Do I need prior experience to join this course?",
                    a: course.level.includes("Beginner")
                      ? "No prior experience required! This course is designed for beginners and will take you from fundamentals to advanced concepts."
                      : "Basic programming knowledge is recommended for this course, but we start with fundamentals to ensure everyone is on the same page.",
                  },
                  {
                    q: "What tools and software will I need?",
                    a: "You'll need a laptop with minimum 8GB RAM. All software and tools used in the course are free and open-source. We'll guide you through the installation process.",
                  },
                  {
                    q: "Will I receive a certificate after completion?",
                    a: "Yes! You'll receive an industry-recognized certificate from Next Minds Infosys upon successful completion of the course and final project.",
                  },
                  {
                    q: "Is job placement assistance provided?",
                    a: "Absolutely! We provide comprehensive career support including resume building, interview preparation, and connections with our 80+ hiring partners.",
                  },
                  {
                    q: "Can I take this course online?",
                    a: "Yes! We offer both in-person classes in Kathmandu and live online sessions, so you can join from anywhere in Nepal.",
                  },
                ].map((faq) => (
                  <div
                    key={faq.q}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <h3 className="text-lg mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-32">
              <h3 className="text-xl mb-4">Need Help Choosing?</h3>
              <p className="text-gray-600 mb-4">
                Talk to our course advisor for personalized guidance
              </p>
              <div className="aspect-square bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white">
                <Users size={64} />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={18} className="text-teal-600" />
                  <span className="text-sm">+977-9XXXXXXXXX</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} className="text-teal-600" />
                  <span className="text-sm">counseling@nextminds.edu.np</span>
                </div>
              </div>
              <button
                onClick={() => setEnrollOpen(true)}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all"
              >
                Schedule Counselling
              </button>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="mb-3">Benefits of Counselling:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {[
                    "Career path guidance",
                    "Course recommendation",
                    "Job market insights",
                    "Learning roadmap",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle
                        size={16}
                        className="text-teal-600 flex-shrink-0 mt-1"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
            <Award size={40} />
          </div>
          <h2 className="text-4xl mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have transformed their careers with
            Next Minds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setEnrollOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Enroll in {course.title}
            </button>
            <button className="border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full hover:bg-teal-50 transition-all">
              Schedule Free Counselling
            </button>
          </div>
        </div>
      </section>

      <EnrollModal
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        preSelectedCourse={course.title}
      />
    </div>
  );
}
