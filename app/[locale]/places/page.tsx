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
          {t('back')}
        </Link>
      </div>

      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('title')}</h1>

          {/* The list says nothing about its own completeness — no count, no
              "more coming" (PRD AC 7b). It is simply the list. */}
          <ul className="mx-auto flex max-w-3xl flex-col gap-10">
            {places.map(place => (
              // The anchor sits on the entry, not on its name, so an arrival
              // from a panel lands on the whole record; `scroll-mt` keeps the
              // name off the top edge (architecture §4.2, design §2.5). Built
              // from the id, not the name: the name is localized, the anchor
              // must not be.
              <li
                key={place.id}
                id={`poi-${place.id}`}
                className="scroll-mt-12 border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
              >
                {/* The place name is plain text, here and everywhere else
                    (PRD §7.1). */}
                <h2 className="text-ink text-2xl font-bold">{place.name}</h2>

                <p className="text-ink-muted mt-3 leading-relaxed">
                  {place.description}
                </p>

                {/* Programs before the map: the link that goes deeper into the
                    site stands above the one that leaves it, and a place always
                    has at least one program — it exists because a program
                    visits it. Each name is a link to that program's card on the
                    homepage, one per line. */}
                <p className="text-ink-muted mt-4 text-sm font-semibold">
                  {t('seenOnTours')}
                </p>
                <ul className="mt-1 flex list-none flex-col gap-1 p-0">
                  {place.programs.map(program => (
                    <li key={program.id}>
                      <Link
                        href={`/${locale}/#${program.id}tour-card`}
                        className="text-brand hover:text-brand-dark underline-offset-2 hover:underline focus-visible:underline"
                      >
                        {program.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* The one point in the feature that takes the visitor off the
                    site, so it is last in the entry and marked as external:
                    permanent underline, an arrow, a new tab. */}
                <a
                  href={place.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-dark mt-4 inline-block text-sm font-semibold underline underline-offset-2"
                >
                  {t('mapLink')} <span aria-hidden="true">↗</span>
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
