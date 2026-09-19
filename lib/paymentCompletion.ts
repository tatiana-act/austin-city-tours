import { cache } from 'react';
import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { getStripe, paymentIntentIdOf, reservationFromSession } from '@/lib/stripe';
import { requestOrigin, statusPageUrl } from '@/lib/reservationUrl';
import type { Reservation } from '@/types/reservation';

export type CompletionState =
  | { kind: 'A' }
  | { kind: 'B'; reservation: Reservation; qrDataUrl: string }
  | { kind: 'C' };

const NOT_CONFIRMED: CompletionState = { kind: 'A' };

/**
 * The V3 decision table (architecture §4.2), evaluated once per request: the
 * page and its `generateMetadata` share it through React `cache`, so one request
 * makes one pair of Stripe calls and at most one `qr_shown` write.
 *
 * The flag is written before the QR is rendered. The QR image is generated
 * before the flag, too, so a failure to build it never spends the one showing.
 * This never writes to the sheet or sends Telegram: the webhook is the only
 * writer ([AD §6]).
 */
export const getCompletionState = cache(
  async (sessionId: string | undefined): Promise<CompletionState> => {
    if (!sessionId) return NOT_CONFIRMED;

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent'],
      });
      if (!session.metadata?.reservation_id) return NOT_CONFIRMED;
      if (session.payment_status !== 'paid') return NOT_CONFIRMED;

      const paymentIntent = session.payment_intent;
      const paymentIntentId = paymentIntentIdOf(paymentIntent);
      if (!paymentIntent || typeof paymentIntent === 'string' || !paymentIntentId) {
        return NOT_CONFIRMED;
      }
      if (paymentIntent.metadata.qr_shown) return { kind: 'C' };

      const reservation = reservationFromSession(
        session,
        paymentIntentId,
        'valid',
        new Date().toISOString(),
      );
      if (!reservation) return NOT_CONFIRMED;

      const origin = requestOrigin(await headers());
      const qrDataUrl = await QRCode.toDataURL(
        statusPageUrl(reservation.locale, reservation.id, origin),
        { type: 'image/png', errorCorrectionLevel: 'M', margin: 4, width: 512 },
      );

      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { qr_shown: new Date().toISOString() },
      });

      return { kind: 'B', reservation, qrDataUrl };
    } catch (error) {
      // Stripe error, missing key, bad PILOT_SHARE_URL or failed flag write: not
      // confirmed yet; a reload retries.
      console.error('payment/complete: could not decide the screen state:', error);
      return NOT_CONFIRMED;
    }
  },
);
