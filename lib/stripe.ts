import Stripe from 'stripe';
import type { Reservation, ReservationLocale, ReservationStatus } from '@/types/reservation';

/**
 * Stripe client from `STRIPE_SECRET_KEY` (architecture §3, §6).
 *
 * A getter rather than a module-level instance: the SDK throws on construction
 * without a key, and a missing key must fail closed at the point of use —
 * `startCheckout` returns `failed`, the webhook answers 400 — not crash every
 * module that imports this one. The API version is the one pinned by the
 * installed SDK (`stripe` in package.json), matching the endpoint (§4.3).
 */
let client: Stripe | null = null;

export class StripeNotConfiguredError extends Error {
  constructor() {
    super('STRIPE_SECRET_KEY is not set');
    this.name = 'StripeNotConfiguredError';
  }
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError();
  if (!client) client = new Stripe(key);
  return client;
}

/** The metadata map written on both the Checkout Session and its PaymentIntent (§2.2). */
export interface ReservationMetadata {
  reservation_id: string;
  event_id: string;
  program_id: string;
  date: string;
  locale: ReservationLocale;
}

export function toReservationLocale(value: string | undefined | null): ReservationLocale {
  return value === 'ru' ? 'ru' : 'en';
}

function customFieldText(session: Stripe.Checkout.Session, key: string): string {
  const field = session.custom_fields.find((f) => f.key === key);
  return field?.text?.value ?? '';
}

/**
 * A reservation built from a paid Checkout Session. `session` must have been
 * retrieved with `line_items` expanded. Returns null when the session was not
 * made by this site (no `reservation_id`).
 */
export function reservationFromSession(
  session: Stripe.Checkout.Session,
  paymentIntentId: string,
  status: ReservationStatus,
  createdAt: string,
): Reservation | null {
  const metadata = session.metadata ?? {};
  const id = metadata.reservation_id;
  if (!id) return null;
  return {
    id,
    name: customFieldText(session, 'name'),
    programId: metadata.program_id ?? '',
    eventId: metadata.event_id ?? '',
    date: metadata.date ?? '',
    guests: session.line_items?.data[0]?.quantity ?? 0,
    amountUsd: (session.amount_total ?? 0) / 100,
    email: session.customer_details?.email ?? '',
    locale: toReservationLocale(metadata.locale),
    status,
    paymentIntentId,
    createdAt,
  };
}

/** The id of a PaymentIntent field that may be expanded or not. */
export function paymentIntentIdOf(
  value: string | Stripe.PaymentIntent | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}
