// components/UpcomingToursSection.tsx
import React from 'react';
import { TourProgram, UpcomingTourEvent } from '@/types/tour';
import UpcomingTourCard from './UpcomingTourCard';
import { useTranslations } from "next-intl";
import { effectivePrice } from '@/lib/payment';

interface UpcomingToursSectionProps {
  upcomingTours: UpcomingTourEvent[];
  allTours: ReadonlyMap<string, TourProgram>;
  /** No longer used: the card's button starts payment (Stripe pilot, architecture §3). */
  onReserveSpot: (tourId: string) => void;
  isMobileDevice: boolean;
  locale: string;
}

const UpcomingToursSection: React.FC<UpcomingToursSectionProps> = ({
  upcomingTours,
  allTours,
  isMobileDevice,
  locale
}) => {
  const t = useTranslations('Upcoming');
  return (
    <section className="section upcoming-tours-section" id="upcomingTours">
      <div className="container">
        <h2 className="section-title">{t('title')}</h2>
        {/*<p className="section-subtitle">Reserve your spot for these scheduled tours</p>*/}
        <div className="upcoming-tours-grid">
          {upcomingTours.map(upcomingTour => {
            const program = allTours.get(upcomingTour.tourProgramId);
            return (
              <UpcomingTourCard
                key={upcomingTour.id}
                upcomingTour={upcomingTour}
                tourName={program?.title || ''}
                effectivePrice={program ? effectivePrice(upcomingTour, program) : 0}
                isMobileDevice={isMobileDevice}
                locale={locale}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingToursSection;
