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
  Acap: [
    { poi: 'capitol' },
    { poi: 'old_bakery' },
    { poi: 'millet' },
    { poi: 'st_mary' },
    { poi: 'paramount' },
    { poi: 'norwood' },
    { poi: 'angelina' },
    { poi: 'driskill' },
  ],
  Haust: [
    { poi: 'driskill' },
    { poi: 'paramount' },
    { poi: 'millet' },
    { poi: 'txdot' },
    { poi: 'land_office' },
  ],
  Brmn: [
    { poi: 'history_cen' },
    { poi: 'woolridge' },
    { poi: 'travis_court' },
    { poi: 'hirshfield' },
    { poi: 'bremond' },
    { poi: 'john_bremond' },
    { poi: 'pier_bremond' },
    { poi: 'eug_bremond' },
    { poi: 'north_cottage' },
    { poi: 'chateau' },
  ],
  Gcrt: [
    { poi: 'williamson' },
    { poi: 'wil_court' },
    { poi: 'onion_dome' },
    { poi: 'city_post' },
    { poi: 'gtown_art' },
    { poi: 'grace_center' },
    { poi: 'sw_university' },
  ],
  Rrock: [
    { poi: 'chisholm' },
    { poi: 'rr_hall' },
    { poi: 'woodbine' },
    { poi: 'rr_post' },
    { poi: 'sam_bass' },
  ],
  Auswe: [
    { poi: 'capitol', day: 1 },
    { poi: 'driskill', day: 1 },
    { poi: 'paramount', day: 1 },
    { poi: 'old_bakery', day: 1 },
    { poi: 'millet', day: 1 },
    { poi: 'st_mary', day: 1 },
    { poi: 'mayfield', day: 1 },
    { poi: 'covert', day: 1 },
    { poi: 'bat_bridge', day: 1 },
    { poi: 'williamson', day: 2 },
    { poi: 'wil_court', day: 2 },
    { poi: 'onion_dome', day: 2 },
    { poi: 'sw_university', day: 2 },
    { poi: 'inner_space', day: 2 },
  ],
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
