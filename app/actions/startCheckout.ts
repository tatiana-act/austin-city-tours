'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { z } from 'zod';
import { routing } from '@/i18n/routing';
import { upcomingTours } from '@/data/upcomingTours';
import { paymentPolicy as policyRu } from '@/data/paymentPolicy';
import { paymentPolicy as policyEn } from '@/data/paymentPolicy.en';
import { effectivePrice, isPayable } from '@/lib/payment';
import { findProgram, programTitle } from '@/lib/programTitle';
import { getStripe, ReservationMetadata } from '@/lib/stripe';
import { requestOrigin } from '@/lib/reservationUrl';
import { formatDateToUserLocale } from '@/lib/utils';
import type { ReservationLocale } from '@/types/reservation';

export type StartCheckoutState = { failed: boolean };

/**
 * V1: Stripe renders Checkout in Russian and shows our custom strings as given.
 * Unverified until S1 with test keys. If it proves false, set this to `false`:
 * Stripe's page and every string the site sends to it then go English for every
 * payer, while the return URLs keep the page's locale (architecture §4.1).
 */
const STRIPE_CHECKOUT_SUPPORTS_RU = true;

/**
 * Stripe's minimum session lifetime is 30 minutes (architecture §4.1, thread A11).
 * One extra minute covers the delay before Stripe receives the request, so the
 * value never falls below that minimum.
 */
const SESSION_LIFETIME_SECONDS = 31 * 60;

const MAX_GUESTS = 15;

const eventIdSchema = z.string().trim().min(1).max(64);
const localeSchema = z.string().trim().max(8);

function checkoutLocaleFor(pageLocale: ReservationLocale): ReservationLocale {
  return STRIPE_CHECKOUT_SUPPORTS_RU ? pageLocale : 'en';
}

/**
 * Starts payment for a scheduled date (architecture §4.1): validates the date
 * on the server, creates a Checkout Session and redirects to it. On a Stripe
 * failure — including a missing `STRIPE_SECRET_KEY` — it returns
 * `{ failed: true }` and nothing is charged.
 */
export async function startCheckout(
  _prev: StartCheckoutState,
  formData: FormData,
): Promise<StartCheckoutState> {
  const localeResult = localeSchema.safeParse(formData.get('locale'));
  const locale = localeResult.success ? localeResult.data : '';
  if (!hasLocale(routing.locales, locale)) redirect('/en/');
  const pageLocale: ReservationLocale = locale;

  const eventResult = eventIdSchema.safeParse(formData.get('eventId'));
  const eventId = eventResult.success ? eventResult.data : '';
  const event = upcomingTours.find((t) => t.id === eventId);
  const program = event ? findProgram(event.tourProgramId, pageLocale) : undefined;
  if (!event || !program) redirect(`/${pageLocale}/`);

  // A page left open overnight, or a date re-priced to 0: back to the date page,
  // which renders without the button and without a message [76].
  if (!isPayable(event, program, new Date())) redirect(`/${pageLocale}/tours/${event.id}/`);

  const checkoutLocale = checkoutLocaleFor(pageLocale);
  const unitPrice = effectivePrice(event, program);
  const reservationId = crypto.randomUUID();
  const metadata: ReservationMetadata = {
    reservation_id: reservationId,
    event_id: event.id,
    program_id: program.id,
    date: event.date,
    locale: pageLocale,
  };

  let sessionUrl: string | null = null;
  try {
    const stripe = getStripe();
    const origin = requestOrigin(await headers());
    const t = await getTranslations({ locale: checkoutLocale, namespace: 'Payment' });
    const notice = (checkoutLocale === 'en' ? policyEn : policyRu).notice;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: checkoutLocale,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: MAX_GUESTS },
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: `${programTitle(program.id, checkoutLocale)} · ${formatDateToUserLocale(event.date, checkoutLocale)}`,
              description: t('pricePerPerson'),
            },
          },
        },
      ],
      custom_fields: [
        {
          key: 'name',
          type: 'text',
          optional: false,
          label: { type: 'custom', custom: t('nameLabel') },
          text: { maximum_length: 100 },
        },
      ],
      custom_text: { submit: { message: notice } },
      success_url: `${origin}/${pageLocale}/payment/complete/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${pageLocale}/tours/${event.id}/`,
      expires_at: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
      metadata: { ...metadata },
      payment_intent_data: {
        metadata: { ...metadata },
        description: `Reservation ${reservationId}`,
      },
    });
    sessionUrl = session.url;
  } catch (error) {
    console.error('startCheckout: creating the Checkout Session failed:', error);
    return { failed: true };
  }

  if (!sessionUrl) {
    console.error('startCheckout: Stripe returned a session without a URL');
    return { failed: true };
  }
  redirect(sessionUrl);
}
