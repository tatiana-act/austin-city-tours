import { programTitle } from '@/lib/programTitle';
import type { Reservation } from '@/types/reservation';

/**
 * Telegram texts of the pilot, in English, not localized (architecture §7.3).
 * `tourEn` = EN `TourProgram.title`; `date` = `YYYY-MM-DD` from the data.
 */

/** [9] */
export function newBookingText(r: Reservation): string {
  return `New booking from ${r.name}: ${programTitle(r.programId, 'en')}, date: ${r.date}, guests: ${r.guests}`;
}

/** [34]; stage-1 draft wording [63]. */
export function notSavedText(r: Reservation): string {
  return `Paid reservation NOT SAVED to the sheet yet, check the payment in Stripe — ${r.name}: ${programTitle(r.programId, 'en')}, date: ${r.date}, guests: ${r.guests}`;
}

/** [10] */
export function chargebackText(name: string, tourEn: string, date: string): string {
  return `Chargeback for reservation made by ${name} for tour ${tourEn} date: ${date}`;
}
