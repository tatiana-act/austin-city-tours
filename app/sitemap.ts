import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SITE_URL;

    // Real, indexable pages only. Do NOT list `#anchor` URLs — Google ignores
    // fragments, so they just add duplicates of the page they live on.
    // Tour detail pages and /tours/next (a redirect) are intentionally excluded:
    // the detail pages are date-based and expire (soft-404s in Search Console),
    // and /tours/next always redirects, so it isn't a real content page.
    const routes = ['', 'about', 'tours/calendar']

    return routes.flatMap((path) =>
        routing.locales.map((locale) => {
            const suffix = path ? `/${path}` : ''
            return {
                url: `${baseUrl}/${locale}${suffix}/`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: path === '' ? 1 : 0.8,
                alternates: {
                    languages: {
                        'en': `${baseUrl}/en${suffix}/`,
                        'ru': `${baseUrl}/ru${suffix}/`,
                        'x-default': `${baseUrl}/en${suffix}/`, // Для Google
                    },
                },
            }
        })
    )
}
