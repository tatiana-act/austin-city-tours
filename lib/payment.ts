import type { TourProgram, UpcomingTourEvent } from '@/types/tour';

/**
 * Price and payability rules of the Stripe pilot (architecture §3). Client-safe:
 * the home card imports it, so nothing here may touch the server or tour data.
 */

/** The address the notice, the screen after payment and the policy name. */
export const GUIDE_EMAIL = 'tatiana.city.guide@gmail.com';

/** Price of one guest on a date: the date's own price, else its program's. */
export function effectivePrice(event: UpcomingTourEvent, program: TourProgram): number {
  return event.price ?? program.price;
}

const centralDateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The calendar date of `now` in Austin, as `YYYY-MM-DD`. */
export function centralDate(now: Date): string {
  const parts = centralDateFormat.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * A date can be paid for while it is priced and until the end of its own day in
 * Central Time, including after its start time (PRD AC 2, AC 4).
 */
export function isPayable(event: UpcomingTourEvent, program: TourProgram, now: Date): boolean {
  return effectivePrice(event, program) > 0 && centralDate(now) <= event.date;
}
