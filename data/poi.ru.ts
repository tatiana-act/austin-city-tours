import type { PoiId } from '@/data/poi.programs';
import type { PoiText } from '@/types/poi';

// Keys and order must stay identical to `poi.en.ts`; the compiler enforces the
// key set, since `PoiId` is derived from `poi.programs.ts`.
export const poiRu: Record<PoiId, PoiText> = {
  capitol: { name: 'Капитолий Техаса', description: 'TBD' },
};
