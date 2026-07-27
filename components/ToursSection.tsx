import React, { useState, useEffect } from 'react';
import { TourProgram } from '@/types/tour';
import TourCard from './TourCard';
import {useTranslations} from "next-intl";

interface ToursSectionProps {
  tours: TourProgram[];
  onBookTour: (tourId: string) => void;
}

// Mobile shows one column, so keep the initial list short — otherwise the
// calendar and the sections below it are a very long scroll away.
const MOBILE_INITIAL_COUNT = 3;

const ToursSection: React.FC<ToursSectionProps> = ({ tours, onBookTour }) => {
  const [visibleCount, setVisibleCount] = useState(MOBILE_INITIAL_COUNT);
  const [increment, setIncrement] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const threeColumnsMinWidth = 350 * 3 + 32 * 2 + 40;
    const minWidthQueryText = `(min-width: ${threeColumnsMinWidth}px)`;
    const mediaQuery = window.matchMedia(minWidthQueryText);

    // Check for mobile (single column usually < 768px or based on grid)
    // Here using a standard breakpoint for simplicity, or we can reuse the grid logic if preferred. 
    // Given the prompt "if horizontal space is limited, and site displays just one column"
    // Let's assume < 768px for single column mobile view.
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    const handleResize = () => {
      const mobileStatus = mobileQuery.matches;
      setIsMobile(mobileStatus);

      // Logic for Increment (pagination). Deliberately leaves visibleCount
      // alone so a resize never hides tours the visitor already loaded.
      if (mediaQuery.matches) { // 3 columns
        setIncrement(3);
      } else {
        setIncrement(mobileStatus ? MOBILE_INITIAL_COUNT : 2);
      }
    };

    // Initial check
    const mobileStatus = mobileQuery.matches;
    setIsMobile(mobileStatus);

    if (mediaQuery.matches) {
      setVisibleCount(6);
      setIncrement(3);
    } else {
      setVisibleCount(MOBILE_INITIAL_COUNT);
      setIncrement(mobileStatus ? MOBILE_INITIAL_COUNT : 2);
    }

    mediaQuery.addEventListener('change', handleResize);
    mobileQuery.addEventListener('change', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      mobileQuery.removeEventListener('change', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleShowAllAndScroll = (event: Event) => {
      const customEvent = event as CustomEvent;
      const tourId = customEvent.detail?.tourId;
      if (tourId) {
        setVisibleCount(tours.length);
        setTimeout(() => {
          const elementId = tourId + 'tour-card';
          const element = document.getElementById(elementId);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    window.addEventListener('show-all-tours-and-scroll', handleShowAllAndScroll);
    return () =>
      window.removeEventListener(
        'show-all-tours-and-scroll',
        handleShowAllAndScroll
      );
  }, [tours.length]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + increment);
  };

  const visibleTours = tours.slice(0, visibleCount);
  const t = useTranslations('ToursSection');

  return (
    <section id="tours" className="section">
      <div className="container">
        <h2 className="section-title">{t('title')}</h2>
        <div className="tours-grid">
          {visibleTours.map(tour => (
            <TourCard
              key={tour.id}
              tour={tour}
              onBookTour={onBookTour}
              isCompact={isMobile}
            />
          ))}
        </div>
        {visibleCount < tours.length && (
          <div className="flex justify-center mt-8">
            <button onClick={handleLoadMore} className="cta-button">
              {t('btnMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToursSection;
