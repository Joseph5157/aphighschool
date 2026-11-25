# Deferred document discovery and action plan

- Date recorded: 25 November 2026
- Status: **PLANNED — DEFERRED UNTIL AFTER LAUNCH CONTENT PREPARATION**
- Application changes in this plan: **none**
- Production content changes in this plan: **none**

## 1. Purpose

AP Teacher Desk already has curated Related Orders. It deliberately does not use generic
"related posts", chronological previous/next links, trending feeds or other engagement-driven
recirculation. The next document-discovery work should make the curated relationships easier to
author and understand, then make document and external-action buttons more precise.

This program is deferred while launch content is gathered and verified. It is recorded now so
the decisions are not lost or re-invented during implementation.

## 2. Delivery sequence

Do not combine the gates into one large pull request.

| Gate | Purpose | Schema change | Production content change |
| --- | --- | --- | --- |
| `REL-DATA-1` | Add typed document relationships | Yes | No |
| `REL-CMS-1` | Author relationship type and note safely | No | No |
| `REL-PUBLIC-1` | Show outgoing and incoming document history | No | No |
| `TERM-ACTIONS-1` | Use precise PDF and external-action labels | Yes | Later, after review |
| `ARCHIVE-PAGE-1` | Add pagination and archive filters | No | No |
| `TERM-ROLES-1` | Add SGT/SA/HM/MEO role discovery | Possibly | Requires terminology approval |

## 3. `REL-DATA-1` — typed curated relationships

### Objective

Change Related Orders from an undifferentiated list into verified, directional relationships.
The existing `RelatedOrder` source, target, optional `relationshipNote`, approval flag and
manual/AI source remain in place.

### Recommended schema

```prisma
enum RelatedOrderKind {
  background
  amends
  supersedes
  clarifies
  implements
}
```

Add the following field to `RelatedOrder`:

```prisma
kind RelatedOrderKind @default(background)
```

Existing relationships safely become `background`. Do not infer a more specific kind from a
title, date, reference number or relationship note.

### Direction

For a row where `postId = A` and `relatedPostId = B`, document A performs the stored
relationship against document B.

| Stored kind | Label on A | Inverse label on B |
| --- | --- | --- |
| `background` | Background order | Later related document |
| `amends` | Amends | Amended by |
| `supersedes` | Supersedes | Superseded by |
| `clarifies` | Clarifies | Clarified by |
| `implements` | Implements | Implemented by |

Do not add vague relationship types such as `similar` or `recommended`.

### State safety

Creating an `amends` or `supersedes` relationship must not automatically change the target
post's `orderState`. That is a content decision requiring human verification. The CMS may show
a non-blocking inconsistency warning, but it must never silently modify the target.

### Typed input and validation

Replace `relatedPostIds: string[]` with a typed structure:

```ts
type RelatedOrderInput = {
  relatedPostId: string;
  kind: RelatedOrderKind;
  relationshipNote: string | null;
};
```

Validation must reject:

- a relationship to the same post;
- duplicate target post IDs;
- an unknown relationship kind;
- a target post that does not exist;
- a relationship note longer than 200 characters.

Create and update operations should persist the post and its relationship set in one Prisma
transaction. A relationship failure must not leave a partially updated post.

### Expected implementation surfaces

- `prisma/schema.prisma`
- `lib/validation/post.ts`
- `app/actions/posts.ts`
- `app/admin/posts/[id]/page.tsx`
- `app/admin/posts/_components/PostForm.tsx`
- `app/admin/posts/_components/PostFormClient.tsx`
- the existing schema, validation, create/update and edit-prefill tests

## 4. `REL-CMS-1` — relationship authoring

For each selected related document, the CMS should show:

- English title;
- GO/Rc/Memo reference;
- published or draft state;
- official document date where recorded;
- relationship-kind selector;
- optional relationship note.

Example:

> **G.O.Ms.No.21 — Transfer Rules 2023**  
> Relationship: **Amends**  
> Note: Changes entitlement-point calculation.

Requirements:

- preserve all selected targets, kinds and notes when editing;
- never erase relationship metadata on an unrelated edit;
- permit draft targets, while public pages continue to hide them until published;
- keep every relationship choice manual;
- show non-blocking warnings for relationship/state inconsistencies;
- never infer a relationship from document text or metadata.

### Candidate search

The current candidate picker loads only the latest 100 posts. Increasing that limit is not a
durable solution because older background orders are often the most important targets. Replace
it with an authenticated admin search that:

- searches English title, Telugu title, reference number and topic tag;
- excludes the current post;
- returns a small bounded result set, approximately 20 at a time;
- always loads already-selected targets even when they are outside the current result set.

## 5. `REL-PUBLIC-1` — document relationship history

### Query contract

The post detail query should load both:

- `relatedFrom`: documents the current post affects or uses;
- `relatedTo`: later documents that affect or refer to the current post.

Both directions must require `approved: true` and a published target/source. Select only the
fields rendered by the component: ID, slug, titles, reference, official/created date,
document type, order state, relationship kind and relationship note.

### Presentation

Replace the current one-direction timeline with one section titled **Document relationships**.
Render these groups only when they contain records:

1. **This document refers to**
2. **Later documents affecting this order**

Each compact item shows:

- directional relationship label;
- reference number;
- official date, falling back to the portal date through `DocumentDate`;
- English and Telugu titles;
- optional authored note;
- current/amended/superseded state;
- internal link to the document.

Use deterministic official-date ordering with the existing fallback rule. Do not render an
empty relationship section.

Placement:

- short post: after summary/source information and before the final browse link;
- long post: after the article body and before the closing browse link;
- leave the desktop table of contents unchanged;
- do not add another large panel before the article starts.

### Revalidation

When A -> B is added, changed or removed, revalidate both A and B. Also revalidate:

- targets removed during an edit;
- targets newly added;
- linked pages when a related draft is published;
- every affected linked page before deleting a post.

The inbound relationship view must not remain stale for the ISR interval after a CMS change.

## 6. `TERM-ACTIONS-1` — precise actions

This gate remains separate from relationship work.

### Recommended schema

```prisma
enum ActionKind {
  apply_online
  web_counselling
  application_status
  hall_ticket
  answer_key
  results
  official_portal
}
```

Add a nullable `actionKind` to `Post`. Never infer it from a URL, title, lifecycle state or
domain.

| Action kind | Public label |
| --- | --- |
| `apply_online` | Apply online |
| `web_counselling` | Open web counselling |
| `application_status` | Check application status |
| `hall_ticket` | Download hall ticket |
| `answer_key` | View answer key |
| `results` | View results |
| `official_portal` | Open official portal |

PDF labels may be derived from the recorded `documentType`:

- Open GO PDF
- Open Proceedings PDF
- Open Memo PDF
- Open Circular PDF
- Open Notification PDF
- fallback: Open document PDF

Keep the mapping in one server-safe terminology module so `OfficialSourceCard`,
`ActionSummary` and `ThumbZoneBar` cannot drift. Existing unclassified action links retain the
safe `Open action link` fallback until manually reviewed. Production classification requires a
separate approved content-edit list.

## 7. Required regression coverage

- Existing relationships receive the `background` default without data loss.
- Every Prisma relationship enum value is accepted; unknown values are rejected.
- Self-links, duplicate targets, missing targets and oversized notes are rejected.
- Kind and note survive the complete edit-page -> form -> action -> database chain.
- Create/update operations are atomic.
- Draft and unapproved relationships never render publicly.
- Outgoing and incoming directions use the correct labels.
- Relationship changes disappear from both rendered document pages.
- Generic recent posts, chronological previous/next posts and tools feeds remain absent.
- Relationship cards do not overflow at 360px or 390px.
- Light/dark modes remain readable and every interactive target is at least 44px.

Verification widths: 360, 390, 768 and 1440 pixels in light and dark mode.

Repository verification currently requires the local Postgres service and the non-interactive
build command:

```bash
docker compose up -d postgres
npx prisma generate
npm run db:push
npx tsc --noEmit
npm test
npx next build --no-lint
```

## 8. Explicit non-goals

This program must not add:

- algorithmic or generic related posts;
- chronological previous/next posts;
- trending or most-viewed claims;
- WhatsApp or push integrations;
- automatic order-state changes;
- AI-generated relationship notes;
- copied competitor content or layouts;
- production content edits inside a code pull request;
- role aliases such as SGT/SA/MEO before their terminology is approved.

## 9. Implementation handoff

When work resumes, start only `REL-DATA-1` from a fresh branch based on the then-current
`origin/main`. Read `AGENTS.md`, the Related Orders schema, post actions and validation, the
complete admin-form data chain, `DocumentTemplate.tsx`, and the relationship regression tests
before editing. Stop with an unmerged pull request for review; do not continue automatically to
the next gate.
