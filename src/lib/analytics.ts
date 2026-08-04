/**
 * Google Tag Manager container.
 *
 * Defaults to the production container so the tag works without extra setup,
 * but stays overridable: set NEXT_PUBLIC_GTM_ID to a different container for a
 * staging site, or to an empty string to switch tracking off entirely (useful
 * for local work, so development traffic does not land in your analytics).
 *
 * Must be NEXT_PUBLIC_ — the value is read in the browser.
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-59LSJGH8";

/** Nothing renders when the container is blank. */
export const analyticsEnabled = GTM_ID.trim().length > 0;
