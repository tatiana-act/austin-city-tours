'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from './Modal';
import BookingForm from './BookingForm';
import MyConstants from '@/lib/MyConstants';
import { TourProgram } from '@/types/tour';

interface AboutBioProps {
  locale: string;
  allTours: Map<string, TourProgram>;
}

const AboutBio: React.FC<AboutBioProps> = ({ locale, allTours }) => {
  const t = useTranslations('About');
  const tBooking = useTranslations('BookingForm');
  const [isBookingOpen, setBookingOpen] = useState(false);

  // Cross-page section links need a full navigation with an explicit trailing
  // slash (trailingSlash: true) so the browser scrolls to the target section.
  const upcomingHref = `/${locale}/#${MyConstants.idEvents}`;

  return (
    <>
      <p className="about-bio-lead">{t('bio1')}</p>
      <p>{t('bio2')}</p>
      <p>{t('bio3')}</p>
      <p>
        {t.rich('bio4', {
          upcoming: (chunks) => (
            <a href={upcomingHref} className="about-inline-link">
              {chunks}
            </a>
          ),
          booking: (chunks) => (
            <button
              type="button"
              className="about-inline-link about-inline-button"
              onClick={() => setBookingOpen(true)}
            >
              {chunks}
            </button>
          ),
        })}
      </p>

      <div className="about-actions">
        <button type="button" className="cta-button" onClick={() => setBookingOpen(true)}>
          {t('cta')}
        </button>
      </div>

      {isBookingOpen && (
        <Modal isOpen={isBookingOpen} title={tBooking('title')} onClose={() => setBookingOpen(false)}>
          <BookingForm allTours={allTours} onClose={() => setBookingOpen(false)} />
        </Modal>
      )}
    </>
  );
};

export default AboutBio;
