import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Footer from '@/components/Footer';
import { getPoiCatalog } from '@/lib/poi';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Places' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    // Own canonical so this page isn't folded into the homepage: the shared
    // layout's canonical points at `/`, and without this the page would declare
    // itself a duplicate of it.
    alternates: {
      canonical: `/${locale}/places`,
      languages: {
        en: '/en/places',
        ru: '/ru/places',
        'x-default': '/en/places',
      },
    },
  };
}

export default async function PlacesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Places' });

  const places = getPoiCatalog(locale);

  return (
    <main className="min-h-screen bg-white">
      {/* Back bar */}
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}`} className="tour-detail-back-link">
          ← Austin City Tours
        </Link>
      </div>

      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('title')}</h1>

          {/* The list says nothing about its own completeness — no count, no
              "more coming" (PRD AC 7b). It is simply the list. */}
          <ul className="mx-auto flex max-w-3xl flex-col gap-10">
            {places.map(place => (
              <li
                key={place.id}
                className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
              >
                <h2 className="text-ink text-2xl font-bold">{place.name}</h2>

                <p className="text-ink-muted mt-3 leading-relaxed">
                  {place.description}
                </p>

                {place.programs.length > 0 && (
                  <p className="text-ink-muted mt-3 text-sm">
                    <span className="font-semibold">{t('onTours')}:</span>{' '}
                    {place.programs.map(program => program.title).join(', ')}
                  </p>
                )}

                <a
                  href={place.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-dark mt-3 inline-block font-semibold underline underline-offset-2"
                >
                  {t('openMap')} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
