# PRD: Stripe payments pilot

version 1.4 | date 2026-09-18 | status: buildable — no open questions
sources: `[owner, N]` — interview answer N, logged in `decisions.md` §1 (cited as **[D]**);
`[owner, S1]`–`[owner, S6]` — the starting scenario, [D §1]; `[from code]` — read from the
repository
companion: `projects/context.md` — on conflict it wins; the exceptions granted for this
pilot are listed in [D §5]

Written in English because the interview was in English. "Tatiana" is the guide; the
maintainer calls her "owner" [owner, 13].

---

## 1. Goal and metric

**Goal.** Find out whether the site can take payment for scheduled tours reliably, on a
branch deployment, with production unchanged `[owner, 1]`.

| | |
|---|---|
| Instrument | Reconciliation at the end of a stage: Stripe's list of successful payments for the stage against the reservation rows in the sheet and the status pages their QR codes open `[owner, 20]` |
| Base | 0 — the site takes no payments today (context.md DOMAIN) |
| Threshold | Zero mismatches, **and** at least one QR scanned and shown correctly: stage 1 — a test reservation; stage 2 — a real customer at a real tour `[owner, 20, 21]` |
| Moment | When Tatiana declares the stage over; no date, no count `[owner, 22]` |
| Attribution | A payment without its row or page is a failure of this path only; tour, date and price complaints do not enter the count. Nobody edits the spreadsheet by hand `[owner, 54]`: every row is the site's, and a payment whose row is still missing when the stage ends is a mismatch even if the alert told Tatiana of it |

Convenience is not measured. Feedback that reaches Tatiana is a qualitative signal, not a
pass condition `[owner, 1, 23]`. [D §4]

## 2. User stories

1. As a visitor — a tourist, or a local paying for guests — I pay for a scheduled date from
   its card or its page and enter the name and guest count on the payment page
   `[owner, S1, S3, 28, 33]`.
2. As a payer, right after paying I see the QR once and can share or save it, so that I or
   my guests can show it at the tour `[owner, 40, 44, 45]`.
3. Before paying I see that there are no refunds or cancellations through the site and
   whom to write to, and I can read the policy `[owner, 15–18]`.
4. As a visitor not ready to pay, I can still ask the guide questions through the existing
   forms `[owner, 33]`.
5. As Tatiana, I scan a QR and see name, guests, tour, date and whether the reservation is
   valid `[owner, 30, 48]`.
6. As Tatiana, I get a Telegram message and a sheet row for every paid reservation
   `[owner, 6, 9, S6]`.
7. As Tatiana, on a chargeback I get a Telegram message, the reservation's row is marked
   and its QR shows "not valid" `[owner, 6, 10, 51, 52]`.
8. As Tatiana, when a paid reservation could not be written to the sheet, I get a Telegram
   alert naming it; I check the payment in the Stripe dashboard and let the guest join the
   tour. Nobody repairs the reservation by hand: the site restores the row itself when
   Stripe re-sends `[owner, 34, 35, 54, 55, 57, 58]`.
9. As Tatiana, I end a stage and read the result against §1 `[owner, 20–22]`.

## 3. Out of scope

- Refunds and cancellations on the site; disputes are settled by Tatiana outside it `[owner, 2]`.
- Accounts and logins — a separate feature `[owner, 3]`.
- Capacity and sold-out handling `[owner, 4]`; any currency but USD `[owner, 5]`.
- Any email sent by the site `[owner, 37]`.
- Re-issuing or recovering a QR `[owner, 38]`.
- Paying for a program without a date: "Reserve" on a program card and "Book a tour" keep
  their current behaviour `[owner, 33]`.
- Any change to production (`main`) `[owner, 1]`.
- Marking test-mode notifications `[owner, 8]`.
- A "checked in" state: the status page has exactly three states (§5) `[owner, 47, 49, 51]`.

## 4. Entities

| Term | Meaning | Existing code |
|---|---|---|
| **Reservation** | A paid place on a tour date, made through this pilot. The maintainer's "booking id" and "booking status" refer to it | new |
| Tour date | `UpcomingTourEvent`; its effective price is `event.price ?? program.price` | `[from code]` `app/[locale]/tours/[tourEventId]/page.tsx:38` |
| Booking request / Contact | The existing forms and sheet tabs `Bookings`, `Contacts`; unchanged | context.md GLOSSARY |
| Chargeback | A card dispute opened by the customer's bank, reported by Stripe. ≠ dispute, which is an email to Tatiana | `[owner, 6]` |

**Reservation** carries: an id that cannot be guessed or derived from another `[owner, 50]`;
the name as typed `[owner, 27]`; the tour date; guests 1–15 `[owner, 41]`; amount = effective
price × guests, USD `[owner, 5, 31]`; the payer's email as Stripe collects it `[owner, 39]`;
the language the payment started in `[owner, 43]`; status valid / not valid `[owner, 47, 51]`.

**Sheet row**, in a new tab of the existing spreadsheet `[owner, S6]`: booking id, name, tour,
date, guests, amount, email, link to the status page, status `[owner, 39, 52]`. Written and
changed only by the site `[owner, 54]`; Tatiana reads it to find a customer `[owner, 38]`.
Stage-1 test reservations and the $1 rehearsal are written the same way, to the same tab,
unmarked `[owner, 56]`.

**Telegram messages**, to the chat the site already uses (`TELEGRAM_BOT_CHATID`,
`app/tgmessage.ts` `[from code]`), in English: reservation `[owner, 9]`; chargeback
`[owner, 10]`; failed-to-save alert `[owner, 34]` — no text given; one per reservation, it
names the reservation.

**Texts from the maintainer**: policy and notice, one EN file and one RU file `[owner, 19]`.

## 5. Views

- **V1 Pay buttons.** "Join this tour" on a date card (`components/UpcomingTourCard.tsx:107`)
  and "Reserve a spot" on a date page (`components/TourDetailClient.tsx:21`) start payment
  instead of the contact form `[owner, 33]`; hidden when the effective price is 0 or
  missing `[owner, 32]`. Beside them: the notice `[owner, 16, 17]` and a policy link `[owner, 18]`.
- **V2 Stripe payment page** (external): name, guests, email, card `[owner, 28]`; the notice
  where Stripe allows it `[owner, 17]`; may be English only `[owner, 29]`.
- **V3 Screen after payment**, three states: payment not yet confirmed — no QR; confirmed —
  the QR, once, with Share where the browser supports it, otherwise Save `[owner, 40, 44, 45]`;
  reopened — "QR already shown; if lost, email tatiana.city.guide@gmail.com", no QR
  `[owner, 7, 46]`.
- **V4 Status page**, what the QR opens: valid / not valid / booking not found
  `[owner, 47, 49, 51]`; shows name, guests, tour, date, status, and no email
  `[owner, 47, 48]`; in the payment's language `[owner, 43]`; no login `[owner, 11, 30]`;
  out of search [D §4].
- **V5 Policy page**: placeholder until the maintainer's files arrive `[owner, 19]`.

## 6. Acceptance criteria

Checked on the pilot deployment in test mode unless marked **stage 2**.

**Entry**
1. On a date whose effective price is > 0, "Join this tour" on its card and "Reserve a
   spot" on its page each open Stripe's payment page for that date; neither opens the
   contact form `[owner, 33]`.
2. On a date whose effective price is 0 or missing — including a date without its own
   price whose program has `price: 0` — neither button is shown, and the card and page are
   otherwise identical to production `[owner, 32]`.
3. "Reserve" on a program card and "Book a tour" (hero, About) open the same forms as on
   production and write to the same tabs `[owner, 33]`.
4. A date can be paid for until the end of its own day in Central Time, including after
   its start time — then only from its page, since the upcoming list already hides it at
   the start (`lib/tourSchedule.ts` `[from code]`). From the next day neither button is
   shown and no payment for that date can be started `[owner, 53]`.
5. Next to each pay button, in ru and en: the notice naming tatiana.city.guide@gmail.com and
   a working link to the policy page `[owner, 7, 16–18]`. **Stage 2:** the policy page and the
   notice show the maintainer's texts, not the placeholder `[owner, 19]`.

**Payment page**
6. Stripe's page asks for name and guest count; the count starts at 1 and cannot be set
   below 1 or above 15; the total equals effective price × guests, in USD
   `[owner, 5, 28, 31, 41]`.
7. Where the architect confirms Stripe can show custom text, the notice appears on Stripe's
   page `[owner, 17]`.

**Screen after payment**
8. A successful payment shows the QR; a declined or abandoned payment never shows one
   `[owner, 45]`.
9. In a browser that supports sharing the screen offers Share, which hands the QR to another
   app; in one that does not, it offers Save, which stores the QR image on the device. One
   browser of each kind is checked `[owner, 40]`.
10. Reloading the screen, returning to it, or opening its address again shows the
    "already shown" message with tatiana.city.guide@gmail.com in the page's language, and
    no QR `[owner, 45, 46]`.

**Status page**
11. The QR opens the status page on a device that has never opened the pilot, without a
    Vercel login, in the language of the page where payment started `[owner, 11, 30, 43]`.
12. For a paid reservation it shows the name as typed on Stripe's page, the guests, the tour
    title in the page's language, the date and "valid"; it shows no email, and the
    cardholder's name appears nowhere in this flow `[owner, 27, 47, 48]`.
13. A made-up id, or a real id with one character changed, shows "booking not found" and no
    data of any reservation `[owner, 49, 50]`.
14. Two reservations made one after the other have ids with no shared counter or timestamp
    `[owner, 50]`.
15. The status page is absent from `sitemap.xml` and marked not to be indexed; canonical,
    hreflang, sitemap and robots output of existing pages is unchanged [D §4].

**Records and notifications**
16. Each successful payment produces exactly one row in the new tab, holding the id shown
    by its QR, name, tour, date, guests, amount, email, status-page link and "valid"
    `[owner, 39, S6]`.
17. Each successful payment produces exactly one Telegram message in the form
    "New booking from \<name\>: \<tour name\>, date: \<tour date\>, guests: \<guests\>" `[owner, 9]`.
18. If the payer closes the tab right after paying, before the screen after payment loads,
    the row and the message still appear `[owner, 35]`.
19. Stripe delivering the same notification twice creates no second row and no second
    message `[owner, 35]`.
20. With the site temporarily denied access to the spreadsheet, a successful payment
    produces one Telegram alert that names the reservation — name, tour, date, guests — and
    says it is not saved yet `[owner, 34]`. Once access is back, the row appears within
    Stripe's redelivery window (the architect records its length; the tester may use
    Stripe's own "resend") with nobody editing the sheet, and Tatiana gets no second
    "New booking" message and no second alert `[owner, 34, 35, 54, 57]`.
21. A chargeback, simulated in test mode, produces the message "Chargeback for reservation
    made by \<name\> for tour \<tourname\> date: \<date\>", changes the status in the same row
    without adding one, and turns the reservation's status page to "not valid"
    `[owner, 10, 51, 52]`.
22. A request to the payment endpoint that Stripe did not sign changes nothing: no row, no
    message, no status change `[owner, 35]`; context.md CONSTRAINTS (`security-review.md`).

**Localization**
23. Every string the site renders in this flow — notice, screen states, status-page states,
    "booking not found", policy placeholder — exists in ru and en. Stripe's page may be
    English only `[owner, 29]`; context.md DEFINITION_OF_DONE.

## 7. Risks and combinations

| | Risk | Status |
|---|---|---|
| R1 | Overbooking: no limit on guests per date `[owner, 4]` | accepted |
| R2 | A QR is lost for good: shown once, no email, no re-issue `[owner, 37, 38, 45]`; the payer writes to Tatiana, who finds the row | accepted |
| R3 | Anyone holding the link sees the name `[owner, 30]` | accepted; the id cannot be guessed (AC 13–14) |
| R4 | Stripe's page may be English only `[owner, 29]` | accepted |
| R5 | At stage 2 every push reaches paying customers at once `[owner, 36]` | accepted |
| R6 | Two schedules: a date cancelled or re-priced on `main` stays on sale in the pilot until the maintainer edits the pilot's copy `[owner, 42]`. His local check (context.md OPEN 33) now has two places | accepted |
| R7 | Stage 2 runs on an account setup stage 1 never exercised `[owner, 24, 25]` | mitigated by the $1 rehearsal (§10) `[owner, 26]` |
| R8 | Activation of Tatiana's account: timing and outcome outside the project `[owner, 25]` | open |
| R9 | Stripe's notifications may not get through the Vercel protection on the pilot `[owner, 11, 35]` | architect verifies (§11) |
| R10 | A write to the tab fails (service outage, lost access). Meanwhile Tatiana checks the payment in the Stripe dashboard and admits the guest `[owner, 55, 58]`; Stripe's redelivery restores the row `[owner, 35, 57]`; once the window passes the row stays missing, since nobody repairs it by hand `[owner, 54, 55]` | alert (AC 20); a row missing at stage end is a mismatch |
| R11 | Sheet and Telegram fail together: only Stripe holds the payment | caught by reconciliation |
| R12 | A stage has no deadline `[owner, 22]` | accepted |
| R13 | Test messages look like real ones in Tatiana's chat, beside production inquiries `[owner, 8]` | accepted |
| R14 | The maintainer's texts arrive late `[owner, 19]` | stage 2 cannot open |
| R15 | Rows nobody may delete: stage-1 test reservations and the $1 rehearsal stay in the tab, "valid", beside real ones `[owner, 54, 56]` | accepted |

**Combinations**
- **R2 + R11** — the payer closed the screen and both records failed: nobody knows of the
  payment until the payer writes or the stage ends. This is why the metric reconciles
  against Stripe, not against the sheet.
- **R5 + R6 + R7** — at stage 2 every push, schedule edit and Stripe setting is live with
  money. The $1 rehearsal covers the setup once; a Stripe setting changed later is untested.
- **R9 + [35] + [54]** — if Stripe cannot reach the pilot, AC 18–21 fail together:
  chargebacks reach Tatiana only through Stripe's own emails, and with no hand edits the row
  and the status page stay "valid". That is the path rejected in `[owner, 35]` and needs the
  maintainer's decision before building on it.
- **R10 + a status page that reads the sheet** (if the architect chooses so) — a paid guest's
  QR shows "booking not found" at check-in until redelivery restores the row. For Tatiana,
  "not found" is not "not paid": she checks the payment in the Stripe dashboard and admits
  the guest `[owner, 55, 58]`.
- **R8 + R14** — the start of stage 2 depends on two inputs outside the build.

## 8. Open questions

No open questions.

- OQ4 (failed sheet write: automatic restore or not) — closed: automatic restore through
  redelivery, nobody repairs by hand, Tatiana checks the payment in the Stripe dashboard and
  admits the guest `[owner, 55, 57, 58]`, US8, R10.
- OQ3 (where stage-1 and rehearsal reservations go) — closed: same tab, unmarked
  `[owner, 56]`, R15.
- OQ1 (until when a date can be paid for) — closed `[owner, 53]`, AC 4.
- OQ2 (does a hand-added row count as a mismatch) — closed: nobody edits the spreadsheet by
  hand `[owner, 54]`, §1.

## 9. Deferred

- Payments on production — a separate decision after stage 2 `[owner, 1]`.
- Logins `[owner, 3]`; email from the site, "for now" `[owner, 37]`.
- Paying for a program without a date `[owner, 33]`.
- Measuring convenience `[owner, 23]`.

## 10. Plan

Not acceptance criteria.

**Build slices** — a tool for development while stage 1 is private; nothing a stage-2
customer sees is cut: (1) pay buttons → Stripe page → screen after payment, AC 1–10;
(2) endpoint, sheet row, Telegram, AC 16–20, 22; (3) status page, AC 11–15; (4) chargeback,
AC 21.

**Stage 1** `[owner, 12]`. Starts when the maintainer's test keys are set `[owner, 24]`; policy
placeholder allowed `[owner, 19]`. Testers: the maintainer and Tatiana. Ends when Tatiana
says so `[owner, 22]`; passes on §1.

**Between stages**, in order: Tatiana's account active `[owner, 25]`; live keys set; the
maintainer's EN and RU texts in place `[owner, 19]`; he adds a $1 date to the pilot schedule,
a real payment goes through AC 12, 16, 17 and a QR scan, and is refunded in Stripe outside
the site `[owner, 2, 26]` — its row stays (R15); he removes the date `[owner, 26]`; a Stripe test card is declined on
the pilot; the shareable link is issued `[owner, 11]`.

**Stage 2** `[owner, 14]`. Real customers through the link. The maintainer keeps the pilot
schedule `[owner, 42]`; changes go live on push `[owner, 36]`. Ends when Tatiana says so;
passes on §1.

Throughout: nothing from this pilot reaches `main` `[owner, 1]`.

## 11. Boundary with the architect

**The architect decides**: where reservations live and what the status page reads; how
"shown once" is enforced; the URL of the status page and the id format — the maintainer
proposes a page `bookingstatus` taking the id as a parameter, and a random UUID with no
timestamp `[owner, 49, 50]`; how the date page's button learns its date (`TourDetailClient`
receives only the program `[from code]`); the endpoint's signature check and de-duplication;
that a failed sheet write leaves Stripe's notification unaccepted, so Stripe sends it again
`[owner, 34, 35, 54]`;
how Stripe reaches the protected pilot; environment variables per stage; the tab's name
and column order; the QR image format. This document fixes behaviour, not data structures.

**The architect verifies with Stripe and records the result**, each tied to the answer it
serves: Russian on Stripe's page and its field labels `[owner, 29]`; custom text for the
notice `[owner, 17]`; limiting guests to 1–15 with a default of 1 `[owner, 41]`; whether the
cardholder name is asked regardless `[owner, 27]`; simulating a chargeback in test mode
(AC 21); a $1 charge being above Stripe's minimum `[owner, 26]`; Stripe re-sending
unaccepted notifications, and for how long, in test and live mode `[owner, 34, 35, 54]`.
