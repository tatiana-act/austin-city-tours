import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { paymentPolicy as policyRu } from '@/data/paymentPolicy';
import { paymentPolicy as policyEn } from '@/data/paymentPolicy.en';
import MailtoText from '@/components/MailtoText';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Payment' });

  return {
    title: t('policyLink'),
    // Out of search (architecture §8): noindex, and no canonical or hreflang —
    // the layout's would otherwise point at the home page.
    robots: { index: false, follow: false },
    alternates: null,
  };
}

export default async function PaymentPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Payment' });
  const { policy } = locale === 'en' ? policyEn : policyRu;

  return (
    <main className="min-h-screen bg-white">
      <div className="tour-detail-back-bar">
        <Link href={`/${locale}`} className="tour-detail-back-link">
          {t('back')}
        </Link>
      </div>

      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('policyLink')}</h1>

          {/* Sections in order: an optional h2, then plain paragraphs; 2 rem
              between sections whether or not the next one has a heading
              (design §7, architecture §7.2). */}
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            {policy.map((section, i) => (
              <div key={i} className="flex flex-col">
                {section.heading && (
                  <h2 className="text-ink mb-2 text-xl leading-snug font-bold break-words">
                    {section.heading}
                  </h2>
                )}
                <div className="flex flex-col gap-4">
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j} className="text-ink text-base leading-relaxed break-words">
                      <MailtoText text={paragraph} />
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
