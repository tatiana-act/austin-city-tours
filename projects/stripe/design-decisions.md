# Design decisions: Stripe payments pilot

companion to: `design.md` v1.1 (cited there as **[DD §N]**). Options, criterion, choice.
Requirements are in `prd.md` v1.4; contracts are in `architecture.md` v1.0.

---

## §1. Where the notice sits

| option | result |
|---|---|
| **Under the pay button, tied to it by `aria-describedby`** | chosen |
| Above the button | rejected |
| Behind an "i" icon or in a tooltip | rejected |
| One notice per section instead of per card | rejected: AC 5 says "next to each pay button" |

Criterion: the notice is read in the same glance as the button and does not separate the button
from the data it acts on. Above the button, it would come between the price and the action, and on
the card it would push "View details" and the pay button apart. A tooltip hides text that US3
requires to be seen before paying, and on a phone it needs a tap nobody makes. The screen-reader
link makes "under" equal to "with" for non-visual reading.

Cost: five cards repeat the notice five times. Accepted; the text is small and muted.

## §2. The address as a link

| option | result |
|---|---|
| **`mailto:` link wherever the site renders it** | chosen |
| Plain text next to the button, link only after payment | rejected |
| Plain text plus a "copy" button | rejected |

Criterion: what the reader can do with it in one tap. On a phone, the main traffic, plain text
means a long-press and a copy. The footer already renders the same address as `mailto:`, so this
is not a new pattern. On a priced date page the contact form is gone (AC 1), and this link is the
nearest way left to ask the guide a question (US4, `[owner, 62]`). The risk of tapping it instead of the
button is limited by the 0.5 rem gap and the link's text size. A copy button would be a new
control that the PRD does not ask for.

## §3. Policy link: same tab

| option | result |
|---|---|
| **Same tab** | chosen |
| New tab | rejected |

Criterion: the site's existing convention: internal links open in the same tab, external ones in a
new tab (`/places`, poi design §2.3). The browser's Back returns to the card or page. A new tab on
a phone looks like a lost page and does not come back with Back.

## §4. Pending and the move to Stripe

| option | result |
|---|---|
| **Label swap on the pressed button, disabled; Stripe opens in the same tab** | chosen |
| Spinner inside the button | rejected |
| Full-page overlay | rejected |
| Stripe in a new tab or a popup | rejected |

Criterion: existing means and a single place to look. `ContactForm` already shows pending as a
label swap, and the project has no spinner. An overlay covers the page for about a second, which
is more mechanism than the wait needs. A new tab leaves the site's tab behind in "Opening…", and
the return from Stripe would land in the wrong tab; mobile browsers also block popups opened after
an async wait.

## §5. Cancelled payment: no banner

| option | result |
|---|---|
| **Land on the date page, block at rest, no message** | chosen |
| A banner "Payment cancelled, nothing was charged" | rejected |
| A separate cancelled screen | rejected |

Criterion: whether anything happened that the visitor does not already know. They pressed Stripe's
own back link, and a declined card never leaves Stripe. A banner would need its own strings, its
own dismissal and its own state for a case that the PRD does not list. The date page, not the home
page, is where the architecture sends the visitor [A §4.1]. It has the button and the details, so
nothing is lost for a payer who started from a card.

## §6. Screen after payment: order, and a summary

| option | result |
|---|---|
| **h1 → warning → QR → action → summary** | chosen |
| QR and action only (the PRD's minimum) | rejected |
| Summary above the QR | rejected |

Criterion: on a 360 × 640 phone, whether the QR and its action are in view on arrival, and
whether a payer with two reservations can tell their QRs apart. With no summary, two QRs look the
same, and the only way to check one is to scan it. The summary adds no data: it repeats the status
page's fields in the status page's order. Above the QR, it pushes the action button below the
fold (≈ 585 px against ≈ 560 px available). The warning comes before the QR so it is read before
the payer acts.

## §7. Share and Save

| option | result |
|---|---|
| **As the PRD says: Share where the image can be shared, otherwise Save; a failed share turns into Save** | chosen now |
| Save always, Share in addition where supported | recommended to the owner, D6 |

Criterion: how many ways are left to keep the QR when the first one fails. On a phone, the share
sheet is closed by mistake, the target app fails, or the OS discards the browser tab while the
payer is in the messenger. After that the page returns as state C and the QR is lost for good (R2).
The fallback covers only an error reported by the browser. It does not cover a share that
"succeeded" into nothing. Keeping Save costs one more button of the same kind. It is not built
without the owner's answer, because `[owner, 40]` says "otherwise".

## §8. Status page: the order of answers

| option | result |
|---|---|
| **Status + date → guests → name → tour** | chosen |
| The PRD's list order: name, guests, tour, date, status | rejected |

Criterion: the order of Tatiana's questions at check-in. May they join? Is it for today? How many
people? Who? The program is usually known from where she stands. The PRD lists content, not order
[owner, 48]. Putting the date inside the status band makes "valid" and "for which day" one reading,
which is the only protection against a valid QR for another date (D8).

## §9. How status is shown

| option | result |
|---|---|
| **Word + glyph + fill colour; "not found" neutral (outline, no fill)** | chosen |
| Colour only | rejected |
| "Not found" in red, like "not valid" | rejected |

Criterion: whether the three states are told apart without colour, in sunlight, and without one
being read as another. The word carries the meaning, the glyph and colour back it up. "Not found"
also covers an unreadable sheet and a row not yet restored [A §4.4], PRD R10. For Tatiana it means
"check Stripe", not "turn away". Drawn in red, it would be read as "not paid".

## §10. Language switcher on the status page

| option | result |
|---|---|
| **Present, in a light-background form** | chosen, pending the owner's word (D7) |
| Absent, page in the payment's language only | rejected |

Criterion: who reads the page in a language other than the payer's. context.md USERS: a local
books for guests, and their languages need not match. A QR shared with an English-speaking guest
opens in Russian if the payer paid in Russian. The PRD does not ask for a switcher. The owner said
no to one on `/places` (poi answers D5), but that page is reached from the home page, where the
switcher exists, and this page is not. The existing component cannot be reused as drawn: it is
white text for the dark hero.

## §11. Language of our labels on Stripe's page

| option | result |
|---|---|
| **The language Stripe actually shows** | chosen |
| The site locale, whatever Stripe shows | rejected |

Criterion: whether one page mixes two languages. If Stripe cannot show Russian (R4), a Russian name
label inside an English form is the only Russian on the page. The payer fills in an English form,
which [owner, 29] accepted.

## §12. Name label and the count on Stripe's page

| option | result |
|---|---|
| **Name: "Name for the guest list"; item: "Price per person"** | chosen, pending the owner (D1, D2) |
| "Name" / "Price per guest" | rejected |

Criterion: whether the payer enters the value the guide will read. If Stripe asks for "Name on
card" regardless [A §1 V4], a field called just "Name" invites the cardholder's name twice, and
[owner, 27] wants the typed name, not the cardholder's. "Per guest" makes a local who pays and also
goes wonder whether to count themselves. The default of 1 [owner, 41] means the count includes
everyone who goes. The status page and Telegram keep "guests": Tatiana counts heads.

## §13. Frame of the new pages

| option | result |
|---|---|
| **One centred column, max 480 px, on V3 and V4; back bar only where leaving is harmless** | chosen |
| Full-width layout like the date page | rejected |
| Back bar on every new page, as on existing ones | rejected for V3 states 0, B and for V4 |

Criterion: V3 and V4 are phone documents. On desktop a full-width band or QR row would separate
the action from its explanation. Existing standalone pages carry a back bar. On V3 it is an
invitation to leave the one screen that shows the QR, and on V4 it pushes the status down for a
reader who never needs the site. The footer's links remain on both.
