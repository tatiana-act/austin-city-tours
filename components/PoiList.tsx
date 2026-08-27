'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FaListUl } from 'react-icons/fa';
import type { ProgramPoi } from '@/lib/poi';

interface PoiListProps {
  poi: ProgramPoi[];
  /**
   * Heading level for the block title — `h4` inside a tour card, `h2` on the
   * date page, matching each document's existing outline. Content and order are
   * the same either way; only the tag differs.
   */
  headingLevel?: 2 | 4;
}

/**
 * The places one program visits: the caption and the names. A name is a
 * control — clicking it opens a panel with that place's description and a link
 * to its entry on the places page (PRD AC 28). No map link here: that one lives
 * on the list page only.
 *
 * Shared by the homepage accordion and the tour date page on purpose: two views
 * of one list may not disagree in composition or in behaviour (PRD AC 16,
 * AC 24, AC 28), and sharing the component makes that structural instead of a
 * thing to re-check. On the date page — a Server Component — this is a client
 * island (architecture §4.3).
 *
 * Order is the order of the array — the linking table's order, which is not
 * localized, so RU and EN cannot drift apart.
 */
const PoiList: React.FC<PoiListProps> = ({ poi, headingLevel = 4 }) => {
  const t = useTranslations('Places');
  const locale = useLocale();
  // Panels are addressed by `aria-controls`, and one place can appear in two
  // lists on one page (`capitol` in `Acap` and in `Auswe`), so the id has to be
  // unique per list instance, not per place.
  const instanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * The open place, or nothing. One state per list, so "at most one panel"
   * holds by construction inside this list and does not reach across lists —
   * the scope the owner chose (architecture §4.3).
   */
  const [openId, setOpenId] = useState<ProgramPoi['id'] | null>(null);

  // Escape and a click outside the block close the open panel (design §3.3).
  // Both write state from an event handler, never from the effect body.
  useEffect(() => {
    if (openId === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    const handlePointerDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setOpenId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [openId]);

  // A program with no places renders nothing at all: no empty section, no
  // placeholder, no "coming soon" (PRD AC 7a).
  if (poi.length === 0) return null;

  const Heading = headingLevel === 2 ? 'h2' : 'h4';
  const panelId = (id: string) => `${instanceId}-poi-${id}`;

  // Day groups in first-seen order. A program without a day split — every one
  // but `Auswe` — yields a single group with no label, i.e. a flat list.
  const groups: { day?: number; places: ProgramPoi[] }[] = [];
  for (const place of poi) {
    const last = groups.at(-1);
    if (last && last.day === place.day) {
      last.places.push(place);
    } else {
      groups.push({ day: place.day, places: [place] });
    }
  }

  return (
    <div className="tour-highlights" ref={rootRef}>
      <Heading className="highlights-title">{t('youWillSee')}</Heading>

      {groups.map((group, index) => (
        <div key={group.day ?? index} className="mb-3 last:mb-0">
          {group.day !== undefined && (
            <p className="text-ink mt-2 text-sm font-semibold">
              {t('day', { n: group.day })}
            </p>
          )}

          {/* A running list, not a column: the neighbouring `highlights` block
              is a column of ticks, so the shape alone tells the two apart, and
              the longest program (15 places) costs a few lines instead of
              fifteen. Names are set like that block — same size, same muted
              colour, normal weight (PRD AC 27) — and the dotted underline is
              what marks a name as a control rather than a link. Each name is an
              inline-block, so it moves to the next line whole rather than
              breaking mid-name, and the separator is glued to the name before
              it by a non-breaking space. */}
          <p className="text-ink-muted">
            {group.places.map((place, placeIndex) => (
              <React.Fragment key={place.id}>
                <span className="inline-block">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId(current => (current === place.id ? null : place.id))
                    }
                    aria-expanded={openId === place.id}
                    aria-controls={panelId(place.id)}
                    className={
                      'hover:text-brand focus-visible:text-brand cursor-pointer text-left font-normal underline decoration-dotted underline-offset-4' +
                      (openId === place.id ? ' text-brand' : '')
                    }
                  >
                    {place.name}
                  </button>
                  {placeIndex < group.places.length - 1 && (
                    <span aria-hidden="true">&nbsp;·</span>
                  )}
                </span>{' '}
              </React.Fragment>
            ))}
          </p>

          {/* Every place gets its panel node in every render, and the state
              decides visibility only (architecture §4.3): that is what puts the
              descriptions into the server HTML. The panels sit under their own
              day group, so the distance from a name to its panel is bounded by
              the group rather than by the whole list. */}
          {group.places.map(place => (
            <div
              key={place.id}
              id={panelId(place.id)}
              hidden={openId !== place.id}
              className="mt-2 rounded-lg bg-gray-50 p-3"
            >
              <p className="text-ink-muted">{place.description}</p>
              {/* Internal link, same tab, no external marker; an icon carries
                  no text, so its accessible name is the title of the places
                  page — the same key that renders it (PRD §7.4). */}
              <Link
                href={`/${locale}/places/#poi-${place.id}`}
                aria-label={t('title')}
                className="text-brand hover:text-brand-dark mt-2 inline-flex items-center"
              >
                <FaListUl aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PoiList;
