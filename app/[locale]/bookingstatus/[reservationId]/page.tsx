import React from 'react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { lookupReservation } from '@/lib/reservationLookup';
import { programTitle } from '@/lib/programTitle';
import { toReservationLocale } from '@/lib/stripe';
import { formatDateToUserLocale } from '@/lib/utils';
import StatusBand from '@/components/StatusBand';

type Props = { params: Promise<{ locale: string; reservationId: string }> };

// Static — reads no data, so the noindex also reaches the error path (§8, V17).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BookingStatus' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
    alternates: null,
  };
}

/**
 * V4 — what the QR opens (architecture §4.4, design §6). Dynamic, no login, no
 * language switcher; the language is the URL's, which the QR carries from the
 * payer. A lookup error is thrown to the route's `error.tsx` (5xx, [66]).
 */
export default async function BookingStatusPage({ params }: Props) {
  const { locale, reservationId } = await params;
  const t = await getTranslations({ locale, namespace: 'BookingStatus' });
  const result = await lookupReservation(reservationId);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-120 flex-col gap-4 px-5 py-10">
        <h1 className="text-ink-muted text-base font-semibold">{t('title')}</h1>

        {result.kind === 'absent' ? (
          <StatusBand kind="notFound" word={t('notFound')} />
        ) : (
          <>
            <StatusBand
              kind={result.reservation.status === 'valid' ? 'valid' : 'notValid'}
              word={result.reservation.status === 'valid' ? t('valid') : t('notValid')}
            >
              <p className="mt-1 text-lg">{formatDateToUserLocale(result.reservation.date, locale)}</p>
            </StatusBand>

            {/* The date is in the band and not repeated; no email, no amount. */}
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-note text-ink-muted">{t('guests')}</dt>
                <dd className="text-ink text-figure font-bold">{result.reservation.guests}</dd>
              </div>
              <div>
                <dt className="text-note text-ink-muted">{t('name')}</dt>
                <dd className="text-ink text-xl font-bold break-words">{result.reservation.name}</dd>
              </div>
              <div>
                <dt className="text-note text-ink-muted">{t('tour')}</dt>
                <dd className="text-ink text-base break-words">
                  {programTitle(result.reservation.programId, toReservationLocale(locale))}
                </dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </main>
  );
}
