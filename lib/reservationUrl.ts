import type { ReservationLocale } from '@/types/reservation';

/**
 * The origin the request came in on: `x-forwarded-proto` + `host` (architecture
 * §4.1). That is the host the payer is on and already has access to.
 */
export function requestOrigin(headers: Headers): string {
  const host = headers.get('host') ?? 'localhost:3000';
  const forwarded = headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwarded || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * The status-page URL encoded in the QR and written to sheet column H
 * (architecture §4.5): `/{locale}/bookingstatus/{id}/` on the origin of
 * `PILOT_SHARE_URL`, carrying every query parameter of that link — the Vercel
 * shareable-link token that lets a scanner without a Vercel login through
 * (V10, [AD §9]). Without the variable (local development only) the request's
 * own origin is used.
 *
 * Throws when `PILOT_SHARE_URL` is set but is not a URL.
 */
export function statusPageUrl(locale: ReservationLocale, id: string, origin: string): string {
  const share = process.env.PILOT_SHARE_URL;
  const shareUrl = share ? new URL(share) : null;
  const url = new URL(
    `/${locale}/bookingstatus/${encodeURIComponent(id)}/`,
    shareUrl ? shareUrl.origin : origin,
  );
  shareUrl?.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  return url.toString();
}
