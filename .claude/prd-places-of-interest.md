# PRD: Places of Interest (POI)

version: 2.3 | date: 2026-08-18 | status: buildable — no open items
source: owner interview, 21 questions, 2026-08-13, plus the owner's post-interview
decisions of 2026-08-13 and of 2026-08-16/17/18
companion: `.claude/context.md` (v1.0, 2026-08-11) — on conflict, context.md wins
objections and answers: `.claude/answers.md` — threads `D1`–`D14`, opened by design
2026-08-16 against PRD v2.2, answered by the owner 2026-08-16/17
rationale, alternatives weighed, closed items, revision history:
`.claude/decisions-places-of-interest.md` (cited below as **[D]**)

Markers. `[owner, N]` — answer to interview question N. `[owner, decision <date>]` — a
decision taken after the interview, on a question this document put to the owner; three dates
carry them, 2026-08-13, 2026-08-17 and 2026-08-18. `[from code]` — read from the repository.
Nothing here is unsourced.

**Provenance.** v2.2's ten owner decisions did not reach this document directly: they were
recorded in `.claude/architecture-places-of-interest.md` §0 (v1.0, 2026-08-13) and are
relayed here under `[owner, decision 2026-08-13]`. v2.3 carries the owner's answers to the
design objections `D1`–`D14`, quoted verbatim in `.claude/answers.md` and dated 2026-08-16/17
(`[owner, decision 2026-08-17]`), plus the answer to O20 of 2026-08-18. No interview answer was
added, altered or removed in either revision.

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
for approximately one query; ranking on individual place names is out of reach and is
not claimed here `[owner, 3]`. The site currently records essentially no impressions at
all, so the goal is **to appear in results at all**, not to improve a position.

**What the release also delivers, and is not judged by:** a visitor reading about a tour
can see which places that tour visits, and the list page shows every place with a map link
`[owner, decision 2026-08-17]` — the map link lives on that page only (§7). It is built per
§8 and checked by §9, but it carries no metric — the number that measured it could not be
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

**The page grows during the measurement window, and that is accepted**
`[owner, decision 2026-08-13]`:

> «пусть растёт, это не может ухудшить»

Through v2.1 the clock and the complete catalogue started together: the page measured at day
30 was the page released on day 0. The page now goes to production **with its first place**
`[owner, decision 2026-08-13]` (§8), so the day-30 and day-60 readings are taken on a page
that has gained content in between. **Nothing in the table above changes**: the clock still
starts at the production release, the threshold is still ≥20 impressions and ≥3 clicks per
week, and the 60-day reading is still final. O11 is closed on that basis.

**Why the reasoning holds, and what it buys.** Within this project content only accumulates,
so the day-60 page is the fullest the page has been, and a growing page cannot depress
impressions for the named query. That makes the final reading a **best-case** reading rather
than an ambiguous one: a miss at 60 days is a miss on the strongest version of the page that
has existed — a firmer verdict than v2.1's schedule would have produced, not a weaker one.

⚠️ **The premise is scoped, not permanent.** A place may later be dropped from the list if it
does not interest visitors, and a route may change `[owner, decision 2026-08-13]`; both are
out of scope here (§13 item 8). So "content only accumulates" holds **because removal is out
of scope for v1**, not because nothing can remove a place. If one is removed inside the
measurement window anyway, the best-case reading degrades to an ordinary one and the day-60
verdict is weaker than stated above. That is a condition on this argument, not on the
decision — the decision stands either way.

**What it costs, stated rather than absorbed.** The reading stops being attributable to a
page state. If the threshold is met, nobody can say whether it took one place or twenty — the
number that would answer "how much content moved the needle" is not being captured. This is
consistent with what §2.1 already disclaims (the reading answers *whether*, not *why*), but
it is the input §13 item 3 would want, and the same input R7 and the context.md q16 argument
would want. **Optional, gates nothing, costs a line in a note:** record how many places the
page holds at each of the two readings, so a later decision has it.

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

**What a searcher sees before the click, recorded because it sits on this same threshold.** The
page's `description` metadata is "Austin sightseeing" / «Достопримечательности Остина» — two
words `[owner, decision 2026-08-18]` (§7.4), where the value it replaces was a full sentence.
The two halves of the threshold are not equally exposed to it: impressions follow from ranking
for the named query, which the description does not enter, while clicks are decided partly by
how the result reads. So if the 60-day reading meets ≥20 impressions and misses ≥3 clicks, this
is the first thing to look at. Recorded as an input to reading the result — not a prediction,
and not an objection: the string is the owner's.

**Deliberately not claimed as measurable:** the share of tour-description readers who reach
the place list. That entry point is an accordion on `/` and no custom event is emitted
anywhere in the codebase `[from code]`, so the number cannot be produced without new code.
The footer link added in v2.2 (§7.1) does not change this: it is a second entry point, not
an instrument, and attributing arrivals between the two would need the same missing event.

Two readings this document applied rather than assumed — the threshold is scoped to the
page and not the site, and day 30 is a weekly rate and not a 30-day total — are stated with
their reasoning in [D §4]. One sentence from the owner reverses either.

---

## 3. User stories

Visitor types are context.md's (USERS: the tourist, and the local booking for guests); this
feature's interview did not revisit them.

- **US1 — tourist, choosing.** As someone comparing two programs, I want to see which
  places each one visits, so I can tell them apart before enquiring. → AC 15, 16, 24. Since
  v2.3 the list page serves this story too: a place names the programs that visit it and
  each name is a link to that program `[owner, decision 2026-08-17]` → AC 25.
- **US2 — local, booking for guests.** As someone sending a tour to arriving guests, I want
  one page of places with map links, so they can see where they will be taken without me
  explaining it. → AC 8, 9, 12.
- **US3 — visitor on a date page.** As someone who arrived on a specific date, I want the
  place list right there, so I do not have to go and find the program. → AC 16, 17, 24.
- **US4 — searcher.** As someone searching for what to see in Austin, I want to land on
  this site. → AC 12, 13, 14. **Served for the one named query only**, not for individual
  place names; no acceptance criterion covers the place-name case, deliberately (§2).
- **US5 — owner, publishing.** As the person who commits the texts, I want to add a place
  by editing one RU/EN pair, so that a slice stays a single reviewable PR. → AC 1, 4.

---

## 4. Non-goals

Out of scope for v1, each with the answer that put it there.

- A page per place `[owner, 3]`.
- Photos of places `[owner, 13 revised]` — v1 is text only.
- Places that no program visits `[owner, 9]` — the catalogue is drawn entirely from
  existing routes in v1. **Now a build error, not a content rule**
  `[owner, decision 2026-08-13]`: see AC 6 and §13 item 1, whose cost this changes.
- **Annotations on a place inside a particular program** — "we go inside here", "Mondays
  only" `[owner, decision 2026-08-13]`. Such text exists in the owner's source material and
  is deliberately not carried into v1; it belongs to the program↔place pair, not to the
  place, and is deferred to §13 item 7. This is also what keeps AC 11 free of conflict: an
  annotation like "Mondays only" *is* an availability marker.
- Any call to action about a custom tour `[owner, 9]`. This would reopen context.md
  question 3, where the owner decided the individual-tour path is deliberately not being
  improved. v1 does not reopen it.
- Any change to `bonus` `[owner, 17]`.
- Any change to `meetingPoint` / `meetingPointLink` `[owner, 16]`.
- Any link between places and reviews `[owner, 12]` — direction for 2027.
- Any coverage or availability marker `[owner, 11]`.
- Permanent pages per program — still context.md question 16, still explicitly not started.
  The hold stays in force and this feature does not go near it; the consequence is carried
  openly in R7. The other half of it — that a place could not link to a program at all —
  ended with the catalogue's program links (§7.1, AC 25), and R4 is closed with it (§11).
- Naming the third meaning of "event" for the product as a whole
  `[owner, decision 2026-08-13]`. §1's ban on `event` in new identifiers is the mitigation;
  R6 is the residue.

---

## 5. The Place entity

`[owner, 1]` A place is any Austin-area sight worth telling about and worth visiting. It is
**not** a projection of the tour catalogue: conceptually the catalogue may be larger than
what tours cover. `[owner, 9]` In v1 it coincides with the tour catalogue — and since
`[owner, decision 2026-08-13]` that coincidence is **enforced**, not incidental: a place no
program visits fails the build (AC 6). The conceptual statement survives; what changed is
that v1 can no longer drift out of it by accident.

**There is no sharp criterion for what is a place and what is not**
`[owner, decision 2026-08-13]`. `[owner, 1]` is a description, not a test: two people can
disagree about a given site and neither is wrong by this document. Membership is a judgment,
it is made **outside this project** (§5.1), and it is **revisable** — a place that turns out
not to interest visitors may later be dropped from the list, and the route itself may change;
both are out of scope here (§13 item 8).

Recorded because it is load-bearing, not as a complaint: after v2.2 the catalogue is bounded
**neither by a count** (AC 2 withdrawn) **nor by a criterion**. That is coherent — the set
arrives compiled and this document does not size it — but it means nothing here can say a
proposed place is wrong, and nothing here defines when the catalogue is right. → **R14**.

**What it does not cost, worth stating because the search priority makes it the obvious
worry:** dropping a place later removes a list entry, not a URL. v1 introduces exactly one
new URL (AC 20) and no per-place pages, so a removal produces no dead address, no soft-404
and nothing to redirect. The shape chosen is robust to this by construction.

Fields:

| Field | Required | Per locale | Notes |
|---|---|---|---|
| name | yes | **yes**, RU + EN | |
| short description | yes | **yes**, RU + EN | `[owner, 3]` short by design |
| map link | yes | **no — one per place** | `[owner, decision 2026-08-13]`. **Google Maps** `[owner, decision 2026-08-13]`, chosen from the two options in `[owner, 19]`. Matches the precedent in the repo: every `meetingPointLink` today is a `maps.app.goo.gl` short link `[from code]`. Provisional and reversible; [D §5] prices the reversal — one link per place, so N edits at whatever size the catalogue has reached |
| photo | **no** | — | `[owner, 13 revised]` deferred; entries must be able to gain one later without being rewritten — R9 |

A place appears in the catalogue **once**, regardless of how many programs visit it, and it
is **described once**: one record, which every program that visits it references
`[owner, decision 2026-08-13]`. The same place therefore reads identically in every program
it appears in. What varies per program belongs to the pairing, not to the place — position
(§6), the day grouping (§6), and, when it arrives, the annotation deferred in §4.

The data shape itself is the architect's call, not this document's — §5 states what a place
must carry and §6 what it must relate to; how that is expressed in `data/*` and `types/*` is
not prescribed here.

### 5.1 Content pipeline

`[owner, 4]` The guide writes the text in Russian; the owner adjusts it and translates it to
English; the owner commits it.

**No place count is committed** `[owner, decision 2026-08-13]`. The **15-place** target
carried since v1.4 [D §1, §2.2], and the 30-text arithmetic derived from it, are
**withdrawn** — with them go
AC 2 and the completion condition it carried. Which places exist, and which program visits
which, is **compiled outside this project** `[owner, decision 2026-08-13]`: it arrives as a
set, and this document neither sizes it nor schedules it.

`[owner, 5]` said **no place text existed in either language**. That is still true of the
descriptions and no longer true of the rest: names, map links and program↔place links for
**30 places across 4 programs** were compiled outside the project and are held as material in
`.claude/architecture-places-of-interest.md` §9. What is in the data files is smaller and is
governed by the queue below — `[from code, 2026-08-18]` **one place** (`capitol` in `Acap`),
its description still `'TBD'`, all four files untracked. So what remains of the pipeline is
descriptions, in both languages, through the one person `[owner, 4]` names.

**A place enters the data when its description is written, not before**
`[owner, decision 2026-08-13]`. The program↔place table is the **release queue**: a place is
linked only once its RU and EN descriptions exist, and rows are added as texts arrive. This
is what makes the incremental release of §8.1 work — decisions 3 and 4 tie the three data
files to that table, so a place absent from it is absent everywhere, and **no placeholder
ever exists in shipped data**. The `'TBD'` state stops being a thing the page can show and
becomes a thing that never reaches the repository.

**Two states therefore do not exist, and no view is designed for either**
`[owner, decision 2026-08-17]`:

- **A place without a description.** The description is shown unconditionally wherever it is
  shown at all (§7.1); nothing guards against an empty one. What holds this is the queue
  above plus the release check, not the compiler — `'TBD'` is a non-empty string and
  satisfies AC 3 to the letter. Today's data does not meet it yet: `capitol` carries
  `description: 'TBD'` `[from code]`, which is legitimate on `dev` and does not go to
  production.
- **An empty catalogue.** The program↔place table is never empty, so the list page never
  renders with no entries. Plain type inference does not catch this one — an *empty* linking
  table compiles, because the inferred place-id type degrades to `never`, which empty text
  files satisfy — so PRD v2.3 left to the architect whether the build should hold it. It does:
  a type assertion in the linking table itself fails `npm run build` on an empty table
  (`.claude/architecture-places-of-interest.md` §2.6). The state is now compiler-caught like
  the other two, not decision-only.

Two consequences worth having in writing:

- **The 30-place set is material, not the shipped set.** It is the compiled result of the work
  decision 1 places outside this project — names, map links and program↔place links, all of
  which exist. Under the queue it enters the data one place at a time, each with its two
  descriptions. Nothing in it is wasted; it is staged rather than finished.
- **The choice arrived before the first commit** `[from code]`, so it cost nothing: the files
  are untracked, and trimming them to the written set was an edit to the working tree, not a
  rewrite of history.

**Consequence of removing the count, not softened.** The number was what made "done"
sayable. Without it there is no state at which the catalogue is complete, no arithmetic to
schedule against, and no criterion that can fail on size — see the rewritten R2. What
replaces it is the incremental release (§8): value is delivered per place instead of at a
finish line.

Existing project rule that applies unchanged (context.md DEFINITION_OF_DONE): RU and EN
ship as a pair in one PR, same ids in the same order. A place with no English text cannot
ship — and since `[owner, decision 2026-08-13]` it cannot even build (AC 3).

**Why the queue and not a check.** Decision 3 makes an unpaired place a build error and
decision 5 publishes from the first place; between them, a placeholder that is non-empty in
both locales satisfies AC 3 to the letter and would reach production — `'TBD'` is a string
like any other, and no compiler can tell it from prose. The alternatives were to publish it,
or to hold production until every description exists — the all-or-nothing release decision 5
had just removed. The queue removes the case instead of guarding it: there is no placeholder
to catch, because a place without a description is not in the data at all. O17 closed on that
basis; the reading this document had applied provisionally ("a placeholder is not a
description") is now the owner's, and it is enforced by construction rather than by review.

The release check in `.claude/architecture-places-of-interest.md` §7 —
`grep -c "'TBD'" data/poi.ru.ts data/poi.en.ts` must return 0 — stays useful but changes
role: under the queue it is true at every release rather than only at the last one, so it is
a **safety net against a slip, not a gate on the catalogue**, and that document now says so.

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
place *is*. Otherwise v2 pays a second time for every text v1 commissioned. (Position
belongs to the program↔place pairing, not to the place: the same place can be third on one
route and first on another.)

**The same constraint now covers three things, not one.** Position, the day grouping below,
and the annotations deferred in §4 are all properties of the **pair**, and a place is
described once (§5) `[owner, decision 2026-08-13]`. Any of them can be added later without
touching a place entry. This is the single structural commitment v1 makes to v2.

### Multi-day programs

`[owner, decision 2026-08-13]` A program whose route is split across days keeps that split,
and **shows it**. Today this is `Auswe` alone `[from code]` — days 1 and 2; every other
program's list renders flat. The grouping is a property of the program↔place pair, so a
place that appears on day 1 of one program and inside a flat list of another is still one
place with one description (§5).

Both views show the grouping identically (AC 24), for the same reason AC 16 exists: two
views of one list may not disagree.

**How a multi-day program is scheduled** `[owner, decision 2026-08-13]`: **only day 1 goes
into the schedule. Day 2 is not marked in the calendar in any way.**

This settles it in the cheapest possible direction — **nothing changes and nothing is
needed**. `UpcomingTourEvent`'s single `date` / `time` `[from code]` is already correct: it
is day 1. No schema change, no second event, no link between the day grouping and the
schedule. The day split lives entirely inside the program's place list, which is what
decision 9 said it was.

**What it leaves visible, accepted rather than fixed** → **R15**: a date page for such a
program shows places under "Day 2" while the page's own date, and the calendar entry behind
it, name a single day — the second date is stated nowhere. This is the intended shape, not an
oversight; it is recorded because it is the first thing a reader will take for a bug.

`[owner, 14]` **All 12 programs get a place list.** Three are named after a single site and
will have a list of exactly one place — valid and deliberate, not an error:

- `Albjwc` — Wildflower Center tour (the owner will add the centre itself as a place "for
  consistency")
- `Amhry` — O. Henry Museum
- `Milt` — Millett Opera House

Full set of program ids `[from code, data/tours.en.ts]`: `Acap`, `Haust`, `Gcrt`, `Rrock`,
`Brmn`, `Auswe`, `Auhnry`, `Hyde`, `Acstm`, `Albjwc`, `Amhry`, `Milt`. Four of them have a
place list today `[from code]`; the other eight have none, which AC 7a already permits.

The paragraph that reconciled "all 12" with a 15-place catalogue is **withdrawn** — there is
no catalogue size to reconcile against `[owner, decision 2026-08-13]`.

**"All 12" survives the removal of the count** `[owner, decision 2026-08-13]`: the owner
plans to cover every program. Stated precisely, because the surrounding decisions make the
distinction matter — it is a **plan**, and it is:

- **not a release gate.** The page ships from the first place (§8.1); coverage does not hold
  it back.
- **not a schedule.** The sets are compiled outside this project and the descriptions have no
  date (R2). "Plans to" carries no when.
- **the only completed state this feature has left**, and it is a real one: the program set
  is finite and enumerable `[from code]`, so "every program has a list" is checkable in a way
  that "the catalogue holds the right places" is not (R14).

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

Three views ship together; §7.4 names the strings they add.

### 7.1 Places list page

One page listing all places `[owner, 3]`. Per entry, in this composition
`[owner, decision 2026-08-17]`:

| Element | Shown as |
|---|---|
| Place name | plain text — **not a link**, here or in any other view |
| Short description | shown on this page only, and always present (§5.1) |
| Map link | a labelled localised string, «показать на карте» / "locate on map" (§7.4). The only point in the feature where a visitor leaves the site |
| Programs that visit it | each program's **full name** — `TourProgram.title` `[from code]`, not the short form `shortTitle` — and each name is a link (below) |

No photos `[owner, 13 revised]`, no availability marker `[owner, 11]`.

**Order: alphabetical by the place name as displayed** `[owner, decision 2026-08-17]`. The
two locales therefore order the page differently; that is what an alphabetical list is for —
a reader looks a name up under its own first letter — and the criteria do not depend on the
order (AC 26). AC 4 is untouched: it fixes the order of ids **in the data files**, which is
not the order of output. One consequence of the alphabet is visible and accepted rather than
fixed — the RU page reads as two alphabets, Latin names before Cyrillic ones → **R17**.
**Named, not resolved:**
`.claude/architecture-decisions-places-of-interest.md` §2 weighed these same options and
rejected the alphabet; that document now disagrees with the owner and is the architect's to
correct.

**The program names are links** `[owner, decision 2026-08-17]`: the link carries the program
identifier to the homepage and lands the visitor at that program's description. The homepage
does not render all program cards initially `[from code]`; when the target is not among them,
all programs are loaded and the visitor is then taken to the one clicked. This states the
observable result only — the mechanism is the architect's and the coder's (§10). **No new
URL:** the target is the existing homepage address carrying an identifier, so AC 20 stands
and `sitemap.ts` is untouched (context.md CONSTRAINTS keeps anchor URLs out of it).

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

**Entry points: the tour description, and the site footer.**

`[owner, 18]` gave the tour description and ruled out the main navigation. The consequence
the PRD accepted from that — the tour catalogue lives as accordions on the homepage, so the
only route ran through an expanded accordion on `/`, and a visitor who never opened a tour
never learned the page existed — **no longer holds**: the page is also linked from the
**footer** `[owner, decision 2026-08-13]`, which is present on every page and is not the
main navigation. R3 is rewritten accordingly.

**The footer does not replace the tour-description entry** `[owner, decision 2026-08-13]` —
both stand, and AC 12 requires both. This confirms the reading this revision had applied
provisionally; it is now the owner's word, and O14 is closed.

**No page furniture beyond that** `[owner, decision 2026-08-17]`: no header, no main
navigation `[owner, 18]`, and **no language switcher — it stays on the homepage only**. The
page keeps its way back to the homepage and the footer.

The cost of the switcher decision is accepted, not overlooked, and is recorded because it
touches a companion document: a visitor who arrives from search on `/en/places/` cannot hand
the RU version to guests without editing the address or going through the homepage, and
`.claude/context.md` v1.0 USERS calls the switcher part of the main path for visitor type 2.
The owner's answer is later and specific to this page; context.md is not amended here.
`hreflang` does not cover the case — it selects the locale on entry, for a search engine, and
gives the visitor nothing to click.

### 7.2 Program view (homepage accordion)

`[owner, 20]` Each program's description shows its own places, in the program's stable order
(§6), with the day grouping where the program has one (§6, `Auswe`). The description is the
homepage accordion; permanent program pages remain out of scope (§4).

**Names only** `[owner, decision 2026-08-17]`. The list carries the caption «Вы увидите» /
"You will see" (§7.4) and then the place names. **No short descriptions** — they live on the
list page and nowhere else — **no map links**, and the name is not a link. Checked by AC 15.

**The full list stands between the program's description and the booking button, and that is
accepted** `[owner, decision 2026-08-17]`: no truncation, no "first N", no "the rest is on
the places page". Cost, accepted: on a mobile column the call to action moves several screens
down for the longest programs. The owner's answer reads "only one such program"; the data
says **two** — `Auswe` 15 places, `Brmn` 10 `[from code]` — and eight of the twelve program
sets have not reached the repository yet, so the count can grow. This corrects the premise,
not the decision, which holds at either count.

**Duplication with the program's own copy is accepted, not resolved**
`[owner, decision 2026-08-13]`, and **both lists stay** `[owner, decision 2026-08-17]` — the
owner's word is «пока», so this is provisional in the same sense as the map provider ([D §5]).
`TourProgram.highlights` and `TourProgram.description` `[from code, types/tour.ts]` already
name sights in prose, so the same site can appear twice inside one accordion — once in the
program's text, once in its place list. No deduplication, no rewrite of the existing copy.
Same shape as R5, different neighbour → **R13**.

### 7.3 Tour date page (`/[locale]/tours/[tourEventId]`)

`[owner, 20]` Repeats the program's place list, in the same order and with the same day
grouping as §7.2 shows it, so a visitor does not have to go find the program.
`[owner, 21]` Identical content to §7.2 in v1 — neither free order nor the day grouping
licenses the two views to disagree (AC 16, AC 24). **Identical composition too**
`[owner, decision 2026-08-17]`: the same caption, names only, no descriptions, no map links,
the name not a link.

### 7.4 Strings this document names

Visitor-facing strings were being invented in `.claude/architecture-places-of-interest.md` §6
rather than required here. **The feature adds six, and all six are named below.** They are
slots of this document — naming them is not the architect's job and not the coder's. How they
are keyed, and their punctuation and capitalisation, is the coder's business; that they come
through next-intl is AC 21.

| Where | RU | EN | Source |
|---|---|---|---|
| Page title / `h1`, list page (§7.1) | «Что посмотреть в Остине» | "Places to see in Austin" | `[owner, decision 2026-08-13]` |
| Map link, list page (§7.1) | «показать на карте» | "locate on map" | `[owner, decision 2026-08-17]` |
| Place-list caption, accordion and date page (§7.2, §7.3) | «Вы увидите» | "You will see" | `[owner, decision 2026-08-17]` |
| Caption above the programs in a catalogue entry (§7.1) | *«Можно увидеть на экскурсиях»* | "Can be seen on tours" | EN `[owner, decision 2026-08-18]`; RU proposed here |
| Day-group label (§7.2, §7.3, AC 24) | *«День {n}»* | "Day {n}" | EN `[owner, decision 2026-08-18]`: «Day 1 / Day 2»; RU proposed here |
| `description` metadata of the list page — the line under the title in search results | *«Достопримечательности Остина»* | "Austin sightseeing" | EN `[owner, decision 2026-08-18]`; RU proposed here |

**The day label is one string with a number in it, not one string per day**
`[owner, decision 2026-08-18]` read against AC 24: «Day 1 / Day 2» is "Day {n}" at n = 1 and
n = 2. Two separate strings would repeat the `bonus` trap — every further day costing an edit
to both `messages/*.json` plus a deploy (R11, context.md GLOSSARY).

**The three RU halves in italics are this document's proposals, not the owner's word.** Same
route the other strings took: proposed here, replaced by one word from him whenever he says it.
Nothing waits on them and no item is opened — they ship as written if nothing replaces them,
and each is a one-line edit per locale afterwards.

Punctuation and capitalisation of a named string — whether the caption takes a colon like the
neighbouring `youLike` ("You will love it:") `[from code]` — are part of creating the key: the
owner named the string, not its typography, and that is not a question to put back to him.

The list page needs no caption of its own — its `h1` is one. The existing `whatWeSee`
(«Что увидим») is superseded by the caption above, and `openMap` («На карте») by the map-link
string.

---

## 8. Release plan

### 8.1 Slicing — incremental, and it reaches production

**The page goes to production with its first place** `[owner, decision 2026-08-13]`. It does
not wait for a complete catalogue, and there is no complete catalogue to wait for (§5.1).

This **reverses v2.1's premise**, which is worth stating because the section was built on it:
v2.1 said "a slice is a merge into `dev` with its Vercel preview, **not** a publication", the
catalogue "reaches production once, complete", and "no slice is visible to a production
visitor". All three are withdrawn. AC 7b, which enforced them, is withdrawn with them.

The mechanics underneath are unchanged `[from code, CLAUDE.md]`: work is staged on `dev`,
only `main` deploys to production, every pushed branch gets its own preview which the owner
opens while logged in to Vercel (context.md question 29), and the `dev` → `main` merge
remains the owner's release switch. What changed is that a merge to `main` is now expected to
happen **more than once**, on a page a visitor sees each time.

**Two things this costs, since the all-or-nothing property was doing work:**

- **AC 1 gets heavier.** A merge into `dev` was a draft; it is now one owner decision away
  from visitors. Every place a slice introduces must be complete in both locales *and*
  actually described — which is what the release queue in §5.1 enforces by construction:
  a slice adds places to the linking table only as their descriptions arrive with them.
- **What AC 7b protected is answered, not replaced.** "The places list page never presents an
  incomplete catalogue as the finished one" was a real requirement, and under the incremental
  release incomplete *is* the released state. The page **says nothing about it**
  `[owner, decision 2026-08-13]` — no marker, no count, no "more coming". AC 7b now carries
  that as a positive criterion, and O12 is closed.

**Release cadence: unconstrained technically, bounded by taste**
`[owner, decision 2026-08-13]`. Every slice **may** go to production — there is no limit on
the number of deployments. The constraint the owner does place is qualitative: **avoid very
small increments**, because they clutter the history.

"Very small" is deliberately not quantified, and this document does not invent a floor. Two
things follow from what is already here:

- **The existing process already serves the preference; no new rule is needed**
  `[from code, CLAUDE.md]`. Work accumulates on `dev` and `main` is the release switch, so
  batching is the default behaviour of the process rather than something to impose on it.
- **The natural unit is already a program's place list** — that is what a slice is (below),
  and it is larger than one place and smaller than the catalogue.

⚠️ **Where this meets decision 5, read the two together.** Decision 5 sets a *floor*: the page
may release before the catalogue is complete, from the first place. This answer expresses a
*preference* above that floor: do not release in dribs. They are compatible — one is
permission, the other is taste — but applied together the practical first release is a
program's worth of places rather than a single one. **That is a reading, not the owner's
word**, and it is the only place these two statements need reconciling; one sentence settles
it either way.

**Which programs are written first** `[owner, decision 2026-08-13]` — «Пешеходная экскурсия
по центру Остина, Остин Мистический, Экскурсия по кварталу Bremond и Выходные в стиле
Остин», resolved against the catalogue `[from code, data/tours.ts]`: **`Acap`**, **`Haust`**,
**`Brmn`**, **`Auswe`**. The remaining eight follow in whatever order the texts arrive.

Those four are compiled as material — names, map links and program↔place links for all 30
places (§5.1). The ordering above therefore no longer decides which *sets* are compiled; it
decides which **descriptions** are written first, and the queue admits a place to the data
only when its two descriptions exist.

Useful when commissioning: `Acap` and `Auhnry` `[from code, data/tours.ts]` both walk
Congress Avenue and both take in the Driskill and the O. Henry material, and a place is
written **once** however many programs visit it (§5, §6). So `Auhnry`, not in the first four,
will already have most of its list once `Acap` is written. **The count that matters is
distinct places, not programs** — 8 + 6 + 10 + 15 pairings across the first four programs
resolve to **30 distinct places**.

Order of slices, stated as what each one has to deliver; how they are cut into branches is the
architect's (`.claude/architecture-places-of-interest.md` §7):

- **A one-place rehearsal, which stays on `dev`.** One program with one place proves the whole
  rendering path — data shape, both locales, program view, date view, map link, metadata — at
  the smallest possible content cost. It exists already, on `capitol` in `Acap`, with the
  description still `'TBD'` `[from code]`, which is why it cannot be released: `'TBD'` does not
  go to production (§5.1). Decision 5 would permit a one-place release, but a single place is
  exactly the "very small increment" the cadence answer asks to avoid, so the first **release**
  is the slice below.
- **The first multi-stop route**, from the four named above. Proves what a single-place program
  cannot: several places inside one program, in a stable order, identical between the program
  view and the date view (AC 16), and an alphabetical catalogue of more than one entry (AC 26).
  `Auswe` additionally proves the day grouping (AC 24).
- **The remaining named programs, then the other eight**, in whatever order the guide's texts
  arrive — one place at a time, since the queue admits places, not programs.

One dependency worth knowing before the first release, because it decides what is checkable
when `[from code]`: AC 25's harder half — arriving at a program whose card the homepage did not
render — cannot be observed while `Acap` is the only linked program, because `Acap` is always
among the first cards rendered. It becomes observable with the first program outside that set.

Each slice must leave `dev` in a state that could be released without embarrassment — AC 7a
checks that, and now it is not a hypothetical: the release decision is still the owner's, but
it is expected to be taken repeatedly rather than once (§8.1, O16).

What slicing buys, as of v2.2: the pipeline, the data shape, both locales and the rendering
are proven early **and** value reaches visitors in instalments. The second half is new — v2.1
stated explicitly that slicing did not buy it. See R2 and §11.1.

---

## 9. Acceptance criteria

Each is observable and checkable before the merge it applies to.

### 9.1 Content

Numbers are stable and are not reused. A criterion withdrawn by a later decision keeps its
number and says so, following the convention this document family uses for risks and for
context.md's open items.

1. Each merge into `dev` carries a complete slice: every place it introduces is complete in
   both locales. **Weight changed in v2.2**: a merge into `dev` is now one owner decision
   away from production (§8.1), not a staging step.
2. **WITHDRAWN in v2.2** `[owner, decision 2026-08-13]`. Was: "15 places is the completion
   target and the condition for the production release." No place count is committed and the
   set is compiled outside this project (§5.1); the release condition is separately removed
   by the incremental release (§8.1). Nothing replaces it — there is no size-based criterion
   and no state at which the catalogue is complete.
3. Every place has a non-empty name and short description **in both RU and EN**, and a map
   link. No place ships with a name or description filled in one language only.
   **Build-enforced since v2.2** `[owner, decision 2026-08-13]`: an unpaired place fails
   `npm run build`, so this is checked by the compiler and not by review (AC 22).
   The **map link is one per place and is not localised**
   `[owner, decision 2026-08-13]` — it left the RU/EN pairing requirement in v2.2 (§5).
   **Placeholder text is not a description** `[owner, decision 2026-08-13]`. `'TBD'` is
   non-empty and would pass the letter of this criterion, so the mechanism is the release
   queue in §5.1, not a review step: a place is linked only once its descriptions exist, and
   an unwritten place is therefore absent from the data rather than present with a
   placeholder.
4. RU and EN data ship in the same PR, with identical place ids in identical order (existing
   DoD rule). Also build-enforced since v2.2, via AC 3's mechanism.
5. Each place appears exactly once in the catalogue, however many programs visit it, and is
   **described once** — one record that programs reference
   `[owner, decision 2026-08-13]`. Structural since v2.2, not a matter of discipline: there
   is no second place to put a divergent description.
6. No place ships before the program that visits it — the catalogue contains no uncovered
   places in v1. **A build error since v2.2** `[owner, decision 2026-08-13]`, not a content
   rule. Cost of this, recorded where it lands: §13 item 1.
7. Every program whose places have shipped lists all of them. Order is free
   `[owner, decision 2026-08-13]` but **stable**: the same program shows the same places in
   the same sequence on every view and in both locales. Walking order is not required and is
   not claimed anywhere in the UI.
   7a. A program with no shipped places renders exactly as it does today — no empty section,
   no placeholder, no "coming soon". Checked on the homepage and on a date page before each
   merge into `dev`. Eight of the twelve programs are in this state today `[from code]`.
   7b. **REPLACED in v2.2** `[owner, decision 2026-08-13]`. Was: "the places list page never
   presents an incomplete catalogue as the finished one… the production release happens on
   the complete 15." The page now goes to production with its first place (§8.1), so an
   incomplete catalogue *is* the released state. **The page carries no marker about it** —
   no "growing list", no "more coming", no count, no progress note. The list is simply the
   list. This is now a positive criterion, checkable like any other, and it points the same
   way as AC 10 and AC 11: nothing on this page comments on its own completeness or on a
   place's availability.

### 9.2 Places list page

8. One page exists listing every place; each entry shows the place name as plain text, its
   short description, the map link as the labelled string of §7.4, and the **full** name of
   every program that visits it — `TourProgram.title`, not the short form `shortTitle`
   `[owner, decision 2026-08-17]`. The place name is not a link, here or anywhere else.
9. Every map link, opened manually, lands on the correct location. Checked **once per
   place** — the link is not localised since v2.2 `[owner, decision 2026-08-13]`, so there is
   one link to open, not two. Checked before merge; no automation claimed.
10. The page displays no photographs.
11. The page displays no coverage, availability or "no dates scheduled" marker. Kept free of
    conflict by the deferral in §4: the annotations the owner's source material carries
    ("Mondays only") would be availability markers `[owner, decision 2026-08-13]`.
12. The page is reachable from a tour description **and from the site footer**
    `[owner, decision 2026-08-13]`. The footer link is present on every page and is not the
    main navigation, which `[owner, 18]` ruled out. The footer **adds to** the
    tour-description entry and does not replace it `[owner, decision 2026-08-13]`, so this
    criterion requires both routes and fails if either is missing.
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
25. On the list page every program name inside an entry is a link, and following it brings the
    visitor to that program's card on the homepage **with the program's description visible,
    without a further tap, on any screen width** `[owner, decision 2026-08-17]`,
    `[owner, decision 2026-08-18]`. Three things are observable, and all three are checked: the
    card is scrolled to; the program list is expanded when that card was **not among those the
    homepage rendered initially**; and the card itself arrives open — including on a phone,
    where the homepage otherwise shows it as a collapsed teaser `[from code]`. Checked in both
    locales and on a phone, on a program outside the initially rendered set; §8 records when
    that first becomes observable.
    **Scope of the last clause, so it is not read wider than it is:** it applies to arrival
    through this link. The collapsed teaser is unchanged for every other route into the
    homepage — an ordinary visitor to `/` sees exactly what they see today, which is what AC 23's
    mobile check confirms. No new URL is introduced; AC 20 is unaffected.
26. Entries appear in alphabetical order of the place name as displayed, per locale
    `[owner, decision 2026-08-17]`. The two locales may order the page differently, so
    checking that RU and EN carry the same catalogue is a comparison of sets, not of lines.
    AC 4 (identical ids in identical order in the data files) is a different statement and is
    not affected.

### 9.3 Program and date views

15. Each program's description lists its places in the homepage accordion (§7.2) — the
    caption of §7.4 followed by the place names, **with no short descriptions, no map links
    and no link on the name** `[owner, decision 2026-08-17]` — in the program's own stable
    order (AC 7), with the day grouping where the program has one (AC 24).
    **How to check it until GitHub issue #53 is fixed** `[owner, decision 2026-08-17]`: the
    homepage renders the desktop shape on the server, so only the first three program cards
    are expanded in the rendered HTML `[from code]`, while context.md question 17 requires
    checking rendered output. Until #53 lands, check this criterion on a program among those
    three and take the rest from AC 16 — the date page carries the list in its HTML always.
    The defect itself is out of scope here: it predates this feature and is fixed on its own
    branch.
16. A date page lists the same places, in the same order, **in the same day grouping and in
    the same composition** (AC 15), as its program. Free order removes the obligation to match
    the route; it does not permit the two views of one list to disagree. Checked by opening a
    program in the accordion and its date page side by side.
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
    (context.md DEFINITION_OF_DONE, firm rule). This includes the day label of AC 24.
22. `npm run build` passes. **Since v2.2 this is also the content gate**
    `[owner, decision 2026-08-13]`: a place unpaired between RU and EN (AC 3) and a place no
    program visits (AC 6) both fail the build. `npx tsc --noEmit` is **not** a substitute —
    it aborts on `tsconfig.json(25,5): TS5101` and silently reports no errors
    (`.claude/architecture-places-of-interest.md` §8 A2; context.md question 34).
23. The PR states its Vercel preview URL and says a mobile check **is** needed — this
    feature changes markup and text, which is context.md's own trigger for it.
24. A program whose route is split across days shows that split, in both the accordion and
    the date page, identically `[owner, decision 2026-08-13]`. Today this is `Auswe` alone
    `[from code]`; every other program renders flat. The day label is a translated string
    with the number as a parameter, not a key per label (AC 21) — a key per label would
    repeat the `bonus` trap R11 records. Its wording is "Day {n}" / «День {n}» (§7.4) — one
    string, the number supplied at render. Checked by opening `Auswe` in both views.

---

## 10. Boundary with the architect

This document states *what* must be observable, not *how*. Left to the architect: where the
place data lives and in what shape, how a place is linked to a program, how the list page is
routed and rendered, and how the sitemap entry is produced. The constraints that bind those
choices are stated as requirements, not as designs: RU/EN parity as a pair (AC 3, 4), one
entry per place (AC 5), stable order (AC 7), the day grouping shown identically in both views
(AC 24), later gain of a photo without rewriting entries (R9), and later gain of walking
order and of pair annotations without rewriting entries (§6, §13 items 6–7).

**Three of these became the architect's mechanism rather than the reviewer's checklist**
`[owner, decision 2026-08-13]`: RU/EN parity (AC 3), one entry per place (AC 5) and no
uncovered place (AC 6) must fail the build. *That* they fail the build is a requirement; *how*
remains the architect's call, and `.claude/architecture-places-of-interest.md` §2.5 records
the mechanism chosen and §8 A2 the evidence that it fires.

**Three items land there in v2.3, all of them "what" here and "how" over there:**

- **The link from a catalogue entry to a program** (AC 25). This document requires the
  arrival — including from a card the homepage had not rendered, and **including the target
  card being open on arrival** `[owner, decision 2026-08-18]`, which adds a third thing the
  transition owes beyond scrolling and expanding the list. Where the missing step lives, and
  how "load all, open the target, go" is wired, is the architect's call with the coder.
- **The catalogue's alphabetical order** (AC 26). Locale-aware comparison is a mechanism, not
  a requirement. `.claude/architecture-decisions-places-of-interest.md` §2 currently records
  the opposite decision and needs correcting there.
- **The third invariant, "the linking table is never empty"** (§5.1). Answered: the architect
  holds it in the build, by a type assertion inside the linking table (§2.6 there). This
  document required the state not to exist; how it is prevented was, and stays, his.

---

## 11. Risks

Numbers are stable and are not reused. R1, R8 and R12 were closed in earlier revisions and
are recorded in [D §6]; the gaps below are theirs. **R2 and R3 were rewritten in v2.2 and
kept their numbers and their rows** — neither closed, both changed shape and severity, and
both say what they used to say. **R13, R14 and R15 are new in v2.2.**
**R4 is closed in v2.3**: the catalogue now links to programs (§7.1, AC 25), so the absence it
named — a place can say a program's name but cannot reach it — no longer exists. Its row is
removed and the closure is recorded in [D §6]. **R16 and R17 are new in v2.3.**

| # | Risk | Source | Severity |
|---|---|---|---|
| R2 | **Content is the critical path and now has no end either.** Rewritten in v2.2. The descriptions still do not exist — 30 places committed, every `description` a `'TBD'` placeholder `[from code]` — and they still pass through one person at roughly one batch every 2–3 weeks. What changed: the release no longer waits for them all `[owner, decision 2026-08-13]`, so value is no longer withheld until the last text; and no count is committed `[owner, decision 2026-08-13]`, so there is no longer a number this risk can be sized against or a completion date it can miss. It became smaller as a delivery risk and less legible as a schedule risk. | `[owner, 4, 5]`, `[owner, decision 2026-08-13]`, `[from code]` | medium *(was high)* |
| R3 | **Discoverability, mitigated in v2.2.** Rewritten. Entry was from the tour description only, inside a homepage accordion a search visitor never opens. The footer link `[owner, decision 2026-08-13]` is present on every page and crawlable, so the page now has a site-wide internal link — which is also the first thing the SEO goal in §2 needed. What remains: the footer is a weak position, and no main-navigation entry exists, which `[owner, 18]` ruled out. **The downgrade is this document's reading of a decision that did not rate it**; the mitigation is the owner's, the severity is not. | `[owner, 18]`, `[owner, decision 2026-08-13]` | low *(was medium)* |
| R5 | **Double representation.** The same object can show as a place in the list and as a bonus label on the same date page. Accepted deliberately, but it will look like a bug to anyone who did not read this. | `[owner, 21]` | low |
| R6 | **Terminology.** "Event" now covers a tour date *and* a one-off city occurrence. Resolved in this document's prose only, not in the code, and no vocabulary will be agreed while this feature is built `[owner, decision 2026-08-13]`. Mitigation is the standing rule in §1. | context.md q24, `[owner, 15]`, `[owner, decision 2026-08-13]` | medium |
| R7 | **v1 must not make per-place pages more expensive later** — the standing instruction context.md attaches to question 16 — but there is no per-place content yet to verify that against. | `[owner, 12]` | medium |
| R9 | **Photos deferred.** Entries must be able to gain a photo later without being rewritten. `images.unoptimized: true` `[from code]` means nothing resizes images automatically, so whenever photos arrive, sizing is a manual content step and a Core Web Vitals exposure. | `[owner, 13]`, `[from code]` | low |
| R10 | **The 2027 reviews link needs a dimension that does not exist.** `Reviews!A:F` column C is a *program* id, and `FeedbackForm` does not collect a place. Linking reviews to places is not a display change. | `[from code]`, context.md q31 | low (later) |
| R11 | **`bonus` as a mechanism is unfit for city happenings.** A rodeo on one Saturday needs a one-off label, but `bonus` holds a translation key requiring edits to both `messages/*.json` plus a deploy. Untouched by decision, so the cost stays. AC 24's day label is deliberately built the other way — a parameter, not a key per label — so this feature does not add a second instance of it. | `[owner, 15, 17]`, context.md GLOSSARY | low (deferred) |
| R13 | **Duplication with the program's own copy.** `TourProgram.highlights` and `TourProgram.description` `[from code, types/tour.ts]` already name sights in prose, so one accordion can name the same site twice — once in the program text, once in the place list. Kept deliberately `[owner, decision 2026-08-13]`, and **both lists confirmed to stay** `[owner, decision 2026-08-17]` — provisionally: the owner's word is «пока». Same shape as R5, same consequence — it will read as a bug to anyone who did not read this. The duplicated on-page text shrank in v2.3: the place list in the accordion is now names only (§7.2), so what repeats is a name, not a description. | `[owner, decision 2026-08-13]`, `[owner, decision 2026-08-17]`, `[from code]` | low |
| R14 | **Which places belong is a judgment with no test.** New in v2.2. AC 2 is withdrawn and `[owner, 1]` is a description, not a criterion `[owner, decision 2026-08-13]`: nothing in these documents can say a proposed place does not belong. Membership is judged outside the project (§5.1) and is revisable (§13 item 8). What this does **not** cost, since O13 was answered: coverage still has a boundary — the owner plans to cover **all 12 programs** `[owner, 14]`, `[owner, decision 2026-08-13]`, and the program set is finite and enumerable `[from code]`, so "every program has a list" remains a sayable completed state even though "the catalogue holds the right places" does not. What remains: the criteria can check an entry, never the set. Mitigated by shape, not by process — a removal costs no URL (§5). **Severity is this document's read**, lowered once O13 closed. | `[owner, 1]`, `[owner, 14]`, `[owner, decision 2026-08-13]` | low *(medium before O13 was answered)* |
| R15 | **A second day that exists on the page and nowhere in the schedule.** New in v2.2. Only day 1 is scheduled; day 2 is not marked in the calendar at all `[owner, decision 2026-08-13]`, while the place list shows a "Day 2" group `[owner, decision 2026-08-13]`. Two observable consequences, both accepted: a visitor sees day-2 places on a page whose date is a single day, with the second date stated nowhere; and the calendar shows a two-day program as a one-day entry. A third is mechanical and worth knowing before the first such date is added `[from code]`: past-versus-upcoming is decided from that single `date`/`time` via `parseCentralTime`, so the event leaves "upcoming" once day 1 has passed — while day 2 is still ahead. **Dormant today** — no `Auswe` date exists in `data/upcomingTours.ts` or `data/RecentTours.ts` `[from code]`; it activates the first time one is scheduled. | `[owner, decision 2026-08-13]`, `[from code]` | low |
| R16 | **A place and a meeting point can be the same physical site under two names.** §6 forbids any link between the two, so a date page can show one object twice, in two blocks, under two names — `landOffice` in the place list is today's Capitol Visitors Center, which is also `Haust`'s meeting point `[from code]`. Neither R5 (bonus) nor R13 (`highlights`) covers this neighbour. **Dormant:** only `capitol` is linked in the data today `[from code]`; it activates when that place ships. **No owner answer exists** — design raised it as thread D14 and it went unanswered, and choosing one name for the object is an open question of the architecture document (§10 item 6 there). Nothing here treats it as settled: what is settled is only that the two entities are not linked `[owner, 16]`. | `[owner, 16]`, `[from code]` | low |
| R17 | **The Russian catalogue reads as two alphabets.** New in v2.3. The order is alphabetical by the displayed name (§7.1, AC 26) `[owner, decision 2026-08-17]`, and in the Russian collation Latin sorts before Cyrillic — while roughly a third of the compiled set carries a Latin name in Russian too (`Old Bakery & Emporium`, `Millett Opera House`, `Norwood Tower`, `Austin History Center`, `North Cottage`, `Chateau Bellevue`, `Southwestern University`) `[from code, .claude/architecture-places-of-interest.md §9]`. So the RU page runs one alphabet and then another. This is a consequence of the owner's decision, recorded rather than fixed — **and recorded so that it is not filed as a defect**: it is the correct output of an alphabetical sort, not a sorting bug. It changes nothing the criteria check (AC 26 asserts the order, not its pleasantness). Reversing it would need a decision the owner has not been asked for. | `[owner, decision 2026-08-17]`, `[from code]` | low |

### 11.1 Combinations that change the decision

- **R2 + AC 1–7 — reversed in v2.2.** v2.1 read: slicing removed the all-or-nothing property
  from *merging*, not from *releasing*, so R2 stood undiminished as schedule risk. The
  incremental release `[owner, decision 2026-08-13]` removes it from releasing too. What the
  pair says now is the opposite and smaller: each slice is publishable, so a stalled content
  pipeline degrades the page's *depth* rather than blocking its existence. The residue is
  that "how deep is deep enough to publish" has no criterion — AC 2 is withdrawn and AC 7b
  with it (O12).
- **R3 + R2 — weakened in v2.2, and it matters for a decision outside this feature.** v2.1
  called this pair "the strongest argument for revisiting context.md q16": an audience
  bounded by an accordion interaction search visitors never perform, reached at a cost of 30
  texts. Both halves shrank — the footer gives a site-wide entry (R3), and the first place
  publishes without waiting for the rest (R2). The argument for q16 is correspondingly
  weaker, and **anyone reaching for this pair as evidence should take it at its v2.2
  strength, not its v2.1 strength.**
- **R13 + R5 + R16.** Three accepted duplications meet on one date page, so a single object
  can be named up to four times: in the program's `highlights` prose, in the place list, as a
  `bonus` label, and — once `landOffice` ships — as the meeting point under a different name.
  None is treated in v1 (§4). All surface in the same view, which is where a later fix
  would go; recorded together so the *combined* appearance is not mistaken for a new defect
  when someone first sees them at once.
- **R5 + R6.** Double representation and the third meaning of "event": a place list, a bonus
  label and a tour date all render together. No
  fix happens in this feature (naming is out of scope, `bonus` is a non-goal), so the pair is
  carried, not treated. Both surface on the date page, which is where a later fix would go.
- **R9 + R10.** Both are content-model debts payable in later versions; neither should
  influence the v1 decision, and they are named here so they are not counted into it.

---

## 12. Open items

O0–O20 are closed; the records are in [D §3]. Numbers continue from there and are not reused.

**None.** The architect's review of PRD v2.3 (`.claude/architecture-places-of-interest.md`
v1.1, §10 items 7–9) raised two, O19 and O20, and the owner answered both the same day; what
each settled is stated where it applies — §7.4 and §2.1 for the strings, AC 25 and §10 for the
arrival. Of the design objections in `.claude/answers.md`, eleven of fourteen carry an owner
answer and v2.3 carries those answers; the other three (D11, D12, D14) need none — their
remainders are design's, or already stated in AC 9 and R16.

What remains before release is content (R2), not decisions.

---

## 13. Deferred to later versions

In the order the owner raised them:

1. Places not visited by any program, with a call to action to request a custom tour
   `[owner, 9]` — reopens context.md question 3. **Its cost changed in v2.2**: such a place
   is now a build error `[owner, decision 2026-08-13]`, so this is no longer "add a feature"
   but "remove an invariant and then add a feature". Cheap while the invariant is young;
   recorded now so the later work is not costed from the v2.1 text.
2. Photos per place `[owner, 13]`.
3. A page per place, once content justifies it `[owner, 3, 12]`.
4. Reviews attached to places — not before 2027 `[owner, 12]`.
5. A `bonus` refactor `[owner, 17]`.
6. **Walking order — explicitly v2** `[owner, decision 2026-08-13]`: place lists follow the
   route instead of a free order. Constraint this puts on v1, stated in §6: it must arrive
   without rewriting place entries that have already shipped.
7. **Annotations on a place within a program** — "we go inside here", "Mondays only"
   `[owner, decision 2026-08-13]`. The text exists in the owner's source material and is not
   carried into v1 (§4). When it arrives it is a property of the **program↔place pair**, not
   of the place, per the owner's own framing — so, like walking order and the day grouping,
   it can be added without rewriting a shipped place entry (§6). Note for whoever picks it
   up: an annotation of the "Mondays only" kind is an availability marker, which AC 11
   currently forbids on the list page; that criterion is what would have to move, and it is
   sourced `[owner, 11]`.
8. **Dropping a place, and changing a route** `[owner, decision 2026-08-13]`. A place that
   turns out not to interest visitors may be removed from the list, and the route itself may
   change. Both are **out of scope here** — v1 neither performs nor plans such a change, and
   nothing in §9 checks for one. Recorded because two statements elsewhere lean on it: §2.1's
   best-case reading of the day-60 metric assumes nothing is removed inside the measurement
   window, and §5 notes that a removal costs no URL when it does happen (AC 20). Mechanically
   it is an edit to the same data the sets arrive in (§5.1), not new work in this feature.
