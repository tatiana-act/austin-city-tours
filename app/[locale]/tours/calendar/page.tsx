import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CalendarSection from '@/components/CalendarSection';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import { getTourSchedule } from '@/lib/tourSchedule';
import { TourProgram } from '@/types/tour';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Calendar' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    // Own canonical so this page indexes on its own (not folded into the homepage).
    alternates: {
      canonical: `/${locale}/tours/calendar`,
      languages: {
        en: '/en/tours/calendar',
        ru: '/ru/tours/calendar',
        'x-default': '/en/tours/calendar',
      },
    },
  };
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const tours = locale === 'en' ? toursEn : toursRu;
  const allTours: Map<string, TourProgram> = new Map(
    tours.map((tour) => [tour.id, tour] as const),
  );

  // Mirror the homepage calendar: future events + past events (including
  // upcoming tours whose date has passed and aren't yet in RecentTours).
  const { futureUpcomingTours, mergedPastTours } = getTourSchedule();

  return (
    <main className="tour-detail-page">
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}`} className="tour-detail-back-link">
          ← Austin City Tours
        </Link>
      </div>

      <CalendarSection
        allTours={allTours}
        upcomingTours={futureUpcomingTours}
        recentTours={mergedPastTours}
        locale={locale}
        variant="standalone"
      />
    </main>
  );
}
