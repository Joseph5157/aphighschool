# Research pack template

Copy this file to `docs/content/research/<topic>.md`. A research pack records evidence; it is
not a post draft.

## Pack metadata

| Field | Value |
| --- | --- |
| Topic |  |
| Canonical tag |  |
| Priority | P1 / P2 / P3 |
| Evidence status | verified / partial / discovery_only / blocked / expired |
| Researched on |  |
| Review by | Date or event |
| Intended post model | Current update / standing reference / action guide / document guide |

## Teacher intent and terminology

- Primary teacher question:
- English search phrases:
- Telugu search phrases:
- Approved role/cadre wording:
- Terms that must not be conflated:

Use only canonical tags from `lib/terminology.ts`. Search wording does not prove a post topic.

## Official source register

| ID | Issuer | Document or page | Reference and date | URL | Checked on | Evidence state | Supports |
| --- | --- | --- | --- | --- | --- | --- | --- |
| O1 |  |  |  |  |  |  |  |

Use the exact source URL. Do not mark a source GOIR-verified unless the URL is on
`goir.ap.gov.in`.

## Verified fact ledger

| Fact ID | Supported fact | Source ID | Scope/condition | Time-sensitive | Safe for post |
| --- | --- | --- | --- | --- | --- |
| F1 |  | O1 |  | yes/no | yes/no |

Keep large numeric tables in the source document. Record that the table exists and what a reader
should use it for; do not copy its rows into this pack.

## Official links and action state

| Action | Official URL | State | Opens/closes | Drafting rule |
| --- | --- | --- | --- | --- |
|  |  | live / closed / not verified |  |  |

## Related Orders and document history

| Document | Relationship | Evidence | Existing portal post | Review note |
| --- | --- | --- | --- | --- |
|  | background / amends / supersedes / clarifies / implements |  | ID or unknown |  |

Do not infer relationships from document order or similar titles.

## Competitor discovery signals

| Site | URL | Signal found | May support publication? |
| --- | --- | --- | --- |
|  |  | Teacher wording, content gap or possible document lead | No |

Summarise the signal in original words. Do not copy paragraphs, tables or layouts.

## Gaps and blockers

- Missing exact official document:
- Conflicting dates or wording:
- Action link not yet live:
- Telugu term requiring review:
- Related Order not yet located in the CMS:

## Do not publish

- Unsupported rates, totals, dates or eligibility claims
- Numeric tables copied from source documents
- Competitor-only claims
- Expired or unverified action buttons

Add topic-specific exclusions here.

## Recommended post set

| Proposed post | State | Required evidence before drafting | Review trigger |
| --- | --- | --- | --- |
|  | ready / verify_first / hold |  |  |

## Claude Code handoff

Before drafting, read `AGENTS.md`, `.agents/skills/quality-checklist.md` and
`docs/content/POST_TEMPLATE.md`. Use only facts marked safe for post. If this pack is blocked,
return the missing evidence and stop.
