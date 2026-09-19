/**
 * @jest-environment node
 */
/// <reference types="jest" />
import { lookupReservation } from '@/lib/reservationLookup';
import { StripeNotConfiguredError } from '@/lib/stripe';

const mockFind = jest.fn();
const mockGetStripe = jest.fn();
const mockSearch = jest.fn();
const mockList = jest.fn();
const mockSessionRetrieve = jest.fn();
const mockPiRetrieve = jest.fn();

jest.mock('../../lib/reservationSheet', () => ({
  findReservation: (id: string) => mockFind(id),
}));
jest.mock('../../lib/stripe', () => ({
  ...jest.requireActual('../../lib/stripe'),
  getStripe: () => mockGetStripe(),
}));

const ID = '3f1c2a9e-5b7d-4c1e-9a2b-7d6e5f4a3b2c';

const session = {
  id: 'cs_1',
  created: 1_790_000_000,
  payment_status: 'paid',
  payment_intent: 'pi_1',
  amount_total: 4000,
  customer_details: { email: 'payer@example.com' },
  custom_fields: [{ key: 'name', text: { value: 'Anna K.' } }],
  line_items: { data: [{ quantity: 2 }] },
  metadata: { reservation_id: ID, event_id: 'tour77', program_id: 'Acap', date: '2026-09-22', locale: 'en' },
};

beforeEach(() => {
  [mockFind, mockGetStripe, mockSearch, mockList, mockSessionRetrieve, mockPiRetrieve].forEach((m) => m.mockReset());
  mockGetStripe.mockReturnValue({
    paymentIntents: { search: mockSearch, retrieve: mockPiRetrieve },
    checkout: { sessions: { list: mockList, retrieve: mockSessionRetrieve } },
  });
  mockSessionRetrieve.mockResolvedValue(session);
  mockPiRetrieve.mockResolvedValue({ id: 'pi_1', latest_charge: { id: 'ch_1', disputed: false } });
});

describe('lookupReservation (architecture §4.4)', () => {
  it.each(['made-up', `${ID}x`, ID.toUpperCase(), ''])(
    'answers not found for a malformed id (%s) without asking anyone (AC 13)',
    async (id) => {
      await expect(lookupReservation(id)).resolves.toEqual({ kind: 'absent' });
      expect(mockFind).not.toHaveBeenCalled();
      expect(mockGetStripe).not.toHaveBeenCalled();
    },
  );

  it('reads the row when the sheet has it, and asks Stripe nothing', async () => {
    const reservation = { id: ID, status: 'not valid' };
    mockFind.mockResolvedValue({ row: 5, reservation });
    await expect(lookupReservation(ID)).resolves.toEqual({ kind: 'found', reservation });
    expect(mockGetStripe).not.toHaveBeenCalled();
  });

  it('throws — the error page, never "not found" — when the sheet cannot be read (AC 24)', async () => {
    mockFind.mockRejectedValue(new Error('403'));
    await expect(lookupReservation(ID)).rejects.toThrow('403');
    expect(mockGetStripe).not.toHaveBeenCalled();
  });

  it("shows a paid reservation from Stripe's data while its row is missing [70]", async () => {
    mockFind.mockResolvedValue(null);
    mockSearch.mockResolvedValue({ data: [{ id: 'pi_1' }] });
    mockList.mockResolvedValue({ data: [{ id: 'cs_1' }], has_more: false });

    const result = await lookupReservation(ID);
    expect(mockSearch).toHaveBeenCalledWith({
      query: `metadata['reservation_id']:'${ID}' AND status:'succeeded'`,
      limit: 1,
    });
    expect(mockList).toHaveBeenCalledWith({ payment_intent: 'pi_1', limit: 1 });
    expect(result).toMatchObject({
      kind: 'found',
      reservation: { id: ID, name: 'Anna K.', guests: 2, programId: 'Acap', date: '2026-09-22', status: 'valid' },
    });
  });

  it('marks a reservation from Stripe "not valid" when its charge is disputed', async () => {
    mockFind.mockResolvedValue(null);
    mockSearch.mockResolvedValue({ data: [{ id: 'pi_1' }] });
    mockList.mockResolvedValue({ data: [{ id: 'cs_1' }], has_more: false });
    mockPiRetrieve.mockResolvedValue({ id: 'pi_1', latest_charge: { id: 'ch_1', disputed: true } });
    await expect(lookupReservation(ID)).resolves.toMatchObject({ reservation: { status: 'not valid' } });
  });

  it('finds a payment not yet searchable among the last hour of sessions', async () => {
    mockFind.mockResolvedValue(null);
    mockSearch.mockResolvedValue({ data: [] });
    mockList.mockResolvedValue({
      data: [{ ...session, id: 'cs_other', metadata: { reservation_id: 'other' } }, session],
      has_more: false,
    });

    await expect(lookupReservation(ID)).resolves.toMatchObject({ kind: 'found', reservation: { id: ID } });
    const params = mockList.mock.calls[0][0];
    expect(params.status).toBe('complete');
    expect(params.created.gte).toBeGreaterThan(Math.floor(Date.now() / 1000) - 3601);
  });

  it('answers not found only when the sheet and Stripe both do not know the id (AC 13)', async () => {
    mockFind.mockResolvedValue(null);
    mockSearch.mockResolvedValue({ data: [] });
    mockList.mockResolvedValue({ data: [{ ...session, metadata: { reservation_id: 'other' } }], has_more: false });
    await expect(lookupReservation(ID)).resolves.toEqual({ kind: 'absent' });
    expect(mockSessionRetrieve).not.toHaveBeenCalled();
  });

  it('pages through recent sessions', async () => {
    mockFind.mockResolvedValue(null);
    mockSearch.mockResolvedValue({ data: [] });
    mockList
      .mockResolvedValueOnce({ data: [{ id: 'cs_a', metadata: {} }], has_more: true })
      .mockResolvedValueOnce({ data: [session], has_more: false });
    await expect(lookupReservation(ID)).resolves.toMatchObject({ kind: 'found' });
    expect(mockList.mock.calls[1][0].starting_after).toBe('cs_a');
  });

  it.each([
    ['search fails (e.g. 429)', () => mockSearch.mockRejectedValue(new Error('429'))],
    [
      'the session scan fails',
      () => {
        mockSearch.mockResolvedValue({ data: [] });
        mockList.mockRejectedValue(new Error('500'));
      },
    ],
    [
      'Stripe is not configured',
      () =>
        mockGetStripe.mockImplementation(() => {
          throw new StripeNotConfiguredError();
        }),
    ],
  ])('throws when %s — never "not found" [66, 70]', async (_label, arrange) => {
    mockFind.mockResolvedValue(null);
    arrange();
    await expect(lookupReservation(ID)).rejects.toThrow();
  });
});
