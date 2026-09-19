/**
 * @jest-environment node
 */
/// <reference types="jest" />
import Stripe from 'stripe';
import { POST } from '@/app/api/stripe/webhook/route';

// The real SDK checks the signatures; only the procedures are replaced.
const mockFulfil = jest.fn();
const mockDispute = jest.fn();
jest.mock('../../lib/fulfillment', () => ({
  fulfilCheckout: (sessionId: string, origin: string) => mockFulfil(sessionId, origin),
  handleDispute: (dispute: unknown) => mockDispute(dispute),
}));

const SECRET = 'whsec_test_secret';
const signer = new Stripe('sk_test_dummy');

function event(type: string, object: Record<string, unknown>) {
  return JSON.stringify({ id: 'evt_1', object: 'event', type, data: { object } });
}

function request(payload: string, signature: string | null): Request {
  const headers = new Headers({ host: 'pilot.example', 'x-forwarded-proto': 'https' });
  if (signature !== null) headers.set('stripe-signature', signature);
  return new Request('https://pilot.example/api/stripe/webhook/', { method: 'POST', headers, body: payload });
}

function signed(payload: string, secret = SECRET): Request {
  return request(payload, signer.webhooks.generateTestHeaderString({ payload, secret }));
}

const completed = (overrides: Record<string, unknown> = {}) =>
  event('checkout.session.completed', {
    id: 'cs_test_1',
    object: 'checkout.session',
    payment_status: 'paid',
    metadata: { reservation_id: 'abc' },
    ...overrides,
  });

const savedEnv = { ...process.env };

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  mockFulfil.mockReset();
  mockDispute.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  process.env = { ...savedEnv };
});

describe('POST /api/stripe/webhook/ — signature (AC 22)', () => {
  it('answers 400 and does nothing without a signature', async () => {
    const res = await POST(request(completed(), null));
    expect(res.status).toBe(400);
    expect(mockFulfil).not.toHaveBeenCalled();
  });

  it('answers 400 and does nothing for a signature made with another secret', async () => {
    const res = await POST(signed(completed(), 'whsec_attacker'));
    expect(res.status).toBe(400);
    expect(mockFulfil).not.toHaveBeenCalled();
  });

  it('answers 400 and does nothing for a body changed after signing', async () => {
    const payload = completed();
    const header = signer.webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const res = await POST(request(payload.replace('abc', 'xyz'), header));
    expect(res.status).toBe(400);
    expect(mockFulfil).not.toHaveBeenCalled();
  });

  it.each(['STRIPE_WEBHOOK_SECRET', 'STRIPE_SECRET_KEY'])(
    'fails closed with 400 when %s is not configured',
    async (name) => {
      delete process.env[name];
      const res = await POST(signed(completed()));
      expect(res.status).toBe(400);
      expect(mockFulfil).not.toHaveBeenCalled();
    },
  );
});

describe('POST /api/stripe/webhook/ — responses (architecture §4.3)', () => {
  it('fulfils a paid session and answers 200 when done', async () => {
    mockFulfil.mockResolvedValue('done');
    const res = await POST(signed(completed()));
    expect(res.status).toBe(200);
    expect(mockFulfil).toHaveBeenCalledWith('cs_test_1', 'https://pilot.example');
  });

  it('answers 500 so Stripe redelivers when the procedure asks to retry', async () => {
    mockFulfil.mockResolvedValue('retry');
    expect((await POST(signed(completed()))).status).toBe(500);
  });

  it('answers 500 when the procedure throws', async () => {
    mockFulfil.mockRejectedValue(new Error('stripe down'));
    expect((await POST(signed(completed()))).status).toBe(500);
  });

  it('ignores an unpaid session or one not made by this site, with 200', async () => {
    expect((await POST(signed(completed({ payment_status: 'unpaid' })))).status).toBe(200);
    expect((await POST(signed(completed({ metadata: {} })))).status).toBe(200);
    expect(mockFulfil).not.toHaveBeenCalled();
  });

  it('ignores other event types with 200', async () => {
    const res = await POST(signed(event('customer.created', { id: 'cus_1', object: 'customer' })));
    expect(res.status).toBe(200);
    expect(mockFulfil).not.toHaveBeenCalled();
  });
});

describe('POST /api/stripe/webhook/ — chargebacks (AC 21)', () => {
  const disputeEvent = () =>
    event('charge.dispute.created', { id: 'dp_1', object: 'dispute', payment_intent: 'pi_1', charge: 'ch_1' });

  it('hands a signed dispute to handleDispute and answers 200 when done', async () => {
    mockDispute.mockResolvedValue('done');
    const res = await POST(signed(disputeEvent()));
    expect(res.status).toBe(200);
    expect(mockDispute).toHaveBeenCalledWith(expect.objectContaining({ id: 'dp_1', payment_intent: 'pi_1' }));
  });

  it('answers 500 until the dispute is fully handled', async () => {
    mockDispute.mockResolvedValue('retry');
    expect((await POST(signed(disputeEvent()))).status).toBe(500);
  });

  it('does not touch anything for an unsigned dispute (AC 22)', async () => {
    const res = await POST(request(disputeEvent(), 't=1,v1=forged'));
    expect(res.status).toBe(400);
    expect(mockDispute).not.toHaveBeenCalled();
  });
});
