/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { fulfilCheckout } from '@/lib/fulfillment';
import {
  createWorld,
  fakeSheet,
  fakeStripe,
  fakeTelegram,
  RESERVATION_ID,
  World,
} from '@/test-utils/stripeFakes';

let mockWorld: World;
let mockStripe: ReturnType<typeof fakeStripe>;
let mockSheet: ReturnType<typeof fakeSheet>;
let mockTelegram: ReturnType<typeof fakeTelegram>;

jest.mock('../../lib/stripe', () => ({
  ...jest.requireActual('../../lib/stripe'),
  getStripe: () => mockStripe,
}));
jest.mock('../../lib/reservationSheet', () => ({
  findReservation: (id: string) => mockSheet.findReservation(id),
  appendReservation: (r: { id: string; status: string }, url: string) => mockSheet.appendReservation(r, url),
  setNotValid: (row: number) => mockSheet.setNotValid(row),
}));
jest.mock('../../app/tgmessage', () => ({
  __esModule: true,
  default: (message: string) => mockTelegram(message),
}));

const ORIGIN = 'https://pilot.example';
const NEW_BOOKING = 'New booking from Anna K.: Walking tour of downtown Austin, date: 2026-09-22, guests: 3';

beforeEach(() => {
  mockWorld = createWorld();
  mockStripe = fakeStripe(mockWorld);
  mockSheet = fakeSheet(mockWorld);
  mockTelegram = fakeTelegram(mockWorld);
  process.env.PILOT_SHARE_URL = 'https://pilot-branch.vercel.app/?_vercel_share=TOKEN';
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.PILOT_SHARE_URL;
});

describe('fulfilCheckout (architecture §4.3)', () => {
  it('writes one row and one "New booking" message for a paid session (AC 16, AC 17)', async () => {
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('done');

    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.rows[0][0]).toBe(RESERVATION_ID);
    expect(mockWorld.rows[0][7]).toBe(
      `https://pilot-branch.vercel.app/ru/bookingstatus/${RESERVATION_ID}/?_vercel_share=TOKEN`,
    );
    expect(mockWorld.rows[0][8]).toBe('valid');
    expect(mockWorld.messages).toEqual([NEW_BOOKING]);
    expect(mockWorld.piMetadata.tg_booking).toEqual(expect.any(String));
    expect(mockWorld.piMetadata.tg_not_saved).toBeUndefined();
  });

  it('creates no second row and no second message when Stripe delivers twice (AC 19)', async () => {
    await fulfilCheckout('cs_test_1', ORIGIN);
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('done');
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.messages).toEqual([NEW_BOOKING]);
  });

  it('with the sheet down: "New booking" + one alert, then restores the row silently (AC 20)', async () => {
    mockWorld.sheetDown = true;

    // First delivery: both messages, not accepted.
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('retry');
    expect(mockWorld.messages).toHaveLength(2);
    expect(mockWorld.messages[0]).toBe(NEW_BOOKING);
    expect(mockWorld.messages[1]).toContain('NOT SAVED');
    expect(mockWorld.messages[1]).toContain('Anna K.: Walking tour of downtown Austin, date: 2026-09-22, guests: 3');

    // Redelivery while still down: nothing new.
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('retry');
    expect(mockWorld.messages).toHaveLength(2);
    expect(mockWorld.rows).toHaveLength(0);

    // Access back: the row appears, nobody is messaged again.
    mockWorld.sheetDown = false;
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('done');
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.messages).toHaveLength(2);
  });

  it('retries a failed Telegram message without duplicating the row', async () => {
    mockWorld.telegramDown = true;
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('retry');
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.messages).toHaveLength(0);

    mockWorld.telegramDown = false;
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('done');
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.messages).toEqual([NEW_BOOKING]);
  });

  it('asks for a redelivery when the flag cannot be written (accepted residual: one repeat)', async () => {
    mockWorld.flagWritesFail = true;
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('retry');
    mockWorld.flagWritesFail = false;
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).resolves.toBe('done');
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.messages).toEqual([NEW_BOOKING, NEW_BOOKING]);
  });

  it('throws when Stripe cannot be read, so the route answers 500', async () => {
    mockStripe.checkout.sessions.retrieve.mockRejectedValueOnce(new Error('api down'));
    await expect(fulfilCheckout('cs_test_1', ORIGIN)).rejects.toThrow('api down');
    expect(mockWorld.rows).toHaveLength(0);
    expect(mockWorld.messages).toHaveLength(0);
  });
});
