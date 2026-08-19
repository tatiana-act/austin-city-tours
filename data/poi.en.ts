import type { PoiId } from '@/data/poi.programs';
import type { PoiText } from '@/types/poi';

// Names are the real English proper names, not transliterations of the Russian:
// the English page can only be found by them.
export const poiEn: Record<PoiId, PoiText> = {
  capitol: { name: 'Texas State Capitol', description: 'TBD' },
};
