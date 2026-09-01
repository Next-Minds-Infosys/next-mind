/**
 * Browser-side reporting. Inert without a DSN, same as the server config.
 * Only NEXT_PUBLIC_SENTRY_DSN is readable here - the server-only SENTRY_DSN is
 * deliberately not exposed to the client bundle.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Session replay is off: lesson videos and student submissions would be
    // captured, which is student data leaving your infrastructure.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}
