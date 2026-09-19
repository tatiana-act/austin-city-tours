export type ReservationStatus = 'valid' | 'not valid';
export type ReservationLocale = 'en' | 'ru';

/** A paid place on a tour date, made through the Stripe pilot (architecture §2.1). */
export interface Reservation {
  /** Booking id, UUID v4. */
  id: string;
  /** Checkout custom field `name`, as typed. */
  name: string;
  /** `TourProgram.id` — language-neutral, permanent. */
  programId: string;
  /** `UpcomingTourEvent.id` — informational only. */
  eventId: string;
  /** `event.date`, `YYYY-MM-DD`, Central Time. */
  date: string;
  /** Line-item quantity, 1..15. */
  guests: number;
  /** `session.amount_total / 100`. */
  amountUsd: number;
  /** `session.customer_details.email`. */
  email: string;
  /** Locale of the page where payment started. */
  locale: ReservationLocale;
  status: ReservationStatus;
  /** `pi_…` */
  paymentIntentId: string;
  /** ISO-8601 UTC, time of fulfilment. */
  createdAt: string;
}
