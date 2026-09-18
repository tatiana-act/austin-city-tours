# Architecture decisions: Stripe payments pilot

companion to: `architecture.md` v1.1 (cited there as **[AD §N]**)
holds: options, criterion and reasoning for each choice in `architecture.md` §0.1.
Stripe and Vercel claims carry the §1 register ids (V1–V14); all are unverified.

---

## 1. Reservation store and what the status page reads

- (a) New tab `Reservations` in the existing spreadsheet — **chosen**.
- (b) Stripe as the store: status page finds the PaymentIntent by `metadata.reservation_id` via the Search API.
- (c) A new database (Vercel KV / Postgres / Blob).

Criterion: the §1 metric reconciles Stripe against sheet rows and status pages; the backend
set is fixed by context.md CONSTRAINTS, and [D §5] grants one exception (the endpoint), not a
new store.
(a) makes the row and the page one record, so they cannot disagree. (b) needs Search, which
is eventually consistent (a fresh reservation may be unfindable for a while) and would still
require the row separately. (c) is a new backend nobody approved.
Cost of (a), already accepted by the PRD: while a row is missing the page says "not found"
(PRD §7, R10 combination); Tatiana checks the Stripe dashboard [55, 58].

## 2. Guests and name on Stripe's page

- (a) Guests = line-item quantity with `adjustable_quantity` 1–15 — **chosen** (V3).
- (b) `numeric` custom field "Guests".
- (c) `dropdown` custom field with options 1–15.

Criterion: AC 6 — bounded 1–15, default 1, and the total equals price × guests on Stripe's
page. Only (a) changes the amount; (b) bounds digit count, not value, and (b) and (c) leave the
total at one unit. Cost: the control is Stripe's quantity selector, labelled by Stripe, not
"guests" — mitigated by the item description saying the price is per guest; accepted
[61], wording in design thread D1.
Name: a `text` custom field is the only way to ask a name that is not the cardholder's [27];
Stripe still asks the name on card (V4), which the site never reads.

## 3. Booking id

- (a) UUID v4 from `crypto.randomUUID()` — **chosen**.
- (b) The Checkout Session id.
- (c) UUID v7 / ULID.

Criterion: AC 13–14, no shared counter or timestamp, not derivable from another value [50].
(c) embeds a timestamp. (b) has no documented randomness guarantee, would expose a Stripe
object id in every QR and sheet row, and does not exist until the session does, while the id
must be in the session's metadata at creation. (a) has 122 random bits and is available
before the session.

## 4. Enforcing "shown once"

- (a) Server-side flag `qr_shown` on the PaymentIntent, written before the QR is rendered — **chosen**.
- (b) Cookie or local storage in the payer's browser.
- (c) A column in the sheet row.

Criterion: AC 10 — reload, return, and opening the address again (possibly in another
browser) show "already shown".
(b) fails on another browser or a cleared cookie. (c) depends on the webhook having written
the row, which may lag or fail (R10), so the QR would be withheld exactly when the sheet is
down.
Order matters: flag first, render second. A failed flag write shows state A, and a reload
retries, so a failure never produces a second showing. Browser back-forward cache is
handled on the client (architecture §4.5), because a restored page never asks the server.
Residual: two simultaneous first requests may both render the QR.

## 5. Where the idempotency flags live

- (a) PaymentIntent metadata — **chosen** (V13).
- (b) Extra columns in the sheet row.
- (c) A log of processed Stripe event ids.

Criterion: AC 20 — one alert, and no second "New booking", across redeliveries **while the
sheet is unavailable**. (b) is unreadable at exactly that moment. (c) needs a store (§1). The
PaymentIntent exists for every paid reservation and is reachable on every delivery, since the
webhook calls Stripe anyway.
Row de-duplication uses the row itself (`findReservation` by booking id): the row is the
thing whose uniqueness AC 16 and AC 19 require.
Residual: metadata writes are not compare-and-set; a flag write that fails after a sent
message repeats that message once.

## 6. One writer

- (a) Webhook only — **chosen**.
- (b) Webhook and the screen after payment both fulfil (Stripe's usual recommendation).

Criterion: AC 16 and AC 19, exactly one row. Sheets has no conditional append; two writers
racing on the same reservation (the redirect and the event arrive within the same second)
produce two rows. AC 18 is met by the webhook alone. (b) would only cut the lag before the
row appears.

## 7. Messages when the sheet write fails

- (a) "New booking" at the first delivery regardless of the sheet; alert once if the row failed; nothing on restore — **chosen**.
- (b) "New booking" only once the row exists, so at restore time.

Criterion: AC 17 (exactly one "New booking") and AC 20 ("no second 'New booking' message"
after restore — which presumes a first was already sent). Both options satisfy AC 17; (a)
matches AC 20's wording and tells Tatiana about the payment immediately; (b) would delay it by
the outage. Reading recorded in thread A5.

## 8. Stripe reaching the protected pilot

- (a) Protection Bypass for Automation, secret in the endpoint URL's query — **chosen** (V9).
- (b) Turn Deployment Protection off for the pilot.
- (c) A public relay that forwards to the pilot.

Criterion: R9 without undoing context.md OPEN 29 (protection stays) and without new
infrastructure. Stripe cannot send custom headers, so the query form is the one available.
Cost: the secret opens every deployment of the project to whoever holds it, and it is
visible to members of the Stripe account holding the endpoint (Tatiana's, at stage 2).

## 9. Scanners reaching the protected pilot

- (a) The shareable-link token travels inside every QR URL — **chosen** (V10).
- (b) Turn protection off for the pilot branch.
- (c) Deployment Protection Exceptions for a pilot domain (a paid Vercel add-on, unverified).
- (d) Automation bypass secret in the QR — rejected outright: it opens every deployment.

Criterion: AC 11 — a device that has never opened the pilot, no Vercel login, at stage 1 as at
stage 2 and after later pushes, under [11] ("shareable link") and OPEN 29. A device with no
cookie can only be admitted by something it carries, so the credential has to be in the QR.
(a) adds no new credential: at stage 2 every customer already holds the same link.
Consequences, accepted [60] (PRD R3, R16, §10): the link exists before stage 1; it is not
revoked or regenerated during a stage, since that breaks every QR; every QR admits its holder
to the whole pilot. If V10 shows the token does not survive new deployments, AC 11 fails on
the first push after a QR is issued, and the choice returns to the owner between (b) and (c).

## 10. QR image

- (a) PNG from `qrcode` on the server, embedded as a data URL — **chosen**.
- (b) SVG.
- (c) Generated in the browser.
- (d) An image endpoint.

Criterion: [40] share or save as an image other apps accept, shown once. PNG is what
messengers and photo galleries accept, and SVG often is not. (c) ships the library to the
client for no gain. (d) is a second URL that serves the QR again, which [45] forbids.

## 11. Tour title on the status page

- (a) From `programId` stored in the row — **chosen**.
- (b) From the event, looking up `eventId` in the schedule.

Criterion: AC 12 (title in the page's language) for as long as QRs are scanned. Events leave
`data/upcomingTours.ts` — the $1 rehearsal date is removed on purpose [26] — and then (b) has
no title. Programs are permanent (context.md GLOSSARY). The date comes from the row.

## 12. Payment methods

- (a) `payment_method_types: ['card']` — **chosen**; Apple Pay and Google Pay ride on card.
- (b) Dynamic payment methods from the Dashboard.

Criterion: V3 state "confirmed" must be knowable on redirect. Async methods (bank debits)
reach `paid` later and need `checkout.session.async_payment_succeeded`, a third event and a
state the PRD does not describe.

## 13. Starting payment

- (a) `<form action={startCheckout}>` → Server Action creates the session → `redirect(session.url)` — **chosen** (V12).
- (b) A route handler `GET /pay/[eventId]` that redirects.
- (c) Stripe.js on the client.

Criterion: context.md CONSTRAINTS — data only through Server Actions, one `app/api`
exception, and it is the webhook. (b) is a second route outside that rule; (c) needs a
publishable key and client code for what a redirect does. (a) also works without JS.

## 14. Status page when the sheet cannot be read

- (a) Show "booking not found" and log — **chosen**.
- (b) A fourth, error state.

Criterion: V4 has exactly three states [47, 49, 51], all localized (AC 23). (b) adds a state
and strings the PRD does not have. For Tatiana, "not found" already means "check Stripe"
(PRD §7, R10 combination), which is the right action in both cases. Thread A7.

## 15. Status-page URL

- (a) `/[locale]/bookingstatus/[reservationId]/` — **chosen**.
- (b) `/[locale]/bookingstatus/?id=…`.

Criterion: the maintainer's proposal [49] (page `bookingstatus`, id as a parameter); both
satisfy it. (a) keeps the query string for the share token alone (§9), so that nothing else
competes for it, and needs no `searchParams` handling on the page.
