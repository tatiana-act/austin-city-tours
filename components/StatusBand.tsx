import React from 'react';

export type BandKind = 'valid' | 'notValid' | 'notFound' | 'error';

interface StatusBandProps {
  kind: BandKind;
  word: string;
  /** Under the word: the date, or the error page's lines. */
  children?: React.ReactNode;
}

// Colour and border are further carriers of the state, never the only one: the
// word carries the meaning (design §6.3).
const LOOK: Record<BandKind, { band: string; glyph: string }> = {
  valid: { band: 'bg-green-700 text-white', glyph: '✓' },
  notValid: { band: 'bg-red-700 text-white', glyph: '✕' },
  notFound: { band: 'border-2 border-solid border-ink-muted text-ink', glyph: '?' },
  error: { band: 'border-2 border-dashed border-ink-muted text-ink', glyph: '↻' },
};

/** The status band of the booking status page and its error page (design §6.3). */
export default function StatusBand({ kind, word, children }: StatusBandProps) {
  const { band, glyph } = LOOK[kind];
  return (
    <div className={`flex w-full flex-col items-center rounded-xl px-5 py-4 text-center ${band}`}>
      <span aria-hidden="true" className="text-2xl leading-none">
        {glyph}
      </span>
      <p className="md:text-figure mt-1 text-2xl font-bold break-words">{word}</p>
      {children}
    </div>
  );
}
