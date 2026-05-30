import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { upcomingTours } from '@/data/upcomingTours';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import { getAllReviews } from '@/app/actions/readAllFeedbacks';
import { formatDateToUserLocale } from '@/lib/utils';
import ReviewCard from '@/components/ReviewCard';
import TourDetailClient from '@/components/TourDetailClient';

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; tourEventId: string }>;
}) {
  const { locale, tourEventId } = await params;

  const event = upcomingTours.find((t) => t.id === tourEventId);
  if (!event) notFound();

  const tours = locale === 'en' ? toursEn : toursRu;
  const program = tours.find((t) => t.id === event.tourProgramId);
  if (!program) notFound();

  const allReviews = await getAllReviews();
  const tourReviews = allReviews.filter((r) => r.tourProgramId === event.tourProgramId);

  const t = await getTranslations({ locale, namespace: 'TourDetail' });
  const tUpcoming = await getTranslations({ locale, namespace: 'Upcoming' });
  const tTours = await getTranslations({ locale, namespace: 'ToursSection' });
  const tReviews = await getTranslations({ locale, namespace: 'Reviews' });

  const price = event.price ?? program.price;
  const bonus = event.bonus ? tUpcoming(event.bonus) : null;

  return (
    <main className="tour-detail-page">
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}#upcomingTours`} className="tour-detail-back-link">
          {t('back')}
        </Link>
      </div>

      <div className="tour-detail-hero">
        <div className="tour-detail-image-wrapper">
          <Image
            src={program.imageUrl}
            alt={program.title}
            fill
            className="tour-detail-image"
            priority
          />
        </div>
        <div className="tour-detail-info">
          <h1 className="tour-detail-title">{program.title}</h1>
          <div className="tour-detail-attributes">
            <div className="tour-detail-attr">
              <span>📅</span>
              <span>{formatDateToUserLocale(event.date, locale)}</span>
            </div>
            <div className="tour-detail-attr">
              <span>🕐</span>
              <span>{event.time}</span>
            </div>
            <div className="tour-detail-attr">
              <span>⏱️</span>
              <span>{program.duration}</span>
            </div>
            <div className="tour-detail-attr">
              <span>💲</span>
              <span>{price > 0 ? `${price}${tUpcoming('currency')}` : t('free')}</span>
            </div>
            {bonus && (
              <div className="tour-detail-attr tour-detail-bonus">
                <span>🎁</span>
                <span>{bonus}</span>
              </div>
            )}
          </div>
          <TourDetailClient tourProgram={program} />
        </div>
      </div>

      <section className="tour-detail-section container">
        <p className="tour-description">{program.description}</p>

        <div className="tour-highlights">
          <h2 className="highlights-title">{tTours('youLike')}</h2>
          <ul className="highlights-list">
            {program.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {program.extra && <div className="tour-highlights">{program.extra}</div>}

        <div className="meeting-point">
          <strong>{tTours('meetingPoint')}</strong>{' '}
          {program.meetingPointLink.trim() === '' ? (
            <span>{program.meetingPoint}</span>
          ) : (
            <a href={program.meetingPointLink} target="_blank" rel="noopener noreferrer">
              📍 {program.meetingPoint} 📍
            </a>
          )}
        </div>
      </section>

      <section className="tour-detail-reviews-section container">
        <h2 className="section-title">{tReviews('title')}</h2>
        {tourReviews.length === 0 ? (
          <p className="tour-detail-no-reviews">{t('noReviews')}</p>
        ) : (
          <div className="reviews-grid">
            {tourReviews.map((review) => (
              <ReviewCard key={review.id} review={review} tourTitle={program.shortTitle} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
