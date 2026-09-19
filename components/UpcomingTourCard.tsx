// components/UpcomingTourCard.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { UpcomingTourEvent } from '@/types/tour';
import { formatDateToUserLocale } from '@/lib/utils';
import { useTranslations } from "next-intl";
import { FaFacebook, FaTelegram, FaShare } from 'react-icons/fa';
import PayButton from './PayButton';
import PaymentNotice from './PaymentNotice';

interface UpcomingTourCardProps {
  upcomingTour: UpcomingTourEvent;
  tourName: string;
  /** `event.price ?? program.price`; 0 = unpriced: no price line, no pay block. */
  effectivePrice: number;
  isMobileDevice: boolean;
  locale: string;
}

const UpcomingTourCard: React.FC<UpcomingTourCardProps> = ({
  upcomingTour,
  tourName,
  effectivePrice,
  isMobileDevice,
  locale
}) => {
  const handleClick = () => {
    const elementId = upcomingTour.tourProgramId + 'tour-card';
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      const event = new CustomEvent('show-all-tours-and-scroll', {
        detail: { tourId: upcomingTour.tourProgramId },
      });
      window.dispatchEvent(event);
    }
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>, platform: string, text: string, title: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#tour-card-${upcomingTour.id.valueOf()}`;
    const encodedUrl = encodeURIComponent(url);
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    } else if (platform === 'telegram') {
      const encText = encodeURIComponent(text);
      window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encText}`, '_blank');
    } else if (platform === 'share') {
      const sharedData: ShareData = {
        title: text,
        text: title,
        url: url,
      }

      if(navigator.canShare && typeof navigator.canShare === 'function'
        && navigator.canShare(sharedData)) {
        try {
          await navigator.share(sharedData);
        } catch (error) {
          console.log("Share failed:", error);
        }
      }
    }
  };

  const t = useTranslations('Upcoming');
  const shareText = t('shareText', { tourName: tourName, date: upcomingTour.date, time: upcomingTour.time })
  const shareTitle = t('shareTitle')
  const isPriced = effectivePrice > 0;
  const noticeId = `pay-notice-${upcomingTour.id}`;
  return (
    <div className="upcoming-tour-card" onClick={handleClick} id={'tour-card-' + upcomingTour.id.valueOf()}>
      <div className="upcoming-tour-content">
        <h4 className="upcoming-tour-name">{tourName}</h4>
        <div className="upcoming-tour-details">
          <div className="tour-datetime">
            <span className="date">
              📅 {formatDateToUserLocale(upcomingTour.date, locale)}
            </span>
            <span className="time">🕐 {upcomingTour.time}</span>
          </div>
          {upcomingTour.bonus && <div className="tour-highlights">{t(upcomingTour.bonus)}</div>}
          {isPriced && (<div className="tour-price">💲 {effectivePrice}{t('currency')}</div>)}
        </div>
        <div className="share-buttons">
          {isMobileDevice && (<button className="share-button share" onClick={async (e) => handleShare(e, 'share', shareText, shareTitle)} title={t('share')}>
            <FaShare />
          </button>)}
          <button className="share-button facebook" onClick={async (e) => handleShare(e, 'facebook', shareText, shareTitle)} title={t('shareOnFb')}>
            <FaFacebook />
          </button>
          <button className="share-button telegram" onClick={async (e) => handleShare(e, 'telegram', shareText, shareTitle)} title={t('shareOnFb')}>
            <FaTelegram />
          </button>
        </div>
        <div className="upcoming-tour-actions">
          <Link
            href={`/${locale}/tours/${upcomingTour.id}`}
            className="details-link"
            onClick={(e) => e.stopPropagation()}
          >
            {t('details')}
          </Link>
          {/* The list hides a date at its start time, so on the card price
              alone decides (architecture §3). */}
          {isPriced && (
            <>
              <PayButton eventId={upcomingTour.id} locale={locale} label={t('join')} noticeId={noticeId} />
              <PaymentNotice id={noticeId} locale={locale} isolateClicks />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingTourCard;
