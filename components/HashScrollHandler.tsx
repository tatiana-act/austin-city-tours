'use client';

import { useEffect } from 'react';

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
