import React from 'react';
import { useTranslations } from 'next-intl';
import type { PoiView } from '@/lib/poi';

interface PoiListProps {
  poi: PoiView[];
  /**
   * Heading level for the block title — `h4` inside a tour card, `h2` on the
   * date page, matching each document's existing outline. Content and order are
   * the same either way; only the tag differs.
   */
  headingLevel?: 2 | 4;
}

/**
 * The places one program visits.
 *
 * Shared by the homepage accordion and the tour date page on purpose: two views
 * of one list may not disagree (PRD AC 16, AC 24), and sharing the component
 * makes that structural instead of a thing to re-check.
 *
 * Order is the order of the array — the linking table's order, which is not
 * localized, so RU and EN cannot drift apart.
 */
const PoiList: React.FC<PoiListProps> = ({ poi, headingLevel = 4 }) => {
  const t = useTranslations('Places');

  // A program with no places renders nothing at all: no empty section, no
  // placeholder, no "coming soon" (PRD AC 7a). Eight of the twelve programs are
  // in this state.
  if (poi.length === 0) return null;

  const Heading = headingLevel === 2 ? 'h2' : 'h4';

  // Day groups in first-seen order. A program without a day split — every one
  // but `Auswe` — yields a single group with no label, i.e. a flat list.
  const groups: { day?: number; places: PoiView[] }[] = [];
  for (const place of poi) {
    const last = groups.at(-1);
    if (last && last.day === place.day) {
      last.places.push(place);
    } else {
      groups.push({ day: place.day, places: [place] });
    }
  }

  return (
    <div className="tour-highlights">
      <Heading className="highlights-title">{t('whatWeSee')}</Heading>

      {groups.map((group, index) => (
        <div key={group.day ?? index} className="mb-3 last:mb-0">
          {group.day !== undefined && (
            <p className="text-ink mt-2 text-sm font-semibold">
              {t('day', { n: group.day })}
            </p>
          )}

          <ul className="flex list-none flex-col gap-1 p-0">
            {group.places.map(place => (
              <li key={place.id} className="text-ink-muted py-1 text-sm">
                <a
                  href={place.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-dark font-semibold"
                  title={t('openMap')}
                >
                  📍 {place.name}
                </a>
                {place.description && <> — {place.description}</>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PoiList;
