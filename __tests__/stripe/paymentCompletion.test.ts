/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { getCompletionState } from '@/lib/paymentCompletion';
import { StripeNotConfiguredError } from '@/lib/stripe';

const mockRetrieve = jest.fn();
const mockUpdate = jest.fn();
const mockGetStripe = jest.fn();
const mockQrPayloads: string[] = [];
type QrMode = 'stub' | 'real' | 'fail';
const mockQr: { mode: QrMode } = { mode: 'stub' };

jest.mock('../../lib/stripe', () => ({
  ...jest.requireActual('../../lib/stripe'),
  getStripe: () => mockGetStripe(),
}));
jest.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'pilot.example', 'x-forwarded-proto': 'https' }),
}));
jest.mock('qrcode', () => {
  const actual = jest.requireActual('qrcode');
  return {
    __esModule: true,
    default: {
      toDataURL: (text: string, options: object) => {
        mockQrPayloads.push(text);
        if (mockQr.mode === 'fail') return Promise.reject(new Error('qr failed'));
        // A real PNG is slow under parallel load; one test below makes one.
        if (mockQr.mode === 'stub') return Promise.resolve('data:image/png;base64,STUB');
        return actual.toDataURL(text, options);
      },
    },
  };
});

const ID = '3f1c2a9e-5b7d-4c1e-9a2b-7d6e5f4a3b2c';

function paidSession(overrides: Record<string, unknown> = {}, piMetadata: Record<string, string> = {}) {
  return {
    id: 'cs_test_1',
    payment_status: 'paid',
    amount_total: 12000,
    customer_details: { email: 'payer@example.com' },
    custom_fields: [{ key: 'name', text: { value: 'Anna K.' } }],
    line_items: { data: [{ quantity: 3 }] },
    metadata: { reservation_id: ID, event_id: 'tour77', program_id: 'Acap', date: '2026-09-22', locale: 'ru' },
    payment_intent: { id: 'pi_1', metadata: { reservation_id: ID, ...piMetadata } },
    ...overrides,
  };
}

const savedShare = process.env.PILOT_SHARE_URL;

beforeEach(() => {
  mockRetrieve.mockReset();
  mockUpdate.mockReset();
  mockGetStripe.mockReset();
  mockQrPayloads.length = 0;
  mockQr.mode = 'stub';
  mockGetStripe.mockReturnValue({
    checkout: { sessions: { retrieve: mockRetrieve } },
    paymentIntents: { update: mockUpdate },
  });
  process.env.PILOT_SHARE_URL = 'https://pilot-branch.vercel.app/?_vercel_share=TOKEN';
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  if (savedShare === undefined) delete process.env.PILOT_SHARE_URL;
  else process.env.PILOT_SHARE_URL = savedShare;
});

describe('screen after payment — decision table (architecture §4.2)', () => {
  it('A without a session id, and asks Stripe nothing', async () => {
    await expect(getCompletionState(undefined)).resolves.toEqual({ kind: 'A' });
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it('A when Stripe is not configured', async () => {
    mockGetStripe.mockImplementation(() => {
      throw new StripeNotConfiguredError();
    });
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
  });

  it('A when Stripe fails or has no such session', async () => {
    mockRetrieve.mockRejectedValue(new Error('No such checkout.session'));
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
  });

  it('A for a session not made by this site', async () => {
    mockRetrieve.mockResolvedValue(paidSession({ metadata: {} }));
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
  });

  it('A — never a QR — while the payment is not paid (AC 8)', async () => {
    mockRetrieve.mockResolvedValue(paidSession({ payment_status: 'unpaid' }));
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('C when the QR was already shown, with nothing written (AC 10)', async () => {
    mockRetrieve.mockResolvedValue(paidSession({}, { qr_shown: '2026-09-20T17:00:00.000Z' }));
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'C' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('A when writing the flag fails, so a reload retries', async () => {
    mockRetrieve.mockResolvedValue(paidSession());
    mockUpdate.mockRejectedValue(new Error('rate limited'));
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
  });

  it('A, with the flag untouched, when the QR cannot be built', async () => {
    mockRetrieve.mockResolvedValue(paidSession());
    mockQr.mode = 'fail';
    await expect(getCompletionState('cs_test_1')).resolves.toEqual({ kind: 'A' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('B: writes qr_shown, then returns the QR and the reservation (AC 8, AC 12)', async () => {
    mockQr.mode = 'real';
    mockRetrieve.mockResolvedValue(paidSession());
    mockUpdate.mockResolvedValue({});
    const state = await getCompletionState('cs_test_1');

    expect(mockRetrieve).toHaveBeenCalledWith('cs_test_1', { expand: ['line_items', 'payment_intent'] });
    expect(mockUpdate).toHaveBeenCalledWith('pi_1', {
      metadata: { qr_shown: expect.any(String) },
    });
    expect(state.kind).toBe('B');
    if (state.kind !== 'B') return;
    expect(state.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(state.reservation).toMatchObject({
      id: ID,
      name: 'Anna K.',
      guests: 3,
      programId: 'Acap',
      date: '2026-09-22',
      locale: 'ru',
      amountUsd: 120,
      status: 'valid',
    });
  }, 30000);

  it("encodes the status page in the payer's locale with the shareable-link token (AC 11)", async () => {
    mockRetrieve.mockResolvedValue(paidSession());
    mockUpdate.mockResolvedValue({});
    await getCompletionState('cs_test_1');
    expect(mockQrPayloads).toEqual([
      `https://pilot-branch.vercel.app/ru/bookingstatus/${ID}/?_vercel_share=TOKEN`,
    ]);
  });
});
