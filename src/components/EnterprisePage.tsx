"use client";

import { useRef, useState } from "react";
import {
  Award,
  Building2,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnrollModal from "./EnrollModal";

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

const sectors = [
  {
    icon: Building2,
    title: "For Colleges & Universities",
    description: "Bridge the gap between academic learning and industry requirements",
    features: [
      "Industry-relevant curriculum in AI, cybersecurity, web development, and design",
      "Workshops & bootcamps with hands-on project-based learning",
      "Faculty development programs to update teaching methodologies",
      "Placement readiness training to improve student employability",
    ],
    courses: ["Full Stack Development", "AI & Machine Learning", "Cybersecurity Fundamentals", "UI/UX Design"],
  },
  {
    icon: Users,
    title: "For Corporate Teams",
    description: "Build future-ready teams that drive innovation and growth",
    features: [
      "Custom upskilling and reskilling programs aligned with business goals",
      "Leadership development training for managers and team leads",
      "Productivity optimization with modern tools and methodologies",
      "Innovation training for continuous improvement culture",
    ],
    courses: ["Agile & Project Management", "Data Analytics", "Cloud Computing", "Digital Transformation"],
  },
  {
    icon: Globe,
    title: "For Government Agencies",
    description: "Modernize public services with digital transformation",
    features: [
      "Citizen-centric digital service design and delivery",
      "IT infrastructure and cybersecurity training",
      "Governance workshops with design thinking approach",
      "Scalable capacity building from regional to national level",
    ],
    courses: ["E-Governance", "Cybersecurity", "Digital Service Design", "Data Management"],
  },
  {
    icon: Target,
    title: "For NGOs & Foundations",
    description: "Enhance mission effectiveness with technology and innovation",
    features: [
      "Mission-aligned technology strategies and implementation",
      "Data-driven decision making and impact measurement",
      "Digital marketing and community engagement",
      "Project management and team collaboration tools",
    ],
    courses: ["Social Impact Analytics", "Digital Advocacy", "Nonprofit Technology", "Grant Management"],
  },
];

const partnerBenefits = [
  { icon: Target, title: "Customized Programs", description: "Tailored curriculum designed specifically for your organization's needs and goals" },
  { icon: Users, title: "Expert Trainers", description: "Industry professionals with real-world experience in top tech companies" },
  { icon: TrendingUp, title: "Measurable Results", description: "Track progress with assessments, projects, and performance metrics" },
  { icon: Award, title: "Recognized Certification", description: "Industry-recognized certificates for all participants upon completion" },
  { icon: Shield, title: "Flexible Delivery", description: "On-site, online, or hybrid training options to suit your schedule" },
  { icon: Zap, title: "Ongoing Support", description: "Post-training support and consultation to ensure continued success" },
];

export default function EnterprisePage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl" />

        <motion.div
          ref={heroRef}
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? "show" : "hidden"}
          className="relative max-w-7xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="gradient" className="mb-6 text-sm px-4 py-1.5">
              Enterprise Learning Solutions
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold mb-6">
            Build a{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Smarter</span>
            ,{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Stronger</span>
            , More Future-Ready Team
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your one-stop partner for Learning & Development. We help organizations grow through purposeful
            learning—enabling teams to upskill, reskill, and stay competitive in the fast-changing tech landscape.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" onClick={() => setEnrollOpen(true)}>
              Book a Discovery Call
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#contact">View Sample Programs</a>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { value: "500+", label: "Professionals Trained" },
              { value: "50+", label: "Corporate Partners" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
              >
                <Card className="p-6 shadow-[0_4px_24px_rgba(20,184,166,0.1)] hover:shadow-[0_12px_36px_rgba(20,184,166,0.2)] transition-shadow duration-300 overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 -mx-6 mb-4 w-[calc(100%+3rem)]" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-lg text-gray-500">Comprehensive learning solutions for every organization</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-7">
              {[
                { icon: TrendingUp, title: "Technical Upskilling", description: "Software development, AI, data science, and emerging technology training" },
                { icon: Users, title: "Soft Skills & Leadership", description: "Communication, teamwork, problem-solving, and leadership development" },
                { icon: Zap, title: "Productivity Boosters", description: "Efficiency tools, agile methodologies, and workflow optimization" },
              ].map((service) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    variants={fadeUp}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="group"
                  >
                    <Card className="h-full text-center p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_rgba(20,184,166,0.18)] transition-shadow duration-300 overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-8 mb-6 w-[calc(100%+4rem)]" />
                      <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={28} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Tailored for{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Every Sector
                </span>
              </h2>
              <p className="text-lg text-gray-500">Specialized training programs for different organizational needs</p>
            </motion.div>

            <div className="space-y-7">
              {sectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <motion.div
                    key={sector.title}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.07)] hover:shadow-[0_16px_48px_rgba(20,184,166,0.15)] transition-shadow duration-300">
                      <div className="grid md:grid-cols-3">
                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 text-white">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                            <Icon size={28} />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">{sector.title}</h3>
                          <p className="text-teal-50 text-sm leading-relaxed">{sector.description}</p>
                        </div>
                        <div className="md:col-span-2 p-8">
                          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">What We Offer</h4>
                          <ul className="space-y-3 mb-6">
                            {sector.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-3">
                                <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Sample Programs</p>
                            <div className="flex flex-wrap gap-2">
                              {sector.courses.map((course) => (
                                <Badge key={course} variant="default" className="text-xs">
                                  {course}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Partner Benefits ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Partner with{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Next Minds
                </span>
              </h2>
              <p className="text-lg text-gray-500">Proven results that drive organizational success</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {partnerBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    variants={fadeUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="group"
                  >
                    <Card className="h-full p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(20,184,166,0.15)] transition-shadow duration-300 overflow-hidden">
                      <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-6 mb-5 w-[calc(100%+3rem)]" />
                      <div className="w-12 h-12 mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-200/50 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Partners
                </span>{" "}
                Say
              </h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="shadow-[0_8px_40px_rgba(20,184,166,0.12)] overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />
                <CardContent className="p-10 md:p-12">
                  <div className="text-5xl text-teal-500 mb-4 leading-none">&ldquo;</div>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Next Minds helped us upskill our entire development team with their comprehensive
                    MERN stack program. The training was practical, relevant, and immediately applicable
                    to our projects. Our team&apos;s productivity and code quality have significantly improved.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Rajesh Sharma</div>
                      <div className="text-sm text-gray-500">CTO, TechCorp Nepal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How We{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Work With You
                </span>
              </h2>
              <p className="text-lg text-gray-500">A collaborative approach to ensure maximum impact</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-7">
              {[
                { step: "1", title: "Discovery Call", description: "Understand your organization's goals, challenges, and learning needs" },
                { step: "2", title: "Custom Design", description: "Create tailored curriculum and training program for your team" },
                { step: "3", title: "Deliver Training", description: "Execute the program with expert instructors and hands-on projects" },
                { step: "4", title: "Measure & Support", description: "Track results and provide ongoing support for continued success" },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  className="group"
                >
                  <Card className="h-full p-6 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(20,184,166,0.14)] transition-shadow duration-300 overflow-hidden">
                    <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 to-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mx-6 mb-5 w-[calc(100%+3rem)]" />
                    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-200/50">
                      {item.step}
                    </div>
                    <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Let&apos;s Transform Your{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Organization
                </span>
              </h2>
              <p className="text-lg text-gray-500">Book a free consultation to discuss your training needs</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="shadow-[0_8px_40px_rgba(20,184,166,0.12)] overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />
                <CardContent className="p-8 md:p-12">
                  <form className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      {[
                        { label: "Your Name *", type: "text", placeholder: "John Doe" },
                        { label: "Organization Name *", type: "text", placeholder: "Your Company" },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                          <input type={field.type} required placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
                        </div>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      {[
                        { label: "Email *", type: "email", placeholder: "you@company.com" },
                        { label: "Phone *", type: "tel", placeholder: "+977-9XXXXXXXXX" },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                          <input type={field.type} required placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Type *</label>
                      <select required className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow">
                        <option value="">Select type</option>
                        <option>College/University</option>
                        <option>Corporate/Private Company</option>
                        <option>Government Agency</option>
                        <option>NGO/Foundation</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Size</label>
                      <select className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow">
                        <option value="">Select team size</option>
                        <option>10–25 people</option>
                        <option>25–50 people</option>
                        <option>50–100 people</option>
                        <option>100+ people</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Training Interests</label>
                      <textarea rows={4} placeholder="Tell us about your training needs, goals, and areas of interest..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow resize-none" />
                    </div>
                    <Button size="lg" className="w-full">Request a Consultation</Button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                    {[
                      { icon: Phone, label: "Enterprise Hotline", value: "+977-9XXXXXXXXX" },
                      { icon: Mail, label: "Email Us", value: "enterprise@nextminds.edu.np" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-teal-200/40">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">{label}</div>
                          <div className="text-sm font-medium text-gray-700">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
