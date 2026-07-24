import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../globals.css';
import React from "react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import type { Graph } from 'schema-dts';
import type { Metadata } from 'next'

const SITE_URL = 'https://austin-city-tours.vercel.app';

async function buildGraph(locale: string): Promise<Graph> {
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
  const tAbout = await getTranslations({ locale, namespace: 'About' });

  const aboutUrl = `${SITE_URL}/${locale}/about`;
  const personId = `${SITE_URL}/#tatiana`;
  const aboutId = `${aboutUrl}#about`;
  const inLanguage = locale === 'ru' ? 'ru-RU' : 'en-US';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: 'Tatiana Orlova',
        url: aboutUrl,
        mainEntityOfPage: { '@id': aboutId },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Austin city tour guide',
          qualifications: 'city expert',
        },
      },
      {
        '@type': 'AboutPage',
        '@id': aboutId,
        url: aboutUrl,
        name: tAbout('pageTitle'),
        inLanguage,
        description: tMeta('description'),
        mainEntity: { '@id': personId },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${locale}`,
        url: `${SITE_URL}/${locale}`,
        name: tMeta('title'),
        inLanguage,
        description: tMeta('description'),
        about: { '@id': aboutId },
        mainEntity: { '@id': personId },
      },
    ],
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://austin-city-tours.vercel.app'),
    title: {
      default: t('title'),
      template: '%s | Austin City Tours',
    },
    description: t('description'),
    keywords: t('keywords').split(',').map((k: string) => k.trim()),
    verification: {
      google: "B7Ct-qStJLf0MwYWx5zZwurbBgaNG14Zr_uRJkOJaiQ"
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://austin-city-tours.vercel.app/${locale}`,
      siteName: 'Austin City Tours',
      images: [
        {
          url: '/acustom.jpg',
          width: 696,
          height: 524,
          alt: 'Austin City Tours',
        },
      ],
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://austin-city-tours.vercel.app/${locale}`,
      languages: {
        'en': '/en',
        'ru': '/ru',
        'x-default': '/en',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const graph = await buildGraph(locale);

  return (
    <html lang={locale}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
