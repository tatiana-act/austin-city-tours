import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/Footer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <main className="about-page">
      {/* Back bar — matches tour detail page */}
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}`} className="tour-detail-back-link">
          ← Austin City Tours
        </Link>
      </div>

      {/* Hero: photo left, info right — mirrors tour detail hero */}
      <section className="tour-detail-hero">
        <div className="tour-detail-image-wrapper">
          <Image
            src="/tatiana.jpg"
            alt="Tatiana Orlova — Austin City Tours guide"
            fill
            className="tour-detail-image"
            priority
          />
        </div>
        <div className="tour-detail-info">
          <p className="about-tagline">{t('tagline')}</p>
          <h1 className="about-name">Tatiana Orlova</h1>
          <div className="about-stats">
            <div className="about-stat">
              <span className="about-stat-number">{t('statsYears')}</span>
              <span className="about-stat-label">{t('statsYearsLabel')}</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">{t('statsTours')}</span>
              <span className="about-stat-label">{t('statsToursLabel')}</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">{t('statsLang')}</span>
              <span className="about-stat-label">{t('statsLangLabel')}</span>
            </div>
          </div>
          <Link href={`/${locale}#upcomingTours`} className="book-button tour-detail-book-button">
            {t('cta')}
          </Link>
        </div>
      </section>

      {/* Bio — matches tour-detail-section style */}
      <section className="tour-detail-section about-bio-section">
        <p className="about-bio-lead">{t('bio1')}</p>
        <p>{t('bio2')}</p>

        <h2 className="about-bio-heading">{t('bio3Heading')}</h2>
        <p>{t('bio3')}</p>
        <p>{t('bio4')}</p>

        <h2 className="about-bio-heading">{t('bio5Heading')}</h2>
        <p>{t('bio5')}</p>

        <h2 className="about-bio-heading">{t('bio6Heading')}</h2>
        <p>{t('bio6')}</p>
        <p>{t('bio7')}</p>

        <p className="about-sign">
          {t('sign')}<br />
          <strong>Tatiana</strong>
        </p>
      </section>

      <Footer />
    </main>
  );
}
