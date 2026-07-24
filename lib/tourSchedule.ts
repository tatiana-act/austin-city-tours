import { upcomingTours } from '@/data/upcomingTours';
import pastTours from '@/data/RecentTours';
import { PastTourEvent, UpcomingTourEvent } from '@/types/tour';
import { parseCentralTime } from '@/lib/utils';

export interface TourSchedule {
  /** Upcoming tours that have not started yet (Central Time), in source order. */
  futureUpcomingTours: UpcomingTourEvent[];
  /**
   * RecentTours plus any upcoming tours whose start time has passed and that
   * aren't already listed in RecentTours, inserted in date order.
   */
  mergedPastTours: PastTourEvent[];
}

/**
 * Splits the tour schedule relative to `now`. Shared by the homepage and the
 * standalone calendar page so both show the same past/future events.
 */
export function getTourSchedule(now: Date = new Date()): TourSchedule {
  const futureUpcomingTours = upcomingTours.filter(
    (tour) => parseCentralTime(tour.date, tour.time) >= now,
  );

  const pastTourIds = new Set(pastTours.map((t) => t.id));
  const expiredUpcomingTours: PastTourEvent[] = upcomingTours.filter(
    (tour) => parseCentralTime(tour.date, tour.time) < now && !pastTourIds.has(tour.id),
  );

  const mergedPastTours = [...pastTours];
  for (const expired of expiredUpcomingTours) {
    const insertAt = mergedPastTours.findIndex((t) => t.date <= expired.date);
    if (insertAt === -1) mergedPastTours.push(expired);
    else mergedPastTours.splice(insertAt, 0, expired);
  }

  return { futureUpcomingTours, mergedPastTours };
}
