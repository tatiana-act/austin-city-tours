'use client';

import { useEffect } from 'react';

/** Suffix of a program card's anchor: `<programId>tour-card`. */
const PROGRAM_ANCHOR_SUFFIX = 'tour-card';

/**
 * Scrolls to the element referenced by the URL hash after the page mounts.
 *
 * Native hash scrolling is unreliable here: sections like the calendar are
 * rendered by client components (FullCalendar) that lay out after hydration,
 * so the browser scrolls before the target has its final size/position.
 *
 * Strategy: poll for the target element, then watch the document with a
 * ResizeObserver and re-scroll on every layout change (e.g. as async content
 * finishes rendering). Stop once the layout has been stable for a short while,
 * or after a hard cap so we never observe forever.
 *
 * It also carries the missing half of the arrival from the places list: a
 * `<programId>tour-card` hash announces the program once, so `ToursSection` can
 * load the card if it is not among the rendered ones and show it open (see the
 * architecture doc §4.1). The announcement reuses the existing window event
 * because this component and `HomeClient` are siblings with no shared client
 * state; its meaning is now wider than its name.
 */
export default function HashScrollHandler() {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));

    let cancelled = false;
    let attempts = 0;
    let observer: ResizeObserver | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanupObserver = () => {
      observer?.disconnect();
      observer = null;
      if (settleTimer) clearTimeout(settleTimer);
    };

    const watchUntilSettled = (el: HTMLElement) => {
      const rescroll = () => {
        if (cancelled) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Consider layout "settled" if nothing else resizes for a moment.
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(cleanupObserver, 500);
      };

      observer = new ResizeObserver(rescroll);
      // Observing the body catches height changes as content below renders in.
      observer.observe(document.body);
      observer.observe(el);

      // Hard cap: never keep re-scrolling for longer than this.
      timers.push(setTimeout(cleanupObserver, 5000));

      rescroll();
    };

    // A program card, not an event card: `tour-card-<eventId>` ends with the
    // id, and the bare `tour-card` belongs to nothing. Every other anchor —
    // `#upcomingCalendar` and the rest — is left alone.
    if (id.endsWith(PROGRAM_ANCHOR_SUFFIX) && id !== PROGRAM_ANCHOR_SUFFIX) {
      const tourId = id.slice(0, -PROGRAM_ANCHOR_SUFFIX.length);
      // Deferred by one turn on purpose: sibling effects run in render order,
      // and this component sits above `HomeClient` in the tree, so a synchronous
      // dispatch would fire before `ToursSection` has subscribed. Mount effects
      // of one commit all run before any timer, so a zero delay is enough.
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          // Sent whether or not the card is already rendered: a rendered card
          // still has to arrive open (architecture §4.1).
          window.dispatchEvent(
            new CustomEvent('show-all-tours-and-scroll', {
              detail: { tourId, expand: true },
            }),
          );
        }, 0),
      );
    }

    const poll = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        watchUntilSettled(el);
      } else if (attempts++ < 40) {
        timers.push(setTimeout(poll, 100));
      }
    };
    poll();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cleanupObserver();
    };
  }, []);

  return null;
}
