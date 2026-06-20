"use client";

import { useState } from "react";
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
import EnrollModal from "./EnrollModal";

const sectors = [
  {
    icon: Building2,
    title: "For Colleges & Universities",
    description:
      "Bridge the gap between academic learning and industry requirements",
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
    courses: [
      "E-Governance",
      "Cybersecurity",
      "Digital Service Design",
      "Data Management",
    ],
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
    description:
      "Industry professionals with real-world experience in top tech companies",
  },
  {
    icon: TrendingUp,
    title: "Measurable Results",
    description:
      "Track progress with assessments, projects, and performance metrics",
  },
  {
    icon: Award,
    title: "Recognized Certification",
    description:
      "Industry-recognized certificates for all participants upon completion",
  },
  {
    icon: Shield,
    title: "Flexible Delivery",
    description:
      "On-site, online, or hybrid training options to suit your schedule",
  },
  {
    icon: Zap,
    title: "Ongoing Support",
    description:
      "Post-training support and consultation to ensure continued success",
  },
];

export default function EnterprisePage() {
  const [enrollOpen, setEnrollOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm mb-6">
            Enterprise Learning Solutions
          </div>
          <h1 className="text-5xl md:text-6xl mb-6">
            Build a{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
              Smarter
            </span>
            ,{" "}
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
              Stronger
            </span>
            , More Future-Ready Team
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your one-stop partner for Learning & Development. We help
            organizations grow through purposeful learning—enabling teams to
            upskill, reskill, and stay competitive in the fast-changing tech
            landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setEnrollOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Book a Discovery Call
            </button>
            <a
              href="#contact"
              className="border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full hover:bg-teal-50 transition-all text-center"
            >
              View Sample Programs
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Professionals Trained" },
              { value: "50+", label: "Corporate Partners" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl mb-2 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive learning solutions for every organization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Technical Upskilling",
                description:
                  "Software development, AI, data science, and emerging technology training",
              },
              {
                icon: Users,
                title: "Soft Skills & Leadership",
                description:
                  "Communication, teamwork, problem-solving, and leadership development",
              },
              {
                icon: Zap,
                title: "Productivity Boosters",
                description:
                  "Efficiency tools, agile methodologies, and workflow optimization",
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="text-center p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-2xl mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Tailored for{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Every Sector
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Specialized training programs for different organizational needs
            </p>
          </div>
          <div className="space-y-12">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.title}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 text-white">
                      <Icon size={48} className="mb-4" />
                      <h3 className="text-3xl mb-3">{sector.title}</h3>
                      <p className="text-teal-50">{sector.description}</p>
                    </div>
                    <div className="md:col-span-2 p-8">
                      <h4 className="text-xl mb-4">What We Offer:</h4>
                      <ul className="space-y-3 mb-6">
                        {sector.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle
                              size={20}
                              className="text-teal-600 flex-shrink-0 mt-1"
                            />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm mb-3 text-gray-600">
                          Sample Programs:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {sector.courses.map((course) => (
                            <span
                              key={course}
                              className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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
              Why Partner with{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Next Minds
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Proven results that drive organizational success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Partners
              </span>{" "}
              Say
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-4xl text-teal-600 mb-4">&ldquo;</div>
            <p className="text-xl text-gray-600 mb-6">
              &ldquo;Next Minds helped us upskill our entire development team
              with their comprehensive MERN stack program. The training was
              practical, relevant, and immediately applicable to our projects.
              Our team&apos;s productivity and code quality have significantly
              improved.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                <Users size={32} />
              </div>
              <div>
                <div className="text-lg">Rajesh Sharma</div>
                <div className="text-gray-600">CTO, TechCorp Nepal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              How We{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Work With You
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              A collaborative approach to ensure maximum impact
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Discovery Call",
                description:
                  "Understand your organization's goals, challenges, and learning needs",
              },
              {
                step: "2",
                title: "Custom Design",
                description:
                  "Create tailored curriculum and training program for your team",
              },
              {
                step: "3",
                title: "Deliver Training",
                description:
                  "Execute the program with expert instructors and hands-on projects",
              },
              {
                step: "4",
                title: "Measure & Support",
                description:
                  "Track results and provide ongoing support for continued success",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                  {item.step}
                </div>
                <h3 className="text-xl mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4">
              Let&apos;s Transform Your{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Organization
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Book a free consultation to discuss your training needs
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your Company"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+977-9XXXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Organization Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select type</option>
                  <option>College/University</option>
                  <option>Corporate/Private Company</option>
                  <option>Government Agency</option>
                  <option>NGO/Foundation</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Team Size
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select team size</option>
                  <option>10-25 people</option>
                  <option>25-50 people</option>
                  <option>50-100 people</option>
                  <option>100+ people</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Training Interests
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tell us about your training needs, goals, and any specific areas of interest..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all text-lg"
              >
                Request a Consultation
              </button>
            </form>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Phone className="text-teal-600" size={24} />
                  <div>
                    <div className="text-sm text-gray-600">Enterprise Hotline</div>
                    <div>+977-9XXXXXXXXX</div>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Mail className="text-teal-600" size={24} />
                  <div>
                    <div className="text-sm text-gray-600">Email Us</div>
                    <div>enterprise@nextminds.edu.np</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnrollModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </div>
  );
}
