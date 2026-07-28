"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import type { PublicCourse } from "@/db/queries";
import { colors } from "@/lib/theme";
import EnrollModal from "./EnrollModal";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "about", label: "About" },
  { id: "who-is-this-for", label: "Who Is This For" },
  { id: "skills", label: "Skills" },
  { id: "curriculum", label: "Curriculum" },
  { id: "mentor", label: "Mentor" },
  { id: "why-us", label: "Why Us" },
  { id: "faq", label: "Faq" },
];

const highlights = [
  {
    title: "Hands-on Projects",
    desc: "Build 5+ real-world projects to showcase in your portfolio",
  },
  {
    title: "Industry Practices",
    desc: "Learn professional coding standards and best practices",
  },
  {
    title: "Flexible Schedule",
    desc: "Weekend and evening batches available for working professionals",
  },
  {
    title: "Beginner Friendly",
    desc: "No prior programming experience required",
  },
];

const whyUs = [
  {
    icon: Users,
    title: "Expert Instructors",
    desc: "Learn from professionals working in top tech companies",
  },
  {
    icon: BookOpen,
    title: "Hands-On Projects",
    desc: "Build real-world projects for your portfolio",
  },
  {
    icon: Award,
    title: "Industry Certification",
    desc: "Earn recognized certificates to boost your career",
  },
  {
    icon: Clock,
    title: "Lifetime Access",
    desc: "Access course materials and updates forever",
  },
  {
    icon: Users,
    title: "Career Support",
    desc: "Resume building, interview prep, and job placement",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    desc: "Weekend and evening batches available",
  },
];

const counsellingBenefits = [
  "Career path guidance",
  "Course recommendation",
  "Job market insights",
  "Learning roadmap",
];

interface CoursePageContentProps {
  course: PublicCourse;
  courses: PublicCourse[];
}

export default function CoursePageContent({ course, courses }: CoursePageContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState("overview");
  // Curriculum accordion: one module open at a time, all collapsed on load.
  const [openModule, setOpenModule] = useState<number | null>(null);
  const instructor = course.mentor;
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [instructor]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 nm-hero-panel">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div
                className="text-sm text-nm-teal px-3 py-1 rounded-full inline-block mb-4"
                style={{ backgroundColor: `${colors.teal}25` }}
              >
                {course.category}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">
                {course.title}
              </h1>
              <p className="text-xl mb-6" style={{ color: "rgba(255,255,255,0.70)" }}>
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="nm-gradient text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
                >
                  Enroll Now !!!
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="border-2 border-nm-teal text-nm-teal px-8 py-3 rounded-full hover:bg-white/10 transition-all font-semibold"
                >
                  Download Syllabus
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { n: `${course.students}+`, l: "Students" },
                  { n: "4.8/5", l: "Rating" },
                  { n: "500+", l: "Placements" },
                  { n: "80+", l: "Partners" },
                ].map((s) => (
                  <div key={s.l} className="text-center p-4 bg-white rounded-lg shadow">
                    <div className="font-display text-2xl font-bold nm-gradient-text mb-1">
                      {s.n}
                    </div>
                    <div className="text-sm">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">
              <div className="aspect-video nm-gradient rounded-lg mb-4 flex items-center justify-center text-white">
                <BookOpen size={48} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-nm-navy">{course.title}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-nm-body">
                  <Layers size={18} className="text-nm-teal flex-shrink-0" />
                  <span>
                    Level: <strong className="font-semibold">{course.level}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-nm-body">
                  <Clock size={18} className="text-nm-teal flex-shrink-0" />
                  <span>
                    Duration: <strong className="font-semibold">{course.duration}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-nm-body">
                  <Users size={18} className="text-nm-teal flex-shrink-0" />
                  <span>
                    Category: <strong className="font-semibold">{course.category}</strong>
                  </span>
                </div>
              </div>
              <div className="font-display text-3xl font-bold mb-6 nm-gradient-text">
                NPR {course.price.toLocaleString()}
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full nm-gradient text-white px-6 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
                >
                  Enroll Now
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full border-2 border-nm-teal text-nm-teal px-6 py-3 rounded-full hover:bg-nm-light transition-all font-semibold"
                >
                  Download Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight strip */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-nm-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="text-center">
                <h4 className="font-semibold mb-2 text-nm-navy">{h.title}</h4>
                <p className="text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky section nav */}
      <div ref={navRef} className="sticky top-16 bg-white border-b border-nm-border z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-none">
            {sections
              .filter((s) => s.id !== "mentor" || instructor)
              .filter((s) => s.id !== "about" || course.contentMd)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    active === s.id
                      ? "border-nm-teal text-nm-teal"
                      : "border-transparent text-nm-body hover:text-nm-teal"
                  }`}
                >
                  {s.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-16">
            <section id="overview" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">Course Overview</h2>
              <p className="mb-6">{course.description}</p>
              <h3 className="font-display text-2xl font-bold mb-4 text-nm-navy">
                What You Will Achieve
              </h3>
              <ul className="space-y-3">
                {course.skills.slice(0, 6).map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-nm-teal flex-shrink-0 mt-0.5" />
                    <span className="">{s}</span>
                  </li>
                ))}
              </ul>
            </section>

            {course.contentMd && (
              <section id="about" className="scroll-mt-36">
                <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                  About This Course
                </h2>
                <div className="prose-content max-w-none [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-nm-navy [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-nm-navy [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-nm-navy [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-nm-teal [&_a]:underline [&_strong]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-nm-teal [&_blockquote]:pl-4 [&_blockquote]:text-nm-muted [&_code]:rounded [&_code]:bg-nm-light [&_code]:px-1 [&_code]:py-0.5 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-nm-navy [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.contentMd}</ReactMarkdown>
                </div>
              </section>
            )}

            <section id="who-is-this-for" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                Who Is This Course For?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {course.whoIsItFor.map((item) => (
                  <div
                    key={item}
                    className="border border-nm-border rounded-lg p-6 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 nm-gradient rounded-full flex items-center justify-center text-white mb-4">
                      <Users size={22} />
                    </div>
                    <p className="">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="skills" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                Skills You Will Learn
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {course.skills.map((s) => (
                  <div
                    key={s}
                    className="bg-nm-light text-nm-teal px-4 py-3 rounded-lg text-center"
                  >
                    {s}
                  </div>
                ))}
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-6 text-nm-navy">
                Platforms &amp; Tools You&apos;ll Master
              </h3>
              <div className="flex flex-wrap gap-4">
                {course.tools.map((t) => (
                  <div
                    key={t}
                    className="bg-white border border-nm-border px-6 py-3 rounded-lg text-gray-700"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </section>

            <section id="curriculum" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                Course Curriculum
              </h2>
              <p className="mb-6">
                Our comprehensive curriculum is designed by industry experts to ensure you gain
                practical, job-ready skills.
              </p>
              <div className="space-y-3">
                {course.curriculum.map((mod, i) => {
                  const open = openModule === i;
                  return (
                    <div
                      key={mod.id ?? `${mod.title}-${i}`}
                      className="border border-nm-border rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenModule(open ? null : i)}
                        aria-expanded={open}
                        aria-controls={`curriculum-panel-${i}`}
                        className="w-full flex items-start gap-4 p-4 text-left hover:bg-nm-light transition-all"
                      >
                        <span className="w-10 h-10 nm-gradient rounded-full flex items-center justify-center text-white flex-shrink-0 text-sm font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-lg font-semibold text-nm-navy">
                            {mod.title}
                          </span>
                          {mod.topics.length > 0 && (
                            <span className="block text-sm text-nm-muted mt-1">
                              {mod.topics.length} {mod.topics.length === 1 ? "topic" : "topics"}
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          size={18}
                          aria-hidden="true"
                          className={`flex-shrink-0 mt-2.5 text-nm-muted transition-transform duration-200 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {open && mod.topics.length > 0 && (
                        <div
                          id={`curriculum-panel-${i}`}
                          className="border-t border-nm-border px-4 py-4"
                        >
                          <ul className="list-disc pl-9 space-y-1.5 text-sm text-nm-muted">
                            {mod.topics.map((topic) => (
                              <li key={topic}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {instructor && (
              <section id="mentor" className="scroll-mt-36">
                <h2 className="font-display text-3xl font-bold mb-4 text-nm-navy">
                  Learn <span className="text-nm-teal">From Industry Experts</span>
                </h2>
                <p className="mb-6">
                  Every {course.title} batch is led by a working professional — not a full-time
                  lecturer. You learn the tools, habits, and shortcuts they use on real projects
                  every week.
                </p>
                <div className="border border-nm-border rounded-lg p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-all">
                  <div
                    className="relative w-full sm:w-[150px] flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center nm-gradient text-white"
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    {instructor.photo ? (
                      <Image
                        src={instructor.photo}
                        alt={instructor.name}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    ) : (
                      <Users size={64} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-1 text-nm-navy">
                      {instructor.name}
                    </h3>
                    <div className="text-nm-teal mb-4">{instructor.role}</div>
                    <p className="">{instructor.bio}</p>
                  </div>
                </div>
              </section>
            )}

            <section id="why-us" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                How We Make Learning Different
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {whyUs.map((w) => {
                  const Icon = w.icon;
                  return (
                    <div key={w.title} className="bg-white border border-nm-border rounded-lg p-6">
                      <div className="w-12 h-12 nm-gradient rounded-full flex items-center justify-center text-white mb-4">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-nm-navy">{w.title}</h3>
                      <p className="">{w.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="faq" className="scroll-mt-36">
              <h2 className="font-display text-3xl font-bold mb-6 text-nm-navy">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {course.faqs.map((faq) => (
                  <div key={faq.q} className="border border-nm-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-nm-navy">{faq.q}</h3>
                    <p className="">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white border border-nm-border rounded-2xl p-6 sticky top-32">
              <h3 className="font-display text-xl font-bold mb-4 text-nm-navy">
                Need Help Choosing?
              </h3>
              <p className="text-nm-body mb-4">
                Talk to our course advisor for personalized guidance
              </p>
              <div className="aspect-square nm-gradient rounded-lg mb-4 flex items-center justify-center text-white">
                <Users size={56} />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-nm-body">
                  <Phone size={16} className="text-nm-teal flex-shrink-0" />
                  <span className="text-sm">+977-9XXXXXXXXX</span>
                </div>
                <div className="flex items-center gap-2 text-nm-body">
                  <Mail size={16} className="text-nm-teal flex-shrink-0" />
                  <span className="text-sm">counseling@nextmindsinfosys.com</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full nm-gradient text-white px-6 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
              >
                Schedule Counselling
              </button>
              <div className="mt-6 pt-6 border-t border-nm-border">
                <h4 className="font-semibold mb-3 text-nm-navy">Benefits of Counselling:</h4>
                <ul className="space-y-2 text-sm text-nm-body">
                  {counsellingBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-nm-teal flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 nm-hero-panel">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 nm-gradient rounded-full flex items-center justify-center text-white">
            <Award size={36} />
          </div>
          <h2 className="font-display text-4xl font-bold mb-6 text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            Join thousands of students who have transformed their careers with Next Minds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="nm-gradient text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
            >
              Enroll in {course.title}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="border-2 border-nm-teal text-nm-teal px-8 py-3 rounded-full hover:bg-white/10 transition-all font-semibold"
            >
              Schedule Free Counselling
            </button>
          </div>
        </div>
      </section>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preSelectedCourse={course.title}
        courses={courses}
      />
    </div>
  );
}
