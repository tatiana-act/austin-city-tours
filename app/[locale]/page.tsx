import React from 'react';
import Hero from '@/components/Hero';
import FAQSection from '@/components/FAQSection';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import { faqs as faqsRu } from '@/data/faq';
import { faqs as faqsEn } from '@/data/faq.en';
import { TourProgram } from '@/types/tour';
import HomeClient from '@/components/HomeClient';
import { headers } from 'next/headers';
import { getTourSchedule } from '@/lib/tourSchedule';
import HashScrollHandler from '@/components/HashScrollHandler';
import { getProgramPoi, type ProgramPoi } from '@/lib/poi';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userAgent = (await headers()).get('user-agent') || '';
  const isMobileDevice = /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
  const tours = locale === 'en' ? toursEn : toursRu;
  const faqs = locale === 'en' ? faqsEn : faqsRu;

  const allTours: Map<string, TourProgram> = new Map(
    tours.map(tour => [tour.id, tour] as const),
  );

  // `ToursSection` and `TourCard` are client components, so the places are read
  // here on the server and handed down as a prop rather than imported there.
  const poiByProgram: Record<string, ProgramPoi[]> = Object.fromEntries(
    tours.map(tour => [tour.id, getProgramPoi(tour.id, locale)] as const),
  );

  const { futureUpcomingTours } = getTourSchedule();

  // Compact layout: the calendar, recent tours and the reviews section are
  // hidden. Their components are kept so any of them can be mounted again.
  return (
    <main>
      <HashScrollHandler />
      <Hero allTours={allTours} />
      <HomeClient allTours={allTours} tours={tours} poiByProgram={poiByProgram} upcomingTours={futureUpcomingTours} isMobileDevice={isMobileDevice} locale={locale} />
      <FAQSection faqs={faqs} />
    </main>
  );
}