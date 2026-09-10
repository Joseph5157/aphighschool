# Homepage Telugu title experiment — record

Branch: `home-telugu-1`

Branch point: verified clean `main` at `991e58011618cbeed0002cc0c18eb773286bbaf0`.

Part of the small `HOME-*` series started by `docs/context/HOME_POLISH_PLAN.md`. This gate is a
**measured experiment**, not an assumed redesign, and it did not ship a code change.

## Question

`PostCard`'s Telugu title (`text-telugu-body ... truncate`) is capped to one line, while the
English title (`text-card-title ... line-clamp-2`) gets two. Does raising the Telugu title to a
two-line cap improve the Telugu-first product enough to justify the row-height increase and lost
first-viewport density?

## Method

Measured in real Chromium (`npx next build` + `npx next start`, not the dev server — the dev
server hit repeated stale-chunk/404 flakiness this session and was abandoned in favor of a
production build for reliable measurement) against the live seeded database (6 real published
posts, not synthetic fixtures). Line counts and truncation were measured by cloning each title
element, forcing `white-space: nowrap` on the clone to get its true single-line height, and
comparing the clamped element's rendered/scroll height against that reference — not assumed from
character counts.

## Baseline measurements (`truncate` — current production behaviour)

All 6 published posts, sampled as short/medium/long by Telugu character count:

- Short: `అసలు పీటీఆర్ నిబంధనలు మరియు సిబ్బంది పునర్వ్యవస్థీకరణ మార్గదర్శకాలు` (67 chars, needs 3 natural lines)
- Medium: `ఎపిటెట్ రెస్పాన్స్ షీట్ డౌన్‌లోడ్ మరియు స్కోర్ క్యాలిక్యులేటర్ ఆన్‌లైన్ లింక్ 2026` (82 chars, needs 3 natural lines)
- Long: `APPSC డిపార్ట్‌మెంటల్ పరీక్షల నోటిఫికేషన్: GOT (88), EOT (97) & పేపర్ 141 ఆన్‌లైన్ దరఖాస్తు మరియు మెటీరియల్` (107 chars, needs 4 natural lines)

| Viewport | Row 1 top/bottom | Row 2 bottom | Row 3 bottom | Bottom-nav top | Row 3 visibility |
| --- | --- | --- | --- | --- | --- |
| 375×812 | 251 / 438 | 626 | 829 | 750 | ~58% |
| 390×844 | 223 / 410 | 598 | 801 | 782 | ~90% |
| 1440×1000 | 208 / 332 | 472 | 612 | n/a (no bottom nav) | 100% (all 6 rows fit in 1000px) |

Row heights at 375/390: 187px (4 rows) / 172px (2 rows) — driven by whichever of the two-line
English title or the single-line Telugu title is taller in that row's flex layout.

Telugu: every row is `truncate`d to 1 line at mobile widths. Visible-fraction (measured via
`clientWidth / scrollWidth`, not estimated): 31–39% of each title's characters are visible before
the ellipsis. At 1440px, no Telugu title truncates at all — the column is wide enough that even
the 107-character title fits on one line. **The truncation problem this gate investigates is
mobile-only; it does not exist on desktop today.**

English: at 390px, 5 of 6 titles are already clamped at 2 lines (`scrollHeight > clientHeight`);
only the shortest (`[DEMO] Original PTR Norms & Staff Restructuring Guidelines`) fits fully.

## 2-line prototype

Changed only `PostCard.tsx`'s Telugu title class from `truncate` to `line-clamp-2`. No other
file touched — font family, size, line-height, English treatment, padding, category tile,
metadata, badge, date, reference, rail, feed width, nav, spacing and search were all left alone,
confirmed by `git diff --stat` showing exactly one changed line during the experiment.

### Measurements

| Viewport | Row 1 top/bottom | Row 2 bottom | Row 3 bottom | Bottom-nav top | Row 3 visibility |
| --- | --- | --- | --- | --- | --- |
| 375×812 | 251 / 466 | 682 | 913 | 750 | ~24% |
| 390×844 | 223 / 438 | 654 | 885 | 782 | ~52% |
| 1440×1000 | 208 / 332 | 472 | 612 | n/a | 100% (unchanged) |

Row heights at 375/390: 215px (4 rows) / 200px (2 rows) — every row exactly **+28px** over its
baseline value, because every one of the 6 real Telugu titles needed 3–4 natural lines and so
every row actually used the 2nd line the clamp now allows. No inconsistency: the increase is
uniform across all sampled rows.

Telugu clamped-to-2 status: **all 6 titles are still truncated at 2 lines.** None of the 6 needed
only 2 lines; they need 3 or 4. Measured visible-fraction roughly doubles (to ~50–67% of each
title's natural content) but **zero of six titles reach full, untruncated display** — every row
still ends in an ellipsis, just later.

Desktop (1440×1000): **no change of any kind.** Row heights, rail width (312.25px), feed width
(1000.75px), and horizontal scroll (none) are byte-for-byte identical to baseline — text already
fit on one line at this column width regardless of the 1-line/2-line cap, so the variant is inert
at desktop.

### Adaptive variant — considered, not built

The gate allows testing at most one adaptive alternative, only if the simple 2-line variant has a
clear problem. It does (see Decision below), so one was evaluated: **cap English to 1 line while
letting Telugu take 2.**

This was checked analytically from figures already measured in this experiment (English
single-line height 21px, Telugu single-line height 28px, both taken from the clone-and-measure
technique above) rather than fully built and re-measured in Chromium, because the arithmetic
alone rules it out:

- Baseline text-stack height per row: English 2-line (42px) + Telugu 1-line (28px) = **70px**.
- Adaptive text-stack height per row: English 1-line (21px) + Telugu 2-line (56px) = **77px** —
  a **net increase**, not a decrease. It would not recover any of the lost density.
- It would also make English strictly worse: 5 of 6 titles are already clamped at 2 lines today;
  capping to 1 line would truncate all 6, including the one title that currently displays in
  full.

A breakpoint-gated variant (2-line Telugu only above some width) was also considered and rejected
on the same principle basis PRODUCT.md states directly: "Mobile is the real product surface, not
a reduced version of a desktop one." The corridor-scanning primary use case is the narrow-viewport
case where this tension is sharpest; deferring any Telugu improvement to wider breakpoints would
not serve that primary user, and desktop already has no truncation problem to solve.

Neither adaptive candidate survived inspection, so neither was implemented or measured live in
Chromium — doing so would have been process without a plausible payoff.

## Product evaluation

### Telugu-first benefit

Real but partial. Visible Telugu content roughly doubles per row (from ~1/3 to ~2/3 of the
sentence). It does **not** achieve parity with English's actual outcome (5 of 6 English titles
already read close to complete at 2 lines; 0 of 6 Telugu titles would read complete at 2 lines in
this dataset) and does **not** eliminate truncation for any real document — every title still
ends in an ellipsis, just after more words.

### Density cost

Real and measured, not assumed. Third-row visibility — the exact metric `HOME-POLISH-1` just
worked to improve — drops from ~90% to ~52% at 390×844, and from ~58% to ~24% at 375×812. Row
height rises by a uniform 28px (~15%) on every row that has a real (non-trivial) Telugu title,
which in this dataset is all of them.

## Decision

`KEEP CURRENT 1-LINE TELUGU`

## Rationale

The two questions the gate asks are answered separately, and they don't net to a clear win for
the 2-line variant:

- The benefit is real (visible content roughly doubles) but incomplete — it does not solve the
  actual problem of a Telugu reader seeing the whole title before opening the document, for any
  of the six real posts measured. It converts "shows ~1/3, then …" into "shows ~2/3, then …",
  which is a smaller win than "shows the whole title" would have been.
- The cost is concrete, measured on the same real dataset, and lands on the exact number this
  project has spent two just-closed gates (`SLOP-DENSITY-1`, `HOME-POLISH-1`) protecting: how
  much of the document feed a phone user sees without scrolling. Row 3 going from "mostly
  visible" to "barely started" is a material regression on that number.
- `DESIGN.md` §4 states the tie-breaker directly: where density and a more generous/"airy"
  treatment conflict, density wins. This is that conflict, measured, and the design system's own
  rule resolves it.
- Neither of the two candidate adaptive variants clears the bar once checked against numbers
  already measured in this same experiment — one is arithmetically a net density loss, the other
  contradicts the product's own "mobile is the real surface" principle.

This does not mean the Telugu-title asymmetry is a non-issue — it is a real, honestly-measured
tension between two values the product holds simultaneously (`PRODUCT.md`: Telugu-first
comprehension; `DESIGN.md` §4: density). A CSS line-count change is not the fix for it in this
dataset; the more effective lever, if the founder wants to revisit this, is shorter/more scannable
authored Telugu titles (a content decision, not a layout one) or a different card composition
entirely (a redesign, out of this gate's narrow scope).

## Application change

**REJECTED.** `app/(public)/_components/PostCard.tsx`'s Telugu title class was reverted to its
baseline `truncate` before this record was written. `git diff --stat` against `main` shows only
this documentation file.

## Files changed

- `docs/context/HOME_TELUGU_PLAN.md` (new) — this record.

No application code file differs from `main`.
