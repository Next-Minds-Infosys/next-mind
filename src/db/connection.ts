/**
 * One place that decides how we talk to Postgres.
 *
 * Both the Sequelize instance and better-auth's `pg` pool used to build this
 * independently, which is how they ended up with slightly different SSL
 * settings and two separate log warnings on every cold start.
 */

/**
 * `sslmode` and `channel_binding` are stripped from the URL.
 *
 * We pass an explicit `ssl` object below, so the query parameters are
 * redundant - and pg-connection-string prints a SECURITY WARNING on every
 * process start when it sees `sslmode=require`, because that value is about to
 * change meaning in pg v9. Removing it silences the warning without changing
 * behaviour: TLS is still enforced by the `ssl` option.
 */
export function cleanConnectionString(url: string) {
  return url.replace(/[?&](sslmode|channel_binding)=[^&]*/g, "").replace(/\?$/, "");
}

export function isLocalDatabase(url: string) {
  return /(localhost|127\.0\.0\.1)/.test(url);
}

/**
 * TLS policy.
 *
 * Verification is ON by default. Neon (and RDS, and most managed Postgres)
 * present certificates that chain to roots already in Node's trust store, so
 * the old `rejectUnauthorized: false` was giving up MITM protection for no
 * reason. Verified against Neon before switching.
 *
 * - `DATABASE_CA_CERT` pins a specific CA, for providers using a private root.
 * - `DATABASE_SSL_INSECURE=true` is the escape hatch if a provider genuinely
 *   cannot present a verifiable chain. It is deliberately awkward to set.
 */
export function sslOptions(url: string) {
  if (isLocalDatabase(url)) return undefined;

  if (process.env.DATABASE_CA_CERT) {
    return { ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true as const };
  }
  if (process.env.DATABASE_SSL_INSECURE === "true") {
    return { rejectUnauthorized: false as const };
  }
  return { rejectUnauthorized: true as const };
}
