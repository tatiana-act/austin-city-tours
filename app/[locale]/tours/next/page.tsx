import { redirect } from 'next/navigation';
import { upcomingTours } from '@/data/upcomingTours';
import { parseCentralTime } from '@/lib/utils';

// The target depends on the current time, so this must be evaluated per request
// (never statically prebuilt or cached).
export const dynamic = 'force-dynamic';

/**
 * Utility route: redirects to the next scheduled tour's detail page, or to the
 * homepage when there are no upcoming tours. Always redirects, so it is not a
 * real content page and is intentionally kept out of the sitemap.
 */
export default async function NextTourRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const now = new Date();

  const nextTour = upcomingTours
    .filter((tour) => parseCentralTime(tour.date, tour.time) >= now)
    .sort(
      (a, b) =>
        parseCentralTime(a.date, a.time).getTime() -
        parseCentralTime(b.date, b.time).getTime(),
    )[0];

  redirect(nextTour ? `/${locale}/tours/${nextTour.id}/` : `/${locale}/`);
}
