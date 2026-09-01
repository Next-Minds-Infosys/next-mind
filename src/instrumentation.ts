/**
 * Error reporting.
 *
 * Production 500s were previously discovered by reading Vercel logs after the
 * fact. This registers Sentry on both runtimes and forwards every uncaught
 * server error through `onRequestError`.
 *
 * Everything here is inert without SENTRY_DSN, so local development and any
 * environment that has not been given a DSN behave exactly as before rather
 * than failing to boot.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Full error capture, sampled tracing. Traces are the expensive part and
    // 10% is plenty to spot a slow route.
    tracesSampleRate: 0.1,
    // The release ties an error to the exact deploy that produced it.
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    beforeSend(event) {
      // Never ship credentials to a third party, even in a stack frame.
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
}

export const onRequestError = dsn ? Sentry.captureRequestError : undefined;
