import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    const acceptLanguage = request.headers.get('accept-language') || '';

    // Unified logic: If Accept-Language contains ru, uk, or kk, force it to 'ru'
    // This ensures:
    // 1. uk/kk -> ru
    // 2. ru + en -> ru (prioritizes ru over en)
    // 3. en only -> stays en (matches 'en' in locales)
    // 4. others -> fallback to default 'en'
    if (/(ru|uk|kk)/i.test(acceptLanguage)) {
        const newHeaders = new Headers(request.headers);
        newHeaders.set('accept-language', 'ru');

        request = new NextRequest(request, {
            headers: newHeaders
        });
    }

    return handleI18nRouting(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ru|en)/:path*']
};
