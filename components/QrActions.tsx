'use client';

import React, { useEffect, useSyncExternalStore } from 'react';

interface QrActionsProps {
  /** PNG data URL of the QR. */
  dataUrl: string;
  fileName: string;
  saveLabel: string;
  shareLabel: string;
}

function fileFromDataUrl(dataUrl: string, fileName: string): File {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], fileName, { type: 'image/png' });
}

// Share support never changes during the page's life: nothing to subscribe to.
const subscribeNever = () => () => {};

function useCanShareFile(dataUrl: string, fileName: string): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => {
      if (typeof navigator.canShare !== 'function') return false;
      try {
        return navigator.canShare({ files: [fileFromDataUrl(dataUrl, fileName)] });
      } catch {
        return false;
      }
    },
    // The server cannot know share support: Save only (architecture §4.5).
    () => false,
  );
}

/**
 * Save always; Share under it where the browser can share an image file
 * (design §5.2, architecture §4.5, [75]). A share error or cancel changes nothing.
 * A page restored from the back-forward cache reloads, so the server answers
 * "already shown" (AC 10).
 */
export default function QrActions({ dataUrl, fileName, saveLabel, shareLabel }: QrActionsProps) {
  const canShare = useCanShareFile(dataUrl, fileName);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleShare = () => {
    navigator.share({ files: [fileFromDataUrl(dataUrl, fileName)] }).catch(() => {
      // Closed without choosing, or the target failed: Save is still there.
    });
  };

  return (
    <div className="flex w-56 flex-col gap-2 md:w-64">
      <a href={dataUrl} download={fileName} className="book-button block text-center">
        {saveLabel}
      </a>
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className="border-brand text-brand-dark hover:bg-brand block w-full cursor-pointer rounded-lg border-2 bg-transparent px-6 py-2.5 text-center font-semibold transition-all duration-300 hover:text-white"
        >
          {shareLabel}
        </button>
      )}
    </div>
  );
}
