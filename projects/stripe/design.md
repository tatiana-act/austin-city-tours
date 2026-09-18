# Design: Stripe payments pilot

version 1.2 | date 2026-09-18
inputs: `prd.md` v1.4 (cited by §, AC, `[owner, N]`), and `[owner, 63]` as carried into v1.5
AC 23; `decisions.md` (**[D]**);
`architecture.md` v1.2 (**[A]**); `projects/context.md` v1.2
rationale and rejected options: `design-decisions.md` (**[DD §N]**)
objections: `answers.md`, items D1–D11

⚙ marks a line that depends on a Stripe or Vercel claim still unverified in [A §1]; the V-number
is named, and the fallback stands beside it.

---

## 1. Boundaries

**Design decides:** what each view shows, in what order and with what emphasis; the states of
every view and the look of each; copy intent of every new string, with its stage-1 EN/RU draft
(§8); where the notice and the policy link sit; where mobile and desktop differ; accessibility
requirements — focus, accessible names, contrast, target size.

**Coder:** classes and tokens that satisfy the rules below; message key names; how share support
is detected, how focus and announcements are done, how the back-forward cache is handled; final
punctuation of the §8 drafts; any spacing not named here, taken from the nearest existing class
named here.

**Architect [A]:** URLs; the state decision table of the screen after payment [A §4.2]; what the
status page reads and when it answers "not found" [A §4.4]; Checkout Session parameters [A §4.1];
QR payload and image [A §4.5]. Where this document needs a behaviour from there, it names it.
The two behaviours asked for in D10 are in the architecture: the pay button after Back
[A §4.1.1] and state 0 as `loading.tsx` [A §4.2].

**Coder, for strings:** the EN and RU values of §8 are the stage-1 drafts the coder ships
`[owner, 63]`.

**Maintainer:** replaces the §8 values before stage 2, together with the policy files
`[owner, 19, 63]`. **Owner:** answers in `answers.md`.

---

## 2. Rules for every view of this feature

1. **Existing means only.** Colours: `--color-ink` #333, `--color-ink-muted` #666,
   `--color-brand` #667eea, `--color-brand-dark` #764ba2, `.form-error` #721c24, and two status
   colours from Tailwind's default palette, which the project already uses (`gray-800`,
   `indigo-500`, `yellow-400` in components): `green-700`, `red-700`. Buttons: `.book-button`
   (primary). Page frame: white `main`, `min-h-screen`, as `/places`; back bar
   `.tour-detail-back-bar` where named. No new font, no spinner, no icon set beyond `react-icons`.
2. **Contrast, WCAG AA** (4.5:1 below 18.66 px bold / 24 px):
   - small text in a brand colour is `brand-dark` — 6.4:1 on white, 5.3:1 on the date page's
     grey; `brand` (3.7:1) is never used for text in this feature;
   - `ink-muted` — 5.7:1 on white, 4.8:1 on #e9ecef — allowed;
   - status band: white on `green-700` 5.0:1, on `red-700` 6.5:1.
   - `.book-button` is white on a #667eea→#764ba2 gradient, 3.7:1 at the light end. Existing;
     not changed here.
3. **Links are identified without colour:** every text link this feature introduces is
   underlined permanently.
4. **Focus:** every new control shows the browser's focus ring or an equal replacement; tab order
   is visual order.
5. **Touch target** of every new control ≥ 44 × 44 CSS px, made by padding, not by font size.
6. **Pending** is a label swap on the pressed button, disabled, `aria-busy` — the `ContactForm`
   pattern (`isPending ? t('pending') : t('submit')`). No spinner, no overlay. [DD §4]
7. **No truncation.** Names, titles and the notice wrap by words. A word wider than its column
   (the address at 200 % text size; a 100-character name with no spaces [A §4.1]) breaks inside as
   a last resort: `body` has `overflow-x: hidden`, so an overflowing word would be clipped.
8. **The address tatiana.city.guide@gmail.com is a `mailto:` link** wherever the site renders it
   in this feature, as in the footer. On Stripe's page it is plain text. [DD §2]
9. **Dates** use `formatDateToUserLocale(date, locale)` — "September 20, 2026" /
   "20 сентября 2026 г." It formats the stored `YYYY-MM-DD` in UTC, so the viewer's time zone
   never shifts the day. No zone label, as on existing pages.
10. **Both locales** for every string of §8 (AC 23). RU is the longer one; widths below are
    measured on RU.

---

## 3. V1 — pay block on a date card and a date page

### 3.1 Composition

One block, the same in both places, top to bottom:

| # | element | form |
|---|---|---|
| 1 | pay button | existing label: card "Join this tour" / «Присоединиться», page "Reserve a spot" / «Записаться» `[owner, 33]`; `.book-button` |
| 2 | error line | failure state only (§3.4); `.form-error` colour, 0.9 rem, `role="alert"` |
| 3 | notice | 0.9 rem, `ink-muted`, line height 1.6 — the look of `.meeting-point`; the address in it is a link (§2.8) |
| 4 | policy link | own line, 0.9 rem, `brand-dark`, underlined; same tab [DD §3] |

Gaps: 0.5 rem between 1, 2 and 3; 0.25 rem between 3 and 4. The button's `aria-describedby`
points at the notice, so a screen reader reads the notice with the button. [DD §1]

The block is present only when the date is payable [A §3: card — effective price > 0; page —
`isPayable`]. Otherwise none of its four elements is rendered and nothing takes their place (AC 2).

### 3.2 On the date card (`UpcomingTourCard`)

- The block replaces `book-button` inside `.upcoming-tour-actions`, under "View details". Card
  order: title, date and time, bonus, price, share icons, "View details", block.
- The card is clickable as a whole (it scrolls to the program). Tapping notice text does what
  tapping any card text does today. Tapping the policy link or the address only follows the link.
- Widths `[from code, app/globals.css]`: text column ≈ 325 px on desktop (three cards in 1200 px),
  ≈ 272 px on a 360 px phone, ≈ 232 px on 320 px. The notice (≈ 100 characters in either
  language, §8) takes ≈ 3 lines at 272 px and ≈ 4 at 232 px. The address, 29 characters
  (≈ 210 px), fits one line at 232 px at default text size.
- Five payable cards show five identical notices: AC 5 says "next to each pay button". Accepted.
- Desktop: cards in a row stretch to the tallest, and an unpriced card has only "View details" at
  its bottom. Mobile: one column; no other difference.

### 3.3 On the date page

- The block replaces `TourDetailClient` at the bottom of `.tour-detail-info` (`margin-top: auto`,
  as today).
- Desktop: block width = button width, 280 px, so the notice wraps under the button and reads with
  it; RU notice ≈ 4 lines. Mobile (≤ 768 px): the full width of the info column.
- The background there is the grey gradient; contrast per §2.2.

### 3.4 States

| state | view |
|---|---|
| rest | §3.1 |
| pending — from tap until Stripe opens | button disabled, label "Opening payment…"; notice and link unchanged; other buttons on the page unaffected. Ends with Stripe opening in the same tab [DD §4] or with a failure |
| failure — Stripe did not open [A §4.1 `failed`] | button back to its label and enabled; error line under it (§8). Focus stays on the button; the line is announced. The next tap clears it |
| returned from Stripe with the browser's Back | rest, never pending; the error line is cleared too [A §4.1.1] (D10 (a)) |
| cancelled on Stripe (its "←" link) | the date page [A §4.1 `cancel_url`], block at rest, no banner — also when payment started from a card [DD §5] |
| card declined | the payer stays on Stripe, which says so. No site view |
| stale page: date stopped being payable (next day, or price set to 0) | tap → pending → the date page without the block [A §4.1]. No message (D11) |
| date removed from the pilot schedule | tap → pending → home [A §4.1]. No message |
| effective price 0 or missing | no block (AC 2). The date page still prints "Free" / «Бесплатно», as today (D9) |
| after the start time, same day | card: gone from the list, as today; page: block shown (AC 4) |
| from the next day | page: no block (AC 4) |
| empty | the block holds no list |
| long text | §3.2, §3.3; the program title above the block wraps, as today |
| stage 2 notice | the maintainer's text, up to 1200 characters [A §7.2]: the block grows, no "read more". Repeated on five cards, a long text dominates the list; one or two sentences is the advice to the maintainer (D4 (c)) |

---

## 4. V2 — Stripe's payment page: what the site controls ⚙

Every line depends on [A §1] V1–V4, checked in slice S1.

| item | what the payer sees | if the check fails |
|---|---|---|
| language | Stripe's own UI in the page's language ⚙V1 | English for every payer (PRD R4) |
| our labels, item and notice | in the same single language as Stripe's UI (`checkoutLocale` [A §4.1]): if Stripe cannot show RU, all of them go EN too, so the page never mixes languages [DD §11]. The design reads `success_url` and `cancel_url` as keeping the page's locale, so the screens after Stripe stay in the payer's language; [A §4.1] leaves this open (D2) | — |
| item | "<program title> · <date>" [A §4.1]; under it "Price per person" / «Цена за одного человека» — the count includes everyone who goes (D1) [DD §12] | — |
| guest count | Stripe's quantity control, 1–15, default 1, Stripe's own label ⚙V3 | AC 6 cannot be met — product |
| total | Stripe's, price × count | — |
| name | required text field, label "Name for the guest list" / «Имя для списка гостей» (≤ 50 characters), distinct from Stripe's "Name on card" ⚙V4 (D2) [DD §12]; up to 100 characters [A §4.1] | — |
| email, card | Stripe's | — |
| notice | the site's notice text next to Stripe's pay button ⚙V2; plain text, no policy link | AC 7 lapses |
| back | Stripe's "←" returns to the date page | — |

The site does not control Stripe's layout, fonts, pay-button label, error messages or its "Name on
card" field.

---

## 5. V3 — screen after payment

### 5.1 Frame

White page; one centred column, max 480 px, side padding 20 px. Back bar "← Austin City Tours"
in states A and C only — states 0 and B have no link off the page, because leaving B loses the
QR. The layout's footer is always there. Language = the payment's (the URL's locale); no language
switcher. [DD §13]

### 5.2 States

State letters A, B, C are the architecture's [A §4.2].

**State 0 — confirming.** Shown while the server decides between A, B and C (two Stripe calls
[A §4.2]). h1 "Confirming your payment…"; one line "Please don't close this page — your QR code
will appear here." Text only. It is the route's `loading.tsx` [A §4.2] (D10 (b)). If V15 fails ⚙V15, the
browser's own loading indicator is this state.

**State A — not confirmed, no QR.** h1 "Payment not confirmed yet"; body: reload in a minute,
the QR is shown here once; if the message stays, email the address, Tatiana will find the payment
(§8). No button: reloading is the browser's. Also the view of a URL without a valid session
[A §4.2] — nothing of any reservation is shown.

**State B — QR shown.** Top to bottom [DD §6]:

1. h1 "Payment received".
2. Warning, bold, `ink`: shown only once; share or save it now; a screenshot works too. Then
   one line in normal weight: show it to the guide at the start of the tour.
3. QR: 224 × 224 CSS px on mobile, 256 × 256 on desktop; black on white with a white quiet
   zone; alt "QR code for your booking: {tour}, {date}".
4. Action button, `.book-button`, width = QR width. Share where the browser can share the image
   file, otherwise Save `[owner, 40]`. The server renders Save; Share replaces it on the client in
   the same box, same size, so the swap moves nothing [A §4.5]. D6 asks to keep Save as well.
   [DD §7]
5. Summary: the same fields in the same order as the status page (§6.3) — Guests, Name, Tour,
   Date — so the payer sees what the guide will see and can tell two reservations apart.

Arrival on a 360 × 640 phone (≈ 560 px under the browser's bars): h1, warning, QR and button take
≈ 425 px and are in view without scrolling; the summary is below, reached by a short scroll.

| event in B | result |
|---|---|
| Share → share sheet closed without choosing | nothing changes |
| Share → error other than the payer's cancel | Save replaces Share in the same box |
| Save | the browser's download UI; the site shows nothing |
| the payer stays | the QR stays until the page is left |
| return from another tab or app, page kept in memory | the QR is still there |
| return that restores the page from the back-forward cache, or reload | state C [A §4.5] — the warning says it in advance |

**State C — already shown.** h1 "QR code already shown"; body "If you lost it, email
tatiana.city.guide@gmail.com." `[owner, 46]`, the address a link. No reservation data.

**Cancelled or declined payment:** not a state of this screen — §3.4.

### 5.3 States by kind

| | view |
|---|---|
| empty — no session, malformed URL | A |
| one reservation | B |
| limit — 15 guests | "15" in the summary; two reservations in a row by one payer are told apart by their summaries |
| long text | an 80-character RU title and a 100-character name wrap in the summary (§2.7); the summary grows below the button, never above the QR |
| failure | A; a failed share falls back to Save |

### 5.4 Accessibility

`<title>` = the state's h1. When B replaces state 0 in the same document, the new h1 is announced.
The action button's accessible name is its label. The QR's alt names tour and date; the QR itself
carries no information a screen-reader user needs beyond what Share and Save hand over.

---

## 6. V4 — booking status page

### 6.1 Reader

Tatiana at check-in, phone in hand, often outdoors; then the payer and guests. The page answers in
this order: may this person join (status), for which date (date), how many people (guests), who
(name), which program (tour). [DD §8]

### 6.2 Frame

White page; one centred column, max 480 px, side padding 20 px. Top row: language switcher,
right-aligned (§6.6, D7). No back bar. The layout's footer.

### 6.3 Composition, top to bottom

1. h1 "Booking status" — 1 rem, `ink-muted`, semibold: it names the page; the band speaks.
2. **Status band**, full column width, 12 px corners (as `.upcoming-tour-card`), padding
   1 rem × 1.25 rem, content centred and stacked: glyph, word, date. [DD §9]

   | state | band | glyph | word | under the word |
   |---|---|---|---|---|
   | valid | `green-700` fill, white text | ✓ | "Valid" / «Действительна» | the date, 1.125 rem |
   | not valid | `red-700` fill, white text | ✕ | "Not valid" / «Недействительна» | the date |
   | not found | no fill, 2 px `ink-muted` border, `ink` text | ? | "Booking not found" / «Бронь не найдена» | nothing |

   Word 1.5 rem bold on mobile, 2 rem from 769 px. The glyph is decorative (`aria-hidden`); the
   word carries the meaning, colour is a third carrier and never the only one. «Недействительна»
   at 1.5 rem ≈ 215 px fits the 240 px inside the band on a 320 px phone.
3. **Fields**, valid and not valid only; label above value, labels 0.9 rem `ink-muted`:
   - Guests — 2 rem bold: the number heads are counted by;
   - Name — 1.25 rem bold, as typed;
   - Tour — 1 rem `ink`, the program title in the page's language [A §4.4].

   The date is in the band and not repeated.

Nothing else: no email, amount, start time (a reservation holds a date only [A §2.1]), no reason
for "not valid".

### 6.4 States

| state | view |
|---|---|
| valid | §6.3 |
| not valid | red band and all fields: Tatiana needs to know whose reservation it is |
| not found | the neutral band only. Also the view when the sheet cannot be read [A §4.4] and when a paid row is not yet restored (PRD §7, R10 combination) — hence neutral, not red: for Tatiana "not found" ≠ "not paid" (D5) |
| empty — no id, malformed id | not found [A §4.4] |
| one element | a page always shows one reservation |
| limit — 15 guests | "15" |
| long text | a 100-character name wraps under its label (§2.7); an 80-character RU title takes 2–3 lines on a phone; the band never widens |
| reservation for another date | valid, with its date in the band; Tatiana compares (D8) |
| loading | none on the page: rendered on the server [A §4.4]; the browser's indicator |
| failure | = not found |
| language switched | the same reservation in the other language: the id is in the path [A §4.4]; the tour title changes with the locale; the stored payment language does not |

### 6.5 Mobile and desktop

One column on both. Desktop centres it and leaves the rest white: a band stretched to desktop width
would read as a banner detached from the fields. The only difference is the band's word, 1.5 rem →
2 rem. [DD §13]

### 6.6 Language switcher

The existing `LanguageSwitcher` is drawn white on the dark hero and would be invisible on white.
On this page it takes a light form: the current language `brand-dark`, bold, underlined; the other
`ink-muted`; 1 rem; each name a ≥ 44 × 44 px target and marked with its own `lang`. The home page's
switcher is unchanged. It keeps the reservation because the id is in the path; the QR also carries
the shareable-link query [A §4.5], which the switcher drops. The first visit leaves an access
cookie on the host, so the switch stays admitted [A §1 V10] ⚙V10, checked in slice S3 (D7).
[DD §10]

### 6.7 Accessibility

`<title>` "Booking status". Reading order: h1, band (word, then date), fields. No live regions.

---

## 7. V5 — policy page

Frame as `/places`: back bar "← Austin City Tours" to `/{locale}`; h1 `.section-title` with the
policy title (§8); a centred text column `max-w-3xl`. No language switcher, as on `/places`.

**Content** is `policy`, a list of sections, each an optional heading and plain paragraphs
[A §7.2]. Rendered in order, top to bottom:

| element | form |
|---|---|
| section heading, when present | h2; 1.25 rem, bold, `ink`, line height 1.3; 0.5 rem to its first paragraph [DD §14] |
| paragraph | `ink`, 1 rem, line height 1.7; 1 rem between paragraphs of one section |
| gap between sections | 2 rem, whether or not the next section has a heading |

- Heading levels are h1 → h2 only; no numbering is added. If the maintainer's heading text has
  numbers, they are shown as written.
- Lists, links and emphasis are not carried [A §7.2]. The one exception is the address
  tatiana.city.guide@gmail.com in a paragraph. It is a `mailto:` link by the rule of §2.8, the
  same as in the notice. Any other URL in the text stays plain text.
- No contents list, no anchors on headings, no collapsing.

| state | view |
|---|---|
| stage 1 placeholder | h1 and one section with no heading and one paragraph (§8) |
| the maintainer's text | its sections in order, each heading above its paragraphs |
| text starts with a section without a heading | the paragraphs come straight under the h1, as an introduction; the first heading follows after the 2 rem gap |
| a heading with no paragraphs | the heading, then the 2 rem gap and the next section. The coder carries the maintainer's files heading for heading [A §7.2], so this appears only if the file has it |
| empty `policy` | h1 alone. It does not happen at either stage: stage 1 has the placeholder section, stage 2 the maintainer's files |
| long text | the column grows; nothing is collapsed |
| long heading | wraps by words. A 60-character RU heading takes ≈ 3 lines on a 320 px phone and 1–2 on desktop; never truncated |
| long title | the RU draft (35 characters) at the `.section-title` 2.5 rem takes 3 lines on a 320 px phone. This is the same as the existing `/places` title; accepted |
| failure | static page; none |

Mobile: the column is full width inside the 20 px padding. Headings and paragraphs keep their
sizes; nothing else differs.

---

## 8. Strings

A value marked "draft" is the stage-1 text: the coder ships it as written, with no separate
approval, and the maintainer replaces it before stage 2 `[owner, 63]`. A value with a named source
stays. Rows tied to an open thread (D1, D2) change if the owner's answer does. Keys are the coder's.

| slot | view | EN | RU | source |
|---|---|---|---|---|
| notice, stage 1 | V1, V2 | No refunds or cancellations through the site. For any issue, email tatiana.city.guide@gmail.com. | Возврат и отмена через сайт невозможны. По любому вопросу пишите на tatiana.city.guide@gmail.com. | EN `[owner, 16, 7]`; RU draft |
| policy link = V5 h1 = V5 `<title>` | V1, V5 | Payment and privacy policy | Условия оплаты и конфиденциальность | draft |
| V5 placeholder | V5 | The policy text will be published here. | Здесь будет опубликован текст условий. | draft |
| pending | V1 | Opening payment… | Переход к оплате… | draft |
| start failed | V1 | The payment page didn't open. You weren't charged. Please try again. | Страница оплаты не открылась. Деньги не списаны. Попробуйте ещё раз. | draft |
| name label | V2 | Name for the guest list | Имя для списка гостей | draft (D2) |
| item description | V2 | Price per person | Цена за одного человека | draft (D1) |
| state 0 | V3 | Confirming your payment… / Please don't close this page — your QR code will appear here. | Подтверждаем оплату… / Пожалуйста, не закрывайте страницу — здесь появится ваш QR-код. | draft |
| state A | V3 | Payment not confirmed yet / If you have paid, reload this page in a minute: your QR code is shown here, only once. If this message stays, email tatiana.city.guide@gmail.com — Tatiana will find your payment. | Оплата пока не подтверждена / Если вы оплатили, обновите страницу через минуту: QR-код показывается здесь, только один раз. Если сообщение не исчезает, напишите на tatiana.city.guide@gmail.com — Татьяна найдёт ваш платёж. | draft |
| state B heading | V3 | Payment received | Оплата прошла | draft |
| state B warning | V3 | This QR code is shown only once. Share or save it now — a screenshot works too. | QR-код показывается только один раз. Поделитесь им или сохраните его сейчас — подойдёт и скриншот. | draft |
| state B hint | V3 | Show it to the guide at the start of the tour. | Покажите его гиду перед началом экскурсии. | draft |
| Share / Save | V3 | Share QR code / Save QR code | Поделиться QR-кодом / Сохранить QR-код | draft |
| QR alt | V3 | QR code for your booking: {tour}, {date} | QR-код вашей брони: {tour}, {date} | draft |
| state C | V3 | QR code already shown / If you lost it, email tatiana.city.guide@gmail.com. | QR-код уже был показан / Если вы его потеряли, напишите на tatiana.city.guide@gmail.com. | EN `[owner, 46]`, PRD §5 V3; RU draft |
| page title | V4 | Booking status | Статус брони | draft |
| statuses | V4 | Valid / Not valid / Booking not found | Действительна / Недействительна / Бронь не найдена | "not found" EN `[owner, 49]`; rest draft |
| field labels | V3, V4 | Guests / Name / Tour / Date | Гости / Имя / Экскурсия / Дата | draft |

---

## 9. Not on these screens

None is required by the PRD, so none is added:

- spinner, overlay, progress bar;
- a banner after a cancelled payment;
- a back link in states 0 and B of V3;
- a "checked in" or "not today" state (PRD §3; D8);
- the reason for "not valid"; email, amount or start time on V4;
- a link from V4 to the date page or the meeting point;
- a language switcher on V3 and V5;
- a link or the policy link inside the notice on Stripe's page.

---

## 10. State summary

| | pending / loading | one | limit | long text | failure | not applicable |
|---|---|---|---|---|---|---|
| V1 card | §3.4 | §3.4 rest | five notices, §3.2 | §3.2 | §3.4 | price 0 / missing: no block |
| V1 page | §3.4 | §3.4 rest | — | §3.3 | §3.4, stale page | price 0 / missing, next day: no block |
| V2 Stripe | Stripe's | §4 | 15 guests, Stripe's control | Stripe's | card declined: Stripe's | — |
| V3 | state 0 | B | §5.3 | §5.3 | A; share → Save | cancel: §3.4 |
| V4 | none: server-rendered | valid / not valid | §6.4 | §6.4 | not found | — |
| V5 | none: static | placeholder section | §7 | §7 | none | empty `policy`: h1 alone, does not happen |

Empty: V1 has no list; V3 empty = A; V4 empty = not found; V5 empty = h1 alone, which does not happen (§7).
