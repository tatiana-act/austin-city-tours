# PRD: Places of Interest (POI)

version: 1.6 | date: 2026-08-13 | status: shape chosen (§2.1) and every open item answered — buildable, slicing per §7.1; what remains is content, not decisions (R2)
source: interview with the owner, 21 questions, 2026-08-13
companion: `.claude/context.md` (v1.0, 2026-08-11) — on conflict, context.md wins
revision: v1.1 reworked v1.0 against updated PM rules — alternative shapes instead of a
recorded conflict, a metric per goal, risk combinations, an incremental slice, and user
stories. v1.2 applied the internal-coherence rule while O0 was still open: metrics
(§2.2), user stories (§2.3), views (§6) and acceptance criteria (§7) were split by shape
instead of describing one shape as if it had been decided. v1.3 closes R8 and O1 on the
owner's decision: the `.com` domain is connected and canonicalised, so the sequencing
question those two held is settled `[from code, lib/site.ts]`. v1.4 records the owner's
answer to O0 — **"строим B, но для 15 POI, и записанное в D"** — and collapses the
per-shape split back into the one chosen shape; §2.1 is kept as the record of what was
weighed. v1.4 also introduces the `[owner, decision <date>]` marker (below), rebuilds
§7.1 around the project's `dev` → `main` release process, records the owner's traffic
baselines in §2.2, and reduces AC 21 from a release gate to a refinement. v1.5 closes
three more open items on the owner's answers: O2 — map provider is Google Maps,
provisionally, with the cost of switching written down in §4; O3 — naming the third sense
of "event" is out of scope, which removes the question but not the ambiguity, so §1's ban
on `event` in new identifiers becomes unconditional and R6 stays live; O4 — place order is
free in v1 and walking order moves to v2, which rewrites §5, AC 4, AC 12, AC 13 and
slice 1 while leaving the consistency guarantee between the two views intact; and O6 —
the list page goes into the sitemap, verified by the new AC 22. Two items are answered in
part: O5 gives the RU title «Что посмотреть в Остине» and leaves the English title and one
shared URL segment open, and O7 sets the reading at 30 days after the production release
with a threshold of ≥20 impressions and ≥3 clicks a week on that page, while leaving the
fate of the views metric and the reading of a zero undecided — the latter now carried by
R12. v1.6 closes both of those and with them O7 and R12: the repeat reading is set at 60
days and is final, and the views metric is dropped because non-search traffic arrives in
bursts driven by social-media advertising, so the page's contribution to it cannot be
separated from the campaigns'. Dropping it leaves the narrowed search goal as the single
measured goal, so §2 stops calling the wider statement a goal and states it as what the
feature does. **Still no new interview answers: the interview was not repeated, and across
all five revisions no `[owner, N]` statement was added, altered or removed — v1.4 quotes
`[owner, 6]` in several further places, but that is the same answer cited again, not a
new fact. O0, question 5 (catalogue size) and question 2 (O9) are decisions on questions this
document had already put to the owner; the owner's post-interview statements carry the
`[owner, decision <date>]` marker described below.**

Written in English because the interview was in English; `.claude/context.md` is in
Russian. Nothing here is invented: every statement is either an owner answer (marked
`[owner, Nn]` with the question number) or a fact read from the repository
(`[from code]`). Where an answer was missing it is recorded as a risk, not filled in.

Third marker, introduced in v1.4: **`[owner, decision <date>]`** — a decision the owner
took *after* the interview, on a question this document put to them. It is kept separate
from `[owner, N]` on purpose: `N` always points at one of the 21 interview questions, and
folding later statements into that numbering would destroy the only guarantee this
document makes about its own facts. The interview itself has still not been repeated.

---

## 1. Terminology

The word "event" is already taken twice over, and this feature adds a third meaning.
Context.md flagged this as a mine (GLOSSARY, question 24); it now goes live. Terms as
**this document uses them**. Naming the third meaning for the product as a whole was put
out of scope by the owner (O3), so nothing in this table is an approved product term —
"City happening" in particular is working vocabulary for reading this PRD, not a name
anyone has adopted.

| Term | Meaning | Existing code |
|---|---|---|
| **Place** (POI) | A physical site in Austin or nearby, worth telling about *and* worth visiting `[owner, 1]` | new |
| **Program** | A permanent route, reusable, no date | `TourProgram`, `data/tours.ts` |
| **Tour date** | One occurrence of a program on a specific day | `UpcomingTourEvent`, id `tour74` |
| **City happening** | A one-off occurrence in the city on a given day — rodeo, festival, concert `[owner, 15]`. Not a place: not permanent, not visitable outside its day | none; currently expressible only through `bonus` |
| **Bonus** | Something a tour date includes beyond the standard route. May *be* a place, may be a city happening `[owner, 8, 15]` | `UpcomingTourEvent.bonus` |
| **Meeting point** | Where the group assembles. A separate entity, never a place `[owner, 16]` | `TourProgram.meetingPoint` |

⚠️ **No confirmation is coming, and the rule below does not wait for one.** Naming the
third meaning is out of scope for this project `[owner, decision 2026-08-13]` — see O3.
"City happening" therefore stays a label local to this document.

**Standing rule, unconditional: do not introduce `event` into any new identifier.** It
was never contingent on O3 being answered — it exists precisely because the third meaning
has no agreed name, which is now the settled state rather than a temporary one. Nothing
in this feature needs such an identifier (§3: `bonus` is untouched), so the rule costs
nothing to keep and prevents `eventId` from silently acquiring a second meaning. The
ambiguity itself is not resolved by O3's closure — see R6.

---

## 2. Goal

`[owner, 2]` The stated purpose of this feature is **organic search traffic**, in line
with the standing product priority in context.md DOMAIN.

Search traffic on places arrives on place-name queries ("Driskill Hotel history",
«музей О'Генри Остин»). A single list page can rank for approximately one such query,
not for 15–20. `[owner, 3]` The owner ruled out a page per place because the available
content per place is thin and a dedicated page would disappoint the visitor — which is
a correct read of both the visitor and of how thin pages are ranked.

Therefore what this release actually delivers is the narrower thing:

> A visitor reading about a tour can see which places that tour visits, and can find
> those places on a map.

**This is a description of the feature, not a goal of it** — a change made in v1.6 and
worth stating plainly, because it was a goal in v1.1–v1.5. It stopped being one when its
metric was dropped (§2.2, `[owner, decision 2026-08-13]`): non-search traffic to the site
moves in bursts driven by social-media advertising, so no page-view number can be
attributed to this feature rather than to a campaign. A goal that cannot be measured is,
by this document's own rule, a blocker — so rather than leave a blocker standing or invent
a metric nobody can read, the sentence is demoted to what it always described: the scope
of the work. It still justifies §6.2 and §6.3, which have nothing to do with search.

The distance between the stated goal and what this release delivers was not left standing as a
note: §2.1 put four shapes against it, and O0 has now been answered. `[owner, 12]`
Through the agreed shape the stated goal in its full form becomes reachable only when
content per place grows — the intended growth is visitor reviews attached to places,
which will not exist before 2027.

The chosen shape (§2.1) therefore carries **one measured goal**: a **narrowed search
goal** — one named query ("что посмотреть в Остине" / "places to see in Austin"), served
by the places list page and measured in §2.2. Ranking for 15 individual place names
remains out of reach, and this document does not claim it. The delivery statement above is
the other half of the work — built, shipped and checked by the acceptance criteria, but
not something success is judged by.

The size of that search ambition, stated so nobody reads it larger: the site currently
records essentially no search impressions at all — the highest figure ever seen is 5, once,
owner-reported (§2.2). The narrowed goal is therefore **to appear in results at all** for
one query — not to improve a position, and not to move a traffic number that does not yet
exist.

The shape is chosen, so the rest of this document describes one shape. Metrics (§2.2),
user stories (§2.3), views (§6) and acceptance criteria (§7) no longer branch; §2.1 keeps
the alternatives as the record of the decision, not as live options.

### 2.1 Shapes considered — RESOLVED, see the decision at the end of this section

Kept as the record of what was weighed, not as live options. The four descriptions below
are unchanged from v1.2; the decision follows them.

The agreed shape does not serve the stated goal. Four shapes were weighed against the
same facts; none requires new owner answers, only a decision.

**A. Places inside permanent program pages** (context.md q16). The same 30–40 texts,
placed on pages that can rank — "Hyde Park walking tour" is a query a program page
answers, and the place names inside it carry the long tail. Cost: q16 is the project's
largest fork and the owner has said not to start it. Note that this shape *dissolves*
R4 and R7 rather than managing them.

**B. Thin slice, no new page.** Places render only inside the program accordion (6.2)
and the date page (6.3). No list page, no new URL, 3–5 places instead of 15–20. Serves
the accountable goal for the visitors who already opened a tour, costs roughly a tenth
of the content, and proves the pipeline before 30–40 texts are commissioned. Does
nothing for search — stated plainly rather than hidden.

**C. Do not build now.** Defer until content per place is deep enough to justify
per-place pages — the owner's own reasoning in `[owner, 3, 12]`, applied to the timing
rather than to the page count. Costs nothing and forfeits nothing that the agreed shape
would have delivered against the stated goal.

**D. Keep the agreed shape, change the goal it answers.** One list page can rank for
approximately one query — so name that query ("что посмотреть в Остине" / "places to
see in Austin"), write the page for it, and measure it. This keeps every owner decision
intact and makes the goal honest instead of unmet. *(Retrospective note: both strings this
sketch proposed were subsequently adopted by the owner as the page's titles — «Что
посмотреть в Остине» and "Places to see in Austin" `[owner, decision 2026-08-13]`. What
was a draft here is now a decision, recorded in §6.1.)*

What was recommended (v1.2, superseded by the decision below): **B now, A next**, with D
as the fallback if the list page ships anyway — B being the only shape whose dominant
risk (R2, content) is bounded before it is taken.

#### Decision — closes O0 `[owner, decision 2026-08-13]`

> «строим B, но для 15 POI, и записанное в D»

**What gets built:** places render in the program accordion (§6.2) and on the date page
(§6.3) — B's rendering — **and** the places list page (§6.1) ships, written for and
measured by the one named query D identifies. The catalogue is **15 places**.

**The reading this document works from, stated explicitly so it cannot be re-read later:**
"записанное в D" is taken to mean *the list page ships*, because D's defining content is
that page plus the honest narrowed goal attached to it. Without the page there is nothing
to target a named query with, and D's metric could not exist. A second reading is
available and consistent — that the decision is D with 15 places (the low end of
`[owner, 6]`), built B-style, thin slice first — and it produces **the same artifact**:
list page, accordion, date page, 15 places, one named query. Since the two readings
converge on what is built, no question is raised on them. A third reading — D's metric
without D's page — is rejected as internally impossible, not chosen against: a named
query with no page to rank cannot be measured. If that was what was meant, say so, and
O8 and O9 come back with it.

**The cost of 15, stated plainly.** Cutting the catalogue to 3–5 was refused outright
`[owner, decision 2026-08-13]`:

> «я не могу выкатывать в прод только 5 мест, смысла не имеет»

So 15 is a decision with a reason, not a default, and the reason is about **production**:
a five-place catalogue is not something the owner is willing to show visitors. It sits
inside `[owner, 6]`'s 15–20, so there is no conflict with the interview — but it removes
the single largest advantage the recommendation rested on. At 3–5 places, R2 was bounded
*before* the work was commissioned; at 15 places it is 30 texts through one writer whose
historical rhythm is one content batch every 2–3 weeks, which is R2 at close to full
size. The slicing in §7.1 no longer bounds R2 by releasing value in parts — it only
lowers technical risk early. See R2 and §8.1, where this is corrected rather than
softened.

**Not chosen: A.** The hold context.md question 16 puts on permanent program pages stays
in force and is not touched by this feature. R4 and R7 therefore stand as risks rather
than dissolving (§8). Worth recording for whenever q16 is revisited, without reopening it
here: with impressions at essentially zero (§2.2) the site is invisible in search, and the
case for A — pages that can rank for tour queries — is stronger than this document could
have argued before those figures existed. That is an argument for a later decision, not
a reason to revisit one the owner has just taken.

### 2.2 Success metrics

**One goal, one metric.** The per-shape table of v1.2 and v1.3 is gone with the branching
it served, and v1.6 removed the second row with the goal it measured (below); the
instrument named here already exists in the project.

| Goal | Metric | Instrument | Baseline | Read at | Threshold |
|---|---|---|---|---|---|
| Search, narrowed to one named query — **«Что посмотреть в Остине»** / **"Places to see in Austin"** `[owner, decision 2026-08-13]`, which are also the page's titles (§6.1) | **Impressions and clicks** for that one query `[owner, decision 2026-08-13]`, and its EN counterpart for "Places to see in Austin". Both titles and the address are in §6.1 | Search Console; the `verification.google` token is in `layout.tsx:79` `[from code]` | Recorded: effectively none — highest ever observed is 5, once; usually near zero, no period given. Owner-reported (below); a Search Console reading would make it instrumental — AC 21 | **30 days after the production release** `[owner, decision 2026-08-13]`, read as a weekly rate (below) | **≥20 impressions and ≥3 clicks per week, on this page** `[owner, decision 2026-08-13]` — scoped to the page rather than the site, see below |

The metric counts the places list page, which is why the decision to ship that page
(§2.1) is what makes this feature measurable at all.

**The second metric was dropped** `[owner, decision 2026-08-13]`:

> «число показов кроме поиска меняется всплесками, зависит от рекламы в соцсетях. Не
> нужно отдельно учитывать»

v1.2–v1.5 carried a second row: weekly views of the places page, via `@vercel/analytics`
`[from code]`. It is removed, and the reason is stronger than "not worth tracking" —
**the number cannot be attributed**. Non-search traffic to this site arrives in bursts
that follow social-media advertising, so any views the places page collects are mixed
with whatever campaign was running that week, in a proportion nobody can separate. The
site's page-view baseline (0–2 a day, below) stays recorded as a fact about the site; it
is simply no longer a metric this feature is judged by.

What that removal costs, stated rather than absorbed: the delivery statement in §2 loses
its only metric, and so stops being called a goal (§2). The alternative — keeping it as a
goal measured by a number that cannot distinguish this feature from an ad campaign —
would have been a metric in name only, and this document treats that as worse than
admitting there is one measured goal.

**When the reading is taken** `[owner, decision 2026-08-13]`:

> «смотрим показы и клики через 30 дней после выката в прод»

The clock starts at the **production release** — the merge of `dev` into `main`, which is
the owner's switch and the only deploy visitors see — not at any slice merged into `dev`
(§7.1). Both documents say the same thing about that boundary, and this metric depends on
it: a window counted from a slice would start while nothing is public.

**The threshold** `[owner, decision 2026-08-13]`:

> «3 клика, 20 показов в неделю»

**Scope: this page, not the whole site.** That is this document's reading, stated to the
owner rather than applied quietly, and he can overrule it. Against a baseline at or near
zero the numbers are demanding either way — the reason to scope them to the page is not
arithmetic but attribution: this release is accountable for what *the places page* does,
and a site-wide count would mix its effect with everything else that happens to the site
during the same 30 days. Scoped to the page, the number answers the question the feature
actually raises, the page's own baseline is exactly zero, and Search Console can filter by
page. **So: ≥20 impressions and ≥3 clicks per week on the places list page.**

**Unit reconciliation, recorded as this document's assumption rather than a new question:**
the reading is taken at 30 days, the threshold is weekly. The two are reconciled by reading
a **weekly rate** at day 30 — the last full week inside the window — not a monthly total.
The alternative (summing 30 days against a weekly bar) would compare four weeks of traffic
to a one-week target and pass on roughly a quarter of the intended performance. Small
point, expensive to get wrong, so it is written down; if it is not what was meant, one word
changes it.

**Consistent with the ambition already recorded:** §2 and §2.1 say the goal is to *appear
in results at all*, not to improve a position. 20 impressions a week for one query on one
page is exactly that — a page that is being shown, a few times a day, to people searching
for it. The threshold and the stated ambition agree; neither is doing quiet work against
the other.

**What this answer did not settle by itself** — both since answered, in v1.6:

1. **The second metric was not mentioned** in the threshold answer, and this document
   refused to read silence as a decision. The owner has since dropped it explicitly, with
   the attribution reason quoted above.

**The 30-day window and indexing — a real ambiguity, not a quibble.** The window starts
at the release, but a new page does not enter Google's index the moment it is published;
some part of the thirty days can be spent simply being discovered and crawled. The
consequence is that **a zero on day 30 has two readings and the metric cannot tell them
apart**:

- *it did not work* — the page is indexed, and nobody searches that query or the page
  does not surface for it; or
- *it has not been measured yet* — the page is not yet indexed, so there was nothing that
  could produce an impression.

**Answered** `[owner, decision 2026-08-13]`: «пересчитываем» — a zero on day 30 is not a
verdict; the reading is repeated.

**And the fork disappears once the question is asked properly.** Indexing is not something
to be inferred from a zero — it is a fact, checkable directly in Search Console, which
reports coverage per page and inspects an individual URL. So day 30 is not a choice
between two interpretations; it is a check followed by one of two paths:

- **page not indexed** → the zero says nothing about the feature. The reading is repeated
  (the owner's answer above), and nothing about the threshold is concluded.
- **page indexed, impressions below 20 in the last full week** → that *is* the result,
  measured against the threshold. Not a delay, and not to be re-read as one.

No new instrumentation is implied: the tool is already connected — Search Console, with
the `verification.google` token in `layout.tsx:79` `[from code]` — and this is a procedure
for reading the metric, not a thing to build.

**The repeat has a date, and it is the last one** `[owner, decision 2026-08-13]`:

> «да, второй замер 60 дней»

So the schedule is fixed and finite: **read at 30 days, re-read at 60 days from the
production release, and the 60-day reading is final.** Two readings, not an open-ended
series. This is what lets the threshold fail: if the page is indexed and the last full
week before day 60 shows fewer than 20 impressions or fewer than 3 clicks, the narrowed
search goal was not met, and that is a result the document can record rather than defer.
R12 closes with this, and O7 with it.

One thing the 60-day reading does not do, said plainly so nobody expects it to: it does
not diagnose *why* a miss happened — whether the query was wrong, the page too thin, or
the site too new to rank. It answers whether the goal was met. Diagnosis, if it is wanted,
is separate work and is not scoped here.

**The site's current traffic, owner-reported and marked as such**
`[owner, decision 2026-08-13]`:

> «ничего не получаем сейчас, 0-1-2 просмотра в день»
>
> «показов тоже мало, не больше 5» → «от 0 до 5 показов» → corrected by the owner the
> same day: «у сайта нет 35 показов в неделю, 5 -- это максимум, только один раз было»

**The baseline, as of 2026-08-13:**

- **Page views: 0–2 a day.** The owner stated the period himself.
- **Search impressions: effectively none.** The highest figure ever observed is 5, and it
  happened once; the usual value is near zero. **No period is attached to this**, because
  the owner did not give one — 5 is a one-off peak, not a rate. An earlier revision of
  this section wrote it as "0–5 a day" and derived "up to 35 a week" from it; that was
  this document turning a single observed peak into a standing rate, and the owner
  corrected it. The lesson is kept rather than quietly patched: do not attach a period to
  a number that arrived without one.

Both are **estimates reported by the owner, not instrument readings** — neither was taken
from Search Console nor from `@vercel/analytics`. The distinction is kept deliberately: a
document that lets a reported number pass as a measurement has lost the only thing that
makes its metrics worth anything. The two figures are also **not to be combined into any
arithmetic with each other**; they are different quantities from different instruments,
and the one attempt to compute with them produced the error above.

**Both baselines sit at or near zero**, and that is the fact to plan against. For search
the correction makes the case *stronger*, not weaker: the site is not weakly represented
in results, it is essentially absent from them. The starting point of this feature is
therefore "appear in search results at all", not "improve a position" — see §2 and §2.1,
which are worded to match.

Four consequences, none of them cosmetic:

1. **Views are not impressions.** Views are counted by `@vercel/analytics`, impressions
   by Search Console — different quantities from different instruments, and a page can
   collect many impressions while receiving one view a day. The two statements above
   supply one side each; neither substitutes for the other. Since v1.6 only the
   impressions side is a metric, but the distinction still matters: it is why the
   views figure cannot be pressed into service as a proxy for the one that was kept.
2. **Ratios stop working at this scale.** v1.2 and v1.3 measured the places page "as a
   share of weekly views of `/`". Against 0–2 views a day that is a ratio of two
   near-zero numbers — noise over noise, unable to tell success from coincidence. The
   surviving target is therefore stated in **absolute** numbers. The window has since been
   set by the owner at 30 days from the production release, with a final reading at 60;
   this document's reservation that 30 days is short at this base is recorded above, is
   not an objection to the decision, and is answered in practice by the second reading.
3. **The baseline can no longer be lost, so AC 21 stops being a gate.** The criterion
   existed to stop an unreconstructable baseline from disappearing at release. Both sides
   are now written down, so the loss it guarded against cannot happen. A Search Console
   reading is still worth taking — it converts an estimate into an instrument reading —
   but it is a refinement, not a condition. AC 21 is reformulated accordingly, and O10 is
   closed by fact rather than by decision.
4. **Thresholds were easy to set, and have been set.** Against a baseline at or near
   zero, any sustained double-digit figure is distinguishable from nothing — the
   correction to the impressions figure strengthens this rather than weakening it. The
   owner has since named ≥20 impressions and ≥3 clicks a week; the scope those numbers
   are read against — the page rather than the site — is above.

**Why the "yes" to question 2 reads as consistent, not careless.** Accepting a release
that cannot be judged looks very different against a site receiving 0–2 views a day and
almost no impressions than against one with traffic to protect: at this base almost any
measurement would be indistinguishable from noise, so the owner was declining a number
that would not have told them much anyway. Recorded because a decision that has a
rationale should be readable as reasoned, not merely as overridden.

**Was a blocker, no longer is.** context.md records that nothing about traffic or
enquiries is measured today, so through v1.3 the perishable baseline was this document's
blocking concern: ship first and the stated goal could never be verified. The owner's two
reported figures remove it — the "before" state is on the record, for the metric that was
kept and for the one that was dropped, and neither can now be lost by releasing. What is left is a quality difference between an
estimate and an instrument reading, which is worth closing but does not block anything.

**Settled: measurement does not gate the release.** The owner answered "yes" to the
earlier question "is a release acceptable when there is nothing to measure it by" (O9),
asked about *pure* B, which by construction had no metric. Two readings of that "yes"
were open in this document — that it lapsed with the shape, or that it meant "do not gate
the release on measurement" — and the question mattered only because a missing baseline
would have made the goal permanently unverifiable. With both baselines recorded, the two
readings no longer differ in consequence. O10 is closed by fact, and AC 21 is reduced from
a gate to a refinement.

**Deliberately not claimed as measurable:** "the share of tour-description readers who
reach the place list". The entry point is an accordion on `/` and no custom event is
emitted anywhere in the codebase, so this number cannot be produced without new code.
Not proposed here; recorded so that nobody later reports it from an estimate.

### 2.3 User stories

Visitor types are context.md's (USERS: the tourist, and the local booking for guests);
this feature's interview did not revisit them.

All five stories are read against the chosen shape (§2.1). Four are served; the fifth is
served only in part, and that part is named rather than rounded up.

- **US1 — tourist, choosing.** As someone comparing two programs, I want to see which
  places each one visits, so I can tell them apart before enquiring. → AC 12, 13.
  Served by the homepage accordion (§6.2).
- **US2 — local, booking for guests.** As someone sending a tour to arriving guests, I
  want one page of places with map links, so they can see where they will be taken
  without me explaining it. → AC 7, 8, 11. **Served:** the list page ships, so the
  transferable URL context.md says this visitor type needs exists. This is what closed
  O8 — and the v1.1 sentence claiming the page "survives as its own URL under shape B"
  stays withdrawn: the page exists because the owner chose it, not because B allowed it.
- **US3 — visitor on a date page.** As someone who arrived on a specific date, I want
  the place list right there, so I do not have to go and find the program. → AC 13, 14.
  Served by §6.3.
- **US4 — searcher.** As someone searching "Driskill Hotel history", I want to land on
  this site. **Served only for the one named query** the list page targets (O5), not for
  15 individual place names — one page ranks for approximately one query, and per-place
  pages are a non-goal (§3). No acceptance criterion covers the place-name case,
  deliberately: it is what §2 records as reachable only when content per place grows.
- **US5 — owner, publishing.** As the person who commits the texts, I want to add a
  place by editing one RU/EN pair, so that a slice stays a single reviewable PR. → AC 3.
  Served by the slicing in §7.1.

## 3. Non-goals

Explicitly out of scope for v1, each with the answer that put it there. With the shape
chosen (§2.1) the list holds as written, unconditionally.

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
  explicitly not started. Shape A would have been exactly that and was **not** chosen
  (§2.1), so the hold stays in force and this feature does not go near it. The
  consequence is carried openly in R4, R7 and §8.1 rather than treated as solved.

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
| map link | yes | **Google Maps** `[owner, decision 2026-08-13]`, chosen from the options in `[owner, 19]` (Google Maps or OpenStreetMap, owner's pick). Matches the precedent already in the repo: every `meetingPointLink` today is a `maps.app.goo.gl` short link `[from code]` |
| photo | **no** | `[owner, 13 revised]` deferred; entries must be able to gain one later without being rewritten |

A place appears in the catalogue **once**, regardless of how many programs visit it.

**"Google for now" — reversible, not free.** The owner chose Google Maps as a provisional
answer, on the reasoning that it is easy to change later
`[owner, decision 2026-08-13]`: «пусть пока остается гугл, это легко поменять». That is
correct about reversibility — nothing in this feature binds it to a provider, and the map
link is one content field per entry. It is worth stating what the change would cost when
it comes, so that "easy" is not read as "free": the link is a **required field in every
entry in both locales**, so switching providers on a finished catalogue means replacing
**15 × 2 = 30 links** by hand, by the same single person who writes the texts (R2), each
one verified individually because AC 8 accepts no automation. The cost scales with the
size of the catalogue at the moment of the switch, so switching early is much cheaper
than switching late. This is a note, not a risk — nothing here is uncertain and no
decision is pending.

### Content pipeline

`[owner, 4]` The guide writes the text in Russian; the owner adjusts it and
translates it to English; the owner commits it. `[owner, 5]` **No place text exists
today in either language.** Content creation is inside this feature's scope, not a
precondition someone else satisfies.

`[owner, 6]` **15–20 places in the first release** → 30–40 texts to produce through a
single person. Context.md records the owner's historical content rhythm as roughly one
batch every 2–3 weeks. This is the critical path; the rendering work is not. See R2,
and §7.1 for what the slicing does and does not bound.

Fixed in v1.4: the catalogue is **15 places** — the low end of `[owner, 6]`'s range,
chosen deliberately, with 3–5 refused because a five-place catalogue is not worth showing
in production `[owner, decision 2026-08-13]`. 15 places is 30 texts, and that is the
number the schedule actually depends on (R2).

Existing project rule that applies unchanged (context.md DEFINITION_OF_DONE): RU and
EN ship as a pair in one PR, same ids in the same order. A place with no English text
cannot ship.

---

## 5. Relations

### Place ↔ Program

`[owner, 11]` The link hangs off the **program** — the permanent entity — never off
the schedule. Reason given: the schedule is irregular, sometimes only 1–2 dates exist,
and anything schedule-driven would make places look unavailable.

`[owner, 7]` Walking order of the route was the owner's preference at interview
("sounds nice"), and v1.0–v1.4 of this PRD promoted it to a requirement. **v1 does not
require it** `[owner, decision 2026-08-13]`:

> «пусть места будут в произвольном порядке, для v2 можем включить соответствие порядку
> обхода»

So in v1 a program's place list is **free order**: it is not obliged to match the route.

⚠️ **Assumption, one word from being confirmed:** "free" is read as *not required to match
the walking order*, **not** as *may differ between renders*. The order must be stable —
the same list in the same sequence on every view, in both locales, for the same program.
The alternative reading is barely coherent: a list that reshuffles between visits looks
broken, gives the visitor nothing, and saves no work, since any fixed listing of the
places already produces a stable order. Stated as an assumption rather than assumed
silently; if it is wrong, AC 4 and AC 13 are what change.

The observation that made order matter is unchanged and simply moves to v2: position
belongs to the program↔place pairing, not to the place, since the same place can be third
on one route and first on another.

**Product requirement carried into v2** (stated as a constraint, not as a design — the
same shape as the photo deferral `[owner, 13 revised]` and R9): adding walking order later
must not require rewriting the place entries themselves. Whatever ordering arrives in v2
must be expressible without editing the text, the name or the map link of a place that
has already shipped, and without changing what a place *is* — otherwise v2 pays a second
time for the 30 texts v1 commissioned.

**The cost of free order, not softened:** a list that does not follow the route does not
let a visitor anticipate the walk. It stays an inventory of what the tour includes rather
than a picture of how it unfolds, and the original argument for requiring order — a wrong
order is visible to anyone who actually takes the tour — is answered by not promising an
order at all rather than by getting it right. That is the owner's call, taken knowingly
and deferred to v2. Recorded as a note; it is not a risk, because there is no uncertain
outcome to manage.

`[owner, 14]` **All 12 programs get a place list.** Three of them are named after a
single site and will have a list of exactly one place — a valid, deliberate case, not
an error:

- `Albjwc` — Wildflower Center tour (the owner will add the centre itself as a place
  "for consistency")
- `Amhry` — O. Henry Museum
- `Milt` — Millett Opera House

The full set of program ids `[from code, data/tours.en.ts]`: `Acap`, `Haust`, `Gcrt`,
`Rrock`, `Brmn`, `Auswe`, `Auhnry`, `Hyde`, `Acstm`, `Albjwc`, `Amhry`, `Milt`.

"All 12" is the completed state, and it is compatible with a 15-place catalogue because a
place is listed once but may be visited by several programs (§4): 15 places can cover 12
programs, three of which need exactly one each. AC 4a governs only the intermediate
states on `dev` while slices accumulate — production sees the completed catalogue (§7.1).

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

All three views below are in scope: the shape chosen in §2.1 ships the list page (6.1)
together with B's rendering into the program accordion (6.2) and the date page (6.3).
The per-shape table of v1.2 is gone with the branching it served.

### 6.1 Places list page

One page listing all places `[owner, 3]`. Per entry: name, short description, map
link, and the names of the programs that visit it. No photos `[owner, 13 revised]`, no
availability marker `[owner, 11]`.

#### Identity: title and address — all of it, in one place

Settled, and this is the single place to read it from `[owner, decision 2026-08-13]`:

| | Value |
|---|---|
| **Title, RU** | «Что посмотреть в Остине» |
| **Title, EN** | "Places to see in Austin" |
| **URL segment** | `places` — one segment, serving both locales |
| **Address, RU** | `/ru/places/` |
| **Address, EN** | `/en/places/` |

The RU title is the **same string** as the named query the page is written for (§2.2), so
heading and goal coincide exactly rather than approximately; the EN title is its
counterpart for the English query. The addresses are written out in full because that full
form is what gets verified (AC 22, AC 23) and what goes into the sitemap — the segment
alone would leave the locale prefix and the trailing slash to be re-derived each time.

Why the address looks like that, both from the repository: path segments in this project
are **not localised** — every route renders as `${baseUrl}/${locale}${suffix}/`, so
`/ru/about/` and `/en/about/` share one segment `[from code, app/sitemap.ts]` — and
`trailingSlash: true` applies project-wide `[from code]`. **No collision on the chosen
segment:** `app/[locale]/` today contains only `about` and `tours`, and `places` appears
nowhere in `app/`, `i18n/` or `lib/` as a route or identifier `[from code]`. That was the
only thing that could have blocked the word.

**In the sitemap: yes** `[owner, decision 2026-08-13]`. Deliberate, as every sitemap
decision in this project is: the file's own comment excludes date pages because they are
date-based and expire into soft-404s `[from code, app/sitemap.ts]`, and this page is the
opposite case — permanent, and written to rank. The per-locale entries and their
`en`/`ru`/`x-default` alternates follow the same construction as every other route.
Checked by AC 22.

`[owner, 18]` **Entry point: the tour description.** Not the main navigation.
Consequence, accepted: the tour catalogue lives as accordions on the homepage (there
are no permanent program pages), so the route to this page runs through an expanded
accordion on `/`, and a visitor who never opens a tour never learns it exists. See R3.

Place → program is reachable by **name only**. There is no durable link target:
programs have no permanent pages (context.md question 16) and date pages expire and
are deliberately excluded from `sitemap.ts`. See R4. Shape A, which would have supplied
that link target, was not chosen, so this limitation stands as built.

### 6.2 Program view (homepage accordion)

`[owner, 20]` Each program's description shows its own places. Order is free in v1 but
stable (§5); walking order arrives in v2. The description is the homepage accordion:
permanent program pages remain out of scope (context.md question 16, §3).

### 6.3 Tour date page (`/[locale]/tours/[tourEventId]`)

`[owner, 20]` Repeats the program's place list, in the same order as 6.2 shows it, so a
visitor does not have to go find the program. `[owner, 21]` Identical content to 6.2 in
v1 — free order does not license the two views to disagree (AC 13).

---

## 7. Acceptance criteria

Each is observable and checkable before the merge it applies to. All of them describe the
one shape chosen in §2.1; nothing here branches any more.

### 7.1 Slicing — on `dev`, not in production

**A slice is a merge into `dev` with its Vercel preview, not a publication.** The owner
refused to put a five-place catalogue in front of visitors `[owner, decision 2026-08-13]`,
and that refusal is about production, not about how work accumulates. The project's own
process already separates the two `[from code, CLAUDE.md]`: work is staged on `dev` and
released to `main` in batches, merging into `main` triggers the production deployment and
is the owner's switch alone, every pushed branch gets its own preview deployment, and
only `main` deploys to production.

So both things hold at once: the catalogue reaches production **once, complete**, and the
technical risk is still retired early, slice by slice, before all 30 texts are
commissioned. **No slice is visible to a production visitor** — previews are, and
context.md question 29 records that the owner opens them while logged in to Vercel.

**Which programs are written first** `[owner, decision 2026-08-13]`:

> «Первыми будут Пешеходная экскурсия по центру Остина, Остин Мистический, Экскурсия по
> кварталу Bremond и Выходные в стиле Остин»

Resolved against the catalogue `[from code, data/tours.ts]`: **`Acap`** (Пешеходная
экскурсия по центру Остина), **`Haust`** (Остин Мистический), **`Brmn`** (Экскурсия по
кварталу Bremond), **`Auswe`** (Выходные в стиле Остин). The remaining eight follow in
whatever order the texts arrive.

This replaces the order v1.2 proposed, and the difference is worth stating rather than
quietly overwritten. The earlier proposal opened with `Milt` or `Amhry` — single-place
programs `[owner, 14]`, two texts, the whole rendering path proven at the smallest
possible content cost. The owner's four are all multi-stop routes, so the first slice is
several times larger and the "prove the pipeline cheaply" benefit shrinks accordingly.
That is a content-plan decision, and content is the owner's `[owner, 4]`; it is recorded
with its cost, not argued with.

One consequence that works in the owner's favour, from the catalogue itself: `Acap` and
`Auhnry` `[from code, data/tours.ts]` both walk Congress Avenue and both take in the
Driskill and the O. Henry material — and a place is written **once**, however many
programs visit it (§5, AC 6). So `Auhnry`, which is not in the first four, will already
have most of its list once `Acap` is written. The overlap is worth checking for the other
downtown programs too before commissioning texts: the count that matters is distinct
places, not programs.

Order of slices, with the programs above supplying their content:

- **Slice 0 — one program, one place.** `Milt`, `Amhry` or `Albjwc`: `[owner, 14]` gives
  each a list of exactly one place. Two texts (RU + EN) prove the entire rendering path —
  data shape, both locales, program view, date view, map link — at the smallest possible
  content cost. **Kept as a technical slice, and it does not compete with the content
  order above:** it needs one text pair, from any of those three, and it exists so that
  the rendering is known to work before four multi-stop routes are written against it. If
  the owner would rather not spend that pair out of order, slice 0 merges with slice 1 and
  the first multi-stop route carries both jobs — at the cost of debugging the data shape
  with a longer list.
- **Slice 1 — the first multi-stop route**, from the four named above. Proves what a
  single-place program cannot: several places rendering inside one program, in a stable
  order, identical between the program view and the date view (AC 13). Its original
  justification — proving walking order — lapsed when O4 was answered; the slice keeps a
  purpose of its own.
- **Slices 2…n — the remaining three named programs, then the other eight**, in whatever
  order the guide's texts arrive.

What slicing now buys, stated honestly: it proves the pipeline, the data shape, both
locales and the rendering before the whole catalogue exists. What it no longer buys:
value delivered to visitors in instalments. R2 is therefore bounded less than v1.2
claimed — corrected in R2 and §8.1 rather than left standing.

Each slice must leave `dev` in a state that could be released without embarrassment if
the owner chose to — that is what AC 4a and AC 4b check — but the release decision itself
is the owner's and is expected to happen once, on the complete catalogue.

**Content**

1. Each merge into `dev` carries a complete slice (§7.1): every place it introduces is
   complete in both locales. **15 places** `[owner, 6]`, `[owner, decision 2026-08-13]`
   is the completion target and the condition for the production release — not a
   condition for any single PR.
2. Every place has a non-empty name, short description and map link **in both RU and
   EN**. No place ships with a field filled in one language only.
3. RU and EN data ship in the same PR, with identical place ids in identical order
   (existing DoD rule).
4. Every program whose places have shipped lists all of them. Order is free in v1
   `[owner, decision 2026-08-13]` but **stable**: the same program shows the same places
   in the same sequence on every view and in both locales. Walking order is not required
   and is not claimed anywhere in the UI.
4a. A program with no shipped places renders exactly as it does today — no empty
   section, no placeholder, no "coming soon". Checked on the homepage and on a date
   page before each merge into `dev`.
4b. The places list page never presents an incomplete catalogue as the finished one. On
   `dev` and on previews it may hold however many places have landed; the production
   release happens on the complete 15 `[owner, decision 2026-08-13]`. Checked at the
   release, not at each slice — this is the coherence counterpart of AC 4a for the page
   that AC 4a does not cover.
5. No place ships before the program that visits it — the catalogue contains no
   uncovered places in v1.
6. Each place appears exactly once in the catalogue, however many programs visit it.

**Places list page**

7. One page exists listing every place; each entry shows name, short description, map
   link and the names of the programs that visit it.
8. Every map link, opened manually, lands on the correct location. Checked per place
   before merge — no automation claimed.
9. The page displays no photographs.
10. The page displays no coverage, availability or "no dates scheduled" marker.
11. The page is reachable from a tour description.
23. The page is served at `/ru/places/` and `/en/places/`, and its visible heading is
    «Что посмотреть в Остине» in RU and "Places to see in Austin" in EN
    `[owner, decision 2026-08-13]`, both through next-intl like every other visitor-facing
    string (AC 18). Checked by opening both addresses. This is a criterion rather than a
    note because the RU heading *is* the query the page is accountable for (§2.2): if it
    drifts during implementation, the metric and the page stop describing the same thing,
    and nothing else in §7 would catch that.
22. The page appears in the rendered `sitemap.xml` for **both locales**
    `[owner, decision 2026-08-13]`, each entry carrying the `en`, `ru` and `x-default`
    alternates the rest of the sitemap uses `[from code, app/sitemap.ts]`, and each listed
    URL resolves 200 in that exact form, trailing slash included. Checked on the rendered
    output rather than the source — context.md question 17 records that reading source
    instead of output is how an earlier SEO conclusion went wrong. This states the
    observable result only; how the entry gets there is an implementation matter and is
    not prescribed here. Numbered 22 because 12–21 are taken; it belongs to this block,
    not to the end of the list.

**Program and date views**

12. Each program's description lists its places in the homepage accordion (§6.2), in the
    program's own stable order (AC 4).
13. A date page lists the same places, in the same order, as its program — **unchanged by
    O4**. Free order removes the obligation to match the route; it does not permit the
    two views of one list to disagree with each other. Checked by opening a program in the
    accordion and its date page side by side.
14. A date's `bonus` renders exactly as it does today, in its current position, and
    never inside the place list — including when the bonus names a place that is also
    in the catalogue.

**Non-regression**

15. `meetingPoint` and `meetingPointLink` are unchanged and are never rendered as part
    of a place list.
16. The `bonus` field, its translation-key resolution and its rendering are unchanged.
    No new bonus translation keys are added by this feature.
17. Exactly one new URL is introduced: the places list page. No per-place URLs (§3), and
    no permanent program pages — context.md question 16 stays untouched.
18. No visitor-facing string is hardcoded in JSX; all of them come through next-intl
    (context.md DEFINITION_OF_DONE, firm rule).
19. `npm run build` passes.
20. The PR states its Vercel preview URL and says a mobile check **is** needed — this
    feature changes markup and text, which is context.md's own trigger for it.

**Measurement**

21. The baseline of §2.2 is recorded before the production release. **It already is** —
    0–2 views a day and impressions at essentially zero, both owner-reported — so this is
    satisfied as written and gates nothing. What remains optional: taking a Search
    Console reading before `dev` is merged into `main` `[from code, CLAUDE.md]`, which
    would replace an estimate with an instrument reading. Worth doing, not a condition of
    release. Reduced from a gate to a refinement in v1.4 because the loss it protected
    against — an unreconstructable "before" state — can no longer occur (O10, closed).

---

## 8. Risks

| # | Risk | Source | Severity |
|---|---|---|---|
| R1 | *(promoted out of this table in v1.1 — the goal/shape mismatch is a decision, not a risk. See §2.1 and O0. Number retained because §8.1 refers to it.)* | — | — |
| R2 | **Content is the critical path and has no date.** At the chosen catalogue size, 30 texts, none of which exist, written by the guide and translated by one person whose historical rhythm is one content batch every 2–3 weeks. No launch date can be committed from this PRD. **Correction to v1.2/v1.3:** §7.1 bounds this risk *less* than those versions claimed. Slices land on `dev` and retire technical risk early, but the production release waits for the complete catalogue `[owner, decision 2026-08-13]`, so nothing reaches visitors until the last of the 30 texts exists. The all-or-nothing property was removed from merging, not from releasing. | `[owner, 4, 5, 6]`, `[owner, decision 2026-08-13]` | high |
| R3 | **Discoverability.** Entry is from the tour description only, inside a homepage accordion; not in navigation. | `[owner, 18]` | medium |
| R4 | **Place → program has no durable link target.** Programs have no permanent pages; date pages expire and are excluded from the sitemap on purpose. Places can name tours but not link to them stably. | `[from code]`, context.md q16 | medium |
| R5 | **Double representation.** The same object can show as a place in the list and as a bonus label on the same date page. Accepted deliberately, but it will look like a bug to anyone who did not read this. | `[owner, 21]` | low |
| R6 | **Terminology.** "Event" now covers a tour date *and* a one-off city occurrence. Resolved in this document's prose only; not in the code. **Stays live after O3:** the owner put *naming* out of scope `[owner, decision 2026-08-13]`, which removes the question, not its cause — the word remains overloaded, and no vocabulary will be agreed while this feature is built. Mitigation is the standing rule in §1: no `event` in new identifiers. Severity unchanged; nothing about the underlying ambiguity got better or worse. | context.md q24, `[owner, 15]`, `[owner, decision 2026-08-13]` | medium |
| R7 | **v1 must not make per-place pages more expensive later** — the same standing instruction context.md attaches to question 16 — but there is no per-place content yet to verify that against. | `[owner, 12]` | medium |
| R8 | *(closed in v1.3 by the owner's decision — the condition it guarded is already met, so this is no longer a risk. The `.com` domain is connected and canonicalised: `lib/site.ts:22` is `https://www.austin-city-tours.com`, and the docblock at `lib/site.ts:9-12` records that the apex and the old `.vercel.app` host both answer 308 to `www`, so exactly one host returns 200. Context.md question 12 is satisfied before any permanent page of this feature exists. See O1. Number retained, not reused — the stable-numbering convention of context.md.)* | `[from code, lib/site.ts]` | — |
| R9 | **Photos deferred.** Entries must be able to gain a photo later without being rewritten. Note also that `images.unoptimized: true` means nothing resizes images automatically, so whenever photos arrive, sizing is a manual content step and a Core Web Vitals exposure. | `[owner, 13]`, `[from code]` | low |
| R10 | **The 2027 reviews link needs a dimension that does not exist.** `Reviews!A:F` column C is a *program* id, and `FeedbackForm` does not collect a place. Linking reviews to places is not a display change. | `[from code]`, context.md q31 | low (later) |
| R12 | *(closed in v1.6 — the verdict now has a date. The risk was that "re-measure" without a final reading left the 20/3 threshold with no moment at which it could be missed, so the goal could quietly become unfalsifiable. The owner set the repeat at 60 days from the production release and made it final `[owner, decision 2026-08-13]`, §2.2, so the schedule is two readings and an answer. Number retained, not reused — §8.1 refers to it.)* | — | — |
| R11 | **`bonus` as a mechanism is confirmed unfit for city happenings.** A rodeo on one Saturday needs a one-off label, but `bonus` holds a translation key requiring edits to both `messages/*.json` plus a deploy. Untouched by decision, so the cost stays. | `[owner, 15, 17]`, context.md GLOSSARY | low (deferred) |

Severity above is read against the chosen shape (§2.1). Because A was not chosen, R4 and
R7 stand as risks instead of dissolving, and R3 stands as accepted rather than fixed.
R1 and R8 carry no severity: R1 was a decision and is now taken (O0), R8 is closed.

### 8.1 Combinations that change the decision

- **R1 + R2 → O0, now answered.** Separately: a goal mismatch, and a slow content
  pipeline. Together they were the case for not building at all, and that is why O0
  existed. The owner answered it by removing the mismatch instead of the work — the list
  page gives the feature a measurable goal (§2.2) — while accepting R2 at close to full
  size. Recorded as resolved, not as vanished: the pair is exactly what the owner
  decided to spend.
- **R2 + AC 1–5 → §7.1, partially.** In v1.0 the content risk was made maximal by the
  acceptance criteria themselves: "all 12 programs, 15–20 places, both locales" meant
  nothing shipped until the last translation landed. §7.1 removed that coupling from
  **merging** — slices land on `dev` independently — but the owner has put it back at the
  **release**, deliberately: production waits for all 15 places
  `[owner, decision 2026-08-13]`. So R2 is retired early only as technical risk; as
  schedule risk it is undiminished, and this document does not pretend otherwise.
- **R3 + R2.** The only entry point is inside a homepage accordion, so the audience is
  bounded by an interaction search visitors never perform — while the content cost of
  reaching that audience is 30 texts. The fix that dissolved both was shape A, which was
  not chosen; the pair therefore stays live and is the strongest argument for revisiting
  context.md question 16 later. (This pair was "R3 + R1" until v1.4; R1 is no longer a
  standing risk, so it is restated against R2, which is what actually pays for it.)
- **R4 + R7.** Places can name programs but cannot link to them, and per-place pages
  would need the same missing target. Both are the absence of permanent program pages
  (context.md q16), counted twice — and both stand, since A was not chosen.
- **R5 + R6.** Double representation and the third meaning of "event" both become
  visible on the date page — the single page showing a place list, a bonus label and a
  tour date at once. That page is still where a wording fix would belong, but **no such
  fix happens in this feature**: naming is out of scope by the owner's decision (O3), and
  `bonus` is a non-goal (§3). So the pair is carried, not treated — recorded here so that
  whoever eventually does the naming work knows there is one page where both surface at
  once, and one place to fix them together.
- **R2 + R12 — the pair that made R12 worth closing early.** The measurement clock starts
  at the production release, and the release waits for all 30 texts, so the date of the
  verdict is still unknown for the same reason the launch date is: R2 is live, R12 is not.
  What the pair explained is why the schedule had to be fixed *before* the content
  arrives — the longer the writing takes, the more tempting it becomes to read the first
  available number as the answer. With 30 and 60 days both set relative to the release,
  the schedule survives a launch date nobody can predict, and the temptation has nothing
  to work with.
- **R9 + R10.** Both are content-model debts payable in later versions; neither should
  influence the v1 decision, and they are named here so they are not counted into it.

---

## 9. Open items

Decisions this PRD cannot make. **One live item: O7**, itself down to two lines — the date
of the final reading, and whether the page-views metric survives. Everything else is
closed and retained for reference: O0, O1, O2, O3, O4, O5, O6, O8, O9, O10.

- **O0. CLOSED in v1.4 — answered** `[owner, decision 2026-08-13]`. Was: build this at
  all, and in which shape (A/B/C/D, §2.1)? Answer: «строим B, но для 15 POI, и записанное
  в D» — B's rendering plus D's list page and named query, catalogue of 15. The full
  decision, the reading it is taken under and its cost are in §2.1. Number retained, not
  reused.
- **O1. CLOSED in v1.3 — no decision left to make** `[from code, lib/site.ts]`. The
  question was whether the places list page ships before or after the `.com` domain is
  connected. The domain is already connected and canonicalised — `lib/site.ts:22` is
  `https://www.austin-city-tours.com`, and `lib/site.ts:9-12` records the apex and the
  old `.vercel.app` host answering 308 to `www` — so context.md question 12's ordering
  requirement is met ahead of anything this feature could publish. Nothing in §7 waits on
  it. Number retained, not reused.
- **O2. CLOSED in v1.5 — answered** `[owner, decision 2026-08-13]`: «пусть пока остается
  гугл, это легко поменять». Map provider is **Google Maps**, provisionally, which also
  matches the `maps.app.goo.gl` precedent already in the repo `[from code]`. The
  reversibility is real and its price is written down in §4 — 30 links by hand on a
  finished catalogue — so that "for now" stays an informed choice. Number retained, not
  reused.
- **O3. CLOSED in v1.5 — out of scope, not resolved** `[owner, decision 2026-08-13]`:
  «это за рамками данного проекта». Was: confirmation of a name for the third meaning of
  "event". The question leaves this feature; the ambiguity does not. Consequences, all
  recorded rather than assumed: "city happening" stays a label local to this document
  (§1), the standing ban on `event` in new identifiers holds unconditionally (§1), and R6
  remains a live risk at unchanged severity. Number retained, not reused.
- **O4. CLOSED in v1.5 — answered** `[owner, decision 2026-08-13]`: «пусть места будут в
  произвольном порядке, для v2 можем включить соответствие порядку обхода». Was: is
  walking order a hard requirement? It is not, in v1. This closes a question the PRD
  raised against itself — v1.0 promoted the owner's "sounds nice" into a requirement, and
  the owner has now put it back to a preference and scheduled it for v2. Consequences are
  in §5 (free but stable order, the v2 constraint, the cost), AC 4, 12, 13, §7.1 slice 1
  and §10. Number retained, not reused.
- **O5. CLOSED in v1.5 — fully answered** `[owner, decision 2026-08-13]`, across two
  replies: «новая страница "Что посмотреть в Остине"» and «английский заголовок ок, слово
  для адреса places». Titles: «Что посмотреть в Остине» / "Places to see in Austin".
  Address: `/ru/places/` and `/en/places/`, one segment for both locales. The English
  title had been sitting in §2.1 as this document's own draft; it is now the owner's
  decision and is marked as such. Everything — both titles, the segment, the full
  addresses — is consolidated in §6.1, and verified by AC 23. The segment is free of
  collisions in the repository `[from code]`. Number retained, not reused.
- **O6. CLOSED in v1.5 — answered** `[owner, decision 2026-08-13]`: «новая страница "Что
  посмотреть в Остине" - в sitemap». The places list page **goes into the sitemap**.
  Recorded so nobody reopens it: the reason this was a question at all is that sitemap
  membership in this project is always deliberate — the file's own comment excludes date
  pages because they expire into soft-404s `[from code, app/sitemap.ts]` — and the list
  page is the opposite case, permanent and meant to rank, which is exactly the basis for
  including it. The sequencing condition that could have conflicted (context.md q12:
  connect the domain before adding indexable pages) was already satisfied and closed in
  v1.3 as R8/O1, so there is no conflict left to weigh. Verified by AC 22. Number
  retained, not reused.
- **O7. CLOSED in v1.6 — fully answered**, across four answers over the same day.
  **Decided** `[owner, decision 2026-08-13]`, in two answers: «смотрим показы и клики
  через 30 дней после выката в прод» and «3 клика, 20 показов в неделю». So: impressions
  and clicks, read **30 days after the production release** (after `dev` is merged into
  `main`, not after any slice — §7.1), against **≥20 impressions and ≥3 clicks per week**.
  Two readings this document applied and stated aloud rather than assumed, both open to
  correction: the threshold is scoped **to the places list page, not the site** — the
  release is accountable for what this page does, not for the site's total — and day 30 is
  read as a **weekly rate**, the last full week of the window, not a 30-day total. Both are
  explained in §2.2.
  A zero on day 30 is **not** a failure — «пересчитываем», the reading repeats — and the
  interpretation fork it seemed to create is gone: index status is a fact checked in
  Search Console, not something inferred from a zero (§2.2).
  **The two lines that were still required in v1.5 are answered:**
  1. **When the repeat happens, and which reading is final** — «да, второй замер 60 дней».
     Read at 30 days, re-read at 60, and the 60-day reading is the last. The threshold now
     has a moment at which it can be missed, which is what O7 existed to secure. R12 closes
     with it.
  2. **The fate of the second metric** — «число показов кроме поиска меняется всплесками,
     зависит от рекламы в соцсетях. Не нужно отдельно учитывать». Page views are dropped,
     and not for weakness of signal but for want of attribution (§2.2). The consequence was
     not absorbed silently: the statement that metric served stops being called a goal in
     §2, leaving one measured goal instead of a goal with an unreadable number attached.
     That demotion is this document's reading, stated to the owner rather than applied
     quietly, and one sentence reverses it.
  Number retained, not reused.
- **O8. CLOSED in v1.4 — removed by the choice of shape, not decided separately.** Was:
  does US2 rule out shape B, which produces no transferable URL? The chosen shape ships
  the list page, so US2 is served (§2.3) and the question has no subject. Number
  retained, not reused.
- **O9. CLOSED in v1.4 — removed by the choice of shape, not decided separately.** Was:
  is a release acceptable when nothing can measure it? That was asked about pure B, which
  had no metric; the chosen shape has two (§2.2). The owner's "yes" is recorded in §2.2
  together with the two readings it admitted; both became moot once the baselines were
  reported (O10). Number retained, not reused.
- **O10. CLOSED in v1.4 — removed by fact, not by decision.** Was: does the Search
  Console impressions snapshot gate the production release? It mattered only because a
  missing baseline would have made the stated goal permanently unverifiable. The owner
  reported both baselines — 0–2 views a day and impressions near zero `[owner, decision
  2026-08-13]` — so nothing perishable is left to lose, and AC 21 is now a refinement
  rather than a gate. Number retained, not reused.

## 10. Deferred to later versions

In the order the owner raised them:

1. Places not visited by any program, with a call to action to request a custom tour
   `[owner, 9]` — reopens context.md question 3.
2. Photos per place `[owner, 13]`.
3. A page per place, once content justifies it `[owner, 3, 12]`.
4. Reviews attached to places — not before 2027 `[owner, 12]`.
5. A `bonus` refactor `[owner, 17]`.
6. **Walking order — explicitly v2** `[owner, decision 2026-08-13]`: place lists follow
   the route instead of a free order. Constraint this puts on v1, stated in §5: it must
   arrive without rewriting place entries that have already shipped.
