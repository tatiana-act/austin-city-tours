# Decisions: Places of Interest (POI)

Companion to `.claude/prd-places-of-interest.md`. The PRD says what to build; this file says
what was weighed, what was decided, and what each decision cost. Nothing here is a
requirement — an implementer who reads only the PRD is not missing an instruction.

Markers are the PRD's: `[owner, N]` — answer to interview question N (21 questions,
2026-08-13, in English). `[owner, decision 2026-08-13]` — a decision taken *after* the
interview, on a question the PRD put to the owner. `[from code]` — read from the repository.

**The interview has never been repeated.** Across every revision, no `[owner, N]` statement
has been added, altered or removed. The two markers are kept separate on purpose: `N` always
points at one of the 21 interview questions, and folding later statements into that numbering
would destroy the only guarantee these documents make about their own facts.

---

## 1. Revision history

| Version | What changed |
|---|---|
| v1.0 | First PRD from the interview. |
| v1.1 | Reworked against updated PM rules: alternative shapes instead of a recorded conflict, a metric per goal, risk combinations, an incremental slice, user stories. |
| v1.2 | Split metrics, user stories, views and acceptance criteria **by shape** rather than describing one shape as decided, while O0 was still open. |
| v1.3 | Closed R8 and O1: the `.com` domain is connected and canonicalised, so the sequencing question those two held is settled `[from code, lib/site.ts]`. |
| v1.4 | Recorded the answer to O0 and collapsed the per-shape split into the one chosen shape; introduced the `[owner, decision <date>]` marker; rebuilt slicing around the `dev` → `main` process; recorded traffic baselines; reduced the baseline criterion from a release gate to a refinement. |
| v1.5 | Closed O2 (Google Maps), O3 (naming out of scope), O4 (free order, walking order to v2), O6 (page goes into the sitemap); partially closed O5 and O7. |
| v1.6 | Closed O7 and R12: the repeat reading is set at 60 days and is final; the page-views metric is dropped, leaving one measured goal, so the wider statement stops being called a goal. |
| **v2.0** | **Split into two documents.** The PRD keeps the specification; this file takes the alternatives, the closed items, the closed risks, the rationale and this history. No fact was dropped and none was added. Acceptance criteria were **renumbered** into ordered blocks — the v1.6 list placed AC 23 before AC 22, and nothing outside these two documents referenced those numbers. Sub-numbering is retained only where an item qualifies its parent (`7a`, `7b` — the intermediate-state counterparts of AC 7). Risk numbers were **not** renumbered. |
| **v2.1** | Slicing moved out of the acceptance criteria into its own §8 Release plan — it is a plan, not an observable criterion — and the sections below it shifted by one. The measurement criterion (v2.0 AC 24) was deleted: it asserted a condition already satisfied, and its one live instruction, the optional Search Console reading, moved into PRD §2.1. Two remnants of self-explanation removed, and the URL-segment rationale in §7.1 cut to its result. |

---

## 2. The shape: what was weighed

Four shapes were put against the same facts. None required new owner answers, only a
decision. Descriptions are unchanged from v1.2.

**A. Places inside permanent program pages** (context.md q16). The same texts, placed on
pages that can rank — "Hyde Park walking tour" is a query a program page answers, and the
place names inside it carry the long tail. Cost: q16 is the project's largest fork and the
owner has said not to start it. This shape *dissolves* R4 and R7 rather than managing them.

**B. Thin slice, no new page.** Places render only inside the program accordion and the date
page. No list page, no new URL, 3–5 places instead of 15–20. Serves the delivery statement
for visitors who already opened a tour, costs roughly a tenth of the content, and proves the
pipeline before 30–40 texts are commissioned. Does nothing for search.

**C. Do not build now.** Defer until content per place is deep enough to justify per-place
pages — the owner's own reasoning in `[owner, 3, 12]`, applied to the timing rather than to
the page count.

**D. Keep the agreed shape, change the goal it answers.** One list page can rank for
approximately one query — so name that query («что посмотреть в Остине» / "places to see in
Austin"), write the page for it, and measure it. Keeps every owner decision intact and makes
the goal honest instead of unmet.

Recommended at v1.2, superseded by the decision below: **B now, A next**, with D as the
fallback if the list page ships anyway — B being the only shape whose dominant risk (R2,
content) is bounded before it is taken.

### 2.1 The decision — closes O0 `[owner, decision 2026-08-13]`

> «строим B, но для 15 POI, и записанное в D»

**What gets built:** places render in the program accordion and on the date page — B's
rendering — **and** the places list page ships, written for and measured by the one named
query D identifies. The catalogue is **15 places**.

**The reading this is taken under, stated so it cannot be re-read later.** "записанное в D"
is taken to mean *the list page ships*, because D's defining content is that page plus the
honest narrowed goal attached to it; without the page there is nothing to target a named
query with, and D's metric could not exist. A second reading is available and consistent —
that the decision is D with 15 places (the low end of `[owner, 6]`), built B-style, thin
slice first — and it produces **the same artifact**: list page, accordion, date page, 15
places, one named query. Since the two readings converge on what is built, no question is
raised on them. A third reading — D's metric without D's page — is rejected as internally
impossible, not chosen against: a named query with no page to rank cannot be measured. If
that was what was meant, say so, and O8 and O9 come back with it.

**Both strings D sketched were later adopted as the page's titles** «Что посмотреть в
Остине» and "Places to see in Austin" `[owner, decision 2026-08-13]`. What was this
document's draft is now the owner's decision — see O5.

### 2.2 The cost of 15 places

Cutting the catalogue to 3–5 was refused outright `[owner, decision 2026-08-13]`:

> «я не могу выкатывать в прод только 5 мест, смысла не имеет»

So 15 is a decision with a reason, and the reason is about **production**: a five-place
catalogue is not something the owner is willing to show visitors. It sits inside
`[owner, 6]`'s 15–20, so there is no conflict with the interview — but it removes the single
largest advantage the recommendation rested on. At 3–5 places R2 was bounded *before* the
work was commissioned; at 15 places it is 30 texts through one writer at one batch every 2–3
weeks, which is R2 at close to full size. Slicing no longer bounds R2 by releasing value in
parts; it only lowers technical risk early.

### 2.3 Not chosen: A

The hold context.md question 16 puts on permanent program pages stays in force and is not
touched by this feature. R4 and R7 therefore stand as risks rather than dissolving, and R3
stands as accepted rather than fixed.

Worth recording for whenever q16 is revisited, without reopening it here: with impressions at
essentially zero the site is invisible in search, and the case for A — pages that can rank
for tour queries — is stronger than this document could have argued before those figures
existed. That is an argument for a later decision, not a reason to revisit one just taken.

---

## 3. Closed open items

Numbers are retained and never reused, following context.md's convention.

- **O0. CLOSED v1.4** `[owner, decision 2026-08-13]`. Was: build this at all, and in which
  shape (A/B/C/D)? Answer, reading and cost in §2.
- **O1. CLOSED v1.3 — no decision left to make** `[from code, lib/site.ts]`. Was: does the
  list page ship before or after the `.com` domain is connected? The domain is already
  connected and canonicalised — `lib/site.ts:22` is `https://www.austin-city-tours.com`, and
  `lib/site.ts:9-12` records the apex and the old `.vercel.app` host answering 308 to `www` —
  so context.md question 12's ordering requirement is met ahead of anything this feature
  could publish.
- **O2. CLOSED v1.5** `[owner, decision 2026-08-13]`: «пусть пока остается гугл, это легко
  поменять». Map provider is **Google Maps**, provisionally, chosen from the two options in
  `[owner, 19]` (Google Maps or OpenStreetMap), and matching the `maps.app.goo.gl` precedent
  already in the repo `[from code]`. Cost of reversing it: §5.
- **O3. CLOSED v1.5 — out of scope, not resolved** `[owner, decision 2026-08-13]`: «это за
  рамками данного проекта». Was: confirmation of a name for the third meaning of "event". The
  question leaves this feature; the ambiguity does not. Consequences: "city happening" stays
  a label local to the PRD, the ban on `event` in new identifiers holds **unconditionally**
  (it was never contingent on O3 being answered — it exists precisely because the third
  meaning has no agreed name, which is now the settled state rather than a temporary one),
  and R6 remains live at unchanged severity.
- **O4. CLOSED v1.5** `[owner, decision 2026-08-13]`: «пусть места будут в произвольном
  порядке, для v2 можем включить соответствие порядку обхода». Was: is walking order a hard
  requirement? Not in v1. This closed a question the PRD had raised against itself — see §5.
- **O5. CLOSED v1.5 — fully answered** `[owner, decision 2026-08-13]`, across two replies:
  «новая страница "Что посмотреть в Остине"» and «английский заголовок ок, слово для адреса
  places». Titles, segment and full addresses are consolidated in PRD §7.1. The segment is
  free of collisions in the repository `[from code]`.
- **O6. CLOSED v1.5** `[owner, decision 2026-08-13]`: «новая страница "Что посмотреть в
  Остине" - в sitemap». Recorded so nobody reopens it: sitemap membership in this project is
  always deliberate — the file's own comment excludes date pages because they expire into
  soft-404s `[from code, app/sitemap.ts]` — and the list page is the opposite case, permanent
  and meant to rank. The sequencing condition that could have conflicted (context.md q12:
  connect the domain before adding indexable pages) was already satisfied and closed in v1.3
  as R8/O1.
- **O7. CLOSED v1.6 — fully answered**, across four answers over the same day
  `[owner, decision 2026-08-13]`: «смотрим показы и клики через 30 дней после выката в
  прод», «3 клика, 20 показов в неделю», «пересчитываем», «да, второй замер 60 дней». The
  resulting schedule and threshold are in PRD §2.1; the readings this document applied and
  the reasoning behind them are in §4 below.
- **O8. CLOSED v1.4 — removed by the choice of shape, not decided separately.** Was: does US2
  rule out shape B, which produces no transferable URL? The chosen shape ships the list page,
  so US2 is served and the question has no subject. **The v1.1 sentence claiming the page
  "survives as its own URL under shape B" stays withdrawn:** the page exists because the
  owner chose it, not because B allowed it.
- **O9. CLOSED v1.4 — removed by the choice of shape.** Was: is a release acceptable when
  nothing can measure it? Asked about *pure* B, which by construction had no metric; the
  owner answered **yes**. Two readings were open — that the yes lapsed with the shape, or
  that it meant "do not gate the release on measurement" — and the question mattered only
  because a missing baseline would have made the goal permanently unverifiable. With both
  baselines reported (O10) the two readings no longer differ in consequence.
  **Why that yes reads as consistent, not careless:** accepting a release that cannot be
  judged looks very different against a site receiving 0–2 views a day and almost no
  impressions than against one with traffic to protect. At this base almost any measurement
  would be indistinguishable from noise, so the owner was declining a number that would not
  have told them much anyway.
- **O10. CLOSED v1.4 — removed by fact, not by decision.** Was: does a Search Console
  impressions snapshot gate the production release? It mattered only because a missing
  baseline would have made the stated goal permanently unverifiable. The owner reported both
  baselines, so nothing perishable is left to lose. The baseline stopped being a release
  condition and became an optional refinement, noted in PRD §2.1.

---

## 4. The metric: what was decided and what it cost

### 4.1 The second metric was dropped `[owner, decision 2026-08-13]`

> «число показов кроме поиска меняется всплесками, зависит от рекламы в соцсетях. Не нужно
> отдельно учитывать»

v1.2–v1.5 carried a second row: weekly views of the places page, via `@vercel/analytics`
`[from code]`. It is removed, and the reason is stronger than "not worth tracking" — **the
number cannot be attributed.** Non-search traffic to this site arrives in bursts that follow
social-media advertising, so any views the places page collects are mixed with whatever
campaign was running that week, in a proportion nobody can separate.

**What the removal cost, stated rather than absorbed:** the delivery statement ("a visitor
reading about a tour can see which places that tour visits") lost its only metric, and so
stopped being called a goal. It was a goal in v1.1–v1.5. A goal that cannot be measured is,
by the PM rules these documents follow, a blocker — so rather than leave a blocker standing
or invent a metric nobody can read, the sentence was demoted to what it always described:
the scope of the work. It still justifies the accordion and date-page views, which have
nothing to do with search. **This demotion is the document's reading, stated to the owner
rather than applied quietly; one sentence reverses it.**

### 4.2 Two readings applied, both open to correction

**Scope: the page, not the site.** Against a baseline at or near zero the numbers are
demanding either way — the reason to scope them to the page is not arithmetic but
attribution: this release is accountable for what *the places page* does, and a site-wide
count would mix its effect with everything else that happens to the site during the same 30
days. Scoped to the page, the page's own baseline is exactly zero, and Search Console can
filter by page.

**Unit: a weekly rate, not a 30-day total.** The reading is taken at 30 days, the threshold
is weekly. They are reconciled by reading the last full week inside the window. The
alternative — summing 30 days against a weekly bar — would compare four weeks of traffic to a
one-week target and pass on roughly a quarter of the intended performance. Small point,
expensive to get wrong.

**Consistency check:** 20 impressions a week for one query on one page is a page being shown
a few times a day to people searching for it — which is exactly the stated ambition of
appearing in results at all rather than improving a position. The threshold and the ambition
agree; neither is doing quiet work against the other.

### 4.3 Why the 60-day reading had to be fixed (closes R12)

A zero on day 30 has two readings — *it did not work* versus *it has not been measured yet*,
because a new page does not enter Google's index the moment it is published. The owner
answered «пересчитываем»: a zero is not a verdict, the reading repeats.

That left a real gap: "re-measure" without a final reading leaves the 20/3 threshold with no
moment at which it can be missed, so the goal quietly becomes unfalsifiable. «да, второй
замер 60 дней» closes it — two readings, not an open-ended series.

The interpretation fork itself also disappears once the question is asked properly: index
status is a **fact**, checkable directly in Search Console per page and per URL, not something
inferred from a zero. Day 30 is therefore a check followed by one of two paths, not a choice
between two interpretations (PRD §2.1).

### 4.4 The baselines, and the error corrected on the way

`[owner, decision 2026-08-13]`:

> «ничего не получаем сейчас, 0-1-2 просмотра в день»
>
> «показов тоже мало, не больше 5» → «от 0 до 5 показов» → corrected by the owner the same
> day: «у сайта нет 35 показов в неделю, 5 -- это максимум, только один раз было»

- **Page views: 0–2 a day.** The owner stated the period himself.
- **Search impressions: effectively none.** Highest ever observed is 5, once; the usual value
  is near zero. **No period is attached**, because the owner did not give one.

An earlier revision wrote this as "0–5 a day" and derived "up to 35 a week" from it — this
document turning a single observed peak into a standing rate. The owner corrected it. The
lesson is kept rather than quietly patched: **do not attach a period to a number that arrived
without one**, and do not combine these two figures into arithmetic with each other — they are
different quantities from different instruments.

Four consequences that followed:

1. **Views are not impressions.** A page can collect many impressions while receiving one
   view a day. Since v1.6 only the impressions side is a metric, but the distinction is why
   the views figure cannot be pressed into service as a proxy for the one that was kept.
2. **Ratios stop working at this scale.** v1.2 and v1.3 measured the places page "as a share
   of weekly views of `/`". Against 0–2 views a day that is a ratio of two near-zero numbers —
   noise over noise. The surviving target is stated in **absolute** numbers.
3. **The baseline can no longer be lost.** Both sides are written down, so the loss the
   baseline criterion guarded against cannot happen. It became a refinement (PRD §2.1), and
   O10 closed by fact rather than by decision.
4. **Thresholds were easy to set, and have been set.** Against a baseline at or near zero, any
   sustained double-digit figure is distinguishable from nothing.

**Reservation on record, not an objection:** 30 days is short at this base. It is answered in
practice by the second reading at 60.

**Was a blocker, no longer is.** context.md records that nothing about traffic or enquiries is
measured today, so through v1.3 the perishable baseline was this document's blocking concern:
ship first and the goal could never be verified. The owner's two reported figures removed it.
What is left is a quality difference between an estimate and an instrument reading — worth
closing, blocking nothing.

---

## 5. Decisions inside the entity and the relations

### Google Maps — reversible, not free

The owner chose Google Maps provisionally, on the reasoning that it is easy to change later:
«пусть пока остается гугл, это легко поменять» `[owner, decision 2026-08-13]`. That is correct
about reversibility — nothing in this feature binds it to a provider, and the map link is one
content field per entry.

What the change would cost when it comes, so "easy" is not read as "free": the link is a
required field in **every entry in both locales**, so switching providers on a finished
catalogue means replacing **15 × 2 = 30 links** by hand, by the same single person who writes
the texts (R2), each verified individually because the acceptance criterion accepts no
automation. The cost scales with catalogue size at the moment of the switch, so switching
early is much cheaper than switching late. A note, not a risk: nothing is uncertain and no
decision is pending.

### Free order — a correction this document made against itself

`[owner, 7]` Walking order of the route was the owner's preference at interview ("sounds
nice"), and **v1.0–v1.4 promoted it to a requirement.** The owner has put it back to a
preference and scheduled it for v2 `[owner, decision 2026-08-13]`:

> «пусть места будут в произвольном порядке, для v2 можем включить соответствие порядку
> обхода»

**The cost of free order, not softened:** a list that does not follow the route does not let a
visitor anticipate the walk. It stays an inventory of what the tour includes rather than a
picture of how it unfolds. The original argument for requiring order — a wrong order is
visible to anyone who actually takes the tour — is answered by not promising an order at all
rather than by getting it right. That is the owner's call, taken knowingly. A note, not a
risk: there is no uncertain outcome to manage.

**"Free" is read as *not required to match the walking order*, not as *may differ between
renders*.** The alternative reading is barely coherent: a list that reshuffles between visits
looks broken, gives the visitor nothing, and saves no work, since any fixed listing already
produces a stable order. Stated as an assumption rather than assumed silently.

### Content order — a plan decision recorded with its cost

The owner named the first four programs `[owner, decision 2026-08-13]`. This replaced the
order v1.2 proposed, and the difference is worth stating rather than quietly overwriting: the
earlier proposal opened with `Milt` or `Amhry` — single-place programs `[owner, 14]`, two
texts, the whole rendering path proven at the smallest possible content cost. The owner's four
are all multi-stop routes, so the first slice is several times larger and the "prove the
pipeline cheaply" benefit shrinks accordingly. Content is the owner's `[owner, 4]`; recorded
with its cost, not argued with. The single-place slice survives in the PRD as an optional
technical slice 0.

---

## 6. Closed risks

- **R1 — the goal/shape mismatch.** Promoted out of the risk table in v1.1: it was a decision
  to take, not a risk to manage. Taken as O0 (§2.1). **The combination that made it matter:**
  R1 + R2 — a goal mismatch plus a slow content pipeline — was the case for not building at
  all, and is why O0 existed. The owner answered it by removing the mismatch instead of the
  work, while accepting R2 at close to full size. Resolved, not vanished: the pair is exactly
  what the owner decided to spend.
- **R8 — domain sequencing.** Closed in v1.3 by fact `[from code, lib/site.ts]`: the `.com`
  domain is connected and canonicalised, `lib/site.ts:22` is
  `https://www.austin-city-tours.com`, and the docblock at `lib/site.ts:9-12` records that the
  apex and the old `.vercel.app` host both answer 308 to `www`, so exactly one host returns
  200. context.md question 12 is satisfied before any permanent page of this feature exists.
- **R12 — an unfalsifiable goal.** Closed in v1.6 (§4.3). **The combination that made it worth
  closing early:** R12 + R2. The measurement clock starts at the production release and the
  release waits for all 30 texts, so the date of the verdict is unknown for the same reason the
  launch date is. The pair explained why the schedule had to be fixed *before* the content
  arrives — the longer the writing takes, the more tempting it becomes to read the first
  available number as the answer. With 30 and 60 days both set relative to the release, the
  schedule survives a launch date nobody can predict.

Numbers are retained and not reused; the PRD's risk table carries the gaps.
