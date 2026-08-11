/**
 * The canonical origin of the site — the one hostname Google should index.
 *
 * Every absolute URL the site publishes is built from this: `metadataBase`,
 * `canonical`, the hreflang alternates, `og:url`, the JSON-LD graph, `sitemap.xml`
 * and `robots.txt`. Keeping it in one place means the value can never disagree
 * with itself across those files.
 *
 * When `austin-city-tours.com` goes live, change this line — and in Vercel make
 * that domain primary with `austin-city-tours.vercel.app` redirecting to it, so
 * only one hostname answers with a 200. Serving both would produce duplicates no
 * matter what this constant says.
 *
 * Deliberately a constant rather than an env var: an env var that is unset or
 * differs between environments silently publishes the wrong canonical, which is
 * the exact failure this file exists to prevent. A domain change is a reviewable
 * one-line commit.
 */
export const SITE_URL = 'https://austin-city-tours.vercel.app';
