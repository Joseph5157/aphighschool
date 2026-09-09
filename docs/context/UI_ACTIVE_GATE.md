# UI Active Gate

## Active gate

`UI-CONTENT-1`

## Status

CLOSED

## Purpose

Remove placeholder/demo text, fake counters/statistics, unsupported claims, stale copy, and
dead UI from the public application, per `UI_SYSTEM_MASTER_PLAN.md` Phase 9.

## Scope boundary

`app/(public)` only, consistent with every prior gate's scope note. `app/admin` was not
touched. Verification-only findings that would have required fabricating real-world facts
(tax law, pension rules) this gate cannot authoritatively check were left unfixed and
recorded below rather than guessed at.

## Findings closed

| Finding | Disposition | Evidence |
|---|---|---|
| `UI_AUDIT.md` F16 — WhatsApp banner claiming a channel that doesn't exist, linking to `https://whatsapp.com` | **DELETED** — `WhatsAppBanner.tsx` removed and its two import/usage sites (`DocumentTemplate.tsx`, `posts/[slug]/page.tsx`) cleaned up. `PRODUCT.md` named removal as the default; `AGENTS.md` hard rule #3 and its own non-goals section call any UI implying a WhatsApp channel a defect. | New guard `test/no-fabricated-channel.test.ts` scans all of `app/(public)` for any mention of WhatsApp. |
| `UI_AUDIT.md` F25 — "AP and TS" / "Telangana" scope-lock violations in copy | **FIXED**, five instances (three more than the audit's original three): `tools/da-arrears/page.tsx`, `tools/gpf-apgli/page.tsx`, `tools/prc-calculator/page.tsx` metadata descriptions; `tools/tax-calculator/_components/TaxCalculatorUI.tsx`'s HRA-rule FAQ copy; `pensioners/page.tsx`'s hero copy. `AGENTS.md`'s Scope Lock is AP-only; the calculators are built on AP-specific rules (AP RPS 2022, AP GPF/APGLI), so claiming TS coverage was also a correctness defect, not only a scope one. | New repo-wide guard `test/scope-lock.test.ts` scans all of `app/(public)` for "Telangana", "AP and TS", "AP & TS" — closes the whole defect class instead of the next single file a grep happens to catch. |
| `UI_AUDIT.md` F30 — hardcoded "Quick Searches" chips and `TopicTagBar`'s featured-topic chips could lead to "no matching documents" | **FIXED, structurally** — both now render only candidates verified server-side against real content. New `lib/posts/query.ts` functions: `quickSearchChips(candidates)` (runs each candidate through the same `searchPosts` matching a click would trigger) and `tagsWithPublishedContent(candidates)` (checks a tag is actually carried by a published post). `SearchUI` hides the "Quick Searches" section entirely if nothing survives; `TopicTagBar` takes a required `availableTags` prop and renders `null` if no curated topic survives filtering. Both wired through `optionalQuery` (decorative-surface degrade-silently contract) in `search/page.tsx` and `orders/page.tsx`. | `test/search-query.test.ts` (4 new DB-backed tests), `test/topic-tag-bar.test.tsx` (3 tests) — mutation-checked: reverting the topic-bar filter to the unfiltered list, and reverting the chip source to the old hardcoded array, both fail the guards. |
| Tools index (`tools/page.tsx`) claimed identical "Fill Details → Auto-Calculate → Export PDF" steps on all six tool cards | **FIXED** — found by the tools/pensioners copy-vs-logic audit (below), not the original audit. Only `TaxCalculatorUI` (`window.print`) and `PrcCalculatorUI` (`isPrintMode`) implement export; `CfmsCheckerUI` is a links directory with no fill/calculate/export step at all. Each tool's `steps` array now reflects what that tool's own component actually does; the step-chip block renders nothing when `steps` is empty. | New `test/tools-index.test.tsx` (3 tests), mutation-checked — reverting all six tools to the shared array fails 2 of 3 assertions. |
| `PrcCalculatorUI.tsx:60` — selecting any HRA preset other than the default silently had no effect (`hraVal` read `customHra` in both branches of its ternary) | **FIXED** — one-line correction to read `hraPreset` in the non-custom branch, matching the identical pattern already used for `fitmentVal`/`daVal` two lines above. Found as a byproduct of auditing the HRA rule's copy; it is a calculation bug, not a copy defect, but left the field's own label ("Applicable HRA rate for your working location") false for 3 of its 4 preset options, so it was fixed in this gate rather than deferred. | New `test/prc-calculator-ui.test.tsx`, mutation-checked — reverting the fix makes the fixation summary identical across HRA presets, and the test catches it. |

## Checked and found accurate — not touched

A dedicated audit pass (copy in every `tools/` and `pensioners/` page/component, checked
against that same file's own logic/data) found no other genuine mismatch:
GPF 7.1% interest, APGLI slabs, EL 15/30-day limits, the 300-day EL cap, the 180-month
commutation figure (matches the 15-year Telugu copy), the additional-quantum age bands, and
the office-pipeline's "6 offices" claim (matches the 6-item `OFFICES` array exactly) are all
internally consistent with their own component's constants and FAQ text. FY 2025-26
references are consistent among themselves with no in-code default contradicting them — a
domain/legal fact this gate cannot authoritatively verify, so it was not treated as a
finding either way (see Known limitations in `UI_CURRENT_STATE.md`).

The `[DEMO]`-titled posts visible in the local database are intentional seed fixtures
(`prisma/seed.ts`, guarded by `test/seed-integrity.test.ts`), not production content — left
alone as out of scope for a UI gate.

## Required closure evidence

- Starting worktree clean at `81c27e5` (`UI-STATES-1` closure SHA), local and remote in
  agreement.
- Full Vitest suite: 55 files, 402 tests pass (up from 389 — 13 new tests: 4 in
  `test/search-query.test.ts`, 3 in `test/tools-index.test.tsx`, 3 in
  `test/topic-tag-bar.test.tsx`, 1 in `test/scope-lock.test.ts`, 1 in
  `test/no-fabricated-channel.test.ts`, 1 in `test/prc-calculator-ui.test.tsx`). `npx tsc
  --noEmit` passes. `git diff --check` clean (CRLF-normalization notices only, no actual
  whitespace errors).
- The local Postgres 16 container this program has relied on for DB-backed tests was not
  reachable this gate (Docker Desktop's engine was not running). DB-backed tests were run
  against an equivalent database on the machine's separately-running native PostgreSQL
  service instead (schema pushed via `prisma db push`, confirmed already in sync) —
  `.env.test` itself was not changed. Recorded so a future session does not assume Docker
  is required.
- Every new/changed guard was mutation-tested against the defect it exists to catch:
  reverting the PRC HRA fix, reverting the six tools to a shared step array, reverting the
  topic-bar/chip filtering, and reintroducing "AP & TS" copy all fail their respective new
  test — **zero survivors**.

## Closure notes

**The audit's own F25 list was incomplete, and the gap was found by extending its method,
not by re-running it.** F25 named three tool-metadata descriptions; a plain grep for
"Telangana" / "AP and TS" / "AP & TS" across `app/(public)` this gate found two more
instances the audit missed (a tax-calculator FAQ answer, the pensioners hub hero copy) —
including one already fixed once before, silently, in `leave-encashment` (a pre-existing
guard, `test/leave-encashment-ui.test.tsx`, proves it). Five fixes across four gates'-worth
of audits sharing one defect shape is exactly the whack-a-mole a repo-wide guard is for, so
`test/scope-lock.test.ts` closes the class instead of the next instance.

**Two genuine defects surfaced from a task this gate delegated rather than one it went
looking for.** A background audit comparing every `tools/`/`pensioners/` page's copy against
its own component's logic (asked to find provable mismatches only, not opinions) returned
three findings: the tools-index step-chip claim, the PRC HRA calculation bug, and the
pensioners-hub "AP & TS" line. The first two were not in `UI_AUDIT.md` at all. This is the
same lesson `UI-PATTERNS-1` drew from merging duplicate templates — a targeted, adversarial
check surfaces defects that reading code start-to-finish does not.

**A hardcoded content-availability claim is only fixable by removing the hardcoding.** F30
could have been "closed" by manually verifying six strings against the current database and
either keeping or swapping them — but that fix rots the moment new posts are published or
old ones are archived. `quickSearchChips`/`tagsWithPublishedContent` make the claim
self-correcting: a topic gains a working chip the moment real content exists for it, and
loses it the moment nothing does, with no future gate needed to re-verify a fixed list.

**Not every stale-sounding thing is a defect.** FY 2025-26 branding, read against today's
date, looks calendar-stale — but changing it would mean inventing what a not-yet-verified
future Union Budget's tax slabs are, which is exactly the kind of fabrication `AGENTS.md`
forbids. Recorded as a known limitation rather than "fixed" with guessed numbers.

## Next gate after closure

`UI-SEO-1`
