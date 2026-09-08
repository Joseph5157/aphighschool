# PRODUCT.md — AP Teacher Desk

This document states what the product is, who it is for, and what it promises, so that
design and UI decisions can be argued from the product rather than from taste.

`AGENTS.md` remains the binding decision record. Where this document and `AGENTS.md`
disagree, `AGENTS.md` wins and this file is wrong and should be corrected.

## What this is

A Telugu-first reference portal for Andhra Pradesh **School Education** government orders,
circulars, memos, proceedings, and teacher notifications.

It is a **reference work**, not a news feed. A teacher arrives with a specific question —
*is this order still in force, what does it actually say, what do I have to do and by when* —
and should leave with a defensible answer plus a route to the source document.

It is independent and unofficial. It does not speak for the department.

## Who it is for

**Primary: a working AP government school teacher.** Reads Telugu first and English second.
Is on a mid-range Android phone, often on a slow or metered connection, often standing in a
corridor between periods. Is not a policy specialist: they need to know what a document means
for them, not to parse its legal structure.

**Secondary: DDOs, HMs, MEOs and retired teachers** using the same documents for pay, leave,
CFMS, GPF and pension work, and the calculators built around them.

Neither audience is browsing for pleasure. Time-on-site is not a goal.

## The jobs the product does

1. **Answer "is this current?"** — surface a document's lifecycle state (current, amended,
   superseded, archived) or, for recruitment notifications, its application stage.
2. **Answer "what does this say, in Telugu?"** — an accurate summary, never a machine
   transliteration, never a re-typing of the source's numeric or tabular content.
3. **Answer "what do I have to do, and by when?"** — the action, the deadline, the link.
4. **Show the provenance** — where this came from, whether it was checked against GOIR, and
   a route to the original PDF.
5. **Connect a document to its background orders** — Related Orders is ranked the founder's
   #1 quality priority, ahead of translation accuracy.
6. **Compute the routine numbers** — DA arrears, leave encashment, GPF/APGLI, PRC, income
   tax, pension and commutation — entirely on the user's device.

## What the product promises

- **Accuracy over freshness.** There is no publishing SLA. Publishing nothing this week is an
  acceptable outcome; publishing something wrong is not.
- **Never overstate what is known.** A date that is only "when we added it" is labelled
  *Added to portal*, never presented as the issue date. A document without a recorded GOIR
  check shows no verification claim — and equally, no accusation of being unverified.
- **The source document is authoritative, not our summary.** Numeric and tabular content
  stays inside the source PDF. Every document keeps a visible route to its original.
- **Independence is stated, not implied.** The product never borrows the visual authority of
  a government site to suggest it is one.

## Explicit non-goals

These are settled decisions, not open questions:

- **Not an engagement product.** No streaks, no nudges, no infinite scroll, no notification
  campaigns. Success is reputation as the reliable source, not traffic or session length.
- **Not a general government portal.** AP only. School Education / teachers only. Not
  Telangana, not other departments, not student-facing content.
- **Not a full-text republisher.** No feature may transcribe pay scales, PTR tables, or
  eligibility criteria out of a PDF into post text.
- **Not multi-user.** A single admin operates the CMS; there is no role management.
- **No WhatsApp or push-notification integration** unless that decision is explicitly
  reopened. Any UI implying such a channel exists is a defect.

## What this means for the interface

These follow from the above and are the product constraints the design must satisfy. The
design consequences are worked out in `DESIGN.md`.

1. **Mobile is the real product surface**, not a reduced version of a desktop one. The phone
   case is the design case.
2. **Density is a feature.** A teacher scanning for one order is served by more documents per
   screen, not by large cards with generous padding.
3. **State must be legible at a glance and never only by colour.** Whether an order is in
   force is the single most consequential thing on any card.
4. **Trust markers must be quiet and precise.** Provenance is information, not a badge of
   quality; it must not be styled like promotional decoration.
5. **Telugu is a first-class script, not a translation afterthought.** It gets its own face,
   its own line-height, and equal typographic standing.
6. **Nothing may be invented to fill space.** Missing contact details, statistics, or
   verification stay missing. An empty region is a content problem, not a layout problem.

## Open product questions that block UI work

Recorded here so later gates do not silently resolve them:

- **Contact and legal surface.** There is no about, contact, privacy or terms route, and no
  genuine contact details anywhere. Two production-readiness checklist items (clickable email,
  clickable phone) cannot be satisfied without a product decision, and nothing may be
  fabricated to close them.
- **Telangana in metadata.** Three tool routes advertise "AP and TS" / "Telangana" in their
  meta descriptions, against the AP-only scope lock. Whether the calculators genuinely serve
  TS users, or the copy is wrong, is a product call.
- **The WhatsApp banner.** It currently claims a channel that does not exist and violates the
  standing no-WhatsApp decision. Removal is the default; repointing requires a real channel.
- **Domain and branding.** "AP Teacher Desk" is still placeholder branding pending a final
  domain.
