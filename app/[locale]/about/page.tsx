import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/Footer';
import AboutBio from '@/components/AboutBio';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import { TourProgram } from '@/types/tour';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  const tours = locale === 'en' ? toursEn : toursRu;
  const allTours: Map<string, TourProgram> = new Map(
    tours.map((tour) => [tour.id, tour] as const),
  );

  return (
    <main className="about-page">
      {/* Back bar */}
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}`} className="tour-detail-back-link">
          ← Austin City Tours
        </Link>
      </div>

      <section className="section about-section">
        <h1 className="section-title">{t('pageTitle')}</h1>

        <div className="about-layout">
          {/* Full, uncropped portrait */}
          <div className="about-photo">
            <Image
              src="/tatiana.jpg"
              alt="Tatiana Orlova — Austin City Tours guide"
              width={577}
              height={1280}
              className="about-photo-img"
              sizes="(max-width: 768px) 100vw, 340px"
              priority
            />
          </div>

          {/* Bio (with live links) and action buttons */}
          <div className="about-content">
            <AboutBio locale={locale} allTours={allTours} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
