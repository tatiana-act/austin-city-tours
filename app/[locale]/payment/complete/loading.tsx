import React from 'react';
import { getTranslations } from 'next-intl/server';

/**
 * State 0 of the screen after payment (design §5.2, architecture §4.2): shown
 * while the server decides between A, B and C. Reads nothing, decides nothing.
 */
export default async function PaymentCompleteLoading() {
  const t = await getTranslations('PaymentComplete');

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-120 flex-col gap-4 px-5 py-10">
        <h1 className="text-ink text-2xl font-bold">{t('confirmingTitle')}</h1>
        <p className="text-ink leading-relaxed">{t('confirmingText')}</p>
      </div>
    </main>
  );
}
