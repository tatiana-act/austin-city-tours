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

## QR без входа в Vercel · открыт

A1. [меняет решение] prd.md v1.4 AC 11 requires the QR to open without a Vercel login
    already at stage 1, but §10 issues the shareable link only between stages; the token
    therefore has to ride inside every QR, so the link must exist before stage 1, revoking
    or regenerating it breaks every QR, every QR admits its holder to the whole pilot
    (extends R3), and whether the token survives new deployments is unverified (V10)
                                                   · архитектор · 09-18
    → ждёт владельца

## Число гостей на странице Stripe · открыт

A2. [меняет решение] prd.md v1.4 AC 6 / [28, 41]: Stripe can bound to 1–15 and multiply
    into the total only the line-item quantity, which Stripe labels itself ("Qty"), not
    "guests"; a numeric custom field bounds digit count, not value, and does not change
    the total — the design takes the quantity, with "per guest" in the item description
                                                   · архитектор · 09-18
    → ждёт владельца

D1. [меняет решение] prd.md v1.4 AC 6, [41]; architecture.md v1.0 §4.1, §7.1: "per guest" leaves
    a payer who also goes unsure whether to count themselves, while the default of 1 means the
    count includes everyone who goes; design.md v1.0 §4, §8 proposes "Price per person" /
    «Цена за одного человека» in the item; the status page and Telegram keep "guests"
                                                   · дизайнер · 09-18
    → ждёт владельца

## Контактная форма на видах даты · открыт

A3. [меняет решение] prd.md v1.4 AC 1 and [33] take the contact form off both date views,
    leaving the date page with no route to it, while decisions.md §2 says "Removing the
    contact form from date views → rejected [33]"; the design follows AC 1
                                                   · архитектор · 09-18
    → ждёт владельца

D3. [к сведению] prd.md v1.4 US4, AC 1: on a priced date page the ways left to ask a question are
    the footer contacts and the back link to the home page's program card; design.md v1.0 adds
    no element for it and renders the address in the notice as a `mailto:` link, which also
    serves US4
                                                   · дизайнер · 09-18
    → ждёт владельца

## Строки без источника · открыт

A4. [меняет решение] prd.md v1.4 AC 23 requires ru and en for every string of the flow,
    but only the EN notice [16], the EN "already shown" message [46] and the two Telegram
    templates [9, 10] have a source: the RU notice for stage 1, the policy-link label, the
    Stripe name label and "per guest" line, screen states A and B, Share and Save, the
    status-page states and labels, the start-failed message, page titles and the
    failed-to-save alert line ([34], "no text given") have none
                                                   · архитектор · 09-18
    → ждёт владельца

D4. [меняет решение] prd.md v1.4 AC 23, [19]; architecture.md v1.0 §3, §7: design.md v1.0 §8
    gives an EN/RU value for every string without a source, each marked "proposal", for the
    owner to approve or replace; three points go with it: (a) the policy has no title anywhere,
    the route is `payment-policy` and [15] calls it a privacy policy, so the proposal is
    "Payment and privacy policy" / «Условия оплаты и конфиденциальность»; (b) `policy: string[]`
    cannot carry section headings if the maintainer's text has them; (c) the notice repeats on
    every payable card, so the maintainer's stage-2 notice should stay at one or two sentences
                                                   · дизайнер · 09-18
    → ждёт владельца

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

## Страница статуса при недоступной таблице · открыт

A7. [к сведению] prd.md v1.4 §5 V4 has three states and none for "the sheet cannot be
    read"; the design shows "booking not found", which the R10 combination already tells
    Tatiana to treat as "check Stripe"
                                                   · архитектор · 09-18
    → ждёт владельца

D5. [к сведению] architecture.md v1.0 §4.4, §5; prd.md v1.4 §7 (R10 combination): an unreadable
    sheet shows "booking not found"; design.md v1.0 §6.3 draws "not found" neutral (outline, no
    red, no ✕) so that it does not read as "not paid"; a separate "cannot check now" view would be
    clearer, but Tatiana's action is the same (check Stripe), so it is not asked for
                                                   · дизайнер · 09-18
    → ждёт владельца

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
    → ждёт владельца

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

## Окружение пилота · открыт

A12. [к сведению] prd.md v1.4 [S6], [8]: the pilot writes to the production spreadsheet and
     Telegram chat only if the Preview environment carries the production values, which is
     not visible from the repository; the pilot branch name is needed to scope the new
     variables
                                                   · архитектор · 09-18
     → ждёт владельца

## Share и Save на экране после оплаты · открыт

D6. [меняет решение] prd.md v1.4 §5 V3, AC 9, [40]; architecture.md v1.0 §4.5: on a phone Share
    replaces Save, so a share sheet closed by mistake, a failing target app, or a browser tab
    discarded by the OS while the payer is in the messenger leaves no second way to keep a QR that
    is never shown again (R2); recommended: Save always, Share in addition where supported;
    design.md v1.0 §5.2 builds the PRD's rule, and a share error turns the button into Save
                                                   · дизайнер · 09-18
    → ждёт владельца

## Переключатель языка на странице статуса · открыт

D7. [меняет решение] prd.md v1.4 §5 V4, [43]; context.md v1.2 USERS; poi answers D5: the brief
    asks for the existing switcher on the status page, the PRD does not, and the owner kept one off
    `/places`; design.md v1.0 §6.6 includes it because a QR passed to guests opens in the payer's
    language; it needs a light-background form (the existing one is white on the dark hero), and
    it drops the QR's shareable-link query, which is safe only if Vercel keeps access after the
    first visit (architecture.md v1.0 §1 V10)
                                                   · дизайнер · 09-18
    → ждёт владельца

## Действующая бронь на другую дату · открыт

D8. [к сведению] prd.md v1.4 §3 (exactly three states), §5 V4: a valid QR for yesterday's or next
    week's date shows "valid", and only the date tells Tatiana it is not for this tour; design.md
    v1.0 §6.3 puts the date inside the status band so that both are read together; no fourth state
    is added
                                                   · дизайнер · 09-18
    → ждёт владельца

## Дата без цены · открыт

D9. [к сведению] prd.md v1.4 AC 2, [32]; context.md v1.2 GLOSSARY (price): on a date with price 0
    or none the date page still prints "Free" / «Бесплатно» and now has no button at all, where
    production opens the contact form; all five current dates are priced, so the state is
    theoretical during the pilot
                                                   · дизайнер · 09-18
    → ждёт владельца

## Состояния, которых нет в архитектуре · открыт

D10. [меняет решение] architecture.md v1.0 §4.1, §4.2, §4.5: (a) the browser's Back from Stripe
     can restore the date card or page from the back-forward cache with the pay button still
     disabled in "Opening payment…"; it needs the same `pageshow` guard as V3; (b) V3 is rendered
     after two Stripe calls, so without a loading view the payer looks at a frozen Stripe page at
     the most fragile moment; design.md v1.0 §5.2 asks for state 0, "Confirming your payment…
     don't close this page", as the route's loading view
                                                   · дизайнер · 09-18
     → ждёт архитектора

## Устаревшая страница · открыт

D11. [к сведению] architecture.md v1.0 §4.1; prd.md v1.4 AC 4: a page left open overnight and
     tapped the next day goes to the date page without the button and without any message; the
     date on that page is the explanation; accepted in design.md v1.0 §3.4
                                                   · дизайнер · 09-18
     → ждёт владельца
