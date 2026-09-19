import type Stripe from 'stripe';
import sendTelegramMessage from '@/app/tgmessage';
import { getStripe, paymentIntentIdOf, reservationFromSession } from '@/lib/stripe';
import { appendReservation, findReservation, setNotValid } from '@/lib/reservationSheet';
import { chargebackText, newBookingText, notSavedText } from '@/lib/reservationMessages';
import { statusPageUrl } from '@/lib/reservationUrl';
import { programTitle } from '@/lib/programTitle';

export type FulfilmentResult = 'done' | 'retry';

/** PaymentIntent metadata flags (architecture §2.2). Value: ISO timestamp. */
type Flag = 'tg_booking' | 'tg_not_saved' | 'tg_chargeback';

async function setFlag(stripe: Stripe, paymentIntentId: string, flag: Flag): Promise<boolean> {
  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { [flag]: new Date().toISOString() },
    });
    return true;
  } catch (error) {
    console.error(`fulfilment: writing ${flag} failed:`, error);
    return false;
  }
}

/** Sends a Telegram message, then records it on the PaymentIntent. True when both happened. */
async function sendOnce(
  stripe: Stripe,
  paymentIntentId: string,
  flag: Flag,
  message: string,
): Promise<boolean> {
  const sent = await sendTelegramMessage(message);
  if (!sent.success) {
    console.error(`fulfilment: Telegram (${flag}) failed:`, sent.error);
    return false;
  }
  return setFlag(stripe, paymentIntentId, flag);
}

/**
 * `checkout.session.completed` (architecture §4.3). Steps already done stay done
 * — the row is found by booking id, the messages by their flags — so a Stripe
 * redelivery repeats only what failed (AC 19, AC 20).
 *
 * `origin` is the webhook request's origin: column H falls back to it when
 * `PILOT_SHARE_URL` is absent (local development only).
 *
 * Throws on a Stripe read failure; the route answers 500 and Stripe redelivers.
 */
export async function fulfilCheckout(sessionId: string, origin: string): Promise<FulfilmentResult> {
  const stripe = getStripe();

  // 1. The session with its line items, and its PaymentIntent.
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
  const paymentIntent = session.payment_intent;
  const paymentIntentId = paymentIntentIdOf(paymentIntent);
  if (!paymentIntent || typeof paymentIntent === 'string' || !paymentIntentId) {
    throw new Error(`fulfilment: session ${sessionId} has no PaymentIntent`);
  }
  const reservation = reservationFromSession(session, paymentIntentId, 'valid', new Date().toISOString());
  if (!reservation) {
    throw new Error(`fulfilment: session ${sessionId} has no reservation_id`);
  }
  const flags = paymentIntent.metadata;

  // 2. Row.
  let rowOk = false;
  try {
    const existing = await findReservation(reservation.id);
    if (!existing) {
      await appendReservation(reservation, statusPageUrl(reservation.locale, reservation.id, origin));
    }
    rowOk = true;
  } catch (error) {
    console.error(`fulfilment: sheet row for ${reservation.id} failed:`, error);
  }

  // 3. New booking — at the first delivery, whatever the sheet did ([AD §7]).
  const bookingOk =
    Boolean(flags.tg_booking) ||
    (await sendOnce(stripe, paymentIntentId, 'tg_booking', newBookingText(reservation)));

  // 4. Alert, once, while the row is missing.
  if (!rowOk && !flags.tg_not_saved) {
    await sendOnce(stripe, paymentIntentId, 'tg_not_saved', notSavedText(reservation));
  }

  // 5.
  return rowOk && bookingOk ? 'done' : 'retry';
}

/** The PaymentIntent a dispute belongs to, through its charge when not given directly. */
type DisputeRef = Pick<Stripe.Dispute, 'payment_intent' | 'charge'>;

async function disputedPaymentIntentId(stripe: Stripe, dispute: DisputeRef): Promise<string | null> {
  const direct = paymentIntentIdOf(dispute.payment_intent);
  if (direct) return direct;
  const charge =
    typeof dispute.charge === 'string' ? await stripe.charges.retrieve(dispute.charge) : dispute.charge;
  return paymentIntentIdOf(charge.payment_intent);
}

/**
 * `charge.dispute.created` (architecture §4.3). Every dispute counts as a
 * chargeback, inquiries included; a dispute later won does not restore
 * "valid" (thread A10). A dispute on a payment this site did not make is
 * ignored (`done`, nothing sent).
 *
 * Throws on a Stripe read failure; the route answers 500 and Stripe redelivers.
 */
export async function handleDispute(dispute: DisputeRef): Promise<FulfilmentResult> {
  const stripe = getStripe();

  // 1. The PaymentIntent and its reservation; the session for the name [V14].
  const paymentIntentId = await disputedPaymentIntentId(stripe, dispute);
  if (!paymentIntentId) return 'done';
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const { reservation_id: id, program_id: programId = '', date = '' } = paymentIntent.metadata;
  if (!id) return 'done';

  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
  const session = sessions.data[0];
  if (!session) throw new Error(`dispute: no Checkout Session for ${paymentIntentId}`);
  const name = session.custom_fields.find((f) => f.key === 'name')?.text?.value ?? '';

  // 2. Message, once.
  const messageOk =
    Boolean(paymentIntent.metadata.tg_chargeback) ||
    (await sendOnce(
      stripe,
      paymentIntentId,
      'tg_chargeback',
      chargebackText(name, programTitle(programId, 'en'), date),
    ));

  // 3. Row: "not valid" in the same row; retried until the row exists.
  let rowOk = false;
  try {
    const found = await findReservation(id);
    if (found) {
      if (found.reservation.status !== 'not valid') await setNotValid(found.row);
      rowOk = true;
    }
  } catch (error) {
    console.error(`dispute: marking ${id} not valid failed:`, error);
  }

  // 4.
  return messageOk && rowOk ? 'done' : 'retry';
}
