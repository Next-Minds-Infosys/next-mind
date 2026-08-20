import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The app previously sent none, so it inherited only browser defaults: the site
 * was framable (clickjacking), leaked full referrer URLs cross-origin, and had
 * no transport pinning.
 *
 * CSP is deliberately Report-Only for now. The marketing pages use inline
 * styles heavily (`style={{...}}` throughout) and Next injects inline
 * bootstrap scripts, so an enforcing policy without 'unsafe-inline' would break
 * the site. Report-Only lets violations be observed first; switch the header
 * name to Content-Security-Policy once the reports are clean.
 */
/**
 * Hosts Google Tag Manager needs. GTM itself serves the container, then loads
 * whatever tags are configured inside it - Google Analytics and Ads are the
 * common ones, so they are allowed here too. Add any other vendor you enable in
 * the GTM console, or its tag will be blocked once the policy is enforced.
 */
const gtm = [
  "https://www.googletagmanager.com",
  "https://tagmanager.google.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
].join(" ");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${gtm}`,
  "style-src 'self' 'unsafe-inline' https://tagmanager.google.com https://fonts.googleapis.com",
  `img-src 'self' data: blob: https://images.unsplash.com ${gtm} https://www.google.com https://ssl.gstatic.com`,
  "media-src 'self' blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' https: ${gtm}`,
  // The GTM noscript fallback, and the Google Maps embed on /contact.
  "frame-src https://www.googletagmanager.com https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // `camera=()` / `microphone=()` is an EMPTY allowlist - it denies the
    // feature to every origin *including this one*, so getUserMedia rejected
    // with NotAllowedError before the browser could even prompt. That was
    // correct while nothing needed them; the instructor screen recorder does.
    // `self` permits only our own origin, so embedded third-party frames still
    // cannot reach the camera or microphone.
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // /about-us was 404ing; the canonical page is /about. Permanent so link
    // equity from anywhere pointing at the old path transfers.
    return [{ source: "/about-us", destination: "/about", permanent: true }];
  },
};

export default nextConfig;
