---
name: design-tokens
description: Reference for the project's Tailwind color/font tokens before generating any UI component.
---

Always use these Tailwind tokens (defined in `tailwind.config.js`) — never raw hex values
or Tailwind's default color palette (no `blue-500`, `gray-100`, etc. in this project):

- `ink` (#1B2A4A) — headers, primary text, CTA buttons
- `inkSoft` (#33456B) — secondary text, metadata
- `turmeric` (#E8A33D) / `turmericDeep` (#C7811F) — status accents, the lifecycle stepper
- `tamarind` (#2F6B4F) — open/live/success states
- `kumkum` (#B5432E) — deadline/urgent/error states
- `paper` (#EDE8DC) / `paperRaised` (#F7F4EC) — backgrounds
- `hair` (#D8D2C1) — borders, dividers

Fonts:
- Default body/UI text: Space Grotesk (no class needed, it's the base font)
- Telugu text: always wrap in `.font-telugu` — never let Telugu render in the default font
- Metadata, dates, GO numbers, status labels, anything "data-like": `.font-mono`

Before generating a new component, check whether an existing pattern in
`app/admin/posts/_components/PostForm.tsx` or `app/admin/posts/page.tsx` already
establishes the convention you need (card shape, pill/badge style, form field layout) —
match it rather than inventing a new one.
