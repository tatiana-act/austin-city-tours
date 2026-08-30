'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FaArrowRight } from 'react-icons/fa';
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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    const handlePointerDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (
        root &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        setOpenId(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [openId]);

  // A program with no places renders nothing at all: no empty section, no
  // placeholder, no "coming soon" (PRD AC 7a).
  if (poi.length === 0) return null;

  const Heading = headingLevel === 2 ? 'h2' : 'h4';
  const panelId = (id: string) => `${instanceId}-poi-${id}`;

  /**
   * Open a place, or close the open one, and bring what was opened into view.
   * The scroll step lives here rather than in an effect, so both views get it
   * from one place (PRD AC 16, architecture §4.4), and it runs on opening only:
   * closing is not a request to see something, so the page stays put
   * (design §3.7 rule 7). A click on a second name is one action — one call,
   * against the newly opened panel.
   */
  const toggle = (id: ProgramPoi['id']) => {
    const next = openId === id ? null : id;

    // A hidden node has no geometry, so the state has to be on the page before
    // anything is measured: a synchronous commit, in this same handler
    // (architecture §4.4). The panel starts moving in the frame it gets its
    // size in — a pause before the movement is the defect, not the movement
    // itself (design §3.7 rule 1).
    flushSync(() => setOpenId(next));
    if (next === null) return;

    // Fetched by id, the way the other scroll call sites in this project do it
    // (`Hero`, `TourCard`, `HashScrollHandler`): `useId` decides the shape of
    // the value, and a lookup by id does not care what characters are in it.
    const panel = document.getElementById(panelId(next));
    if (!panel) return;

    // Both sides measured in pixels at click time, and no constant in the
    // condition: one in `rem` would grow together with the panel, one in `px`
    // would not grow with the text, and an enlarged browser font — the ordinary
    // accessibility setting this branch is really for — would tip either one
    // over (architecture §4.4). `clientHeight` of the root element is the box
    // `scrollIntoView` itself aligns against.
    const tallerThanViewport =
      panel.getBoundingClientRect().height >
      document.documentElement.clientHeight;

    panel.scrollIntoView({
      // `nearest` moves the page by exactly what is missing, in either
      // direction, and not at all when the panel is already whole in view
      // (design §3.7 rules 2, 4). For a panel taller than the window there is
      // no "whole in view": its top goes under the top edge and the rest is
      // read by ordinary scrolling — the bottom is never pinned, which would
      // hide the beginning of the text (design §3.7 rule 6).
      block: tallerThanViewport ? 'start' : 'nearest',
      inline: 'nearest',
      // Smooth is how a visitor sees that the page moved rather than the
      // content changed under them; reduced motion gets the same end position
      // with no frames in between (design §3.7 rule 8).
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  // A role brings no keyboard behaviour of its own — that is the price of
  // replacing the button, and it is paid here (architecture §4.5). Enter and
  // Space both activate; Space also swallows its default, which would scroll
  // the page out from under the panel that just opened.
  const handleNameKeyDown = (
    event: React.KeyboardEvent<HTMLSpanElement>,
    id: ProgramPoi['id'],
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle(id);
  };

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
              what marks a name as a control rather than a link. A name wraps by
              words like ordinary text `[owner, 2026-08-28]`; what may not
              happen is a wrapped name coming apart into two controls
              (design §3.1). */}
          <p className="text-ink-muted">
            {group.places.map((place, placeIndex) => (
              <React.Fragment key={place.id}>
                {/* One inline element per name, and one inline box: a `button`
                    is laid out as an atomic inline-block whatever its classes,
                    and that is the break the owner saw — the separator had no
                    room on its last line and the next name started underneath.
                    Nothing here may become `inline-block`, `inline-flex` or
                    `display: contents` again (architecture §4.5). Because the
                    box is inline, a wrapped name stays one control: the hit
                    area is both lines, the dotted mark continues onto the
                    second by construction, and the focus ring — left to the
                    browser on purpose — is drawn per line fragment, which is
                    exactly what is wanted here. */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(place.id)}
                  onKeyDown={event => handleNameKeyDown(event, place.id)}
                  aria-expanded={openId === place.id}
                  aria-controls={panelId(place.id)}
                  /* `poi-name` carries the whole mark of a control — dotted
                     underline and pointer cursor — in one rule, because without
                     scripts both come off together (app/globals.css, PRD AC 31,
                     design §3.2). Colour is not part of that promise and stays
                     here: brand on hover and focus, and held while the panel is
                     open. */
                  className={
                    'poi-name hover:text-brand focus-visible:text-brand' +
                    (openId === place.id ? ' text-brand' : '')
                  }
                >
                  {place.name}
                </span>
                {/* Outside the control, so the accessible name is the place and
                    nothing else, and glued to the last word of the name by a
                    non-breaking space: a line of the list never opens with a
                    separator and never consists of one (design §3.1). The
                    ordinary space after it is where the next name may wrap. */}
                {placeIndex < group.places.length - 1 && (
                  <span aria-hidden="true">&nbsp;·</span>
                )}{' '}
              </React.Fragment>
            ))}
          </p>

          {/* Every place gets its panel node in every render, and the state
              decides visibility only (architecture §4.3): that is what puts the
              descriptions into the server HTML. The panels sit under their own
              day group, so the distance from a name to its panel is bounded by
              the group rather than by the whole list. */}
          {group.places.map(place => {
            // The arrow is glued to the last word of the description, so it
            // never ends up alone at the start of a line (design §3.3, §3.5).
            const text = place.description.trimEnd();
            const lastSpace = text.lastIndexOf(' ');
            const head = lastSpace === -1 ? '' : text.slice(0, lastSpace + 1);
            const lastWord =
              lastSpace === -1 ? text : text.slice(lastSpace + 1);

            return (
              <div
                key={place.id}
                id={panelId(place.id)}
                hidden={openId !== place.id}
                // A callout, not a footnote: one separator only — a brand-coloured
                // rule down the left, no background and no box, and the gap
                // from rule to text derived from the `highlights` items above
                // it (design §3.3). The whole of it is in `app/globals.css`,
                // because the padding half cannot be written as utilities here:
                // this project's unlayered `*` reset zeroes every Tailwind
                // padding and margin.
                className="poi-panel"
              >
                {/* The panel's own typography, stronger than the names above it:
                    main text colour on muted surroundings, base size, roomier
                    leading. AC 27 governs the list, not the panel (design §3.1). */}
                <p className="text-ink leading-relaxed">
                  {head}
                  {/* The arrow is bound to the last word by a non-breaking
                      space, so the two wrap together and it is never left
                      alone at the start of a line (design §3.5). */}
                  <span className="whitespace-nowrap">
                    {lastWord}&nbsp;
                    <Link
                      href={`/${locale}/places/#poi-${place.id}`}
                      aria-label={t('title')}
                      className="text-brand hover:text-brand-dark py-3.5 pr-7"
                    >
                      <FaArrowRight
                        className="inline align-middle"
                        aria-hidden="true"
                      />
                    </Link>
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PoiList;
