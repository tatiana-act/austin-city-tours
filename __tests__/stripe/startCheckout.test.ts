/**
 * @jest-environment node
 */
/// <reference types="jest" />
import en from '@/messages/en.json';
import ru from '@/messages/ru.json';
import { startCheckout } from '@/app/actions/startCheckout';
import { StripeNotConfiguredError } from '@/lib/stripe';

const mockCreate = jest.fn();
const mockGetStripe = jest.fn();

jest.mock('../../lib/stripe', () => ({
  ...jest.requireActual('../../lib/stripe'),
  getStripe: () => mockGetStripe(),
}));
jest.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'pilot.example', 'x-forwarded-proto': 'https' }),
}));
jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
jest.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: unknown) =>
    typeof locale === 'string' && locales.includes(locale),
}));
jest.mock('../../i18n/routing', () => ({ routing: { locales: ['en', 'ru'] } }));
jest.mock('next-intl/server', () => ({
  getTranslations: async ({ locale }: { locale: string }) => (key: string) => {
    const payment: Record<string, string> = locale === 'ru' ? ru.Payment : en.Payment;
    return payment[key];
  },
}));
jest.mock('../../data/upcomingTours', () => ({
  upcomingTours: [
    { id: 'tourPaid', tourProgramId: 'Acap', date: '2026-09-22', time: '10:00', price: 40 },
    { id: 'tourFree', tourProgramId: 'Acap', date: '2026-09-22', time: '10:00', price: 0 },
    { id: 'tourNoPrice', tourProgramId: 'Acap', date: '2026-09-22', time: '10:00' },
    { id: 'tourPast', tourProgramId: 'Acap', date: '2026-09-19', time: '10:00', price: 40 },
    { id: 'tourGhost', tourProgramId: 'NoSuchProgram', date: '2026-09-22', time: '10:00', price: 40 },
  ],
}));

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  Object.entries(fields).forEach(([k, v]) => data.append(k, v));
  return data;
}

const initial = { failed: false };

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-09-20T17:00:00Z') });
  mockCreate.mockReset();
  mockGetStripe.mockReset();
  mockGetStripe.mockReturnValue({ checkout: { sessions: { create: mockCreate } } });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('startCheckout — redirects without a session (architecture §4.1)', () => {
  it('sends an invalid locale to /en/', async () => {
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'de' }))).rejects.toThrow(
      'REDIRECT:/en/',
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sends an unknown date to the home page of its locale', async () => {
    await expect(startCheckout(initial, form({ eventId: 'nope', locale: 'ru' }))).rejects.toThrow(
      'REDIRECT:/ru/',
    );
    await expect(startCheckout(initial, form({ locale: 'ru' }))).rejects.toThrow('REDIRECT:/ru/');
    await expect(
      startCheckout(initial, form({ eventId: 'tourGhost', locale: 'en' })),
    ).rejects.toThrow('REDIRECT:/en/');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it.each(['tourPast', 'tourFree', 'tourNoPrice'])(
    'sends a date that is not payable (%s) to its page, with no session [76]',
    async (eventId) => {
      await expect(startCheckout(initial, form({ eventId, locale: 'en' }))).rejects.toThrow(
        `REDIRECT:/en/tours/${eventId}/`,
      );
      expect(mockCreate).not.toHaveBeenCalled();
    },
  );

  it('still takes payment after the start time, on the same day in Central Time (AC 4)', async () => {
    jest.setSystemTime(new Date('2026-09-23T04:30:00Z')); // 2026-09-22 23:30 CDT
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'en' }))).rejects.toThrow(
      'REDIRECT:https://checkout.stripe.com/c/pay/cs_test_1',
    );
  });
});

describe('startCheckout — fails closed', () => {
  it('returns failed when STRIPE_SECRET_KEY is missing, and creates nothing', async () => {
    mockGetStripe.mockImplementation(() => {
      throw new StripeNotConfiguredError();
    });
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'en' }))).resolves.toEqual({
      failed: true,
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns failed when Stripe rejects the session', async () => {
    mockCreate.mockRejectedValue(new Error('Stripe down'));
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'ru' }))).resolves.toEqual({
      failed: true,
    });
  });
});

describe('startCheckout — Checkout Session parameters', () => {
  async function createdParams(locale: string) {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test_2' });
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale }))).rejects.toThrow(
      'REDIRECT:https://checkout.stripe.com/c/pay/cs_test_2',
    );
    expect(mockCreate).toHaveBeenCalledTimes(1);
    return mockCreate.mock.calls[0][0];
  }

  it('asks for guests as the quantity 1–15, default 1, at the per-person price in USD (AC 6)', async () => {
    const params = await createdParams('en');
    expect(params.mode).toBe('payment');
    expect(params.payment_method_types).toEqual(['card']);
    expect(params.line_items).toHaveLength(1);
    const [item] = params.line_items;
    expect(item.quantity).toBe(1);
    expect(item.adjustable_quantity).toEqual({ enabled: true, minimum: 1, maximum: 15 });
    expect(item.price_data.currency).toBe('usd');
    expect(item.price_data.unit_amount).toBe(4000);
    expect(item.price_data.product_data.name).toBe('Walking tour of downtown Austin · September 22, 2026');
    expect(item.price_data.product_data.description).toBe('Price per person');
  });

  it('asks for the name under the owner\'s label and shows the notice (AC 6, AC 7)', async () => {
    const params = await createdParams('en');
    expect(params.custom_fields).toEqual([
      {
        key: 'name',
        type: 'text',
        optional: false,
        label: { type: 'custom', custom: 'Name for the guest list' },
        text: { maximum_length: 100 },
      },
    ]);
    expect(params.custom_text.submit.message).toContain('tatiana.city.guide@gmail.com');
  });

  it('writes the same metadata on the session and the PaymentIntent, with a random UUID v4 id', async () => {
    const params = await createdParams('ru');
    expect(params.metadata).toEqual({
      reservation_id: expect.stringMatching(UUID_V4),
      event_id: 'tourPaid',
      program_id: 'Acap',
      date: '2026-09-22',
      locale: 'ru',
    });
    expect(params.payment_intent_data.metadata).toEqual(params.metadata);
    expect(params.payment_intent_data.description).toBe(`Reservation ${params.metadata.reservation_id}`);
  });

  it('returns to pages in the locale where payment started, on the request origin', async () => {
    const params = await createdParams('ru');
    expect(params.locale).toBe('ru');
    expect(params.success_url).toBe(
      'https://pilot.example/ru/payment/complete/?session_id={CHECKOUT_SESSION_ID}',
    );
    expect(params.cancel_url).toBe('https://pilot.example/ru/tours/tourPaid/');
    expect(params.custom_fields[0].label.custom).toBe('Имя для списка гостей');
    expect(params.line_items[0].price_data.product_data.description).toBe('Цена за одного человека');
  });

  it('expires the session after 31 minutes, above the 30-minute Stripe minimum', async () => {
    const params = await createdParams('en');
    expect(params.expires_at).toBe(Math.floor(Date.now() / 1000) + 31 * 60);
  });

  it('gives two reservations ids with no shared counter or timestamp (AC 14)', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/x' });
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'en' }))).rejects.toThrow();
    await expect(startCheckout(initial, form({ eventId: 'tourPaid', locale: 'en' }))).rejects.toThrow();
    const [a, b] = mockCreate.mock.calls.map((call) => call[0].metadata.reservation_id);
    expect(a).toMatch(UUID_V4);
    expect(b).toMatch(UUID_V4);
    expect(a).not.toBe(b);
  });
});
