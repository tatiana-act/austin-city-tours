# PRD: Places of Interest (POI)

version: 1.0 | date: 2026-08-13 | status: ready for review, not started
source: interview with the owner, 21 questions, 2026-08-13
companion: `.claude/context.md` (v1.0, 2026-08-11) — on conflict, context.md wins

Written in English because the interview was in English; `.claude/context.md` is in
Russian. Nothing here is invented: every statement is either an owner answer (marked
`[owner, Nn]` with the question number) or a fact read from the repository
(`[from code]`). Where an answer was missing it is recorded as a risk, not filled in.

---

## 1. Terminology

The word "event" is already taken twice over, and this feature adds a third meaning.
Context.md flagged this as a mine (GLOSSARY, question 24); it now goes live. Terms
used in this document, and proposed for the code and for future conversation:

| Term | Meaning | Existing code |
|---|---|---|
| **Place** (POI) | A physical site in Austin or nearby, worth telling about *and* worth visiting `[owner, 1]` | new |
| **Program** | A permanent route, reusable, no date | `TourProgram`, `data/tours.ts` |
| **Tour date** | One occurrence of a program on a specific day | `UpcomingTourEvent`, id `tour74` |
| **City happening** | A one-off occurrence in the city on a given day — rodeo, festival, concert `[owner, 15]`. Not a place: not permanent, not visitable outside its day | none; currently expressible only through `bonus` |
| **Bonus** | Something a tour date includes beyond the standard route. May *be* a place, may be a city happening `[owner, 8, 15]` | `UpcomingTourEvent.bonus` |
| **Meeting point** | Where the group assembles. A separate entity, never a place `[owner, 16]` | `TourProgram.meetingPoint` |

⚠️ Needs the owner's confirmation: "city happening" as the name for the third
meaning. Until it is confirmed, do not introduce `event` into any new identifier.

---

## 2. Goal

`[owner, 2]` The stated purpose of this feature is **organic search traffic**, in line
with the standing product priority in context.md DOMAIN.

**The stated goal is not achievable by the shape agreed in this PRD, and this is
recorded rather than resolved.** Search traffic on places arrives on place-name
queries ("Driskill Hotel history", «музей О'Генри Остин»). A single list page can rank
for approximately one such query, not for 15–20. `[owner, 3]` The owner ruled out a
page per place because the available content per place is thin and a dedicated page
would disappoint the visitor — which is a correct read of both the visitor and of how
thin pages are ranked.

Therefore the **goal this release is accountable for** is the narrower one:

> A visitor reading about a tour can see which places that tour visits, and can find
> those places on a map.

The search goal remains open and unmet. `[owner, 12]` It becomes reachable only when
the content per place grows — the intended growth is visitor reviews attached to
places, which will not exist before 2027. See Risk R1.

## 3. Non-goals

Explicitly out of scope for v1, each with the answer that put it there:

- A page per place `[owner, 3]`.
- Photos of places `[owner, 13 revised]` — v1 is text only.
- Places that no program visits `[owner, 9]` — the catalogue is drawn entirely from
  existing routes in v1.
- Any call to action about a custom tour `[owner, 9]`. This matters: it would reopen
  context.md question 3, where the owner decided the individual-tour path is
  deliberately not being improved. v1 does not reopen it.
- Any change to `bonus` `[owner, 17]`.
- Any change to `meetingPoint` / `meetingPointLink` `[owner, 16]`.
- Any link between places and reviews `[owner, 12]` — direction for 2027.
- Any coverage or availability marker `[owner, 11]`.
- Permanent pages per program — untouched, still context.md question 16, still
  explicitly not started.

---

## 4. The Place entity

`[owner, 1]` A place is any Austin-area sight worth telling about and worth visiting.
It is **not** a projection of the tour catalogue: conceptually the catalogue may be
larger than what tours cover. `[owner, 9]` In v1 it happens to coincide, because only
places visited by existing programs are included.

Fields, per locale (RU and EN):

| Field | Required | Notes |
|---|---|---|
| name | yes | |
| short description | yes | `[owner, 3]` short by design |
| map link | yes | `[owner, 19]` Google Maps or OpenStreetMap, owner's pick. Precedent: every `meetingPointLink` today is a `maps.app.goo.gl` short link `[from code]` |
| photo | **no** | `[owner, 13 revised]` deferred; entries must be able to gain one later without being rewritten |

A place appears in the catalogue **once**, regardless of how many programs visit it.

### Content pipeline

`[owner, 4]` The guide writes the text in Russian; the owner adjusts it and
translates it to English; the owner commits it. `[owner, 5]` **No place text exists
today in either language.** Content creation is inside this feature's scope, not a
precondition someone else satisfies.

`[owner, 6]` **15–20 places in the first release** → 30–40 texts to produce through a
single person. Context.md records the owner's historical content rhythm as roughly one
batch every 2–3 weeks. This is the critical path; the rendering work is not. See R2.

Existing project rule that applies unchanged (context.md DEFINITION_OF_DONE): RU and
EN ship as a pair in one PR, same ids in the same order. A place with no English text
cannot ship.

---

## 5. Relations

### Place ↔ Program

`[owner, 11]` The link hangs off the **program** — the permanent entity — never off
the schedule. Reason given: the schedule is irregular, sometimes only 1–2 dates exist,
and anything schedule-driven would make places look unavailable.

`[owner, 7]` Places are listed in **walking order of the route**. Position therefore
belongs to the program↔place pairing, not to the place: the same place can be third on
one route and first on another. The owner phrased this as a preference ("sounds nice");
this PRD states it as a requirement, because a wrong order is visible to anyone who
takes the tour. Flagged as O4 if the owner disagrees.

`[owner, 14]` **All 12 programs get a place list.** Three of them are named after a
single site and will have a list of exactly one place — a valid, deliberate case, not
an error:

- `Albjwc` — Wildflower Center tour (the owner will add the centre itself as a place
  "for consistency")
- `Amhry` — O. Henry Museum
- `Milt` — Millett Opera House

The full set of program ids `[from code, data/tours.en.ts]`: `Acap`, `Haust`, `Gcrt`,
`Rrock`, `Brmn`, `Auswe`, `Auhnry`, `Hyde`, `Acstm`, `Albjwc`, `Amhry`, `Milt`.

### Place ↔ Tour date

`[owner, 21]` **No link.** A tour date shows exactly its program's place list, in the
program's order.

`[owner, 8]` A bonus *can be* a place in the real world — indeed the five existing
bonus keys `bonusMuseum`, `bonusCap`, `bonusHenryMuseum`, `bonusChat`, `bonusMillet`
are all added stops `[from code]`. `[owner, 21]` But when a bonus is a place, **it is
still displayed as a bonus and is never merged into the place list.** `[owner, 17]`
The `bonus` field, its translation-key mechanism and its rendering are untouched.

Consequence, accepted deliberately: the same real object can appear twice on one date
page — once inside the place list (because the program visits it) and once as a bonus
label. The O. Henry Museum is the extreme case: it is a program (`Amhry`), a stop
inside another program (`Auhnry`), and a bonus key (`bonusHenryMuseum`). See R5.

### Place ↔ Meeting point

`[owner, 16]` None, in either direction. Proximity is irrelevant; a meeting point
exists to assemble the group. If the Texas Capitol is in the catalogue it is because
tours *visit* it, not because `Acap` meets at its south gates. No deduplication, no
cross-linking.

---

## 6. Views

### 6.1 Places list page

One page listing all places `[owner, 3]`. Per entry: name, short description, map
link, and the names of the programs that visit it. No photos `[owner, 13 revised]`, no
availability marker `[owner, 11]`.

`[owner, 18]` **Entry point: the tour description.** Not the main navigation.
Consequence, accepted: the tour catalogue lives as accordions on the homepage (there
are no permanent program pages), so the route to this page runs through an expanded
accordion on `/`, and a visitor who never opens a tour never learns it exists. See R3.

Place → program is reachable by **name only**. There is no durable link target:
programs have no permanent pages (context.md question 16) and date pages expire and
are deliberately excluded from `sitemap.ts`. See R4.

### 6.2 Program view (homepage accordion)

`[owner, 20]` Each program's description shows its own places, in walking order.

### 6.3 Tour date page (`/[locale]/tours/[tourEventId]`)

`[owner, 20]` Repeats the program's place list, in the same order, so a visitor does
not have to go find the program. `[owner, 21]` Identical content to 6.2 in v1.

---

## 7. Acceptance criteria

Each is observable and checkable before merge.

**Content**

1. The catalogue contains between 15 and 20 places.
2. Every place has a non-empty name, short description and map link **in both RU and
   EN**. No place ships with a field filled in one language only.
3. RU and EN data ship in the same PR, with identical place ids in identical order
   (existing DoD rule).
4. Each of the 12 programs lists at least one place.
5. Every place in the catalogue is visited by at least one program — the catalogue
   contains no uncovered places in v1.
6. Each place appears exactly once in the catalogue, however many programs visit it.

**Places list page**

7. One page exists listing every place; each entry shows name, short description, map
   link and the names of the programs that visit it.
8. Every map link, opened manually, lands on the correct location. Checked per place
   before merge — 15–20 manual checks, no automation claimed.
9. The page displays no photographs.
10. The page displays no coverage, availability or "no dates scheduled" marker.
11. The page is reachable from a tour description.

**Program and date views**

12. Each program's description lists its places in walking order.
13. A date page lists the same places, in the same order, as its program.
14. A date's `bonus` renders exactly as it does today, in its current position, and
    never inside the place list — including when the bonus names a place that is also
    in the catalogue.

**Non-regression**

15. `meetingPoint` and `meetingPointLink` are unchanged and are never rendered as part
    of a place list.
16. The `bonus` field, its translation-key resolution and its rendering are unchanged.
    No new bonus translation keys are added by this feature.
17. Exactly one new URL is introduced: the places list page. No per-place URLs.
18. No visitor-facing string is hardcoded in JSX; all of them come through next-intl
    (context.md DEFINITION_OF_DONE, firm rule).
19. `npm run build` passes.
20. The PR states its Vercel preview URL and says a mobile check **is** needed — this
    feature changes markup and text, which is context.md's own trigger for it.

---

## 8. Risks

| # | Risk | Source | Severity |
|---|---|---|---|
| R1 | **The stated goal is not met by the agreed shape.** Search traffic wants per-place pages; the owner ruled them out because content is thin. v1 delivers a page visitors may like and search will not find. Reachable only once content grows (2027 reviews). | `[owner, 2]` vs `[owner, 3, 12]` | high |
| R2 | **Content is the critical path and has no date.** 30–40 texts, none of which exist, written by the guide and translated by one person whose historical rhythm is one content batch every 2–3 weeks. No launch date can be committed from this PRD. | `[owner, 4, 5, 6]` | high |
| R3 | **Discoverability.** Entry is from the tour description only, inside a homepage accordion; not in navigation. | `[owner, 18]` | medium |
| R4 | **Place → program has no durable link target.** Programs have no permanent pages; date pages expire and are excluded from the sitemap on purpose. Places can name tours but not link to them stably. | `[from code]`, context.md q16 | medium |
| R5 | **Double representation.** The same object can show as a place in the list and as a bonus label on the same date page. Accepted deliberately, but it will look like a bug to anyone who did not read this. | `[owner, 21]` | low |
| R6 | **Terminology.** "Event" now covers a tour date *and* a city happening. Resolved in this document's prose only; not in the code. | context.md q24, `[owner, 15]` | medium |
| R7 | **v1 must not make per-place pages more expensive later** — the same standing instruction context.md attaches to question 16 — but there is no per-place content yet to verify that against. | `[owner, 12]` | medium |
| R8 | **Domain ordering.** Context.md question 12 says connect `austin-city-tours.com` **before** adding permanent indexable pages, to avoid indexing them twice. The places list page is exactly such a page. Sequencing decision needed — see O1. | context.md q12 | medium |
| R9 | **Photos deferred.** Entries must be able to gain a photo later without being rewritten. Note also that `images.unoptimized: true` means nothing resizes images automatically, so whenever photos arrive, sizing is a manual content step and a Core Web Vitals exposure. | `[owner, 13]`, `[from code]` | low |
| R10 | **The 2027 reviews link needs a dimension that does not exist.** `Reviews!A:F` column C is a *program* id, and `FeedbackForm` does not collect a place. Linking reviews to places is not a display change. | `[from code]`, context.md q31 | low (later) |
| R11 | **`bonus` as a mechanism is confirmed unfit for city happenings.** A rodeo on one Saturday needs a one-off label, but `bonus` holds a translation key requiring edits to both `messages/*.json` plus a deploy. Untouched by decision, so the cost stays. | `[owner, 15, 17]`, context.md GLOSSARY | low (deferred) |

---

## 9. Open items

Decisions this PRD cannot make.

- **O1.** Does the places list page ship before or after the `.com` domain is
  connected? Context.md question 12 asks for permanent pages to come after.
- **O2.** Map provider: Google Maps or OpenStreetMap `[owner, 19]`. Existing precedent
  in the repo is Google Maps short links.
- **O3.** Confirmation of the term "city happening" (§1), so `event` is not overloaded
  a third time.
- **O4.** Is walking order a hard requirement? The owner's answer was a preference;
  this PRD states it as required.
- **O5.** The page's visible title and its URL wording — unspecified, and it is the one
  SEO-relevant string in a feature whose stated goal is search.
- **O6.** Does the places list page go into `sitemap.ts`? Sitemap membership in this
  project is always a deliberate decision, never a default.

## 10. Deferred to later versions

In the order the owner raised them:

1. Places not visited by any program, with a call to action to request a custom tour
   `[owner, 9]` — reopens context.md question 3.
2. Photos per place `[owner, 13]`.
3. A page per place, once content justifies it `[owner, 3, 12]`.
4. Reviews attached to places — not before 2027 `[owner, 12]`.
5. A `bonus` refactor `[owner, 17]`.
