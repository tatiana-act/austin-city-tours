# Decisions: Stripe payments pilot

companion to: `prd.md` (cited there as **[D]**)
holds: the interview log that every `[owner, N]` in the PRD points to; superseded
answers; rationale; conflicts with `projects/context.md`.

---

## 1. Interview log

Interview held 2026-09-17/18 with the site maintainer, in English. In his answers
"owner" means **Tatiana, the guide** [13]; the PRD follows that usage. The starting
scenario came through the coordinator's brief and is cited as `[owner, S1]`–`[owner, S6]`.

### Starting scenario (verbatim, as relayed)

| | |
|---|---|
| S1 | The user chooses a scheduled tour. |
| S2 | The user enters their name and the guest count. → moved, see [28] |
| S3 | The user pays through Stripe. |
| S4 | The user gets a confirmation email with a unique QR code. → removed, see [37] |
| S5 | The QR code opens a page on the website that shows the customer name and guest count. |
| S6 | Each reservation is also saved to a separate sheet (a new tab) in the Google Sheets document the site already uses. |

### Answers

| N | Question | Answer |
|---|---|---|
| 1 | What proves the experiment? Where does it run? | Payments are stable and convenient, judged by the owner and customers on a branch deployed at Vercel. Pilot for a limited number of real customers; the `main` deployment stays as it is. |
| 2 | Refunds and cancellations? | None on the site. In a dispute the customer contacts the owner and gets the money back as a separate transaction, with no action on the site. |
| 3 | Accounts and logins? | None, at least for now. Logins and payments are verified as separate features. |
| 4 | Capacity / sold-out? | Not handled. |
| 5 | Currencies? | USD only. |
| 6 | What is a dispute; what is notified? | A dispute is an email to the owner. A chargeback cannot be stopped, so it is pushed as a Telegram notification; so is every successful reservation. |
| 7 | Contact address for disputes? | `tatiana.city.guide@gmail.com` |
| 8 | Mark test-mode notifications in Telegram? | Not needed. |
| 9 | Text of the reservation notification? | "New booking from \<name\>: \<tour name\>, date: \<tour date\>, guests: \<guests\>" |
| 10 | Text of the chargeback notification? | "Chargeback for reservation made by \<name\> for tour \<tourname\> date: \<date\>" |
| 11 | How do customers reach a protected preview? | Vercel shareable link. |
| 12 | Stage 1? | Private test by the maintainer and the owner, Stripe in test mode. |
| 13 | Who is "the owner"? | Tatiana, the city guide. |
| 14 | Stage 2? | Public preview through the shareable link, with real money. |
| 15 | Privacy policy? | A standard policy is fine; customers must be told there are no refunds or cancellations. |
| 16 | Notice wording? | "No refunds or cancellations through the site. For any issue, email \<address\>." |
| 17 | Where is the notice shown? | On the site and on the Stripe form. |
| 18 | When is the policy published? | Together with the payment option. |
| 19 | Who writes the policy and notice? | Placeholder for now; the maintainer checks the requirements and supplies two text files, EN and RU. Placeholder is acceptable at stage 1; stage 2 needs the real texts. |
| 20 | Success measure? | At the end of a stage, every Stripe payment has a sheet row and a working QR page; threshold zero mismatches. (Context: "quite a few customers"; customers who cannot pay will complain by email or social networks.) |
| 21 | Must a QR actually be checked? | Yes. Stage 1: Tatiana scans a test reservation's QR and sees the right data. Stage 2: at least one real customer's QR scanned at a real tour. |
| 22 | What ends a stage? | Tatiana decides. No date, no number of reservations. |
| 23 | Is convenience measured? | No; only feedback from site users. |
| 24 | Stripe account? | None at interview time. The maintainer is creating a test account and will store the keys as environment variables. |
| 25 | Tatiana's account? | Created by her after stage 1. |
| 26 | Rehearsal on Tatiana's account? | Yes: one real payment before stage 2, probably on a $1 test tour date that the maintainer adds and removes by hand. |
| 27 | Which name does the QR page show? | The typed name. The cardholder name is not needed. |
| 28 | Where are name and guest count entered? | On the Stripe payment page. |
| 29 | Stripe page not available in Russian? | No fallback to site fields: the fields are obvious. Confirmed as an exception to the localization rule, for the Stripe page in the pilot only. |
| 30 | Who can open the QR page? | Anyone who scans it; the site has no auth. |
| 31 | Price basis? | Per guest. |
| 32 | Date without a price, or price 0? | No reservation. A price of 0 counts as no price. Only the pay button is hidden; nothing else changes. → "nothing else changes" superseded for the price display by [67]. |
| 33 | Which buttons start payment? | "Join this tour" (date card) and "Reserve a spot" (date page) start payment. "Reserve" (program card) and "Book a tour" keep their current behaviour; the contact form stays for customers who want to ask before booking. → on priced date views, settled by [62]. |
| 34 | A step fails after payment? | Tatiana gets a Telegram alert when the reservation could not be written to the sheet, and adds it by hand. → "by hand" superseded by [54], §2. |
| 35 | One incoming endpoint for Stripe notifications? | Yes. |
| 36 | At stage 2, how do changes reach the pilot? | Immediately, on push. |
| 37 | Emails from the site? | None, for now. The customer uses their own email. |
| 38 | Lost QR? | The customer notifies Tatiana. The QR is not generated again: without auth the site cannot know who may have it. |
| 39 | Sheet row content? | The proposed set plus the booking id embedded in the QR. |
| 40 | Passing the QR on? | "Share" where the browser supports it, otherwise "save". |
| 41 | Guests per reservation? | 1 to 15, default 1. |
| 42 | Pilot schedule? | The schedule is in code, so the pilot has its own. |
| 43 | Language of the QR page? | The language of the customer who paid. |
| 44 | Screen after payment? | The QR code, with options to pass it on or save it on the device. |
| 45 | How often is the QR shown? | Once, right after the successful payment. |
| 46 | Screen reopened? | A message that the QR was already shown, with the dispute address. |
| 47 | Status page shape? | One page with a status, valid or invalid. Name only; no email. |
| 48 | Status page content? | Name, tour, date, guests, status. |
| 49 | How the QR works | The QR opens a booking status page with the booking id; the site shows the reservation or "booking not found". (Page name `bookingstatus` and id as URL parameter: the maintainer's proposal to the architect.) |
| 50 | Can ids be guessed? | No. (UUID without timestamp: proposal to the architect.) |
| 51 | Chargeback before the tour? | The QR page says the booking is not valid. |
| 52 | Chargeback in the sheet? | Yes, marked in the reservation's row. |
| 53 | Until when can a date be paid for? (PRD OQ1: the date page renders after the start, `page.tsx:23`) | "It is ok to pay for a today's tour." Read as: until the end of the tour's day, Central Time, including after its start. |
| 54 | Does a row Tatiana adds by hand after a failed-save alert count as a mismatch? (PRD OQ2) | "We are not going to edit spreadsheet manually." (Relayed verbatim by the coordinator from the main session, 2026-09-18.) Scope: the reservations tab only — confirmed by [59]. Tatiana's moderation flag in `Reviews` column E (context.md OPEN 13) is unchanged. Reading the sheet to find a customer [38] is not editing. |
| 55 | Correction to PRD v1.3 on a failed sheet write | "that's not correct: in case of a failure Tatiana will check the payment and excuse this customer, we don't want to repair broken reserves manually." (Relayed verbatim by the coordinator, 2026-09-18.) Clarified by [57] and [58]. |
| 56 | Where do stage-1 and rehearsal reservations go? (PRD OQ3) | "OQ3 no difference between test bookings and normal ones" (relayed verbatim by the coordinator, 2026-09-18). Same tab, written the same way, no mark. |
| 57 | After [55]: (a) the site restores the row automatically when Stripe re-sends, or (b) the reservation stays broken? (PRD OQ4) | "1a is ok" (relayed verbatim, 2026-09-18). Option (a). |
| 58 | Does "excuse" mean Tatiana lets the customer join the tour, and does she check the payment in the Stripe dashboard? | "2 yes" (relayed verbatim, 2026-09-18). Both confirmed. |
| 59 | Does [54] cover the `Reviews` column E moderation? | "4 yes, I mean we will not edit reservations sheet" (relayed verbatim, 2026-09-18). [54] covers the reservations tab only. |

Answers 60–63 are one reply to the architect's questions A-Q1–A-Q4 (`answers.md` threads
A1–A4), relayed verbatim by the coordinator, 2026-09-18: "I accept first 4 from a-q1 to
a-q4". Each row gives the recommendation it accepts, as put to the owner.

| N | Question | Accepted recommendation |
|---|---|---|
| 60 | A-Q1: the QR must open without a Vercel login at stage 1 too | Every QR carries the shareable-link token; the link is issued before stage 1 and never revoked during a stage. |
| 61 | A-Q2: how Stripe's page takes the guest count | Stripe's own quantity selector ("Qty", 1–15, default 1) is the guest count, with "per guest" / "Price per person" in the item description (exact wording: design thread D1, open). |
| 62 | A-Q3: contact form on date views | AC 1 as written: priced date views have no contact form; questions go through the footer contacts and the email in the notice. |
| 63 | A-Q4: who writes strings without a source | The coder drafts EN and RU for stage 1 (design.md §8 proposals); the maintainer replaces them before stage 2, together with the policy files [19]. |

| N | Question | Answer |
|---|---|---|
| 64 | A-Q5 (thread A12): do Preview deployments use the production spreadsheet and Telegram chat? | "I checked the vercel settings, all vars propagated to all environments. Given we will work on separate sheet, I don't think we need different speadsheet doc" (relayed verbatim, 2026-09-18). The five existing variables have the same values in Production and Preview: the pilot writes to the production spreadsheet, in its own new tab, and messages the production chat. The new Stripe variables are not covered (architecture.md scopes them to the pilot branch, `payments-stripe-preview` per [65]). |
| 65 | A-Q6: the pilot branch name, for env scoping (architect proposed `feat/stripe-pilot` from `dev`) | "A-06 Do we really need separate pilot banch? I would strongly prefer to have everything within current branch" and "having separate branch for docs and code looks odd to me. If I merge docs, and don't merge the code, this is inconsistency; also each update of the docs leads to code update, which means we shall always merge 2 these branch. A lot of efforts, but I see no benefits" (relayed verbatim, 2026-09-18). The pilot branch is `payments-stripe-preview`, holding docs and code; they merge to `dev` together or not at all; PR #69 (docs only) is not merged. |
| 66 | D5 / A7: what the status page shows when the sheet cannot be read | "D5 no, I want honest 5XX error if we cannot get the status and detail, otherwise customers would think the payment itself was lost" (relayed verbatim, 2026-09-18). A 5xx response with an error page, never "booking not found"; "not found" only for an id that does not exist. |
| 67 | D9: a date with price 0 or none still shows "Free" on its page | "D9 do not show "free", just omit the price and booking" (relayed verbatim, 2026-09-18). The date page shows no price line instead of "Free" / «Бесплатно», and no booking button. Whether it also covers the date card's "0 USD" (a date with an explicit price of 0): PRD OQ6. |

## 2. Superseded and rejected

- S2, name and guests on the site → Stripe page [28].
- S4, confirmation email with QR → removed [37]; the QR is delivered only by the screen after payment [44, 45].
- Site-sent "email the QR to any address", limited to one send per reservation → replaced by share/save [37, 40].
- Marking test notifications → rejected [8].
- Tatiana adds a missing row by hand after the alert [34] → nobody edits the spreadsheet
  [54, 55]. She checks the payment in the Stripe dashboard and admits the guest [55, 58]; the
  row is restored by Stripe's redelivery through the endpoint [35, 57], or stays missing and
  counts as a mismatch.
- Keeping the contact form on date views for questions (my reading of [33]) → removed from
  priced date views; questions go through the footer contacts and the notice's email [62].
- Measures "payment attempts vs completed" and "complaints only" → dropped [20]: at a
  handful of customers one abandoned attempt swings the share by tens of percent, and
  complaints miss customers who fail silently.
- Collecting name and guests on the site when Stripe cannot show Russian → rejected [29].
- An unreadable sheet shown as "booking not found" (design v1.0 §6.3) → a 5xx error page [66].
- A date without a price keeps "Free" on its page ([32], "nothing else changes") → no price
  line [67].

## 3. Provenance check

Eight messages in the interview channel were marked as not coming from the maintainer; one
was a request ("6 explain"), seven were answers. Six were put back to him: [24] confirmed,
[52] confirmed, [30] confirmed, [21] confirmed, [8] reversed ("not needed"), and the
removal of the contact form reversed in [33] (later removed from priced date views on the
architect's question, [62]). The seventh — "OQ2 no, we will not edit this
file manually" — was recorded as [54] in PRD v1.2 without that check. That was an error.
[54] now rests on the owner's own words, relayed by the coordinator.

## 4. Rationale

**One goal, not two.** [1] names stability and convenience; [23] declines to measure
convenience. A goal without a metric cannot be a goal, so convenience is feedback, not a
pass condition.

**Reconciliation is attributable.** A reservation that Stripe records but the sheet or the
status page does not is a failure of this pilot's own path and of nothing else. Tour
quality, date and price complaints do not enter the count. Hand edits cannot mask a
failure: nobody edits the spreadsheet [54].

**Row recovery.** With hand edits gone, only the site can restore a missing row. [35] gives
an endpoint that Stripe re-sends to until the notification is accepted, so a failed sheet
write is repaired by the path that failed, with nothing new built. v1.3 applied this
without asking; the owner's correction [55] showed it needed his word, and he gave it [57].
The window's length is Stripe's; the architect records it.

**Test rows among real ones.** Asked as OQ3 because it could not be derived from [8];
answered [56]: no difference. Accepted as PRD R15.

**"Reservation", not "booking".** `Booking` already names the request form and its sheet
tab (`BookingForm`, `Bookings!A:H`, context.md GLOSSARY "Booking ≠ Contact"). The
maintainer says "booking id" and "booking status"; those are fine as user-facing words.
The document keeps "reservation" so that three different things keep three names.

**Status page kept out of search.** It shows a name to anyone holding the link [30] and
has no search value; search is the product's main surface (context.md DOMAIN).

**Rehearsal on Tatiana's account.** Stage 1 exercises the maintainer's test account
[24]; stage 2 runs on an account stage 1 never touched [25]. With pushes going live at
once [36], the $1 payment [26] is the only run of that setup before customers.

## 5. Conflicts with `projects/context.md`

For the coordinator, who maintains it. The PRD follows the answers below.

| context.md says | Answer | Nature |
|---|---|---|
| DoD: correct localization always, both languages | [29] | exception for the Stripe page in the pilot |
| CONSTRAINTS: data only through Server Actions, no `app/api/*` (tagged `[из кода]`) | [35] | exception: one endpoint for Stripe |
| OPEN 29: shareable links not needed | [11, 60] | reversed for `payments-stripe-preview`; the link exists from stage 1 and rides in every QR |
| "владелец" = the maintainer | [13] | the maintainer's "owner" is Tatiana |
| CONSTRAINTS / `CLAUDE.md`: `main` is the release switch | [36] | `payments-stripe-preview` goes live on push; `CLAUDE.md` does not cover it |
| `CLAUDE.md`: feature branches `type/short-description` from `dev`, PRs into `dev` | [65] | one branch, `payments-stripe-preview`, holds docs and code; the docs do not go to `dev` on their own (PR #69 is not merged) |
| OPEN 27: fixing the "Free" shown for a date without a price — declined by the owner | [67] | on the pilot the date page omits the price instead of "Free" |
| OPEN 4: return to the privacy policy when real payment appears | [15, 18, 19] | reopened for the pilot |
