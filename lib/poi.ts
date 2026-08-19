import { programPoi, type PoiId } from '@/data/poi.programs';
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

export interface PoiView {
  id: PoiId;
  name: string;
  description: string;
  mapUrl: string;
  /** Present only for programs whose route is split across days (`Auswe`). */
  day?: number;
}

export interface PoiCatalogEntry extends PoiView {
  /** Programs that visit this place, by localized name. Names, not links —
   *  programs have no permanent pages to link to (context.md question 16). */
  programs: { id: string; title: string }[];
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

// Same locale test as `app/[locale]/page.tsx` uses for the tour catalogue.
function poiTexts(locale: string): Record<PoiId, PoiText> {
  return locale === 'en' ? poiEn : poiRu;
}

function toView(id: PoiId, texts: Record<PoiId, PoiText>): PoiView {
  return {
    id,
    name: texts[id].name,
    description: texts[id].description,
    mapUrl: poiMapUrl[id],
  };
}

/**
 * Places visited by one program, in the order the linking table lists them.
 * An unknown program id — or one with no places yet — returns an empty array,
 * which the callers render as nothing at all (AC 7a).
 */
export function getProgramPoi(programId: string, locale: string): PoiView[] {
  const refs = linkedPoi[programId];
  if (!refs) return [];

  const texts = poiTexts(locale);
  return refs.map(ref => ({ ...toView(ref.poi, texts), day: ref.day }));
}

/**
 * Every place once, in order of first appearance in the linking table — the
 * same order in both locales, since that table is not localized.
 */
export function getPoiCatalog(locale: string): PoiCatalogEntry[] {
  const texts = poiTexts(locale);
  const tours = locale === 'en' ? toursEn : toursRu;
  const programTitles = new Map(
    tours.map(tour => [tour.id, tour.shortTitle] as const),
  );

  const catalog = new Map<PoiId, PoiCatalogEntry>();

  for (const [programId, refs] of Object.entries(linkedPoi)) {
    if (!refs) continue;
    const title = programTitles.get(programId);

    for (const ref of refs) {
      let entry = catalog.get(ref.poi);
      if (!entry) {
        entry = { ...toView(ref.poi, texts), programs: [] };
        catalog.set(ref.poi, entry);
      }
      // A program is named once per place however many times it visits it.
      if (title && !entry.programs.some(p => p.id === programId)) {
        entry.programs.push({ id: programId, title });
      }
    }
  }

  return [...catalog.values()];
}
