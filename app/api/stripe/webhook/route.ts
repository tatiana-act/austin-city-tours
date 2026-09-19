import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { fulfilCheckout, handleDispute } from '@/lib/fulfillment';
import { requestOrigin } from '@/lib/reservationUrl';

/**
 * Stripe's one endpoint on the site (architecture §4.3, [D §5]):
 * `POST /api/stripe/webhook/`, events `checkout.session.completed` and
 * `charge.dispute.created`. A non-2xx answer makes Stripe redeliver (V7).
 */
export const runtime = 'nodejs';

const ok = () => new Response(null, { status: 200 });
const badRequest = () => new Response(null, { status: 400 });
const retryLater = () => new Response(null, { status: 500 });

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  // Fails closed: without both secrets nothing is read, written or sent (AC 22).
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error('webhook: rejected,', error);
    return badRequest();
  }
  if (!secret) {
    console.error('webhook: rejected, STRIPE_WEBHOOK_SECRET is not set');
    return badRequest();
  }
  if (!signature) return badRequest();

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    console.error('webhook: signature check failed:', error);
    return badRequest();
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status !== 'paid' || !session.metadata?.reservation_id) return ok();
        const result = await fulfilCheckout(session.id, requestOrigin(request.headers));
        return result === 'done' ? ok() : retryLater();
      }
      case 'charge.dispute.created': {
        const result = await handleDispute(event.data.object);
        return result === 'done' ? ok() : retryLater();
      }
      default:
        return ok();
    }
  } catch (error) {
    console.error(`webhook: ${event.type} ${event.id} failed:`, error);
    return retryLater();
  }
}
