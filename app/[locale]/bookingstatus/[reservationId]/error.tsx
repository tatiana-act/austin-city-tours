'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import StatusBand from '@/components/StatusBand';

/**
 * The status page's error page (design §6.3, §6.4): the status could not be
 * read — the sheet or Stripe unreachable. Answered with a 5xx, never as
 * "booking not found" [66]; nothing of any reservation; no reload button.
 */
export default function BookingStatusError() {
  const t = useTranslations('BookingStatus');

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-120 flex-col gap-4 px-5 py-10">
        <h1 className="text-ink-muted text-base font-semibold">{t('title')}</h1>
        <StatusBand kind="error" word={t('errorTitle')}>
          <p className="text-ink mt-2 text-base">{t('errorLine1')}</p>
          <p className="text-ink text-base">{t('errorLine2')}</p>
        </StatusBand>
      </div>
    </main>
  );
}
