# PRD: Places of Interest (POI)

version: 2.1 | date: 2026-08-13 | status: buildable — no open items
source: owner interview, 21 questions, 2026-08-13, plus the owner's post-interview
decisions of the same day
companion: `.claude/context.md` (v1.0, 2026-08-11) — on conflict, context.md wins
rationale, alternatives weighed, closed items, revision history:
`.claude/decisions-places-of-interest.md` (cited below as **[D]**)

Markers. `[owner, N]` — answer to interview question N. `[owner, decision 2026-08-13]` —
a decision taken after the interview, on a question this document put to the owner.
`[from code]` — read from the repository. Nothing here is unsourced.

Written in English because the interview was in English; context.md is in Russian.

---

## 1. Terminology

| Term | Meaning | Existing code |
|---|---|---|
| **Place** (POI) | A physical site in Austin or nearby, worth telling about *and* worth visiting `[owner, 1]` | new |
| **Program** | A permanent route, reusable, no date | `TourProgram`, `data/tours.ts` |
| **Tour date** | One occurrence of a program on a specific day | `UpcomingTourEvent`, id `tour74` |
| **City happening** | A one-off occurrence in the city on a given day — rodeo, festival, concert `[owner, 15]`. Not a place: not permanent, not visitable outside its day | none; currently expressible only through `bonus` |
| **Bonus** | Something a tour date includes beyond the standard route. May *be* a place, may be a city happening `[owner, 8, 15]` | `UpcomingTourEvent.bonus` |
| **Meeting point** | Where the group assembles. A separate entity, never a place `[owner, 16]` | `TourProgram.meetingPoint` |

**Standing rule: do not introduce `event` into any new identifier.** The word already
means a tour date in the code, and this feature adds a third meaning; naming that third
meaning is out of scope `[owner, decision 2026-08-13]`, so no agreed name is coming.
Nothing here needs such an identifier (§6: `bonus` is untouched), so the rule costs
nothing and stops `eventId` acquiring a second meaning. The ambiguity itself stays — R6.

"City happening" is working vocabulary for reading this document, not an approved product
term. [D §3, O3]

---

## 2. Goal and metric

`[owner, 2]` Purpose: **organic search traffic**, in line with the standing product
priority in context.md DOMAIN.

**One measured goal — narrowed search.** The places list page appears in search results
for one named query: «Что посмотреть в Остине» / "Places to see in Austin". One page ranks
for approximately one query; ranking for 15 individual place names is out of reach and is
not claimed here `[owner, 3]`. The site currently records essentially no impressions at
all, so the goal is **to appear in results at all**, not to improve a position.

**What the release also delivers, and is not judged by:** a visitor reading about a tour
can see which places that tour visits, and can find those places on a map. It is built and
checked by §8, but it carries no metric — the number that measured it could not be
attributed and was dropped `[owner, decision 2026-08-13]`. [D §4]

`[owner, 12]` The full search ambition — ranking on place names — becomes reachable only
when content per place grows; the intended growth is visitor reviews attached to places,
not before 2027 (§13).

### 2.1 Metric

| Goal | Metric | Instrument | Baseline | Read at | Threshold |
|---|---|---|---|---|---|
| Appear in search for one named query `[owner, decision 2026-08-13]` — the same strings as the page's titles (§7.1) | **Impressions and clicks** for that query, scoped to the places list page | Search Console; the `verification.google` token is in `layout.tsx:79` `[from code]` | Page: zero — it does not exist. Site, owner-reported estimates: search impressions effectively none (highest ever observed 5, once, **no period attached**); page views 0–2 a day `[owner, decision 2026-08-13]` | **30 days** after the production release, read as a weekly rate — the last full week in the window. **Re-read at 60 days; the 60-day reading is final** `[owner, decision 2026-08-13]` | **≥20 impressions and ≥3 clicks per week**, on this page `[owner, decision 2026-08-13]` |

The clock starts at the **production release** — the `dev` → `main` merge, the only deploy
visitors see `[from code, CLAUDE.md]` — not at any slice merged into `dev` (§8.1).

The two baseline figures are **estimates reported by the owner, not instrument readings**,
and are **not to be combined into arithmetic with each other**: views come from
`@vercel/analytics`, impressions from Search Console — different quantities from different
instruments. [D §4]

The baseline is already recorded above and cannot be lost, so nothing gates on capturing it.
Optional refinement before the `dev` → `main` merge: take a Search Console reading, which
replaces an owner estimate with an instrument reading. [D §4]

**How a zero is read.** Index status is a fact checked in Search Console, not inferred
from the number:

- **page not indexed** → the zero says nothing about the feature; the reading repeats
  `[owner, decision 2026-08-13]`, and nothing is concluded about the threshold.
- **page indexed, last full week below threshold** → that *is* the result, measured. Not
  a delay, and not to be re-read as one.

At 60 days the result stands either way. The reading answers whether the goal was met; it
does not diagnose *why* a miss happened. Diagnosis is separate work and is not scoped here.

No new instrumentation is implied — Search Console is already connected.

**Deliberately not claimed as measurable:** the share of tour-description readers who reach
the place list. The entry point is an accordion on `/` and no custom event is emitted
anywhere in the codebase `[from code]`, so the number cannot be produced without new code.

Two readings this document applied rather than assumed — the threshold is scoped to the
page and not the site, and day 30 is a weekly rate and not a 30-day total — are stated with
their reasoning in [D §4]. One sentence from the owner reverses either.

---

## 3. User stories

Visitor types are context.md's (USERS: the tourist, and the local booking for guests); this
feature's interview did not revisit them.

- **US1 — tourist, choosing.** As someone comparing two programs, I want to see which
  places each one visits, so I can tell them apart before enquiring. → AC 15, 16.
- **US2 — local, booking for guests.** As someone sending a tour to arriving guests, I want
  one page of places with map links, so they can see where they will be taken without me
  explaining it. → AC 8, 9, 12.
- **US3 — visitor on a date page.** As someone who arrived on a specific date, I want the
  place list right there, so I do not have to go and find the program. → AC 16, 17.
- **US4 — searcher.** As someone searching for what to see in Austin, I want to land on
  this site. → AC 13, 14. **Served for the one named query only**, not for 15 individual
  place names; no acceptance criterion covers the place-name case, deliberately (§2).
- **US5 — owner, publishing.** As the person who commits the texts, I want to add a place
  by editing one RU/EN pair, so that a slice stays a single reviewable PR. → AC 1, 4.

---

## 4. Non-goals

Out of scope for v1, each with the answer that put it there.

- A page per place `[owner, 3]`.
- Photos of places `[owner, 13 revised]` — v1 is text only.
- Places that no program visits `[owner, 9]` — the catalogue is drawn entirely from
  existing routes in v1.
- Any call to action about a custom tour `[owner, 9]`. This would reopen context.md
  question 3, where the owner decided the individual-tour path is deliberately not being
  improved. v1 does not reopen it.
- Any change to `bonus` `[owner, 17]`.
- Any change to `meetingPoint` / `meetingPointLink` `[owner, 16]`.
- Any link between places and reviews `[owner, 12]` — direction for 2027.
- Any coverage or availability marker `[owner, 11]`.
- Permanent pages per program — still context.md question 16, still explicitly not started.
  The hold stays in force and this feature does not go near it; the consequence is carried
  openly in R4, R7 and §11.1.
- Naming the third meaning of "event" for the product as a whole
  `[owner, decision 2026-08-13]`. §1's ban on `event` in new identifiers is the mitigation;
  R6 is the residue.

---

## 5. The Place entity

`[owner, 1]` A place is any Austin-area sight worth telling about and worth visiting. It is
**not** a projection of the tour catalogue: conceptually the catalogue may be larger than
what tours cover. `[owner, 9]` In v1 it happens to coincide, because only places visited by
existing programs are included.

Fields, per locale (RU and EN):

| Field | Required | Notes |
|---|---|---|
| name | yes | |
| short description | yes | `[owner, 3]` short by design |
| map link | yes | **Google Maps** `[owner, decision 2026-08-13]`, chosen from the two options in `[owner, 19]`. Matches the precedent in the repo: every `meetingPointLink` today is a `maps.app.goo.gl` short link `[from code]`. Provisional and reversible; the price of reversing it is in [D §5] |
| photo | **no** | `[owner, 13 revised]` deferred; entries must be able to gain one later without being rewritten — R9 |

A place appears in the catalogue **once**, regardless of how many programs visit it.

The data shape itself is the architect's call, not this document's — §5 states what a place
must carry and §6 what it must relate to; how that is expressed in `data/*` and `types/*` is
not prescribed here.

### 5.1 Content pipeline

`[owner, 4]` The guide writes the text in Russian; the owner adjusts it and translates it to
English; the owner commits it. `[owner, 5]` **No place text exists today in either
language** — content creation is inside this feature's scope, not a precondition someone
else satisfies.

**The catalogue is 15 places** — the low end of `[owner, 6]`'s 15–20, fixed by decision
`[owner, decision 2026-08-13]`. That is **30 texts** through a single person whose
historical rhythm is roughly one content batch every 2–3 weeks (context.md). This is the
critical path; the rendering work is not. See R2 and [D §2.2].

Existing project rule that applies unchanged (context.md DEFINITION_OF_DONE): RU and EN
ship as a pair in one PR, same ids in the same order. A place with no English text cannot
ship.

---

## 6. Relations

### Place ↔ Program

`[owner, 11]` The link hangs off the **program** — the permanent entity — never off the
schedule. Reason given: the schedule is irregular, sometimes only 1–2 dates exist, and
anything schedule-driven would make places look unavailable.

**Order is free in v1** `[owner, decision 2026-08-13]`: a program's place list is not
obliged to match the walking order of the route. Walking order arrives in v2 (§13).

⚠️ **Free means "not required to match the route", not "may differ between renders".** The
order must be **stable**: the same list in the same sequence on every view, in both locales,
for the same program. Stated as an assumption rather than assumed silently; if it is wrong,
AC 7 and AC 16 are what change. [D §5]

**Constraint on v1 from the v2 deferral:** adding walking order later must not require
rewriting the place entries themselves — not the text, the name, the map link, or what a
place *is*. Otherwise v2 pays a second time for the 30 texts v1 commissioned. (Position
belongs to the program↔place pairing, not to the place: the same place can be third on one
route and first on another.)

`[owner, 14]` **All 12 programs get a place list.** Three are named after a single site and
will have a list of exactly one place — valid and deliberate, not an error:

- `Albjwc` — Wildflower Center tour (the owner will add the centre itself as a place "for
  consistency")
- `Amhry` — O. Henry Museum
- `Milt` — Millett Opera House

Full set of program ids `[from code, data/tours.en.ts]`: `Acap`, `Haust`, `Gcrt`, `Rrock`,
`Brmn`, `Auswe`, `Auhnry`, `Hyde`, `Acstm`, `Albjwc`, `Amhry`, `Milt`.

"All 12" is the completed state, and it is compatible with a 15-place catalogue because a
place is listed once but may be visited by several programs: 15 places can cover 12
programs, three of which need exactly one each.

### Place ↔ Tour date

`[owner, 21]` **No link.** A tour date shows exactly its program's place list, in the
program's order.

`[owner, 8]` A bonus *can be* a place in the real world — the five existing bonus keys
`bonusMuseum`, `bonusCap`, `bonusHenryMuseum`, `bonusChat`, `bonusMillet` are all added
stops `[from code]`. `[owner, 21]` But when a bonus is a place, **it is still displayed as a
bonus and is never merged into the place list.** `[owner, 17]` The `bonus` field, its
translation-key mechanism and its rendering are untouched.

Consequence, accepted deliberately: the same real object can appear twice on one date page —
once inside the place list and once as a bonus label. The O. Henry Museum is the extreme
case: a program (`Amhry`), a stop inside another program (`Auhnry`), and a bonus key
(`bonusHenryMuseum`). See R5.

### Place ↔ Meeting point

`[owner, 16]` None, in either direction. Proximity is irrelevant; a meeting point exists to
assemble the group. If the Texas Capitol is in the catalogue it is because tours *visit* it,
not because `Acap` meets at its south gates. No deduplication, no cross-linking.

---

## 7. Views

Three views ship together.

### 7.1 Places list page

One page listing all places `[owner, 3]`. Per entry: name, short description, map link, and
the names of the programs that visit it. No photos `[owner, 13 revised]`, no availability
marker `[owner, 11]`.

**Identity — the single place to read it from** `[owner, decision 2026-08-13]`:

| | Value |
|---|---|
| **Title, RU** | «Что посмотреть в Остине» |
| **Title, EN** | "Places to see in Austin" |
| **URL segment** | `places` — one segment, serving both locales |
| **Address, RU** | `/ru/places/` |
| **Address, EN** | `/en/places/` |

The RU title is the same string as the named query the page is accountable for (§2.1).

Path segments in this project are not localised and `trailingSlash: true` applies
project-wide `[from code]`; `places` is free of collisions in `app/`, `i18n/` and `lib/`
`[from code]`. [D §3, O5]

**In the sitemap: yes** `[owner, decision 2026-08-13]`. Per-locale entries with the
`en` / `ru` / `x-default` alternates the rest of the sitemap uses, same construction as every
other route `[from code, app/sitemap.ts]`. Checked by AC 14.

`[owner, 18]` **Entry point: the tour description.** Not the main navigation. Consequence,
accepted: the tour catalogue lives as accordions on the homepage, so the route to this page
runs through an expanded accordion on `/`, and a visitor who never opens a tour never learns
it exists. See R3.

Place → program is reachable by **name only**. There is no durable link target: programs
have no permanent pages (context.md question 16) and date pages expire and are deliberately
excluded from `sitemap.ts`. See R4.

### 7.2 Program view (homepage accordion)

`[owner, 20]` Each program's description shows its own places, in the program's stable order
(§6). The description is the homepage accordion; permanent program pages remain out of scope
(§4).

### 7.3 Tour date page (`/[locale]/tours/[tourEventId]`)

`[owner, 20]` Repeats the program's place list, in the same order as §7.2 shows it, so a
visitor does not have to go find the program. `[owner, 21]` Identical content to §7.2 in v1 —
free order does not license the two views to disagree (AC 16).

---

## 8. Release plan

### 8.1 Slicing — on `dev`, not in production

**A slice is a merge into `dev` with its Vercel preview, not a publication.** The catalogue
reaches production **once, complete**; the technical risk is retired early, slice by slice,
before all 30 texts are commissioned. **No slice is visible to a production visitor**
`[from code, CLAUDE.md]`: work is staged on `dev`, only `main` deploys to production, and
every pushed branch gets its own preview, which the owner opens while logged in to Vercel
(context.md question 29).

**Which programs are written first** `[owner, decision 2026-08-13]` — «Пешеходная экскурсия
по центру Остина, Остин Мистический, Экскурсия по кварталу Bremond и Выходные в стиле
Остин», resolved against the catalogue `[from code, data/tours.ts]`: **`Acap`**, **`Haust`**,
**`Brmn`**, **`Auswe`**. The remaining eight follow in whatever order the texts arrive.

Useful when commissioning: `Acap` and `Auhnry` `[from code, data/tours.ts]` both walk
Congress Avenue and both take in the Driskill and the O. Henry material, and a place is
written **once** however many programs visit it (§6). So `Auhnry`, not in the first four,
will already have most of its list once `Acap` is written. **The count that matters is
distinct places, not programs** — worth checking across the other downtown programs before
ordering texts.

Order of slices:

- **Slice 0 — one program, one place.** `Milt`, `Amhry` or `Albjwc`: `[owner, 14]` gives each
  a list of exactly one place. Two texts (RU + EN) prove the entire rendering path — data
  shape, both locales, program view, date view, map link — at the smallest possible content
  cost. It needs one text pair out of order; if the owner would rather not spend it, slice 0
  merges into slice 1, at the cost of debugging the data shape against a longer list.
- **Slice 1 — the first multi-stop route**, from the four named above. Proves what a
  single-place program cannot: several places rendering inside one program, in a stable
  order, identical between the program view and the date view (AC 16).
- **Slices 2…n — the remaining three named programs, then the other eight**, in whatever
  order the guide's texts arrive.

Each slice must leave `dev` in a state that could be released without embarrassment — AC 7a
and AC 7b check that — but the release decision is the owner's and is expected to happen
once, on the complete catalogue.

What slicing buys: the pipeline, the data shape, both locales and the rendering are proven
before the whole catalogue exists. What it does **not** buy: value delivered to visitors in
instalments. See R2 and §11.1.

---

## 9. Acceptance criteria

Each is observable and checkable before the merge it applies to.

### 9.1 Content

1. Each merge into `dev` carries a complete slice: every place it introduces is complete in
   both locales.
2. **15 places** `[owner, 6]`, `[owner, decision 2026-08-13]` is the completion target and
   the condition for the **production release** — not a condition for any single PR.
3. Every place has a non-empty name, short description and map link **in both RU and EN**.
   No place ships with a field filled in one language only.
4. RU and EN data ship in the same PR, with identical place ids in identical order (existing
   DoD rule).
5. Each place appears exactly once in the catalogue, however many programs visit it.
6. No place ships before the program that visits it — the catalogue contains no uncovered
   places in v1.
7. Every program whose places have shipped lists all of them. Order is free
   `[owner, decision 2026-08-13]` but **stable**: the same program shows the same places in
   the same sequence on every view and in both locales. Walking order is not required and is
   not claimed anywhere in the UI.
   7a. A program with no shipped places renders exactly as it does today — no empty section,
   no placeholder, no "coming soon". Checked on the homepage and on a date page before each
   merge into `dev`.
   7b. The places list page never presents an incomplete catalogue as the finished one. On
   `dev` and on previews it may hold however many places have landed; the production release
   happens on the complete 15. Checked at the release, not at each slice.

### 9.2 Places list page

8. One page exists listing every place; each entry shows name, short description, map link
   and the names of the programs that visit it.
9. Every map link, opened manually, lands on the correct location. Checked per place before
   merge — no automation claimed.
10. The page displays no photographs.
11. The page displays no coverage, availability or "no dates scheduled" marker.
12. The page is reachable from a tour description.
13. The page is served at `/ru/places/` and `/en/places/`, and its visible heading is «Что
    посмотреть в Остине» in RU and "Places to see in Austin" in EN
    `[owner, decision 2026-08-13]`, both through next-intl like every other visitor-facing
    string (AC 21). Checked by opening both addresses. The RU heading *is* the query the
    page is accountable for (§2.1): if it drifts during implementation, the metric and the
    page stop describing the same thing, and nothing else here would catch it.
14. The page appears in the rendered `sitemap.xml` for **both locales**
    `[owner, decision 2026-08-13]`, each entry carrying the `en`, `ru` and `x-default`
    alternates the rest of the sitemap uses `[from code, app/sitemap.ts]`, and each listed
    URL resolves 200 in that exact form, trailing slash included. **Checked on the rendered
    output, not on the source** — context.md question 17 records that reading source instead
    of output is how an earlier SEO conclusion went wrong. This states the observable result
    only; how the entry gets there is the architect's call.

### 9.3 Program and date views

15. Each program's description lists its places in the homepage accordion (§7.2), in the
    program's own stable order (AC 7).
16. A date page lists the same places, in the same order, as its program. Free order removes
    the obligation to match the route; it does not permit the two views of one list to
    disagree. Checked by opening a program in the accordion and its date page side by side.
17. A date's `bonus` renders exactly as it does today, in its current position, and never
    inside the place list — including when the bonus names a place that is also in the
    catalogue.

### 9.4 Non-regression

18. `meetingPoint` and `meetingPointLink` are unchanged and are never rendered as part of a
    place list.
19. The `bonus` field, its translation-key resolution and its rendering are unchanged. No
    new bonus translation keys are added by this feature.
20. Exactly one new URL is introduced: the places list page. No per-place URLs, and no
    permanent program pages — context.md question 16 stays untouched.
21. No visitor-facing string is hardcoded in JSX; all of them come through next-intl
    (context.md DEFINITION_OF_DONE, firm rule).
22. `npm run build` passes.
23. The PR states its Vercel preview URL and says a mobile check **is** needed — this
    feature changes markup and text, which is context.md's own trigger for it.

---

## 10. Boundary with the architect

This document states *what* must be observable, not *how*. Left to the architect: where the
place data lives and in what shape, how a place is linked to a program, how the list page is
routed and rendered, and how the sitemap entry is produced. The constraints that bind those
choices are stated as requirements, not as designs: RU/EN parity as a pair (AC 3, 4), one
entry per place (AC 5), stable order (AC 7), later gain of a photo without rewriting entries
(R9), and later gain of walking order without rewriting entries (§6).

---

## 11. Risks

Numbers are stable and are not reused. R1, R8 and R12 were closed in earlier revisions and
are recorded in [D §6]; the gaps below are theirs.

| # | Risk | Source | Severity |
|---|---|---|---|
| R2 | **Content is the critical path and has no date.** 30 texts, none of which exist, written by the guide and translated by one person whose historical rhythm is one batch every 2–3 weeks. No launch date can be committed from this PRD. Slicing (§8.1) retires *technical* risk early, but production waits for the complete catalogue `[owner, decision 2026-08-13]`, so nothing reaches visitors until the last of the 30 texts exists. | `[owner, 4, 5, 6]`, `[owner, decision 2026-08-13]` | high |
| R3 | **Discoverability.** Entry is from the tour description only, inside a homepage accordion; not in navigation. | `[owner, 18]` | medium |
| R4 | **Place → program has no durable link target.** Programs have no permanent pages; date pages expire and are excluded from the sitemap on purpose. Places can name tours but not link to them stably. | `[from code]`, context.md q16 | medium |
| R5 | **Double representation.** The same object can show as a place in the list and as a bonus label on the same date page. Accepted deliberately, but it will look like a bug to anyone who did not read this. | `[owner, 21]` | low |
| R6 | **Terminology.** "Event" now covers a tour date *and* a one-off city occurrence. Resolved in this document's prose only, not in the code, and no vocabulary will be agreed while this feature is built `[owner, decision 2026-08-13]`. Mitigation is the standing rule in §1. | context.md q24, `[owner, 15]`, `[owner, decision 2026-08-13]` | medium |
| R7 | **v1 must not make per-place pages more expensive later** — the standing instruction context.md attaches to question 16 — but there is no per-place content yet to verify that against. | `[owner, 12]` | medium |
| R9 | **Photos deferred.** Entries must be able to gain a photo later without being rewritten. `images.unoptimized: true` `[from code]` means nothing resizes images automatically, so whenever photos arrive, sizing is a manual content step and a Core Web Vitals exposure. | `[owner, 13]`, `[from code]` | low |
| R10 | **The 2027 reviews link needs a dimension that does not exist.** `Reviews!A:F` column C is a *program* id, and `FeedbackForm` does not collect a place. Linking reviews to places is not a display change. | `[from code]`, context.md q31 | low (later) |
| R11 | **`bonus` as a mechanism is unfit for city happenings.** A rodeo on one Saturday needs a one-off label, but `bonus` holds a translation key requiring edits to both `messages/*.json` plus a deploy. Untouched by decision, so the cost stays. | `[owner, 15, 17]`, context.md GLOSSARY | low (deferred) |

### 11.1 Combinations that change the decision

- **R2 + AC 1–7.** Slicing removed the all-or-nothing property from **merging**, not from
  **releasing**: production waits for all 15 places `[owner, decision 2026-08-13]`. R2 is
  retired early only as technical risk; as schedule risk it is undiminished.
- **R3 + R2.** The only entry point is inside a homepage accordion, so the audience is
  bounded by an interaction search visitors never perform — while the content cost of
  reaching that audience is 30 texts. The fix that dissolves both is a permanent page per
  program (context.md q16), which is on hold. This pair is the strongest argument for
  revisiting q16 later.
- **R4 + R7.** Places can name programs but cannot link to them, and per-place pages would
  need the same missing target. Both are the absence of permanent program pages, counted
  twice.
- **R5 + R6.** Double representation and the third meaning of "event": a place list, a bonus
  label and a tour date all render together. No
  fix happens in this feature (naming is out of scope, `bonus` is a non-goal), so the pair is
  carried, not treated. Both surface on the date page, which is where a later fix would go.
- **R9 + R10.** Both are content-model debts payable in later versions; neither should
  influence the v1 decision, and they are named here so they are not counted into it.

---

## 12. Open items

**None.** Every item this document raised is closed; the record is in [D §3]. What remains
before release is content (R2), not decisions.

---

## 13. Deferred to later versions

In the order the owner raised them:

1. Places not visited by any program, with a call to action to request a custom tour
   `[owner, 9]` — reopens context.md question 3.
2. Photos per place `[owner, 13]`.
3. A page per place, once content justifies it `[owner, 3, 12]`.
4. Reviews attached to places — not before 2027 `[owner, 12]`.
5. A `bonus` refactor `[owner, 17]`.
6. **Walking order — explicitly v2** `[owner, decision 2026-08-13]`: place lists follow the
   route instead of a free order. Constraint this puts on v1, stated in §6: it must arrive
   without rewriting place entries that have already shipped.
