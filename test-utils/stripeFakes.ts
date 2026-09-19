/// <reference types="jest" />
/**
 * In-memory stand-ins for Stripe, the Reservations tab and Telegram, shared by
 * the Stripe pilot tests in `__tests__/stripe/`. Kept outside `__tests__/` so
 * Jest does not collect it as a test suite.
 */

export const RESERVATION_ID = '3f1c2a9e-5b7d-4c1e-9a2b-7d6e5f4a3b2c';

export type Row = unknown[];

export function createWorld() {
  const piMetadata: Record<string, string> = { reservation_id: RESERVATION_ID };
  const rows: Row[] = [];
  const messages: string[] = [];
  const world = {
    sheetDown: false,
    telegramDown: false,
    flagWritesFail: false,
    rows,
    messages,
    piMetadata,
    disputed: false,
    session: {
      id: 'cs_test_1',
      payment_status: 'paid',
      amount_total: 12000,
      customer_details: { email: 'payer@example.com' },
      custom_fields: [{ key: 'name', text: { value: 'Anna K.' } }],
      line_items: { data: [{ quantity: 3 }] },
      metadata: {
        reservation_id: RESERVATION_ID,
        event_id: 'tour77',
        program_id: 'Acap',
        date: '2026-09-22',
        locale: 'ru',
      },
    },
  };
  return world;
}

export type World = ReturnType<typeof createWorld>;

/** A fake of the Stripe calls the pilot makes. */
export function fakeStripe(world: World) {
  const paymentIntent = () => ({
    id: 'pi_1',
    metadata: { ...world.piMetadata },
    latest_charge: { id: 'ch_1', disputed: world.disputed },
  });
  return {
    checkout: {
      sessions: {
        retrieve: jest.fn(async () => ({ ...world.session, payment_intent: paymentIntent() })),
        list: jest.fn(async () => ({ data: [{ ...world.session, payment_intent: 'pi_1' }] })),
      },
    },
    charges: {
      retrieve: jest.fn(async () => ({ id: 'ch_1', payment_intent: 'pi_1' })),
    },
    paymentIntents: {
      retrieve: jest.fn(async () => paymentIntent()),
      update: jest.fn(async (_id: string, params: { metadata: Record<string, string> }) => {
        if (world.flagWritesFail) throw new Error('flag write failed');
        Object.assign(world.piMetadata, params.metadata);
        return paymentIntent();
      }),
    },
  };
}

/** A fake of `lib/reservationSheet`. Rows as architecture §2.3, header excluded. */
export function fakeSheet(world: World) {
  return {
    findReservation: jest.fn(async (id: string) => {
      if (world.sheetDown) throw new Error('sheet unreachable');
      const index = world.rows.findIndex((r) => r[0] === id);
      if (index === -1) return null;
      const row = world.rows[index];
      return {
        row: index + 2,
        reservation: { id, status: row[8] === 'not valid' ? 'not valid' : 'valid' },
      };
    }),
    appendReservation: jest.fn(async (r: { id: string; status: string }, url: string) => {
      if (world.sheetDown) throw new Error('sheet unreachable');
      world.rows.push([r.id, '', '', '', '', '', '', url, r.status]);
    }),
    setNotValid: jest.fn(async (row: number) => {
      if (world.sheetDown) throw new Error('sheet unreachable');
      world.rows[row - 2][8] = 'not valid';
    }),
  };
}

/** A fake of `sendTelegramMessage`. */
export function fakeTelegram(world: World) {
  return jest.fn(async (message: string) => {
    if (world.telegramDown) return { success: false, error: 'down' };
    world.messages.push(message);
    return { success: true };
  });
}
