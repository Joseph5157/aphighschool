# Release checklist

Run before every deploy. Automated items are covered by `npm test`; the rest are manual.

## Automated
- [ ] `npm test` — all suites pass
- [ ] `npx tsc --noEmit` — no type errors
- [ ] `npm run build` — production build succeeds

## Content correctness
- [ ] No post shows "GOIR Verified" without a real source URL to the gazette entry
- [ ] No ordinary circular, GO, memo, or proceeding displays "Hall Ticket" or "Results"
- [ ] Every published post shows either a verified "Issued" date or the honest
      "Added to portal" fallback — never a guessed official date
- [ ] No `[DEMO]` post is published

## Publishing pipeline
- [ ] A new post created in the admin is a draft and does not appear on `/`
- [ ] Publishing it makes it appear immediately on `/`, `/orders`, `/search`, and its category
- [ ] Editing a published post updates all four surfaces immediately
- [ ] Deleting it removes it from all four immediately
- [ ] Its slug 404s after deletion, and the tab title does not leak the old title

## Reliability
- [ ] With the database stopped, `/` shows the error boundary, not "No published posts found"
- [ ] With the database restarted, the page recovers on reload

## Presentation
- [ ] Light and dark both render every surface correctly at 360px and 1440px
- [ ] No horizontal scrollbar at 360px on any route
- [ ] Telugu renders in Noto Sans Telugu; English UI in Space Grotesk
- [ ] Contrast: ink-on-paper and inkSoft-on-paper measure 4.5:1 or better in both themes

## Accessibility
- [ ] Every core flow completes with the keyboard alone
- [ ] Every focused control shows a visible ring
- [ ] Telugu passages carry `lang="te"`

## Quality-First content check (do this with 5–10 real posts)
- [ ] Each summary was written from the source PDF, not transcribed from its tables
- [ ] No numeric or tabular data has been lifted out of a PDF into post text
- [ ] Each GO reference matches the source document exactly
- [ ] Each `verifiedAgainstGoir` post was checked against GOIR by a human, today

## Utility Tools & Pensioners Hub
- [ ] PRC Pay Fixation Calculator (`/tools/prc-calculator`) correctly looks up AP RPS 2022 Master Scale stages
- [ ] Income Tax Calculator (`/tools/tax-calculator`) exports clean DDO Annexure-I print statements
- [ ] Pensioners Hub (`/pensioners`) renders 6-Office Retirement Pipeline guide
- [ ] Service Pension Calculator (`/pensioners/pension-calculator`) calculates 40% Commutation and DCRG Gratuity with ₹16L cap
- [ ] Commutation Restoration Tracker (`/pensioners/commutation-tracker`) calculates 180-month timeline and exports STO application letter
