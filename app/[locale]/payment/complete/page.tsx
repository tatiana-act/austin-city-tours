import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getCompletionState } from '@/lib/paymentCompletion';
import { programTitle } from '@/lib/programTitle';
import { formatDateToUserLocale } from '@/lib/utils';
import { toReservationLocale } from '@/lib/stripe';
import QrActions from '@/components/QrActions';
import { mailtoChunk } from '@/components/MailtoText';
import type { Reservation } from '@/types/reservation';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
};

async function sessionIdOf(searchParams: Props['searchParams']): Promise<string | undefined> {
  const { session_id } = await searchParams;
  const value = Array.isArray(session_id) ? session_id[0] : session_id;
  return value && value.length <= 255 ? value : undefined;
}

const TITLE_KEY = { A: 'notConfirmedTitle', B: 'receivedTitle', C: 'shownTitle' } as const;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PaymentComplete' });
  // The same per-request evaluation as the page ([AD §17]): `<title>` = the state's h1.
  const state = await getCompletionState(await sessionIdOf(searchParams));

  return {
    title: t(TITLE_KEY[state.kind]),
    robots: { index: false, follow: false },
    alternates: null,
  };
}

/** State B: the QR, once (design §5.2). */
async function Received({
  locale,
  reservation,
  qrDataUrl,
}: {
  locale: string;
  reservation: Reservation;
  qrDataUrl: string;
}) {
  const t = await getTranslations({ locale, namespace: 'PaymentComplete' });
  const tStatus = await getTranslations({ locale, namespace: 'BookingStatus' });
  const tour = programTitle(reservation.programId, toReservationLocale(locale));
  const date = formatDateToUserLocale(reservation.date, locale);

  return (
    <>
      <h1 className="text-ink text-2xl font-bold">{t('receivedTitle')}</h1>
      <div>
        <p className="text-ink font-bold">{t('receivedWarning')}</p>
        <p className="text-ink">{t('receivedHint')}</p>
      </div>
      <Image
        src={qrDataUrl}
        alt={t('qrAlt', { tour, date })}
        width={512}
        height={512}
        unoptimized
        className="size-56 bg-white md:size-64"
      />
      <QrActions
        dataUrl={qrDataUrl}
        fileName={`austin-city-tours-${reservation.date}.png`}
        saveLabel={t('save')}
        shareLabel={t('share')}
      />
      {/* The same fields in the same order as the status page (design §5.2). */}
      <dl className="mt-2 flex flex-col gap-3">
        <div>
          <dt className="text-note text-ink-muted">{tStatus('guests')}</dt>
          <dd className="text-ink text-xl font-bold">{reservation.guests}</dd>
        </div>
        <div>
          <dt className="text-note text-ink-muted">{tStatus('name')}</dt>
          <dd className="text-ink font-bold break-words">{reservation.name}</dd>
        </div>
        <div>
          <dt className="text-note text-ink-muted">{tStatus('tour')}</dt>
          <dd className="text-ink break-words">{tour}</dd>
        </div>
        <div>
          <dt className="text-note text-ink-muted">{tStatus('date')}</dt>
          <dd className="text-ink">{date}</dd>
        </div>
      </dl>
    </>
  );
}

export default async function PaymentCompletePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PaymentComplete' });
  const tPayment = await getTranslations({ locale, namespace: 'Payment' });
  const state = await getCompletionState(await sessionIdOf(searchParams));

  return (
    <main className="min-h-screen bg-white">
      {/* No link off the page in state B: leaving it loses the QR (design §5.1). */}
      {state.kind !== 'B' && (
        <div className="tour-detail-back-bar">
          <Link href={`/${locale}`} className="tour-detail-back-link">
            {tPayment('back')}
          </Link>
        </div>
      )}

      <div className="mx-auto flex max-w-120 flex-col gap-4 px-5 py-10">
        {state.kind === 'A' && (
          <>
            <h1 className="text-ink text-2xl font-bold">{t('notConfirmedTitle')}</h1>
            <p className="text-ink leading-relaxed break-words">
              {t.rich('notConfirmedText', { mail: mailtoChunk })}
            </p>
          </>
        )}

        {state.kind === 'C' && (
          <>
            <h1 className="text-ink text-2xl font-bold">{t('shownTitle')}</h1>
            <p className="text-ink leading-relaxed break-words">
              {t.rich('shownText', { mail: mailtoChunk })}
            </p>
          </>
        )}

        {state.kind === 'B' && (
          <Received locale={locale} reservation={state.reservation} qrDataUrl={state.qrDataUrl} />
        )}
      </div>
    </main>
  );
}
