import { useSyncExternalStore } from 'react';

/**
 * Count of back-forward-cache restores of this document (architecture §4.1.1).
 *
 * The browser's Back from Stripe can restore a card or date page with the pay
 * form still pending. Components key their form by this count, so a restore
 * remounts the form at rest. A module-level store read through
 * `useSyncExternalStore` — no `setState` in an effect (`.claude/skills`).
 */
let restoreCount = 0;
const listeners = new Set<() => void>();
let listening = false;

function handlePageShow(event: PageTransitionEvent) {
  if (!event.persisted) return;
  restoreCount += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Attached once, on the first subscriber, and kept for the document's life:
  // the restore it counts happens after the page was hidden, so the listener
  // must already be there when the page goes into the cache.
  if (!listening) {
    window.addEventListener('pageshow', handlePageShow);
    listening = true;
  }
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => restoreCount;
const getServerSnapshot = () => 0;

export function usePageRestoreCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
