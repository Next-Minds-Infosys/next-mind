import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Image
              src="/next-minds-logo.png"
              alt="Next Minds Logo"
              width={120}
              height={48}
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400">
              Empowering Nepal&apos;s future tech leaders with world-class IT
              training and career support.
            </p>
          </div>

          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/enterprise"
                  className="hover:text-teal-400 transition-colors"
                >
                  Enterprise
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-teal-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-4">Popular Courses</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/courses/mern-stack"
                  className="hover:text-teal-400 transition-colors"
                >
                  MERN Stack
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/python-django"
                  className="hover:text-teal-400 transition-colors"
                >
                  Python & Django
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/ui-ux-design"
                  className="hover:text-teal-400 transition-colors"
                >
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/flutter-development"
                  className="hover:text-teal-400 transition-colors"
                >
                  Flutter Development
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Kathmandu, Nepal</li>
              <li>+977-9XXXXXXXXX</li>
              <li>info@nextminds.edu.np</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2026 Next Minds Infosys. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
