"use client";

import { useRef, useState } from "react";
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
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Course } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnrollModal from "./EnrollModal";

const tabs = ["overview", "who-is-this-for", "skills", "curriculum", "why-us", "faq"];

function formatTabLabel(tab: string) {
  return tab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

interface CoursePageProps {
  course: Course;
}

export default function CoursePageContent({ course }: CoursePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollOpen, setEnrollOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 120, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            <motion.div
              className="md:col-span-2"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp}>
                <Badge variant="default" className="mb-4">{course.category}</Badge>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
                {course.title}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-gray-600 mb-7 leading-relaxed">
                {course.detailedDescription}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                <Button size="lg" onClick={() => setEnrollOpen(true)}>Enroll Now</Button>
                <Button size="lg" variant="outline">Download Syllabus</Button>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "1000+", label: "Students" },
                  { value: "4.8/5", label: "Rating" },
                  { value: "500+", label: "Placements" },
                  { value: "80+", label: "Partners" },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="text-center p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </Card>
                ))}
              </motion.div>
            </motion.div>

            {/* Sticky sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-[0_8px_40px_rgba(20,184,166,0.12)] overflow-hidden sticky top-24">
                <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />
                <div className="aspect-video bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
                  <BookOpen size={56} />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{course.title}</h3>
                  <div className="space-y-2.5 mb-5">
                    {[
                      { icon: Layers, text: `Level: ${course.level}` },
                      { icon: Clock, text: `Duration: ${course.duration}` },
                      { icon: Users, text: `Category: ${course.category}` },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Icon size={16} className="text-teal-600 flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-5">
                    {course.price}
                  </div>
                  <div className="space-y-2.5">
                    <Button className="w-full" onClick={() => setEnrollOpen(true)}>Enroll Now</Button>
                    <Button className="w-full" variant="outline">Download Syllabus</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Highlights bar ── */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-4">
          {course.highlights.map((h) => (
            <div key={h.title} className="text-center px-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">{h.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tab nav ── */}
      <div className="sticky top-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-teal-600 bg-teal-50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {formatTabLabel(tab)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-full bg-teal-50 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-20">

            {/* Overview */}
            <Section id="overview">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-5">Course Overview</motion.h2>
              <motion.p variants={fadeUp} className="text-gray-600 leading-relaxed mb-7">{course.detailedDescription}</motion.p>
              <motion.h3 variants={fadeUp} className="text-xl font-semibold mb-4">What You Will Achieve</motion.h3>
              <motion.ul variants={stagger} className="space-y-3">
                {course.whatYouWillLearn.map((item) => (
                  <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </Section>

            {/* Who is this for */}
            <Section id="who-is-this-for">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-7">Who Is This Course For?</motion.h2>
              <div className="grid md:grid-cols-2 gap-5">
                {course.whoIsThisFor.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="group"
                  >
                    <Card className="h-full p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(20,184,166,0.14)] transition-shadow duration-300 overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-6 mb-5 w-[calc(100%+3rem)]" />
                      <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Users size={20} />
                      </div>
                      <h3 className="font-semibold mb-1.5">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section id="skills">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-7">Skills You Will Learn</motion.h2>
              <motion.div variants={stagger} className="flex flex-wrap gap-2 mb-10">
                {course.skillsYouWillLearn.map((skill) => (
                  <motion.div key={skill} variants={fadeUp}>
                    <Badge variant="default" className="text-sm px-4 py-1.5">{skill}</Badge>
                  </motion.div>
                ))}
              </motion.div>
              <motion.h3 variants={fadeUp} className="text-xl font-semibold mb-4">Platforms & Tools You&apos;ll Master</motion.h3>
              <motion.div variants={stagger} className="flex flex-wrap gap-2">
                {course.tools.map((tool) => (
                  <motion.div key={tool} variants={fadeUp}>
                    <Badge variant="outline" className="text-sm px-4 py-1.5">{tool}</Badge>
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            {/* Curriculum */}
            <Section id="curriculum">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-3">Course Curriculum</motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 mb-7 text-sm">
                Designed by industry experts to ensure practical, job-ready skills.
              </motion.p>
              <motion.div variants={stagger} className="space-y-2.5">
                {course.curriculum.map((mod) => (
                  <motion.div
                    key={mod.module}
                    variants={fadeUp}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <Card className="shadow-[0_1px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(20,184,166,0.12)] transition-shadow duration-300">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {mod.module}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{mod.title}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            {/* Why us */}
            <Section id="why-us">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-7">How We Make Learning Different</motion.h2>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { title: "Expert Instructors", description: "Learn from professionals working in top tech companies", icon: Users },
                  { title: "Hands-On Projects", description: "Build real-world projects for your portfolio", icon: BookOpen },
                  { title: "Industry Certification", description: "Earn recognized certificates to boost your career", icon: Award },
                  { title: "Lifetime Access", description: "Access course materials and updates forever", icon: Clock },
                  { title: "Career Support", description: "Resume building, interview prep, and job placement", icon: Users },
                  { title: "Flexible Schedule", description: "Weekend and evening batches available", icon: Clock },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 360, damping: 24 }}
                      className="group"
                    >
                      <Card className="h-full p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(20,184,166,0.13)] transition-shadow duration-300 overflow-hidden">
                        <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-5 mb-4 w-[calc(100%+2.5rem)]" />
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Icon size={18} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1.5">{item.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </Section>

            {/* FAQ */}
            <Section id="faq">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-7">Frequently Asked Questions</motion.h2>
              <motion.div variants={stagger} className="space-y-3">
                {[
                  {
                    q: "Do I need prior experience to join this course?",
                    a: course.level.includes("Beginner")
                      ? "No prior experience required! This course is designed for beginners and takes you from fundamentals to advanced concepts."
                      : "Basic programming knowledge is recommended, but we start with fundamentals to ensure everyone is on the same page.",
                  },
                  { q: "What tools and software will I need?", a: "You'll need a laptop with minimum 8GB RAM. All software and tools used in the course are free and open-source. We'll guide you through setup." },
                  { q: "Will I receive a certificate after completion?", a: "Yes! You'll receive an industry-recognized certificate from Next Minds Infosys upon successful completion of the course and final project." },
                  { q: "Is job placement assistance provided?", a: "Absolutely! We provide comprehensive career support including resume building, interview prep, and connections with our 80+ hiring partners." },
                  { q: "Can I take this course online?", a: "Yes! We offer both in-person classes in Kathmandu and live online sessions, so you can join from anywhere in Nepal." },
                ].map((faq) => (
                  <motion.div key={faq.q} variants={fadeUp}>
                    <Card className="p-5 shadow-[0_1px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(20,184,166,0.1)] transition-shadow duration-300">
                      <h3 className="font-semibold text-sm mb-2 text-gray-800">{faq.q}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="shadow-[0_4px_24px_rgba(20,184,166,0.1)] overflow-hidden sticky top-32">
              <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />
              <div className="aspect-square bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
                <Users size={56} />
              </div>
              <CardContent className="p-6">
                <CardTitle className="text-base mb-2">Need Help Choosing?</CardTitle>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">Talk to our course advisor for personalized guidance</p>
                <div className="space-y-2.5 mb-5">
                  {[
                    { icon: Phone, text: "+977-9XXXXXXXXX" },
                    { icon: Mail, text: "counseling@nextminds.edu.np" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon size={14} className="text-teal-600 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={() => setEnrollOpen(true)}>Schedule Counselling</Button>
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-700 mb-3">Benefits of Counselling</h4>
                  <ul className="space-y-2">
                    {["Career path guidance", "Course recommendation", "Job market insights", "Learning roadmap"].map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle size={12} className="text-teal-600 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200/50">
              <Award size={32} />
            </div>
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of students who have transformed their careers with Next Minds
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => setEnrollOpen(true)}>Enroll in {course.title}</Button>
              <Button size="lg" variant="outline">Schedule Free Counselling</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {enrollOpen && (
          <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} preSelectedCourse={course.title} />
        )}
      </AnimatePresence>
    </div>
  );
}
