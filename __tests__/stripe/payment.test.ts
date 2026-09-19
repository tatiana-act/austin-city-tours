/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { centralDate, effectivePrice, isPayable } from '@/lib/payment';
import type { TourProgram, UpcomingTourEvent } from '@/types/tour';

const program = (price: number): TourProgram => ({
  id: 'Acap',
  title: 'Walking tour',
  shortTitle: 'Walk',
  description: '',
  duration: '2 hours',
  price,
  imageUrl: '',
  highlights: [],
  meetingPoint: '',
  meetingPointLink: '',
});

const event = (price?: number, date = '2026-09-22'): UpcomingTourEvent => ({
  id: 'tour77',
  tourProgramId: 'Acap',
  date,
  time: '10:00',
  price,
});

describe('effectivePrice', () => {
  it("takes the date's own price first", () => {
    expect(effectivePrice(event(40), program(0))).toBe(40);
  });
  it("falls back to the program's price", () => {
    expect(effectivePrice(event(undefined), program(30))).toBe(30);
  });
  it('keeps an explicit 0 on the date', () => {
    expect(effectivePrice(event(0), program(30))).toBe(0);
  });
});

describe('centralDate', () => {
  it('is the Austin calendar date, not the UTC one (CDT, UTC-5)', () => {
    // 2026-09-23 03:30 UTC = 2026-09-22 22:30 CDT
    expect(centralDate(new Date('2026-09-23T03:30:00Z'))).toBe('2026-09-22');
    // 2026-09-23 05:00 UTC = 2026-09-23 00:00 CDT
    expect(centralDate(new Date('2026-09-23T05:00:00Z'))).toBe('2026-09-23');
  });
  it('follows standard time in winter (CST, UTC-6)', () => {
    expect(centralDate(new Date('2026-12-02T05:30:00Z'))).toBe('2026-12-01');
    expect(centralDate(new Date('2026-12-02T06:00:00Z'))).toBe('2026-12-02');
  });
});

describe('isPayable (PRD AC 2, AC 4)', () => {
  it('is payable before the date', () => {
    expect(isPayable(event(40), program(0), new Date('2026-09-20T12:00:00Z'))).toBe(true);
  });
  it('stays payable after the start time, until the end of the day in Central Time', () => {
    // 23:59 CDT on the tour's day
    expect(isPayable(event(40), program(0), new Date('2026-09-23T04:59:00Z'))).toBe(true);
  });
  it('is not payable from the next day', () => {
    // 00:00 CDT the day after
    expect(isPayable(event(40), program(0), new Date('2026-09-23T05:00:00Z'))).toBe(false);
  });
  it('is not payable when the effective price is 0 or comes from a program priced 0', () => {
    const now = new Date('2026-09-20T12:00:00Z');
    expect(isPayable(event(0), program(40), now)).toBe(false);
    expect(isPayable(event(undefined), program(0), now)).toBe(false);
  });
});
