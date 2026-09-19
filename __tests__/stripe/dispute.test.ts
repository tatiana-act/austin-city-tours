/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { handleDispute } from '@/lib/fulfillment';
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

const CHARGEBACK =
  'Chargeback for reservation made by Anna K. for tour Walking tour of downtown Austin date: 2026-09-22';

// Only the fields handleDispute reads.
function dispute(fields: { payment_intent: string | null; charge: string }) {
  return fields;
}

function paidRow() {
  mockWorld.rows.push([RESERVATION_ID, 'Anna K.', '', '', '', '', '', 'url', 'valid']);
  Object.assign(mockWorld.piMetadata, {
    program_id: 'Acap',
    date: '2026-09-22',
    tg_booking: 'earlier',
  });
}

beforeEach(() => {
  mockWorld = createWorld();
  mockStripe = fakeStripe(mockWorld);
  mockSheet = fakeSheet(mockWorld);
  mockTelegram = fakeTelegram(mockWorld);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('handleDispute (architecture §4.3, AC 21)', () => {
  it('sends the chargeback message and marks the same row "not valid", adding none', async () => {
    paidRow();
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('done');

    expect(mockWorld.messages).toEqual([CHARGEBACK]);
    expect(mockWorld.rows).toHaveLength(1);
    expect(mockWorld.rows[0][8]).toBe('not valid');
    expect(mockWorld.piMetadata.tg_chargeback).toEqual(expect.any(String));
    expect(mockStripe.checkout.sessions.list).toHaveBeenCalledWith({ payment_intent: 'pi_1', limit: 1 });
  });

  it('finds the PaymentIntent through the charge when the dispute does not name it', async () => {
    paidRow();
    await expect(handleDispute(dispute({ payment_intent: null, charge: 'ch_1' }))).resolves.toBe('done');
    expect(mockStripe.charges.retrieve).toHaveBeenCalledWith('ch_1');
    expect(mockWorld.messages).toEqual([CHARGEBACK]);
  });

  it('sends nothing twice when Stripe delivers the dispute again', async () => {
    paidRow();
    await handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }));
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('done');
    expect(mockWorld.messages).toEqual([CHARGEBACK]);
    expect(mockSheet.setNotValid).toHaveBeenCalledTimes(1);
  });

  it('before its row exists: message now, 500 until the row can be marked', async () => {
    Object.assign(mockWorld.piMetadata, { program_id: 'Acap', date: '2026-09-22' });
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('retry');
    expect(mockWorld.messages).toEqual([CHARGEBACK]);

    mockWorld.rows.push([RESERVATION_ID, 'Anna K.', '', '', '', '', '', 'url', 'valid']);
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('done');
    expect(mockWorld.messages).toEqual([CHARGEBACK]);
    expect(mockWorld.rows[0][8]).toBe('not valid');
  });

  it('retries while the sheet is unreachable', async () => {
    paidRow();
    mockWorld.sheetDown = true;
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('retry');
    mockWorld.sheetDown = false;
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('done');
    expect(mockWorld.messages).toEqual([CHARGEBACK]);
  });

  it('ignores a dispute on a payment this site did not make', async () => {
    delete mockWorld.piMetadata.reservation_id;
    await expect(handleDispute(dispute({ payment_intent: 'pi_1', charge: 'ch_1' }))).resolves.toBe('done');
    expect(mockWorld.messages).toHaveLength(0);
    expect(mockSheet.findReservation).not.toHaveBeenCalled();
  });
});
