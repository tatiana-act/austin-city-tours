import type Stripe from 'stripe';
import { findReservation } from '@/lib/reservationSheet';
import { getStripe, paymentIntentIdOf, reservationFromSession } from '@/lib/stripe';
import type { Reservation } from '@/types/reservation';

/** Booking-id format accepted on input (architecture §2.4). */
export const RESERVATION_ID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type LookupResult = { kind: 'found'; reservation: Reservation } | { kind: 'absent' };

const ABSENT: LookupResult = { kind: 'absent' };

/** Window of the fallback scan that covers Stripe Search's indexing lag (V16). */
const RECENT_SESSIONS_SECONDS = 60 * 60;

/**
 * A reservation built from Stripe (step 6): name and guests from the session,
 * program, date and locale from its metadata; "not valid" when the latest
 * charge is disputed. Throws when Stripe cannot be read or the data is not a
 * reservation — the page then shows the error, never "not found" [70].
 */
async function fromStripe(
  stripe: Stripe,
  sessionId: string,
  paymentIntentId: string,
): Promise<LookupResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });
  const charge = paymentIntent.latest_charge;
  const disputed = typeof charge === 'object' && charge !== null && charge.disputed;
  const reservation = reservationFromSession(
    session,
    paymentIntentId,
    disputed ? 'not valid' : 'valid',
    new Date(session.created * 1000).toISOString(),
  );
  if (!reservation) throw new Error(`lookup: session ${sessionId} carries no reservation`);
  return { kind: 'found', reservation };
}

/**
 * The status page's lookup (architecture §4.4): the sheet, then Stripe.
 * "Absent" only when the sheet was read and Stripe was queried, and neither
 * knows the id [70]. Throws when either cannot be read (5xx, [66]). Never writes:
 * a reservation found only in Stripe waits for the webhook to restore its row.
 */
export async function lookupReservation(id: string): Promise<LookupResult> {
  // 1. Malformed: not found, no sheet or Stripe call.
  if (!RESERVATION_ID_FORMAT.test(id)) return ABSENT;

  // 2–3. The sheet; a read error propagates.
  const row = await findReservation(id);
  if (row) return { kind: 'found', reservation: row.reservation };

  const stripe = getStripe();

  // 4. Search. `id` passed the format check above, so it cannot break the query.
  const search = await stripe.paymentIntents.search({
    query: `metadata['reservation_id']:'${id}' AND status:'succeeded'`,
    limit: 1,
  });
  const paymentIntent = search.data[0];
  if (paymentIntent) {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id, limit: 1 });
    const session = sessions.data[0];
    if (!session) throw new Error(`lookup: paid ${paymentIntent.id} has no Checkout Session`);
    return fromStripe(stripe, session.id, paymentIntent.id);
  }

  // 5. Sessions completed in the last hour, for a payment not yet searchable.
  const since = Math.floor(Date.now() / 1000) - RECENT_SESSIONS_SECONDS;
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.checkout.sessions.list({
      created: { gte: since },
      status: 'complete',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    const match = page.data.find(
      (s) => s.metadata?.reservation_id === id && s.payment_status === 'paid',
    );
    if (match) {
      const matchedPaymentIntentId = paymentIntentIdOf(match.payment_intent);
      if (!matchedPaymentIntentId) throw new Error(`lookup: paid ${match.id} has no PaymentIntent`);
      return fromStripe(stripe, match.id, matchedPaymentIntentId);
    }
    const last = page.data[page.data.length - 1];
    if (!page.has_more || !last) break;
    startingAfter = last.id;
  }

  return ABSENT;
}
