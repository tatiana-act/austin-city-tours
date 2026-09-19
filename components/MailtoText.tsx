import React from 'react';
import { GUIDE_EMAIL } from '@/lib/payment';

interface MailtoTextProps {
  /** Plain text that may contain tatiana.city.guide@gmail.com. */
  text: string;
  /** Keep a click on the address from reaching a clickable parent (the date card). */
  isolateClicks?: boolean;
}

const linkClass = 'text-brand-dark underline underline-offset-2 break-words';

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

/**
 * Plain text with the guide's address rendered as a `mailto:` link, wherever it
 * appears (design §2.8). Everything else stays plain text (architecture §7.2).
 */
export default function MailtoText({ text, isolateClicks = false }: MailtoTextProps) {
  const parts = text.split(GUIDE_EMAIL);
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a
              href={`mailto:${GUIDE_EMAIL}`}
              className={linkClass}
              onClick={isolateClicks ? stopPropagation : undefined}
            >
              {GUIDE_EMAIL}
            </a>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

/** The same link, for `t.rich` messages whose `<mail>` tag wraps the address. */
export function mailtoChunk(chunks: React.ReactNode) {
  return (
    <a href={`mailto:${GUIDE_EMAIL}`} className={linkClass}>
      {chunks}
    </a>
  );
}
