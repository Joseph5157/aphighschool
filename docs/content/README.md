# AP Teacher Desk content research system

Status: documentation-only workflow for launch content preparation
Last reviewed: 25 November 2026

## Purpose

This directory separates source research from post writing. Research can be gathered and
reviewed here first; Claude Code can later turn one approved research pack into a CMS-ready
draft using `POST_TEMPLATE.md`.

Nothing in this directory publishes a post, changes production data or replaces the human
quality review. Competitor pages are discovery signals only. A publishable claim must be
traceable to an official source.

## Files

- `POST_TEMPLATE.md` — the required post output contract for Claude Code.
- `RESEARCH_PACK_TEMPLATE.md` — the structure for collecting evidence before drafting.
- `CONTENT_QUEUE.md` — the launch topic queue and current evidence status.
- `research/` — one source pack per topic.
- `drafts/` — CMS-ready draft posts generated from approved packs.
- `launch-batch-1/` — LAUNCH-CONTENT-BATCH-1 manifest and the consolidated Telugu review file.

## Workflow

1. **Discover:** record teacher search wording and competitor coverage without copying text.
2. **Verify:** locate the exact official page, PDF, GO, memo, proceeding or service link.
3. **Record:** put supported facts, gaps, expiry rules and prohibited claims in a research pack.
4. **Approve:** a human decides whether the pack is ready for drafting.
5. **Draft:** Claude Code uses one approved pack plus `POST_TEMPLATE.md`.
6. **Review:** run `.agents/skills/quality-checklist.md` and keep the CMS post as a draft.
7. **Publish manually:** only after source, Telugu, lifecycle and Related Orders checks pass.

## Evidence states

| State | Meaning | Drafting rule |
| --- | --- | --- |
| `verified` | Exact official source supports the claim | May be used with its scope and date |
| `partial` | Official portal exists, but the exact document or current event is not verified | Draft only the verified portion |
| `discovery_only` | Competitor or search result indicates a possible topic | Do not state as fact |
| `blocked` | A required official source is missing or conflicts remain | Do not generate a publishable post |
| `expired` | The official action window or event has passed | Use only as clearly dated historical context |

## Claude Code handoff

Use a prompt like this from the repository root:

```text
Read AGENTS.md, .agents/skills/quality-checklist.md,
docs/content/POST_TEMPLATE.md, and
docs/content/research/<topic>.md completely.

Create one CMS-ready draft using only claims marked verified in the research pack.
Do not copy competitor wording. Do not transcribe numeric tables, vacancy grids,
pay scales, eligibility matrices or PTR tables from PDFs. Preserve unresolved
items as editorial blockers rather than guessing. Keep the draft unpublished.
Return the completed CMS fields, structured article HTML when needed, a source
traceability list, and the explicit quality checklist result.
```

If the research pack is `blocked`, Claude Code should stop with the missing evidence instead
of producing a polished-looking article.

## Source rules

- Prefer the issuing department, GOIR, AP Finance, CSE, SCERT and official service portals.
- Record the exact document number, document date and URL when available.
- A competitor page may identify a search term or possible document, but cannot verify it.
- Do not infer a document type, topic, lifecycle stage or Related Order from a title alone.
- Do not set `verifiedAgainstGoir` unless `sourceUrl` is an exact `https://goir.ap.gov.in` URL.
- Keep long legal text and official numeric tables in the source PDF.
- Review time-sensitive facts again on the day the post is entered in the CMS.

## Repository boundary

Research packs and generated draft files may be committed. Production content edits belong in
the CMS and require separate approval. Do not mix production database edits or application code
changes into a content-research pull request.
