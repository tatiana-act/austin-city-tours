import React from 'react';
import Hero from '@/components/Hero';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import { faqs as faqsRu } from '@/data/faq';
import { faqs as faqsEn } from '@/data/faq.en';
import { upcomingTours } from '@/data/upcomingTours';
import pastTours from '@/data/RecentTours';
import { TourProgram, PastTourEvent } from '@/types/tour';
import HomeClient from '@/components/HomeClient';
import { getAllReviews } from "@/app/actions/readAllFeedbacks";
import ReviewSection from "@/components/ReviewsSection";
import { headers } from 'next/headers';
import { parseCentralTime } from '@/lib/utils';
import RecentEventsSection from '@/components/RecentEventsSection';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const allReviews = await getAllReviews();
  const userAgent = (await headers()).get('user-agent') || '';
  const isMobileDevice = /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
  const tours = locale === 'en' ? toursEn : toursRu;
  const faqs = locale === 'en' ? faqsEn : faqsRu;

  const allTours: Map<string, TourProgram> = new Map(
    tours.map(tour => [tour.id, tour] as const),
  );

  const now = new Date();
  const futureUpcomingTours = upcomingTours.filter(tour => parseCentralTime(tour.date, tour.time) >= now);
  const pastTourIds = new Set(pastTours.map(t => t.id));
  const expiredUpcomingTours: PastTourEvent[] = upcomingTours.filter(
    tour => parseCentralTime(tour.date, tour.time) < now && !pastTourIds.has(tour.id)
  );
  const mergedPastTours = [...pastTours];
  for (const expired of expiredUpcomingTours) {
    const insertAt = mergedPastTours.findIndex(t => t.date <= expired.date);
    if (insertAt === -1) {
      mergedPastTours.push(expired);
    } else {
      mergedPastTours.splice(insertAt, 0, expired);
    }
  }

  return (
    <main>
      <Hero allTours={allTours} />
      <HomeClient allTours={allTours} tours={tours} upcomingTours={futureUpcomingTours} isMobileDevice={isMobileDevice} locale={locale} />
      <RecentEventsSection pastTours={mergedPastTours} tours={tours} locale={locale} />
      <ReviewSection reviews={allReviews} allTours={allTours} />
      <FAQSection faqs={faqs} />
      <Footer />
    </main>
  );
}