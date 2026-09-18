# Architecture: Stripe payments pilot

version 1.0 | date 2026-09-18
inputs: `prd.md` v1.4; `decisions.md` (cited **[D]**); `projects/context.md` v1.2
rationale and rejected options: `architecture-decisions.md` (cited **[AD §N]**)
objections to the PRD: `answers.md`, threads A1–A12

**[unverified]** marks a claim about Stripe or Vercel taken from their documentation as
the architect knows it (through 2026-05). It was not checked against current documentation:
this session had no web access. Every such claim is in §1 with the slice that checks it.

---

## 0. Boundaries

**Architect (this document):** where reservations live and what the status page reads;
booking-id format; status-page URL; how "shown once" is enforced; webhook contract,
signature check, de-duplication and retry semantics; sheet tab and column order; QR payload
and image format; how Stripe and QR scanners get through Vercel protection; environment
variables; module boundaries; slices.

**Coder:** implementation inside these contracts — styling and classes, message key names,
Stripe SDK version and its pinned API version, QR pixel size and error-correction level,
share-support detection technique (subject to `.claude/skills/*`, in particular no
`setState` in effects), logging, the saved file's name.

**Visual form** of V1 notice, V3, V4, V5 — a design document if one is commissioned;
otherwise the coder reuses existing classes. Not decided here.

**Owner / maintainer:** env values (§6); Stripe and Vercel setup (§9); texts without a source
(§7.2); answers in §11.

**PRD, not here:** everything behavioural. Where this document and the PRD disagree, the PRD wins.

### 0.1 Choices

| subject | chosen | rejected | |
|---|---|---|---|
| reservation store, status-page source | new tab of the existing spreadsheet | Stripe metadata + Search API; a new database (Vercel KV / Postgres) | [AD §1] |
| guests / name on Stripe's page | line-item quantity; text custom field | numeric or dropdown custom field for guests | [AD §2] |
| booking id | UUID v4 | Checkout Session id; UUID v7 / ULID | [AD §3] |
| "shown once" | flag on the PaymentIntent, written before render | cookie / local storage; column in the sheet | [AD §4] |
| idempotency flags | PaymentIntent metadata | sheet columns; processed-event log | [AD §5] |
| who writes the row | webhook only | webhook + screen after payment | [AD §6] |
| messages on a failed write | "New booking" at first delivery, alert once, nothing on restore | "New booking" deferred to restore | [AD §7] |
| Stripe → protected pilot | Protection Bypass for Automation in the endpoint URL | protection off for the branch; public relay | [AD §8] |
| scanner → protected pilot | shareable-link token inside the QR URL | protection off for the branch; Deployment Protection Exceptions | [AD §9] |
| QR image | server-generated PNG data URL | SVG; client-side generation; image endpoint | [AD §10] |
| title on the status page | from `programId` | from the event in the schedule | [AD §11] |
| payment methods | `card` (with wallets) | dynamic payment methods | [AD §12] |
| starting payment | `<form>` + Server Action + redirect | route handler `GET /pay/[eventId]`; client-side Stripe.js | [AD §13] |
| status page, sheet unreachable | "booking not found" | a fourth, error state | [AD §14] |
| status-page URL | path segment `/bookingstatus/{id}/` | query `?id=` | [AD §15] |

---

## 1. Verification register (PRD §11)

| # | Claim | Serves | Status | Checked in | If false |
|---|---|---|---|---|---|
| V1 | Checkout accepts `locale: 'ru'` and renders its own UI in Russian; `custom_fields[].label.custom` is our string, ≤ 50 chars | [29], AC 23 | unverified | S1 | Stripe page in English, as R4 already accepts |
| V2 | `custom_text.submit.message` shows up to 1200 chars of plain text next to the pay button | [17], AC 7 | unverified | S1 | AC 7 does not apply ("where the architect confirms") |
| V3 | `line_items[].adjustable_quantity { enabled, minimum: 1, maximum: 15 }` with `quantity: 1` bounds the count 1–15, default 1, total = unit × quantity. A `numeric` custom field bounds digit count only, not value, and does not change the total | [41], [31], AC 6 | unverified | S1 | AC 6 not satisfiable on Stripe's page — back to product |
| V4 | Card payments in Checkout ask "Name on card" regardless of our fields | [27], AC 12 | unverified | S1 | none; we never read it |
| V5 | Test card `4000 0000 0000 0259` succeeds, then a dispute is created and `charge.dispute.created` is sent | AC 21 | unverified | S4 | chargeback AC checked by Stripe CLI trigger |
| V6 | USD minimum charge is $0.50, so $1 is accepted | [26] | unverified | rehearsal | rehearsal price raised |
| V7 | Non-2xx deliveries are retried: live mode up to 3 days with exponential backoff; test mode about 3 times over a few hours; an event can be re-sent by hand (Dashboard, `stripe events resend`) | [34], [35], [54], AC 20 | unverified | S2 | AC 20 relies on manual resend |
| V8 | Stripe does not follow redirects on webhook delivery; a 3xx counts as failure | webhook URL (§4.3) | unverified | S2 | none; URL has the trailing slash anyway |
| V9 | Vercel Protection Bypass for Automation accepts the secret as query parameter `x-vercel-protection-bypass`, on the branch URL of a protected preview | R9, AC 18–21 | unverified | S0, S2 | R9 materialises: AC 18–21 fail together — back to owner (PRD §7 combination R9) |
| V10 | A Vercel shareable link is a URL with a query token (`_vercel_share`); the token works on any path of that host, does not expire until revoked, and survives new deployments of the branch | [11], AC 11 | unverified | S0, S3 | QRs die on push or revoke — back to product (thread A1) |
| V11 | Web Share with files (`navigator.canShare({ files })`) works in iOS Safari and Android Chrome, not in desktop Firefox; `<a download>` saves a data-URL PNG in both | [40], AC 9 | unverified | S1 | none; fallback covers it |
| V12 | `redirect()` to an external URL from a Server Action works | §4.1 | unverified | S1 | Action returns the URL, client assigns `location` |
| V13 | PaymentIntent `metadata` can be updated after the payment succeeded; updates merge by key | §2.2, §4.2, §4.3 | unverified | S1 | flags move to Checkout Session metadata, if updatable |
| V14 | `checkout.sessions.list({ payment_intent })` returns the session of a PaymentIntent | §4.3 dispute | unverified | S4 | name copied into PI metadata at fulfilment |

---

## 2. Data model

### 2.1 `types/reservation.ts` — new

```ts
export type ReservationStatus = 'valid' | 'not valid';
export type ReservationLocale = 'en' | 'ru';

export interface Reservation {
  id: string;               // booking id, UUID v4 (§2.4)
  name: string;             // Checkout custom field `name`, as typed [27]
  programId: string;        // TourProgram.id — language-neutral, permanent
  eventId: string;          // UpcomingTourEvent.id — informational only
  date: string;             // event.date, YYYY-MM-DD, Central Time
  guests: number;           // line item quantity, 1..15
  amountUsd: number;        // session.amount_total / 100
  email: string;            // session.customer_details.email [39]
  locale: ReservationLocale;// locale of the page where payment started [43]
  status: ReservationStatus;
  paymentIntentId: string;  // pi_…
  createdAt: string;        // ISO-8601 UTC, time of fulfilment
}
```

The status page must not depend on the schedule: the $1 date is removed after the rehearsal
[26], and past dates leave `data/upcomingTours.ts`. It resolves the title from `programId`
(`data/tours*.ts`, permanent) and prints `date` from the row. [AD §11]

### 2.2 Stripe objects

**Checkout Session and PaymentIntent metadata, written at session creation** (same map on both):

| key | value |
|---|---|
| `reservation_id` | booking id |
| `event_id` | `UpcomingTourEvent.id` |
| `program_id` | `TourProgram.id` |
| `date` | `event.date` |
| `locale` | `en` \| `ru` |

**PaymentIntent metadata flags, written later** (value: ISO timestamp; absent = not done) [V13]:

| key | written by | means |
|---|---|---|
| `qr_shown` | screen after payment | QR was rendered once |
| `tg_booking` | webhook | "New booking" message sent |
| `tg_not_saved` | webhook | failed-to-save alert sent |
| `tg_chargeback` | webhook | chargeback message sent |

Stripe holds these flags because it is the one store that is available when the sheet is
not. [AD §5]

### 2.3 Sheet tab `Reservations` — new, existing spreadsheet [S6]

Header in row 1; one row per reservation from row 2. Written with `valueInputOption: 'RAW'`
(a name beginning with `=` stays text).

| col | header | value |
|---|---|---|
| A | booking id | UUID |
| B | name | as typed |
| C | tour | EN `TourProgram.title` |
| D | date | `YYYY-MM-DD` |
| E | guests | integer 1–15 |
| F | amount | number, USD |
| G | email | payer's email |
| H | status page | status-page URL, the one encoded in the QR (§4.5) |
| I | status | `valid` \| `not valid` |
| J | program | `TourProgram.id` |
| K | event | `UpcomingTourEvent.id` |
| L | language | `en` \| `ru` |
| M | payment | PaymentIntent id |
| N | created | ISO-8601 UTC |

A–I are the PRD's set [39, 52]; J–N are technical: J and L drive the status page, M links a
row to Stripe for the §1 reconciliation. None of them marks test vs live [56].
Only the site writes the tab [54]. The only cell ever changed after append is I.

### 2.4 Booking id

`crypto.randomUUID()` (UUID v4, 122 random bits), generated in `startCheckout` before the
session exists. No timestamp, no counter (AC 14). Accepted format on input:
`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/`. [AD §3]

---

## 3. Modules and files

| file | status | responsibility | exports |
|---|---|---|---|
| `lib/payment.ts` | new, client-safe | price and payability rules | `effectivePrice(event, program): number`; `centralDate(now: Date): string` (YYYY-MM-DD in America/Chicago); `isPayable(event, program, now): boolean` = `effectivePrice > 0 && centralDate(now) <= event.date` |
| `types/reservation.ts` | new | §2.1 | types |
| `lib/stripe.ts` | new, server | Stripe client from `STRIPE_SECRET_KEY` | `stripe` |
| `lib/reservationUrl.ts` | new, server | status-page URL (§4.5) | `statusPageUrl(locale, id, requestOrigin): string` |
| `lib/reservationSheet.ts` | new, server | tab `Reservations`; own `GoogleAuth` setup (existing actions are not refactored) | `findReservation(id): Promise<{ row: number; reservation: Reservation } \| null>`; `appendReservation(r): Promise<void>`; `setNotValid(row): Promise<void>` — all throw on API failure |
| `lib/reservationMessages.ts` | new, pure | Telegram texts (§7.3) | `newBookingText(r)`, `notSavedText(r)`, `chargebackText(name, tourEn, date)` |
| `lib/fulfillment.ts` | new, server | per-event procedures (§4.3) | `fulfilCheckout(sessionId): Promise<'done' \| 'retry'>`; `handleDispute(dispute): Promise<'done' \| 'retry'>` |
| `app/actions/startCheckout.ts` | new, `'use server'` | §4.1 | `startCheckout(prev, formData)` |
| `app/api/stripe/webhook/route.ts` | new | §4.3; the one `app/api` endpoint [D §5] | `POST` |
| `app/[locale]/payment/complete/page.tsx` | new | V3 (§4.2) | page, `generateMetadata` |
| `app/[locale]/bookingstatus/[reservationId]/page.tsx` | new | V4 (§4.4) | page, `generateMetadata` |
| `app/[locale]/payment-policy/page.tsx` | new | V5 | page, `generateMetadata` |
| `components/PayButton.tsx` | new, client | `<form action>` → `startCheckout`; hidden `eventId`, `locale`; error slot | default |
| `components/PaymentNotice.tsx` | new | notice + policy link (V1) | default |
| `components/QrActions.tsx` | new, client | Share / Save, back-forward-cache guard (§4.5) | default |
| `data/paymentPolicy.ts`, `data/paymentPolicy.en.ts` | new, pair | maintainer's RU / EN texts [19] | `paymentPolicy: PaymentPolicyText` |
| `types/paymentPolicy.ts` | new | `interface PaymentPolicyText { notice: string; policy: string[] }` — both files must carry both | type |
| `components/UpcomingSection.tsx` | changed | passes `payable = effectivePrice(event, program) > 0` per card | — |
| `components/UpcomingTourCard.tsx` | changed | `book-button` → `PayButton` + `PaymentNotice` when `payable`, nothing otherwise (AC 1, 2); `onReserveSpot` no longer used by the card | — |
| `app/[locale]/tours/[tourEventId]/page.tsx` | changed | `isPayable(event, program, new Date())` → `PayButton` + `PaymentNotice`, else nothing; `TourDetailClient` no longer mounted (AC 1, 2, 4) | — |
| `messages/en.json`, `messages/ru.json` | changed, pair | strings of §7.1 | — |
| `package.json` | changed | `stripe`, `qrcode`, `@types/qrcode` | — |

Untouched: `app/[locale]/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `proxy.ts`,
`i18n/routing.ts`, `next.config.ts`, `lib/site.ts`, `app/tgmessage.ts` (imported as is),
`data/upcomingTours.ts` format, the `Bookings` / `Contacts` / `Reviews` tabs.

On the home card, start time has not passed (the list hides it at start), so `payable`
checks price only; the date page applies the end-of-day rule (AC 4), which holds only if the
page renders per request: it must stay `ƒ` in the build output (no `generateStaticParams`,
no caching of the page).

---

## 4. Contracts

### 4.1 Pay button → Stripe Checkout

```ts
// app/actions/startCheckout.ts
type StartCheckoutState = { failed: boolean };
export async function startCheckout(
  prev: StartCheckoutState, formData: FormData,
): Promise<StartCheckoutState>;   // on success: redirect(session.url), never returns
```

| input (zod, server) | outcome |
|---|---|
| `eventId` not in `upcomingTours`, or `locale` not in `routing.locales` | redirect to `/{locale}/` (`/en/` when the locale is invalid) |
| `!isPayable(event, program, now)` | `redirect('/{locale}/tours/{eventId}/')` — page renders without the button |
| Stripe API error | `{ failed: true }` → `PayButton` shows the start-failed string (§7.1) |
| session created | `redirect(session.url)` [V12] |

Checkout Session parameters:

```ts
{
  mode: 'payment',
  locale,                                        // 'en' | 'ru' [V1]
  payment_method_types: ['card'],                // [AD §12]
  line_items: [{
    quantity: 1,
    adjustable_quantity: { enabled: true, minimum: 1, maximum: 15 },  // guests [V3]
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(effectivePrice * 100),
      product_data: {
        name: `${localizedProgramTitle} · ${formatDateToUserLocale(event.date, locale)}`,
        description: perGuestString,             // §7.1
      },
    },
  }],
  custom_fields: [{
    key: 'name', type: 'text', optional: false,
    label: { type: 'custom', custom: nameLabelString },   // ≤ 50 chars
    text: { maximum_length: 100 },
  }],
  custom_text: { submit: { message: paymentPolicy[locale].notice } },  // ≤ 1200 chars [V2]
  success_url: `${origin}/${locale}/payment/complete/?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${origin}/${locale}/tours/${eventId}/`,
  expires_at: nowSeconds + 30 * 60,              // Stripe's minimum
  metadata: M,                                   // §2.2
  payment_intent_data: { metadata: M, description: `Reservation ${reservationId}` },
}
```

`origin` — the request's own origin (`x-forwarded-proto` + `host`), i.e. the host the payer
is on and already has access to. Name and guests are asked only on Stripe's page [28]. [AD §2]

### 4.2 Screen after payment — `/[locale]/payment/complete/?session_id=…` (V3)

Dynamic, never cached. Decision table, evaluated top to bottom:

| condition | state |
|---|---|
| `session_id` missing, Stripe error, no session, no `metadata.reservation_id` | A — not yet confirmed, no QR |
| `session.payment_status !== 'paid'` | A |
| PI `metadata.qr_shown` present | C — already shown + tatiana.city.guide@gmail.com, no QR (AC 10) |
| PI update `qr_shown = now` fails | A (a reload retries) |
| PI update succeeds | B — QR (§4.5) + `QrActions` |

The flag is written **before** the QR is rendered. This page never writes to the sheet and
never sends Telegram: the webhook is the only writer. [AD §4], [AD §6]

Residual, accepted: two requests arriving within the same instant can both see the flag
absent and both render B.

### 4.3 Webhook — `POST /api/stripe/webhook/`

| | |
|---|---|
| Path | `/api/stripe/webhook/` — **with** the trailing slash: `trailingSlash: true` answers 308 without it [V8] |
| Stripe endpoint URL | `https://<pilot branch host>/api/stripe/webhook/?x-vercel-protection-bypass=<secret>` [V9] |
| Events enabled | `checkout.session.completed`, `charge.dispute.created` — nothing else |
| Endpoint API version | the API version pinned by the installed `stripe` SDK |
| Runtime | Node.js; body read once with `request.text()` |
| Signature | `stripe.webhooks.constructEvent(raw, request.headers.get('stripe-signature'), STRIPE_WEBHOOK_SECRET)` |
| Not matched by `proxy.ts` | its matcher is `['/', '/(ru|en)/:path*']` |

Responses:

| condition | HTTP | side effects |
|---|---|---|
| signature header missing or check fails; secret not configured | 400 | none (AC 22) |
| other event type | 200 | none |
| `checkout.session.completed` with `payment_status !== 'paid'` or without `metadata.reservation_id` | 200 | none |
| `charge.dispute.created` whose PaymentIntent has no `reservation_id` (a payment not made by this site) | 200 | none |
| procedure returned `done` | 200 | — |
| procedure returned `retry`, or threw | 500 | steps already done stay done; the flags stop them repeating |

**`fulfilCheckout(sessionId)`** — for `checkout.session.completed`:

1. Retrieve the session with `line_items` expanded, and its PaymentIntent. Build `Reservation`
   (§2.1): guests = line-item quantity, name = custom field `name`, status `valid`.
2. **Row.** `findReservation(id)`; absent → `appendReservation`. `rowOk` = the row exists
   after this step. A read or append error sets `rowOk = false`.
3. **New booking.** If `tg_booking` is absent: send `newBookingText`; on success set
   `tg_booking`. `bookingOk` = flag present after this step.
4. **Alert.** If `!rowOk` and `tg_not_saved` is absent: send `notSavedText`; on success set
   `tg_not_saved`.
5. Return `done` if `rowOk && bookingOk`, else `retry`.

Sequence this produces for AC 20: first delivery → "New booking" + alert, 500; each
redelivery while the sheet is down → nothing, 500; first redelivery after access returns →
row appended, nothing sent, 200. [AD §7]

**`handleDispute(dispute)`** — for `charge.dispute.created`:

1. Retrieve the PaymentIntent; read `reservation_id`, `program_id`, `date`. Retrieve its
   Checkout Session [V14] for the name.
2. **Message.** If `tg_chargeback` is absent: send `chargebackText`; on success set the flag.
3. **Row.** `findReservation(id)`; absent or error → `retry`; status ≠ `not valid` →
   `setNotValid(row)`; error → `retry`.
4. Return `done` if steps 2 and 3 succeeded, else `retry`.

Every `charge.dispute.created` counts as a chargeback, inquiries included; a dispute later won
does not restore `valid` (thread A10).

Residuals, accepted: a flag write that fails after its message was sent repeats that message
once on the next delivery; two deliveries of one event processed concurrently can append two
rows (Stripe retries sequentially; not observed as a normal path).

### 4.4 Status page — `/[locale]/bookingstatus/[reservationId]/` (V4)

Dynamic, never cached, no login.

| condition | state | shows |
|---|---|---|
| id fails the §2.4 format | not found | no sheet call |
| `findReservation` → null | not found | — |
| `findReservation` throws | not found | error logged server-side [AD §14] |
| row, status `valid` | valid | name (B), guests (E), tour title from `programId` (J) in the page's locale, date (D) formatted with `formatDateToUserLocale`, status |
| row, status `not valid` | not valid | same fields |

Never shows email (G), amount, or anything from Stripe. Language = the URL's locale, which the
QR carries from the payer's locale (§4.5).

### 4.5 QR

| | |
|---|---|
| Payload | `statusPageUrl(locale, id, origin)` = `new URL('/{locale}/bookingstatus/{id}/', base)` with every query parameter of `PILOT_SHARE_URL` appended; `base` = origin of `PILOT_SHARE_URL`, or the request origin when the variable is absent (local development only) [V10], [AD §9] |
| Same URL goes to | sheet column H |
| Image | PNG, generated on the server with `qrcode` (`toDataURL`), embedded as a data URL in state B's HTML. No endpoint serves it [AD §10] |
| Share | `QrActions`: build a `File` (`image/png`) from the data URL; if `navigator.canShare?.({ files: [file] })` → Share button → `navigator.share({ files: [file] })`; otherwise Save = `<a href={dataUrl} download>` [V11] |
| Server render | the Save form (server cannot know share support); Share replaces it on the client |
| Back-forward cache | on `pageshow` with `event.persisted === true`: `location.reload()` — the server then answers state C (AC 10) |

---

## 5. Error and retry behaviour

| where | failure | behaviour | visible to |
|---|---|---|---|
| `startCheckout` | unknown event / not payable | redirect (§4.1) | payer: page without button |
| `startCheckout` | Stripe API | no session; start-failed string | payer |
| Stripe page | declined card | stays on Stripe | payer |
| Stripe page | abandoned / back | `cancel_url` → date page; no QR (AC 8) | payer |
| Screen after payment | Stripe API, flag write | state A; reload retries | payer |
| Webhook | bad or missing signature | 400, nothing written | — |
| Webhook | sheet read / append | alert once; 500; Stripe redelivers [V7] | Tatiana: "New booking" + alert |
| Webhook | Telegram | 500; redelivery retries the message; row not duplicated | — |
| Webhook | Stripe API (retrieve, flag write) | 500 | — |
| Webhook | dispute before its row exists | message sent; 500 until the row exists | Tatiana |
| Webhook | redelivery window over | row stays missing; mismatch at stage end (PRD R10) | reconciliation |
| Status page | sheet unreachable | "booking not found" (PRD §7, R10 combination) | scanner |

---

## 6. Environment variables

Set by the maintainer or owner in Vercel, never committed. Scope: **Preview, Git branch = the
pilot branch only** (§11 Q6). A change takes effect on the next deployment.

| name | used by | stage 1 value | stage 2 value | new |
|---|---|---|---|---|
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | maintainer's test key `sk_test_…` [24] | Tatiana's live key `sk_live_…` [25] | yes |
| `STRIPE_WEBHOOK_SECRET` | webhook | `whsec_…` of the test-mode endpoint | `whsec_…` of the live endpoint in Tatiana's account | yes |
| `PILOT_SHARE_URL` | `lib/reservationUrl.ts` | the Vercel shareable link of the pilot branch URL | same link, unless revoked | yes |
| `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID` | `lib/reservationSheet.ts` | production spreadsheet [S6] | same | no — must be present for Preview (§11 Q5) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_CHATID` | `app/tgmessage.ts` | production chat [owner, 8] | same | no — same |

The Vercel automation-bypass secret is **not** a code variable: it goes only into the
Stripe endpoint URL (§4.3). No Stripe publishable key is needed (redirect to `session.url`).
Local development: `.env.local` with test keys; `stripe listen --forward-to
localhost:3000/api/stripe/webhook/` prints its own `whsec_…`.

A missing `STRIPE_*` variable fails closed: `startCheckout` returns `failed`, the webhook
answers 400.

---

## 7. Localization

### 7.1 Strings rendered by the site (ru + en, AC 23)

| slot | view | source |
|---|---|---|
| notice | V1, Stripe `custom_text` | `data/paymentPolicy*.ts` `notice` [19]; EN wording [16] with the address [7]; RU — none at stage 1 (thread A4) |
| policy text | V5 | `data/paymentPolicy*.ts` `policy` [19]; placeholder at stage 1 |
| policy link label | V1 | none (A4) |
| start failed | V1 | none (A4) |
| Stripe name-field label (≤ 50 chars) | V2 | none (A4) |
| Stripe item description, "per guest" | V2 | none (A4) |
| Stripe item name | V2 | existing data: program title + formatted date — form only |
| state A, state B heading, Share, Save | V3 | none (A4) |
| state C | V3 | EN [46] and PRD §5 V3; RU none (A4) |
| valid, not valid, booking not found, field labels | V4 | none (A4) |
| `<title>` of V3, V4, V5 | V3–V5 | none (A4) |

Stripe's own UI follows `locale` [V1]; our strings on it come from the same pair of files.

### 7.2 Constraint on the maintainer's texts

`notice` is plain text of at most 1200 characters and names tatiana.city.guide@gmail.com
(AC 5) [V2].

### 7.3 Telegram texts — English, not localized [9, 10]

| function | form |
|---|---|
| `newBookingText` | `New booking from ${name}: ${tourEn}, date: ${date}, guests: ${guests}` [9] |
| `chargebackText` | `Chargeback for reservation made by ${name} for tour ${tourEn} date: ${date}` [10] |
| `notSavedText` | owner's line (none yet, A4) + name, tour, date, guests; says the reservation is not saved [34] |

`tourEn` = EN `TourProgram.title`; `date` = `YYYY-MM-DD` from the data.

---

## 8. SEO

| item | rule |
|---|---|
| V3, V4, V5 pages | `generateMetadata` returns `robots: { index: false, follow: false }` and overrides `alternates` so that no canonical and no hreflang are emitted (the layout's would otherwise point at the home page). Checked on rendered HTML |
| `app/sitemap.ts`, `app/robots.ts`, `app/[locale]/layout.tsx` | unchanged (AC 15) |
| `/api/stripe/webhook/` | not a page; no metadata |
| Existing pages | canonical, hreflang, `og:url`, JSON-LD, `robots.txt`, `sitemap.xml` byte-identical to `dev` (context.md OPEN 34 checklist, item 4) |

---

## 9. Setup per stage (owner and maintainer, no code)

**Before S2 (stage 1):**

1. Vercel project: enable Protection Bypass for Automation; keep the secret [V9].
2. Vercel: create the shareable link for the pilot **branch** URL → `PILOT_SHARE_URL` [V10].
3. Stripe test account: add the endpoint (§4.3) with the two events → `STRIPE_WEBHOOK_SECRET`.
4. Spreadsheet: add the tab `Reservations` with the header row of §2.3. Setup, not an edit of reservations [54].
5. Set §6 variables for the pilot branch; redeploy.

**Between stages** (after Tatiana's account is active [25]): in her live account, repeat 3
with the same URL; replace `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; redeploy. Then the
PRD §10 sequence. Stripe account settings — email receipts, statement descriptor — are
Stripe's, not the site's [37].

---

## 10. Build slices

Order S0 → S1 → S2 → S3 → S4. S1–S4 are the PRD §10 slices.

| slice | content | AC | verifies |
|---|---|---|---|
| S0 | §9 steps 1–2 and 4; open `PILOT_SHARE_URL` with a deep path in a fresh private window; `curl` the branch URL with the bypass parameter | — | V9, V10 (deep path) |
| S1 | `lib/payment.ts`, `startCheckout`, `PayButton`, `PaymentNotice`, `data/paymentPolicy*` (placeholder), V5 page, V3 page, `QrActions`, `lib/reservationUrl.ts`, messages | 1–10, 23 (V1, V3, V5) | V1–V4, V11–V13 |
| S2 | `lib/reservationSheet.ts` (append, find), `lib/reservationMessages.ts`, `lib/fulfillment.ts` (`fulfilCheckout`), webhook route; §9 steps 3, 5 | 16–20, 22 | V7, V8, V9 |
| S3 | V4 page | 11–15, 23 (V4) | V10 (on a push after the link was made) |
| S4 | `setNotValid`, `handleDispute`, chargeback text | 21 | V5, V14 |

Between S1 and S3 the QR points at a page that does not exist yet; AC 11 is checked in S3.

---

## 11. Questions for the owner

| # | question | blocks | recommended |
|---|---|---|---|
| Q1 | Every QR carries the shareable-link token, so the link must exist before stage 1 and must not be revoked or regenerated while any QR is in use (A1) | AC 11 at stage 1; PRD §10 order | accept; move "shareable link issued" before stage 1 |
| Q2 | Guests are Stripe's quantity selector, labelled by Stripe, with "per guest" in the item (A2) | S1 acceptance of AC 6 | accept |
| Q3 | Date views lose their contact-form entry (AC 1) while [D §2] says removing it was rejected (A3) | nothing in code; product wording | AC 1 as written |
| Q4 | Who writes the strings marked "none" in §7.1 and the alert line (A4) | AC 23, stage 2 | coder drafts both locales for stage 1; the maintainer replaces them with his [19] files before stage 2 |
| Q5 | Do Preview deployments already use the production spreadsheet and Telegram chat? (A12) | S2 | confirm, or set them for the pilot branch |
| Q6 | Exact pilot branch name, for env scoping | §6 | `feat/stripe-pilot`, from `dev`, never merged |
