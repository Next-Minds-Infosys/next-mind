"use client";

import { useRef, useState } from "react";
import { contact } from "@/lib/contact";
import { Award, Building2, CheckCircle, Globe, Mail, PartyPopper, Phone, Shield, Target, TrendingUp, Users, Zap } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enterpriseContactSchema,
  type EnterpriseContactInput,
  type EnterpriseContactFormValues,
} from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlobBackground } from "@/components/ui/blob-background";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import type { CourseCard } from "@/db/queries";
import EnrollModal from "./EnrollModal";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

const services = [
  {
    icon: TrendingUp,
    title: "Technical Upskilling",
    description: "Software development, AI, data science, and emerging technology training",
  },
  {
    icon: Users,
    title: "Soft Skills & Leadership",
    description: "Communication, teamwork, problem-solving, and leadership development",
  },
  {
    icon: Zap,
    title: "Productivity Boosters",
    description: "Efficiency tools, agile methodologies, and workflow optimization",
  },
];

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
    courses: [
      "Full Stack Development",
      "AI & Machine Learning",
      "Cybersecurity Fundamentals",
      "UI/UX Design",
    ],
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
    courses: [
      "Agile & Project Management",
      "Data Analytics",
      "Cloud Computing",
      "Digital Transformation",
    ],
    flagship: true,
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
    courses: [
      "Social Impact Analytics",
      "Digital Advocacy",
      "Nonprofit Technology",
      "Grant Management",
    ],
  },
];

const partnerBenefits = [
  {
    icon: Target,
    title: "Customized Programs",
    description:
      "Tailored curriculum designed specifically for your organization's needs and goals",
  },
  {
    icon: Users,
    title: "Expert Trainers",
    description: "Industry professionals with real-world experience in top tech companies",
  },
  {
    icon: TrendingUp,
    title: "Measurable Results",
    description: "Track progress with assessments, projects, and performance metrics",
  },
  {
    icon: Award,
    title: "Recognized Certification",
    description: "Industry-recognized certificates for all participants upon completion",
  },
  {
    icon: Shield,
    title: "Flexible Delivery",
    description: "On-site, online, or hybrid training options to suit your schedule",
  },
  {
    icon: Zap,
    title: "Ongoing Support",
    description: "Post-training support and consultation to ensure continued success",
  },
];

const workSteps = [
  {
    step: "1",
    title: "Discovery Call",
    description: "Understand your organization's goals, challenges, and learning needs",
  },
  {
    step: "2",
    title: "Custom Design",
    description: "Create tailored curriculum and training program for your team",
  },
  {
    step: "3",
    title: "Deliver Training",
    description: "Execute the program with expert instructors and hands-on projects",
  },
  {
    step: "4",
    title: "Measure & Support",
    description: "Track results and provide ongoing support for continued success",
  },
];

function EnterpriseContactForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnterpriseContactFormValues, unknown, EnterpriseContactInput>({
    resolver: zodResolver(enterpriseContactSchema),
    defaultValues: {
      name: "",
      orgName: "",
      email: "",
      phone: "",
      orgType: "",
      teamSize: "",
      trainingInterests: "",
    },
  });

  const handleSubmit = rhfHandleSubmit(async (values) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/enterprise-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  const fieldError = (name: keyof EnterpriseContactFormValues) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p> : null;

  const inputClass =
    "w-full rounded-xl border border-nm-border bg-nm-surface px-4 py-3 text-sm text-nm-navy outline-none transition-colors placeholder:text-nm-muted focus:border-nm-teal focus:ring-2 focus:ring-nm-teal/15";
  const labelClass = "mb-1.5 block text-sm font-medium text-nm-body";

  if (status === "sent") {
    return (
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-nm-teal to-nm-blue p-[1px] shadow-[0_8px_40px_rgba(0,189,184,0.12)]">
        <div className="rounded-[15px] bg-nm-card py-16 text-center">
          <PartyPopper size={44} aria-hidden="true" className="mx-auto mb-4 text-nm-teal" />
          <p className="mb-2 text-2xl font-bold text-nm-navy">Request received!</p>
          <p className="text-nm-muted">Our enterprise team will reach out within 24 hours.</p>
          <Button className="mt-8" onClick={() => setStatus("idle")}>
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-nm-teal to-nm-blue p-[1px] shadow-[0_8px_40px_rgba(0,189,184,0.12)]">
      <div className="rounded-[15px] bg-nm-card p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Your Name *</label>
              <input {...register("name")} type="text" placeholder="John Doe" className={inputClass} />
              {fieldError("name")}
            </div>
            <div>
              <label className={labelClass}>Organization Name *</label>
              <input
                {...register("orgName")}
                type="text"
                placeholder="Your Company"
                className={inputClass}
              />
              {fieldError("orgName")}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Email *</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className={inputClass}
              />
              {fieldError("email")}
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+977-9XXXXXXXXX"
                className={inputClass}
              />
              {fieldError("phone")}
            </div>
          </div>
          <div>
            <label className={labelClass}>Organization Type *</label>
            <select {...register("orgType")} required className={`${inputClass} cursor-pointer`}>
              <option value="">Select type</option>
              <option>College/University</option>
              <option>Corporate/Private Company</option>
              <option>Government Agency</option>
              <option>NGO/Foundation</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Team Size</label>
            <select {...register("teamSize")} className={`${inputClass} cursor-pointer`}>
              <option value="">Select team size</option>
              <option>10–25 people</option>
              <option>25–50 people</option>
              <option>50–100 people</option>
              <option>100+ people</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Training Interests</label>
            <textarea
              {...register("trainingInterests")}
              rows={4}
              placeholder="Tell us about your training needs, goals, and areas of interest..."
              className={`${inputClass} resize-none`}
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-red-500">
              {submitError || "Something went wrong. Please try again."}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Request a Consultation"}
          </Button>

          <div className="mt-8 grid gap-6 border-t border-nm-border pt-8 md:grid-cols-2">
            {[
              { icon: Phone, label: "Enterprise Hotline", value: contact.phoneDisplay },
              { icon: Mail, label: "Email Us", value: contact.email },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="nm-gradient flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-nm-teal/30">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-xs text-nm-muted">{label}</div>
                  <div className="text-sm font-medium text-nm-body">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EnterprisePage({ courses }: { courses: CourseCard[] }) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* ── Hero ── */}
      <section className="nm-dark-panel relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <BlobBackground variant="dark" />

        <motion.div
          ref={heroRef}
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? "show" : "hidden"}
          className="relative mx-auto max-w-7xl text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-nm-teal/40 bg-nm-teal/10 px-4 py-1.5 text-sm font-bold text-nm-teal"
          >
            Enterprise Learning Solutions
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mb-6 font-display text-5xl font-bold text-white md:text-6xl"
          >
            Build a <span className="nm-gradient-text">Smarter</span>,{" "}
            <span className="nm-gradient-text">Stronger</span>, More Future-Ready Team
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-white/65"
          >
            Your one-stop partner for Learning & Development. We help organizations grow through
            purposeful learning—enabling teams to upskill, reskill, and stay competitive in the
            fast-changing tech landscape.
          </motion.p>

          <motion.div variants={fadeUp} className="mb-14 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => setEnrollOpen(true)}>
              Book a Discovery Call
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <a href="#contact">View Sample Programs</a>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto grid max-w-3xl gap-5 md:grid-cols-3">
            {[
              { value: "500+", label: "Professionals Trained" },
              { value: "50+", label: "Corporate Partners" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md"
              >
                <div className="nm-gradient-text mb-1 text-3xl font-bold">{stat.value}</div>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Services ── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="What We Offer"
                title={
                  <>
                    Our <span className="nm-gradient-text">Services</span>
                  </>
                }
                subtitle="Comprehensive learning solutions for every organization"
              />
            </motion.div>

            <div className="grid gap-7 md:grid-cols-3">
              {services.map((service) => (
                <motion.div key={service.title} variants={fadeUp}>
                  <SpotlightCard className="h-full p-8 text-center">
                    <div className="nm-gradient mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-nm-teal/30">
                      <service.icon size={28} />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-nm-navy">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-nm-muted">{service.description}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="bg-nm-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="Solutions By Sector"
                title={
                  <>
                    Tailored for <span className="nm-gradient-text">Every Sector</span>
                  </>
                }
                subtitle="Specialized training programs for different organizational needs"
              />
            </motion.div>

            <div className="space-y-7">
              {sectors.map((sector, i) => (
                <motion.div
                  key={sector.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                  <Card
                    className={`overflow-hidden shadow-[0_2px_20px_rgba(13,45,82,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(0,189,184,0.15)] ${
                      sector.flagship ? "ring-2 ring-nm-teal/50" : ""
                    }`}
                  >
                    <div className="grid md:grid-cols-3">
                      <div
                        className={`nm-gradient order-1 p-8 text-white ${i % 2 === 1 ? "md:order-2" : "md:order-1"}`}
                      >
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                          <sector.icon size={28} />
                        </div>
                        {sector.flagship && (
                          <span className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                            Most Requested
                          </span>
                        )}
                        <h3 className="mb-3 text-2xl font-bold">{sector.title}</h3>
                        <p className="text-sm leading-relaxed text-white/80">{sector.description}</p>
                      </div>
                      <div
                        className={`order-2 p-8 md:col-span-2 ${i % 2 === 1 ? "md:order-1" : "md:order-2"}`}
                      >
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-nm-body uppercase">
                          What We Offer
                        </h4>
                        <ul className="mb-6 space-y-3">
                          {sector.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-nm-teal" />
                              <span className="text-sm leading-relaxed text-nm-body">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-nm-border pt-4">
                          <p className="mb-3 text-xs font-medium tracking-wider text-nm-muted uppercase">
                            Sample Programs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sector.courses.map((course) => (
                              <span
                                key={course}
                                className="rounded-full border border-nm-border bg-nm-surface px-2.5 py-1 text-xs font-medium text-nm-body"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Partner Benefits ── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="Why Partner"
                title={
                  <>
                    Why Partner with <span className="nm-gradient-text">Next Minds</span>
                  </>
                }
                subtitle="Proven results that drive organizational success"
              />
            </motion.div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {partnerBenefits.map((benefit) => (
                <motion.div key={benefit.title} variants={fadeUp}>
                  <SpotlightCard className="h-full p-6">
                    <div className="nm-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md shadow-nm-teal/30">
                      <benefit.icon size={22} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-nm-navy">{benefit.title}</h3>
                    <p className="text-sm leading-relaxed text-nm-muted">{benefit.description}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-nm-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="Partner Stories"
                title={
                  <>
                    What Our <span className="nm-gradient-text">Partners</span> Say
                  </>
                }
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-nm-teal to-nm-blue p-[1px] shadow-[0_8px_40px_rgba(0,189,184,0.12)]"
            >
              <Card className="rounded-[15px]">
                <CardContent className="p-10 md:p-12">
                  <div className="mb-4 text-5xl leading-none text-nm-teal">&ldquo;</div>
                  <p className="mb-8 text-lg leading-relaxed text-nm-body">
                    Next Minds helped us upskill our entire development team with their
                    comprehensive MERN stack program. The training was practical, relevant, and
                    immediately applicable to our projects. Our team&apos;s productivity and code
                    quality have significantly improved.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="nm-gradient flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-nm-navy">Rajesh Sharma</div>
                      <div className="text-sm text-nm-muted">CTO, TechCorp Nepal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="Our Process"
                title={
                  <>
                    How We <span className="nm-gradient-text">Work With You</span>
                  </>
                }
                subtitle="A collaborative approach to ensure maximum impact"
              />
            </motion.div>

            <div className="relative grid gap-8 md:grid-cols-4">
              <div className="absolute top-8 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-nm-teal/40 to-transparent md:block" />
              {workSteps.map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="nm-gradient relative mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg shadow-nm-teal/30">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-nm-navy">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-nm-muted">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="nm-dark-panel relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <BlobBackground variant="dark" />
        <div className="relative mx-auto max-w-4xl">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <SectionEyebrow
                label="Get Started"
                title={
                  <>
                    Let&apos;s Transform Your <span className="nm-gradient-text">Organization</span>
                  </>
                }
                subtitle="Book a free consultation to discuss your training needs"
                dark
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <EnterpriseContactForm />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {enrollOpen && (
          <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} courses={courses} />
        )}
      </AnimatePresence>
    </div>
  );
}
