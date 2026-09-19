import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { paymentPolicy as policyRu } from '@/data/paymentPolicy';
import { paymentPolicy as policyEn } from '@/data/paymentPolicy.en';
import MailtoText from '@/components/MailtoText';

interface PaymentNoticeProps {
  /** Target of the pay button's `aria-describedby`. */
  id: string;
  locale: string;
  /** On the date card, links must not trigger the card's own click (design §3.2). */
  isolateClicks?: boolean;
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

/**
 * The notice and the policy link beside a pay button (V1, design §3.1). No
 * directive: a server component on the date page, a client one inside the card.
 */
export default function PaymentNotice({ id, locale, isolateClicks = false }: PaymentNoticeProps) {
  const t = useTranslations('Payment');
  const notice = (locale === 'en' ? policyEn : policyRu).notice;

  return (
    <div className="flex flex-col gap-1">
      <p id={id} className="text-note text-ink-muted leading-relaxed break-words">
        <MailtoText text={notice} isolateClicks={isolateClicks} />
      </p>
      <p className="text-note leading-relaxed">
        {/* Padding makes the 44 px target; the negative margin keeps the
            0.25 rem visual gap to the notice (design §2.5, §3.1). */}
        <Link
          href={`/${locale}/payment-policy/`}
          className="text-brand-dark -my-2.5 inline-block py-2.5 underline underline-offset-2"
          onClick={isolateClicks ? stopPropagation : undefined}
        >
          {t('policyLink')}
        </Link>
      </p>
    </div>
  );
}
