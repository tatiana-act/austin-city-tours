// Which places each program visits, in the order they are shown.
//
// This table is the single source of truth for which places exist: `PoiId` is
// derived from it, so `poi.links.ts`, `poi.ru.ts` and `poi.en.ts` are all
// `Record<PoiId, …>` and the compiler rejects a place that has no text in one
// locale, and a place no program visits.
//
// Deliberately not localised: RU and EN cannot drift apart in order or content.

type ProgramId =
  | 'Acap'
  | 'Haust'
  | 'Gcrt'
  | 'Rrock'
  | 'Brmn'
  | 'Auswe'
  | 'Auhnry'
  | 'Hyde'
  | 'Acstm'
  | 'Albjwc'
  | 'Amhry'
  | 'Milt';

// `day` groups a multi-day programme. Only `Auswe` has one; everywhere else the
// field is absent and the list renders flat.
type PoiRef = { poi: string; day?: number };

// This table is also the release queue: a place is linked here only once its RU
// and EN descriptions exist, so an unwritten place is absent from the data
// entirely rather than present as a placeholder (PRD v2.2 §5.1, O17).
export const programPoi = {
  Acap: [{ poi: 'capitol' }],
} as const satisfies Partial<Record<ProgramId, readonly PoiRef[]>>;

export type PoiId = (typeof programPoi)[keyof typeof programPoi][number]['poi'];
