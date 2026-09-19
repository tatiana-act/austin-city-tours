import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import type { TourProgram } from '@/types/tour';
import type { ReservationLocale } from '@/types/reservation';

/** A program from the language file of `locale`. */
export function findProgram(programId: string, locale: ReservationLocale): TourProgram | undefined {
  return (locale === 'en' ? toursEn : toursRu).find((t) => t.id === programId);
}

/**
 * Program title in `locale`. Programs are permanent (architecture §2.1, [AD §11]);
 * an unknown id falls back to the id itself rather than to an empty string, so a
 * row or message still says something.
 */
export function programTitle(programId: string, locale: ReservationLocale): string {
  return findProgram(programId, locale)?.title ?? programId;
}
