# Возражения и ответы

Журнал перевозки, не источник правды. Ответ,
вошедший в документ, помечается перевезённым;
дальше правда в документе.

Раздел — **тема**, не прогон. Возражение к месту,
по которому тред уже есть, дописывается в него,
а не заводит новый.

Статус раздела производный: открыт, пока есть
хоть один невнесённый пункт.

Формат id: <буква роли><номер>, сквозная
нумерация в пределах роли, номера не
переиспользуются. P — продакт, A — архитектор,
D — дизайнер, T — тестировщик, C — кодер.

Три и более возражения в треде без нового ответа
заказчика — решение неустойчиво. Не вноси
очередную правку: назови развилку и спроси.

---

## <тема> · открыт | внесён → <документ> <версия> | закрыт

<id>. [блокирует | меняет решение | к сведению]
      <возражение — одна фраза>          · <роль> · <дата>
      → <ответ>                                    · <дата>
      → внесено: <документ> <версия> <раздел>      · <дата>

---

## QR без входа в Vercel · внесён → prd.md v1.5

A1. [меняет решение] prd.md v1.4 AC 11 requires the QR to open without a Vercel login
    already at stage 1, but §10 issues the shareable link only between stages; the token
    therefore has to ride inside every QR, so the link must exist before stage 1, revoking
    or regenerating it breaks every QR, every QR admits its holder to the whole pilot
    (extends R3), and whether the token survives new deployments is unverified (V10)
                                                   · архитектор · 09-18
    → accepted (A-Q1): the token rides in every QR; the link is issued before stage 1
      and never revoked during a stage [owner, 60]           · 09-18
    → внесено: prd.md v1.5 AC 11, §7 R3, R16, §10          · 09-18
    → внесено: architecture.md v1.1 §1 V10, §6, §9, §10 S3, §11;
      architecture-decisions.md §9                          · 09-18

## Число гостей на странице Stripe · внесён → prd.md v1.11

A2. [меняет решение] prd.md v1.4 AC 6 / [28, 41]: Stripe can bound to 1–15 and multiply
    into the total only the line-item quantity, which Stripe labels itself ("Qty"), not
    "guests"; a numeric custom field bounds digit count, not value, and does not change
    the total — the design takes the quantity, with "per guest" in the item description
                                                   · архитектор · 09-18
    → accepted (A-Q2): Stripe's quantity selector is the guest count, 1–15, default 1;
      the item wording stays with D1 [owner, 61]              · 09-18
    → внесено: prd.md v1.5 AC 6                             · 09-18
    → внесено: architecture.md v1.1 §7.1, §11; architecture-decisions.md §2 · 09-18

D1. [меняет решение] prd.md v1.4 AC 6, [41]; architecture.md v1.0 §4.1, §7.1: "per guest" leaves
    a payer who also goes unsure whether to count themselves, while the default of 1 means the
    count includes everyone who goes; design.md v1.0 §4, §8 proposes "Price per person" /
    «Цена за одного человека» in the item; the status page and Telegram keep "guests"
                                                   · дизайнер · 09-18
    → "accept the rest": "Price per person" / «Цена за одного человека» [owner, 73] · 09-18
    → внесено: prd.md v1.11 §5 V2, AC 6                     · 09-18

## Контактная форма на видах даты · внесён → prd.md v1.5

A3. [меняет решение] prd.md v1.4 AC 1 and [33] take the contact form off both date views,
    leaving the date page with no route to it, while decisions.md §2 says "Removing the
    contact form from date views → rejected [33]"; the design follows AC 1
                                                   · архитектор · 09-18
    → accepted (A-Q3): AC 1 as written; priced date views have no contact form;
      questions go through the footer contacts and the notice's email [owner, 62] · 09-18
    → внесено: prd.md v1.5 US4, §5 V1, AC 1; decisions.md §1 [33], §2 · 09-18
    → внесено: architecture.md v1.1 §3 (date page row), §11 · 09-18

D3. [к сведению] prd.md v1.4 US4, AC 1: on a priced date page the ways left to ask a question are
    the footer contacts and the back link to the home page's program card; design.md v1.0 adds
    no element for it and renders the address in the notice as a `mailto:` link, which also
    serves US4
                                                   · дизайнер · 09-18
    → answered by A-Q3 [owner, 62]                          · 09-18
    → внесено: prd.md v1.5 US4                              · 09-18

## Строки без источника · внесён → prd.md v1.5

A4. [меняет решение] prd.md v1.4 AC 23 requires ru and en for every string of the flow,
    but only the EN notice [16], the EN "already shown" message [46] and the two Telegram
    templates [9, 10] have a source: the RU notice for stage 1, the policy-link label, the
    Stripe name label and "per guest" line, screen states A and B, Share and Save, the
    status-page states and labels, the start-failed message, page titles and the
    failed-to-save alert line ([34], "no text given") have none
                                                   · архитектор · 09-18
    → accepted (A-Q4): the coder drafts EN and RU for stage 1; the maintainer replaces
      them before stage 2, with the policy files [owner, 63]   · 09-18
    → внесено: prd.md v1.5 §4, AC 5, AC 23, §10             · 09-18
    → внесено: architecture.md v1.1 §0, §7.1, §7.3, §11      · 09-18

D4. [меняет решение] prd.md v1.4 AC 23, [19]; architecture.md v1.0 §3, §7: design.md v1.0 §8
    gives an EN/RU value for every string without a source, each marked "proposal", for the
    owner to approve or replace; three points go with it: (a) the policy has no title anywhere,
    the route is `payment-policy` and [15] calls it a privacy policy, so the proposal is
    "Payment and privacy policy" / «Условия оплаты и конфиденциальность»; (b) `policy: string[]`
    cannot carry section headings if the maintainer's text has them; (c) the notice repeats on
    every payable card, so the maintainer's stage-2 notice should stay at one or two sentences
                                                   · дизайнер · 09-18
    → answered by A-Q4: the §8 proposals, (a) included, are the stage-1 drafts and the
      maintainer replaces them before stage 2 [owner, 63]; (b) is the architect's, (c) is
      advice to the maintainer — neither is a PRD matter    · 09-18
    → внесено: prd.md v1.5 §4, AC 23                        · 09-18
    → внесено: design.md v1.1 §1, §3.4, §7, §8              · 09-18
    → architect, (b): `policy` becomes sections, each an optional heading plus plain
      paragraphs; the placeholder is one untitled section; lists, links and emphasis are
      not carried. design.md §7 ("one entry of `policy: string[]`", "headings are not
      possible") is the designer's to revise                 · 09-18
    → внесено: architecture.md v1.2 §0.1, §3, §7.2, §10 S1;
      architecture-decisions.md §18                         · 09-18
    → внесено: design.md v1.2 §7, §10; design-decisions.md §14   · 09-18

## Сбой записи в таблицу и повторная доставка · открыт

A5. [к сведению] prd.md v1.4 AC 20 is read as: "New booking" goes out at the first delivery
    even when the row fails, the alert follows once, and restore sends nothing — "no second
    'New booking'" presumes a first; AC 17 holds either way
                                                   · архитектор · 09-18
    → ждёт владельца
A6. [к сведению] prd.md v1.4 AC 20 and R10: Stripe's redelivery window is about 3 days in
    live mode but only a few retries over hours in test mode, and an endpoint that keeps
    failing for days may be disabled by Stripe (all unverified, V7) — in stage 1 the
    restore step is practically a manual resend
                                                   · архитектор · 09-18
    → ждёт владельца

## Страница статуса при недоступной таблице · внесён → prd.md v1.8

A7. [к сведению] prd.md v1.4 §5 V4 has three states and none for "the sheet cannot be
    read"; the design shows "booking not found", which the R10 combination already tells
    Tatiana to treat as "check Stripe"
                                                   · архитектор · 09-18
    → no: an unreadable status is an honest 5xx error page, never "booking not found";
      "not found" only for an id that does not exist [owner, 66]  · 09-18
    → внесено: prd.md v1.8 §3, §5 V4, AC 23, AC 24, §7 R10 and its combination · 09-18

D5. [к сведению] architecture.md v1.0 §4.4, §5; prd.md v1.4 §7 (R10 combination): an unreadable
    sheet shows "booking not found"; design.md v1.0 §6.3 draws "not found" neutral (outline, no
    red, no ✕) so that it does not read as "not paid"; a separate "cannot check now" view would be
    clearer, but Tatiana's action is the same (check Stripe), so it is not asked for
                                                   · дизайнер · 09-18
    → "D5 no, I want honest 5XX error if we cannot get the status and detail, otherwise
      customers would think the payment itself was lost" [owner, 66]  · 09-18
    → внесено: prd.md v1.8 §5 V4, AC 24                      · 09-18
    → PRD OQ5, "accept the rest": an id absent from the sheet is checked with Stripe; a
      paid one shows the reservation or the error page, never "not found" [owner, 70] · 09-18
    → внесено: prd.md v1.11 §5 V4, AC 13, AC 24, §7, §11     · 09-18

## Страница оплаты Stripe · открыт

A8. [к сведению] prd.md v1.4 [27] / AC 12: Stripe asks the name on card regardless
    (unverified, V4), so the payer types two names; only the custom field reaches the row
    and the status page
                                                   · архитектор · 09-18
    → ждёт владельца
A9. [к сведению] prd.md v1.4 R4 / [29]: Checkout supports locale `ru` and our labels and
    notice are our own strings (unverified, V1), so the Stripe page is expected in Russian
    for Russian payers and R4 is not expected to materialise
                                                   · архитектор · 09-18
    → ждёт владельца

D2. [меняет решение] prd.md v1.4 [27], [28], [29]; architecture.md v1.0 §1 V1, V4, §4.1: if Stripe
    asks for "Name on card" regardless, a field labelled just "Name" invites the cardholder's name
    twice; design.md v1.0 §4 proposes "Name for the guest list" / «Имя для списка гостей»
    (≤ 50 characters), and our labels follow the language Stripe actually shows, so an English-only
    Stripe page gets English labels, not Russian ones inside it
                                                   · дизайнер · 09-18
    → "accept the rest": "Name for the guest list" / «Имя для списка гостей» [owner, 74] · 09-18
    → внесено: prd.md v1.11 §5 V2, AC 6                     · 09-18
    → architect, technical half: `checkoutLocale` (the page's locale while V1 holds,
      otherwise `'en'`) sets Stripe's locale and every string the site sends to Stripe; the
      label wording stays with the owner. Pointers checked: §1 V1, V4 and §4.1 are still
      the right sections                                    · 09-18
    → внесено: architecture.md v1.2 §1 V1, §4.1, §7.1       · 09-18
    → внесено: design.md v1.2 §4 (checked against `checkoutLocale`)  · 09-18
    → designer, к сведению: architecture.md v1.2 §4.1 says "`locale` above … use
      `checkoutLocale`" but does not say whether `success_url` and `cancel_url` keep the
      page's locale; design.md v1.2 §4, §5.1 assume they do, so a Russian payer who falls
      back to an English Stripe page still sees the screen after payment and the date page in
      Russian                                                · 09-18
    → ждёт архитектора

## Смысл чарджбэка · открыт

A10. [к сведению] prd.md v1.4 §4 "Chargeback" / AC 21: `charge.dispute.created` fires for
     inquiries as well as chargebacks, and a dispute Tatiana later wins has no reverse path
     in the PRD; the design marks every dispute "not valid" and never restores "valid"
                                                   · архитектор · 09-18
     → ждёт владельца

## Оплата до конца дня · открыт

A11. [к сведению] prd.md v1.4 AC 4: a session started before midnight Central Time stays
     payable until it expires, and Stripe's minimum expiry is 30 minutes, so a payment for
     a date can complete up to 30 minutes into the next day; "started" in AC 4 still holds
                                                   · архитектор · 09-18
     → ждёт владельца

## Окружение пилота · внесён → prd.md v1.11

A12. [к сведению] prd.md v1.4 [S6], [8]: the pilot writes to the production spreadsheet and
     Telegram chat only if the Preview environment carries the production values, which is
     not visible from the repository; the pilot branch name is needed to scope the new
     variables
                                                   · архитектор · 09-18
     → A-Q5: the five existing variables have the same values in Production and
       Preview; the pilot uses the production spreadsheet (its own tab) and chat;
       no separate spreadsheet [owner, 64]. The branch name is A-Q6, an architecture
       matter, not carried into the PRD                       · 09-18
     → внесено: prd.md v1.6 §4, §7 R13, R15                 · 09-18
     → A-Q6: no separate pilot branch; `payments-stripe-preview` holds docs and code,
       which reach `dev` together or not at all [owner, 65]    · 09-18
     → внесено: prd.md v1.7 §1, §10; decisions.md §5        · 09-18
     → внесено: architecture.md v1.1 header, §2.3, §4.3, §6, §9, §11 · 09-18
A13. [меняет решение] prd.md v1.7 §10 [65] lets `payments-stripe-preview` reach `dev`
     "together or not at all", while `dev` is released to `main` in batches and nothing
     from the pilot may reach `main` [1]: once in `dev`, the next release shows pay buttons
     on production, where there are no Stripe variables (every button ends in the
     start-failed message), and priced date views lose the contact form — so the two
     answers hold together only as "not at all" until the production decision (PRD §9)
                                                   · архитектор · 09-18
     → "accept the rest" (Q7): not merged into `dev` before the production decision;
       no production switch is built [owner, 72]              · 09-18
     → внесено: prd.md v1.11 §9, §10; decisions.md §5       · 09-18

## Share и Save на экране после оплаты · внесён → prd.md v1.11

D6. [меняет решение] prd.md v1.4 §5 V3, AC 9, [40]; architecture.md v1.0 §4.5: on a phone Share
    replaces Save, so a share sheet closed by mistake, a failing target app, or a browser tab
    discarded by the OS while the payer is in the messenger leaves no second way to keep a QR that
    is never shown again (R2); recommended: Save always, Share in addition where supported;
    design.md v1.0 §5.2 builds the PRD's rule, and a share error turns the button into Save
                                                   · дизайнер · 09-18
    → "accept the rest": Save always, Share in addition where supported; supersedes
      [40] [owner, 75]                                      · 09-18
    → внесено: prd.md v1.11 US2, §5 V3, AC 9; decisions.md §1 [40], §2 · 09-18

## Переключатель языка на странице статуса · внесён → prd.md v1.9

D7. [меняет решение] prd.md v1.4 §5 V4, [43]; context.md v1.2 USERS; poi answers D5: the brief
    asks for the existing switcher on the status page, the PRD does not, and the owner kept one off
    `/places`; design.md v1.0 §6.6 includes it because a QR passed to guests opens in the payer's
    language; it needs a light-background form (the existing one is white on the dark hero), and
    it drops the QR's shareable-link query, which is safe only if Vercel keeps access after the
    first visit (architecture.md v1.0 §1 V10)
                                                   · дизайнер · 09-18
    → "D7 no. 2 persons scan QR code: the one who created it, and Tatiana. It is safe to
      assume user already used their language, and Tatiana is ok with any language we
      support. No separate lang switch is required" [owner, 68]  · 09-18
    → внесено: prd.md v1.9 §5 V4                             · 09-18
    → architect: the pointer is still right (§1 V10; the query is built in §4.5). V10 now
      also claims the first visit leaves an access cookie, and S3 checks a second
      navigation without the query in a fresh private window. Whether to show the switcher
      stays with the owner                                  · 09-18
    → внесено: architecture.md v1.2 §1 V10, §10 S3          · 09-18
    → внесено: design.md v1.2 §6.6 (access cookie, checked in S3)  · 09-18

## Действующая бронь на другую дату · внесён → prd.md v1.10

D8. [к сведению] prd.md v1.4 §3 (exactly three states), §5 V4: a valid QR for yesterday's or next
    week's date shows "valid", and only the date tells Tatiana it is not for this tour; design.md
    v1.0 §6.3 puts the date inside the status band so that both are read together; no fourth state
    is added
                                                   · дизайнер · 09-18
    → "D8 it is enough if we just display the date" [owner, 69]  · 09-18
    → внесено: prd.md v1.10 §3, §5 V4                       · 09-18

## Дата без цены · внесён → prd.md v1.8

D9. [к сведению] prd.md v1.4 AC 2, [32]; context.md v1.2 GLOSSARY (price): on a date with price 0
    or none the date page still prints "Free" / «Бесплатно» and now has no button at all, where
    production opens the contact form; all five current dates are priced, so the state is
    theoretical during the pilot
                                                   · дизайнер · 09-18
    → "D9 do not show "free", just omit the price and booking" [owner, 67]: the date page
      shows no price line and no button; the card's "0 USD" is PRD OQ6  · 09-18
    → внесено: prd.md v1.8 §5 V1, AC 2; decisions.md §2, §5  · 09-18
    → PRD OQ6, "accept the rest": the card's "0 USD" is hidden too [owner, 71] · 09-18
    → внесено: prd.md v1.11 §5 V1, AC 2                     · 09-18

## Состояния, которых нет в архитектуре · открыт

D10. [меняет решение] architecture.md v1.0 §4.1, §4.2, §4.5: (a) the browser's Back from Stripe
     can restore the date card or page from the back-forward cache with the pay button still
     disabled in "Opening payment…"; it needs the same `pageshow` guard as V3; (b) V3 is rendered
     after two Stripe calls, so without a loading view the payer looks at a frozen Stripe page at
     the most fragile moment; design.md v1.0 §5.2 asks for state 0, "Confirming your payment…
     don't close this page", as the route's loading view
                                                   · дизайнер · 09-18
     → ждёт архитектора
     → architect: (a) the pay form is remounted at rest on a back-forward restore,
       counted from `pageshow` `persisted` through `useSyncExternalStore`; (b) route
       `loading.tsx` renders state 0; the V3 decision runs once per request, shared by
       the page and `generateMetadata`; if Next holds the loading view back (V15), the
       browser's indicator is state 0, as design.md §5.2 allows      · 09-18
     → внесено: architecture.md v1.2 §0.1, §1 V15, §3, §4.1.1, §4.2, §5, §7.1, §10 S1;
       architecture-decisions.md §16, §17                  · 09-18

## Устаревшая страница · внесён → prd.md v1.11

D11. [к сведению] architecture.md v1.0 §4.1; prd.md v1.4 AC 4: a page left open overnight and
     tapped the next day goes to the date page without the button and without any message; the
     date on that page is the explanation; accepted in design.md v1.0 §3.4
                                                   · дизайнер · 09-18
     → "accept the rest": to the date page, no button, no message [owner, 76] · 09-18
     → внесено: prd.md v1.11 AC 4                           · 09-18
