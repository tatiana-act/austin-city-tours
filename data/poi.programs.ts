// Which places each program visits, in the order they are shown.
//
// This table is the single source of truth for which places exist: `PoiId` is
// derived from it, so `poi.links.ts`, `poi.ru.ts` and `poi.en.ts` are all
// `Record<PoiId, …>` and the compiler rejects a place that has no text in one
// locale, and a place no program visits.
//
// Deliberately not localised: RU and EN cannot drift apart in order or content.

// Exported: the catalogue entry types the program id it builds its link to the
// homepage from off this union (architecture §2.1, §3).
export type ProgramId =
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

// Third invariant: this table is never empty (PRD §5.1, architecture §2.6).
// Plain inference does not catch an empty one — `PoiId` degrades to `never`,
// which `Record<never, …>` satisfies with empty text files, so the build stays
// green while the page renders a heading over nothing. The assertion below
// fails instead: on an empty table `NonEmptyCatalogue` is `never` and `true`
// cannot be assigned to it. The tuple wrapper is required — a bare
// `PoiId extends never` distributes over the union and would resolve to `never`
// for the wrong reason. Exported so it is not read as an unused constant.
type NonEmptyCatalogue = [PoiId] extends [never] ? never : true;
export const catalogueIsNotEmpty: NonEmptyCatalogue = true;
