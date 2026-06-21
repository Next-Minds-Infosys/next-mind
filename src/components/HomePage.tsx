"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, Mail, MapPin, Phone, Share2, Users } from "lucide-react";
import {
  motion,
  useInView,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect } from "react";
import { courses } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnrollModal from "./EnrollModal";

const learningJourney = [
  {
    step: "01",
    title: "Start with Clarity",
    description: "Get personalized counseling to choose the right course for your career goals",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Learn by Doing",
    description: "Hands-on practical training with real-world projects and industry tools",
    icon: Users,
  },
  {
    step: "03",
    title: "Get Certified",
    description: "Earn industry-recognized certifications to boost your career prospects",
    icon: Award,
  },
  {
    step: "04",
    title: "Launch Your Career",
    description: "Job placement assistance and career guidance to land your dream job",
    icon: Award,
  },
];

const whyChoose = [
  {
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of real-world experience",
    icon: Users,
  },
  {
    title: "Flexible Learning",
    description: "Choose between physical classes in Kathmandu or online sessions from anywhere",
    icon: BookOpen,
  },
  {
    title: "Hands-on Projects",
    description: "Build a professional portfolio with real-world projects",
    icon: BookOpen,
  },
  {
    title: "Career Support",
    description: "Job placement assistance and interview preparation for all students",
    icon: Award,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, target, { duration: 1.8, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, count, target]);

  return (
    <span ref={ref} className="font-bold">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", courseInterest: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", courseInterest: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";

  return (
    <Card className="shadow-[0_8px_40px_rgba(20,184,166,0.12)] overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />
      <CardHeader>
        <CardTitle className="text-2xl">Send us a Message</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "sent" ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3">✉️</div>
            <p className="text-lg font-semibold text-gray-800 mb-1">Message sent!</p>
            <p className="text-sm text-gray-500">We&apos;ll get back to you shortly.</p>
            <Button className="mt-6" onClick={() => setStatus("idle")}>Send another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your Name" required className={inputClass} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Your Email" required className={inputClass} />
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Your Phone" className={inputClass} />
            <select name="courseInterest" value={form.courseInterest} onChange={handleChange} className={`${inputClass} text-gray-500`}>
              <option value="">Select Course Interest</option>
              <option>MERN Stack Development</option>
              <option>Python &amp; Django</option>
              <option>UI/UX Design</option>
              <option>Flutter Development</option>
              <option>Digital Marketing</option>
              <option>Data Science &amp; AI</option>
            </select>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows={4} required className={`${inputClass} resize-none`} />
            {status === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
            <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send Message"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* ── Hero ── */}
      <section
        id="home"
        className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white"
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              ref={heroRef}
              variants={staggerContainer}
              initial="hidden"
              animate={heroInView ? "show" : "hidden"}
            >
              <motion.div variants={fadeUp}>
                <Badge variant="gradient" className="mb-5 text-sm px-4 py-1.5">
                  #1 IT Training Institute in Kathmandu
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl font-bold leading-tight mb-6"
              >
                Where Your{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Ambition
                </span>{" "}
                Meets{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Opportunities
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                Transform your career with industry-relevant IT training. Learn from experts,
                build real projects, and launch your tech career in Nepal and beyond.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" onClick={() => setEnrollOpen(true)}>
                  Enroll Now
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#contact">Free Counselling</a>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={18} className="text-teal-600" />
                  <span className="text-sm">+977-9XXXXXXXXX</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} className="text-teal-600" />
                  <span className="text-sm">info@nextminds.edu.np</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <Image
                src="https://images.unsplash.com/photo-1573165265437-f5e267bb3db6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJVCUyMHRyYWluaW5nJTIwc3R1ZGVudHMlMjBsZWFybmluZyUyMGNvbXB1dGVyJTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzgwMzIzNjY2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="IT Training at Next Minds"
                width={1080}
                height={720}
                className="rounded-3xl shadow-2xl w-full h-auto"
                priority
              />
              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-white"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  <StatCounter target={1000} suffix="+" />
                </div>
                <div className="text-sm text-gray-500 mt-0.5">Students Trained</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Courses ── */}
      <section id="courses" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Courses
                </span>
              </h2>
              <p className="text-lg text-gray-500">
                Choose from our industry-aligned programs designed for career success
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  className="group"
                >
                  <Card className="h-full flex flex-col overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_48px_rgba(20,184,166,0.18)] transition-shadow duration-300">
                    {/* gradient top accent */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                    <CardHeader className="pb-3">
                      <Badge variant="default" className="self-start mb-3 text-xs">
                        {course.category}
                      </Badge>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription className="mt-1.5">{course.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        {course.tools.slice(0, 4).map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {course.tools.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{course.tools.length - 4}
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-500">{course.duration}</div>
                      <Button variant="ghost" size="sm" asChild className="text-teal-600 font-medium px-0 hover:bg-transparent hover:text-teal-700 group-hover:translate-x-1 transition-transform">
                        <Link href={`/courses/${course.id}`}>Learn More →</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Learning Journey ── */}
      <section
        id="about"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Your Learning{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Journey
                </span>
              </h2>
              <p className="text-lg text-gray-500">A structured path from beginner to professional</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {learningJourney.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="group text-center"
                  >
                    <Card className="h-full p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(20,184,166,0.14)] transition-shadow duration-300 overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-6 mb-6 w-[calc(100%+3rem)]" />
                      <div className="relative mb-5 flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200/60">
                          <Icon size={28} />
                        </div>
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center text-teal-600 text-xs font-bold shadow-sm">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Next Minds
                </span>
              </h2>
              <p className="text-lg text-gray-500">We provide everything you need to succeed in your IT career</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
              {whyChoose.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="group"
                  >
                    <Card className="h-full p-6 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(20,184,166,0.14)] transition-shadow duration-300">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-200/50 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Contact ── */}
      <section
        id="contact"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                Get in{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Ready to transform your career? Contact us today for a free counselling session.
              </p>

              <div className="space-y-5 mb-8">
                {[
                  { icon: MapPin, label: "Location", lines: ["Kathmandu, Nepal"] },
                  { icon: Phone, label: "Phone", lines: ["+977-9XXXXXXXXX", "+977-1-XXXXXXX"] },
                  { icon: Mail, label: "Email", lines: ["info@nextminds.edu.np", "contact@nextminds.edu.np"] },
                ].map(({ icon: Icon, label, lines }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-teal-200/50">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-0.5">{label}</p>
                      {lines.map((l) => (
                        <p key={l} className="text-sm text-gray-500">{l}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {["Facebook", "Instagram", "LinkedIn", "YouTube"].map((platform) => (
                  <motion.a
                    key={platform}
                    href="#"
                    aria-label={platform}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-200/40"
                  >
                    <Share2 size={18} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <ContactForm />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {enrollOpen && (
          <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
