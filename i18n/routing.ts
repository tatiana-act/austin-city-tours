import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'ru'],

    // Used when no locale matches
    defaultLocale: 'en',
    localePrefix: 'always',

    // Don't emit next-intl's automatic hreflang `Link` header. Its `x-default`
    // points at the bare root `/`, which competed with our canonical and made
    // Google pick `/` over `/en/`. We declare hreflang ourselves in metadata.
    alternateLinks: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
