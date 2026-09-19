'use client';

import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { startCheckout, StartCheckoutState } from '@/app/actions/startCheckout';
import { usePageRestoreCount } from '@/lib/pageRestore';

interface PayButtonProps {
  eventId: string;
  locale: string;
  /** The existing label of the place: "Join this tour" or "Reserve a spot". */
  label: string;
  /** Id of the notice the button is described by (design §3.1). */
  noticeId: string;
}

const initialState: StartCheckoutState = { failed: false };

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

function PayForm({ eventId, locale, label, noticeId }: PayButtonProps) {
  const t = useTranslations('Payment');
  const [state, formAction, isPending] = useActionState(startCheckout, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="book-button"
        disabled={isPending}
        aria-busy={isPending}
        aria-describedby={noticeId}
        // The date card scrolls to its program on any click; paying is not that.
        onClick={stopPropagation}
      >
        {isPending ? t('pending') : label}
      </button>
      {state.failed && !isPending && (
        <p role="alert" className="form-error text-note">
          {t('startFailed')}
        </p>
      )}
    </form>
  );
}

/**
 * Pay button of a date card or date page (design §3, architecture §4.1). Keyed by
 * the back-forward restore count, so Back from Stripe shows it at rest (§4.1.1).
 */
export default function PayButton(props: PayButtonProps) {
  const restoreCount = usePageRestoreCount();
  return <PayForm key={restoreCount} {...props} />;
}
