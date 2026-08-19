import React, { useState, useRef, useEffect } from 'react';
import { TourProgram } from '@/types/tour';
import type { ProgramPoi } from '@/lib/poi';
import Image from 'next/image';
import PoiList from './PoiList';
import {useTranslations} from "next-intl";

interface TourCardProps {
  tour: TourProgram;
  /** Places this program visits. Empty for a program that has none yet. */
  poi: ProgramPoi[];
  onBookTour: (tourId: string) => void;
  isCompact?: boolean;
  /**
   * The visitor arrived at this card by the link from the places list, so it
   * shows its details straight away — on a phone too, where the card would
   * otherwise be a teaser (PRD AC 25, architecture §4.1). Set for at most one
   * card at a time.
   */
  hasArrived?: boolean;
}

/**
 * What the visitor did to this card. Three states rather than a boolean: an
 * arrival opens a card the visitor has not touched, but must not override a
 * card the visitor deliberately collapsed, and "collapsed" is not the same as
 * "untouched" once an arrival is in play (architecture §4.1).
 */
type CardInteraction = 'untouched' | 'expanded' | 'collapsed';

const TourCard: React.FC<TourCardProps> = ({ tour, poi, onBookTour, isCompact = false, hasArrived = false }) => {
  const [interaction, setInteraction] = useState<CardInteraction>('untouched');
  const prevInteraction = useRef(interaction);

  useEffect(() => {
    // Collapsing scrolls back to the top of the card, so the visitor does not
    // land in the middle of the grid. Driven by the visitor's own action, not
    // by `showDetails`, which also flips when hydration discovers the layout.
    if (prevInteraction.current !== 'collapsed' && interaction === 'collapsed') {
      const elementId = tour.id.valueOf() + 'tour-card';
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    prevInteraction.current = interaction;
  }, [interaction, tour.id]);

  const handleBookClick = () => {
    onBookTour(tour.id);
  };

  // Details show on a roomy layout always; on a compact one if the visitor
  // opened the card, or arrived at it by link and has not collapsed it since.
  // The arrival is folded into this expression instead of being written into
  // state from an effect (architecture §4.1, and context.md question 20).
  const showDetails =
    !isCompact ||
    interaction === 'expanded' ||
    (hasArrived && interaction !== 'collapsed');

  const toggleExpand = () => {
    setInteraction(showDetails ? 'collapsed' : 'expanded');
  };
  const t = useTranslations('ToursSection');

  // Collapsed on mobile: the photo, the title and a two-line faded teaser are
  // one single expand control, so there is no separate button to hunt for.
  if (!showDetails) {
    return (
      <div className="tour-card" id={tour.id.valueOf() + 'tour-card'}>
        <button
          type="button"
          className="tour-teaser"
          onClick={toggleExpand}
          aria-expanded={false}
        >
          <div className="tour-image-container">
            <Image
              src={tour.imageUrl}
              alt={tour.title}
              className="tour-image"
              width={400}
              height={300}
            />
          </div>
          <div className="tour-content">
            <h3 className="tour-title">{tour.title}</h3>
            <div className="tour-teaser-text">
              <p className="tour-teaser-description">{tour.description}</p>
            </div>
            <span className="tour-teaser-hint">{t('expand')}</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="tour-card" id={tour.id.valueOf() + 'tour-card'}>
      <div className="tour-image-container">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          className="tour-image"
          width={400}
          height={300}
        />
      </div>
      <div className="tour-content">
        <div className="tour-header">
          <div>
            <h3 className="tour-title">{tour.title}</h3>
            <div className="tour-meta">
              <span>⏱️ {tour.duration}</span>
            </div>
          </div>
          {/*<div className="tour-price">${tour.price}</div>*/}
        </div>

        <p className="tour-description">{tour.description}</p>

        <div className="tour-highlights">
          <h4 className="highlights-title">{t('youLike')}</h4>
          <ul className="highlights-list">
            {tour.highlights.slice(0, 4).map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>

        {tour.extra && <div className="tour-highlights">{tour.extra}</div>}

        <PoiList poi={poi} />

        <div className="meeting-point">
          <strong>{t('meetingPoint')}</strong>{' '}
          {tour.meetingPointLink.trim() === '' ? <span>{tour.meetingPoint}</span> :
            <a href={tour.meetingPointLink} target="_blank">
              📍{tour.meetingPoint}📍
            </a>
          }
        </div>
        <div className="button-container">
          <button className="book-button" onClick={handleBookClick}>
            {t('reserve')}
          </button>
        </div>
        {isCompact && (
          <div className="mt-4 text-center">
            <button onClick={toggleExpand} className="text-blue-500 hover:text-blue-700 underline text-sm">
              {t('collapse')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCard;
