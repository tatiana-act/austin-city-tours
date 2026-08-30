import React, { useCallback, useState, useEffect, useSyncExternalStore } from 'react';
import { TourProgram } from '@/types/tour';
import type { ProgramPoi } from '@/lib/poi';
import TourCard from './TourCard';
import {useTranslations} from "next-intl";

interface ToursSectionProps {
  tours: TourProgram[];
  /** Places per program id, passed straight through to each card. */
  poiByProgram: Record<string, ProgramPoi[]>;
  onBookTour: (tourId: string) => void;
}

// Mobile shows one column, so keep the initial list short — otherwise the
// calendar and the sections below it are a very long scroll away.
const MOBILE_INITIAL_COUNT = 3;

// Three 350px cards, two 32px gaps and 40px of page padding.
const THREE_COLUMN_QUERY = `(min-width: ${350 * 3 + 32 * 2 + 40}px)`;
// Below this the grid is a single column and cards render compact.
const MOBILE_QUERY = '(max-width: 768px)';

/**
 * Reads `show-all-tours-and-scroll` without a cast. `expand` is sent by the
 * arrival from the places list (architecture §4.1); `UpcomingTourCard` sends
 * the same event without it, and keeps its old behaviour.
 */
function readAnnouncement(
  event: Event,
): { tourId: string; expand: boolean } | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail: unknown = event.detail;
  if (typeof detail !== 'object' || detail === null) return null;
  if (!('tourId' in detail)) return null;

  const { tourId } = detail;
  if (typeof tourId !== 'string' || tourId === '') return null;

  return { tourId, expand: 'expand' in detail && detail.expand === true };
}

/**
 * Reads a media query as React state without writing state from an effect.
 * The server — and the first client render, which has to produce the same
 * markup — sees `false`; React re-reads the real value while hydrating.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const ToursSection: React.FC<ToursSectionProps> = ({ tours, poiByProgram, onBookTour }) => {
  const isThreeColumn = useMediaQuery(THREE_COLUMN_QUERY);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // What the current layout shows before "load more" is pressed, and how much
  // that button adds.
  const layoutCount = isThreeColumn ? 6 : MOBILE_INITIAL_COUNT;
  const increment = isThreeColumn ? 3 : isMobile ? MOBILE_INITIAL_COUNT : 2;

  // Tracked separately from the layout and only ever grown, so a resize can
  // widen the list but never hides tours the visitor already loaded.
  const [requestedCount, setRequestedCount] = useState(0);
  const visibleCount = Math.max(layoutCount, requestedCount);

  // The program a visitor arrived at from the places list. Kept here rather
  // than in the card, because the announcement is a window event and only this
  // component listens to it; the card gets it as a prop and folds it into what
  // it shows, so nothing writes state after a render (architecture §4.1).
  const [arrivedTourId, setArrivedTourId] = useState<string | null>(null);

  useEffect(() => {
    const handleShowAllAndScroll = (event: Event) => {
      const announcement = readAnnouncement(event);
      if (!announcement) return;
      const { tourId, expand } = announcement;

      // Grow only when the wanted program is not on screen. `UpcomingTourCard`
      // announces a program only in that case anyway, so its path is unchanged;
      // an arrival by link may well point at a card that is already rendered.
      const index = tours.findIndex(tour => tour.id === tourId);
      setRequestedCount(previous =>
        index >= Math.max(layoutCount, previous) ? tours.length : previous,
      );

      if (expand) setArrivedTourId(tourId);

      setTimeout(() => {
        const elementId = tourId + 'tour-card';
        const element = document.getElementById(elementId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    window.addEventListener('show-all-tours-and-scroll', handleShowAllAndScroll);
    return () =>
      window.removeEventListener(
        'show-all-tours-and-scroll',
        handleShowAllAndScroll
      );
  }, [tours, layoutCount]);

  const handleLoadMore = () => {
    // Grows from what is on screen now, not from `requestedCount`, which starts
    // below the layout's own count.
    setRequestedCount(visibleCount + increment);
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
              poi={poiByProgram[tour.id] ?? []}
              onBookTour={onBookTour}
              isCompact={isMobile}
              hasArrived={tour.id === arrivedTourId}
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
