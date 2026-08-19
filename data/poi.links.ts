import type { PoiId } from '@/data/poi.programs';

// One link per place, shared by both locales — a map URL does not depend on the
// language. Canonical Google Maps search URLs rather than `maps.app.goo.gl`
// short links: those are minted by Google when a human shares a pin, so they
// cannot be generated. Replacing one with a short link is a one-line edit.
export const poiMapUrl: Record<PoiId, string> = {
  capitol:
    'https://www.google.com/maps/search/?api=1&query=Texas+State+Capitol+Austin+TX',
};
