import { programPoi, type PoiId, type ProgramId } from '@/data/poi.programs';
import { poiMapUrl } from '@/data/poi.links';
import { poiRu } from '@/data/poi.ru';
import { poiEn } from '@/data/poi.en';
import { tours as toursRu } from '@/data/tours';
import { tours as toursEn } from '@/data/tours.en';
import type { PoiText } from '@/types/poi';

/**
 * Read access to the places data. Pure functions — no network, no filesystem,
 * no request state — so they can be called from any Server Component.
 *
 * The four data files stay separate on purpose (see the architecture doc §2):
 * `poi.programs.ts` is the single source of truth for which places exist, and
 * the other three are `Record<PoiId, …>` keyed off it, so a place missing a
 * text in one locale or a place no program visits is a compile error.
 */

/**
 * A place as the program view shows it: the accordion on the homepage and the
 * tour date page.
 *
 * Since v2.4 it carries the description, because the panel a name opens shows
 * it (PRD AC 28) — the same record the list page prints, read from two places
 * and written once (PRD §5). What the type still keeps out is `mapUrl`: the map
 * link lives on the list page only, and that stays held by the shape of the
 * data rather than by discipline. That the list itself prints names only
 * (AC 15) is now held by the markup invariant of architecture §4.3 instead.
 */
export interface ProgramPoi {
  id: PoiId;
  name: string;
  description: string;
  /** Present only for programs whose route is split across days (`Auswe`). */
  day?: number;
}

/** A place as the list page shows it (PRD §7.1). */
export interface PoiCatalogEntry {
  id: PoiId;
  name: string;
  description: string;
  mapUrl: string;
  /**
   * Programs that visit this place, by full localized `TourProgram.title` —
   * not the short form. `id` carries: the entry builds the link back to the
   * program's card on the homepage from it (architecture §4.1).
   */
  programs: { id: ProgramId; title: string }[];
}

/**
 * The linking table, widened for lookup by a plain `string` program id and for
 * reading `day` off a program that has none. `programPoi` is `as const`, so its
 * own type knows the exact ids and drops absent optional fields; this alias is
 * the read view of the same object, not a cast.
 */
const linkedPoi: Partial<
  Record<string, readonly { poi: PoiId; day?: number }[]>
> = programPoi;

/**
 * `Object.entries` widens the keys of the linking table to `string`, while its
 * `satisfies Partial<Record<ProgramId, …>>` clause already guarantees every key
 * is a `ProgramId`. This narrows them back without a cast; the negative branch
 * is unreachable by construction.
 */
function isLinkedProgram(programId: string): programId is ProgramId {
  return programId in programPoi;
}

// Same locale test as `app/[locale]/page.tsx` uses for the tour catalogue.
function poiTexts(locale: string): Record<PoiId, PoiText> {
  return locale === 'en' ? poiEn : poiRu;
}

/**
 * Places visited by one program, in the order the linking table lists them.
 * An unknown program id — or one with no places yet — returns an empty array,
 * which the callers render as nothing at all (AC 7a).
 */
export function getProgramPoi(programId: string, locale: string): ProgramPoi[] {
  const refs = linkedPoi[programId];
  if (!refs) return [];

  const texts = poiTexts(locale);
  return refs.map(ref => ({
    id: ref.poi,
    name: texts[ref.poi].name,
    description: texts[ref.poi].description,
    day: ref.day,
  }));
}

/**
 * Every place once (AC 5), in alphabetical order of the name as displayed, so
 * the two locales order the page differently on purpose (AC 26). Ties keep the
 * linking table's order, since `Array.prototype.sort` is stable.
 *
 * The order of `programs` inside an entry is the order the table is walked —
 * not localized, so RU and EN name the same programs in the same sequence.
 */
export function getPoiCatalog(locale: string): PoiCatalogEntry[] {
  const texts = poiTexts(locale);
  const tours = locale === 'en' ? toursEn : toursRu;
  const programTitles = new Map(tours.map(tour => [tour.id, tour.title] as const));

  const catalog = new Map<PoiId, PoiCatalogEntry>();

  for (const [programId, refs] of Object.entries(linkedPoi)) {
    if (!refs || !isLinkedProgram(programId)) continue;
    const title = programTitles.get(programId);

    for (const ref of refs) {
      let entry = catalog.get(ref.poi);
      if (!entry) {
        entry = {
          id: ref.poi,
          name: texts[ref.poi].name,
          description: texts[ref.poi].description,
          mapUrl: poiMapUrl[ref.poi],
          programs: [],
        };
        catalog.set(ref.poi, entry);
      }
      // A program is named once per place however many times it visits it.
      if (title && !entry.programs.some(p => p.id === programId)) {
        entry.programs.push({ id: programId, title });
      }
    }
  }

  const collator = new Intl.Collator(locale);
  return [...catalog.values()].sort((a, b) => collator.compare(a.name, b.name));
}
