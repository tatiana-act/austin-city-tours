/**
 * The canonical origin of the site — the one hostname Google should index.
 *
 * Every absolute URL the site publishes is built from this: `metadataBase`,
 * `canonical`, the hreflang alternates, `og:url`, the JSON-LD graph, `sitemap.xml`
 * and `robots.txt`. Keeping it in one place means the value can never disagree
 * with itself across those files.
 *
 * `www` is the canonical form, matching how the domain is configured in Vercel:
 * the apex `austin-city-tours.com` and the old `austin-city-tours.vercel.app` both
 * answer 308 to the `www` host, so only one hostname returns 200. Keep it that way
 * — serving two hosts with 200 produces duplicates no matter what this file says.
 *
 * Do not drop the `www`, and do not add a trailing slash: `trailingSlash: true`
 * appends one per path, and a slash here would produce `//en/`.
 *
 * Deliberately a constant rather than an env var: an env var that is unset or
 * differs between environments silently publishes the wrong canonical, which is
 * the exact failure this file exists to prevent. A domain change is a reviewable
 * one-line commit.
 */
export const SITE_URL = 'https://www.austin-city-tours.com';
