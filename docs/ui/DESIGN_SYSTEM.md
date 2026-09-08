# Design System — AP Teacher Desk

Defined in gate `UI-DESIGN-1`. This is the **specification `UI-SYSTEM-1` implements**, not a
description of current behaviour. Where this document and the code disagree today, the code
is the defect and `docs/ui/UI_AUDIT.md` records it.

Read `DESIGN.md` for the direction and the reasoning; this file is the values and rules.

Source-of-truth order: `AGENTS.md` → `PRODUCT.md` → `DESIGN.md` → this file.

---

## 0. Foundational rules

These three rules exist because the audit proved each one has already been violated silently.

### R0.1 — Only utilities that compile may be used

The project pins `tailwindcss ^3.4.4`. Tailwind **v4** utility names do not exist here and
degrade to nothing with no error. Banned outright: `shadow-2xs`, `shadow-xs`,
`backdrop-blur-xs`, and any other v4-only name.

Any project-specific utility (`no-scrollbar`) or animation (`animate-fadeIn`,
`animate-slideUp`) **must be defined** — in `app/globals.css` under `@layer utilities`, or as
`theme.extend.keyframes` / `theme.extend.animation` in `tailwind.config.js` — before it is
used.

`UI-SYSTEM-1` must add a guard test that compiles the stylesheet and asserts every class used
in `app/**` appears in the output. Without that guard this rule will be broken again.

### R0.2 — The colour token set is closed

The tokens in §2 are the complete palette. Do not use raw hex, and do not use Tailwind's
default palette (`emerald-*`, `amber-*`, `red-*`, `gray-*`, …) anywhere in `app/`.

**`accent` is not a token and must never be introduced.** See §4.

### R0.3 — Focus visibility may never be removed without a replacement

No element may carry a bare `outline-none`. See §6.

---

## 1. Typography

Three families, fixed by `AGENTS.md`. Do not add a fourth.

| Family | Role | Variable |
|---|---|---|
| Space Grotesk | All English UI and body text. The default; needs no class. | `--font-space-grotesk` |
| Noto Sans Telugu | **All** Telugu text, always. Never substituted, never auto-transliterated. | `--font-noto-telugu` |
| IBM Plex Mono | Data only: dates, GO numbers, document/status labels, reference codes, figures in calculator output. | `--font-plex-mono` |

Mono is **not** for body copy, headings, navigation labels, or button text. Its job is to
mark a value as machine-readable data.

### 1.1 Scale

Replaces the `--label-primary` / `--label-secondary` / `--label-helper` custom properties,
which are removed: they invert (larger on mobile than desktop), `--label-helper` is declared
and never consumed, and `TaxCalculatorUI` applies the responsive step twice, landing labels at
11px on desktop.

| Token | Mobile | ≥768px | Weight | Use |
|---|---|---|---|---|
| `display` | 22px / 1.3 | 28px | 700 | Page `h1`. One per route. |
| `section` | 18px / 1.35 | 20px | 700 | `h2` section headings. |
| `card-title` | 15px / 1.4 | 16px | 700 | Document titles in cards and rows. |
| `body` | 15px / 1.6 | 16px | 400 | English prose. |
| `telugu-title` | 18px / 1.75 | 20px | 600 | Telugu document titles. |
| `telugu-body` | 16px / 1.75 | 17px | 500 | Telugu prose. |
| `meta` | 12px / 1.25 | 12px | 600 | Mono metadata: dates, GO numbers, state labels. |
| `label` | 12px / 1.3 | 12px | 600 | Form labels. |

Telugu keeps a larger line-height than Latin at every step; the script's ascenders and
descenders need it.

### 1.2 Minimum sizes — hard floors

- **12px** is the absolute floor for any text, including badges, helper text and captions.
  This retires the current 9px badge size, the 10px form labels, and the 10px nav labels.
- **16px** is the floor for the *font-size of any focusable form control* on mobile. Below
  16px, iOS Safari zooms the viewport on focus. This is a functional requirement, not a
  preference.
- Body measure: **65–75 characters**. Prose containers cap at `~72ch`.

### 1.3 Uppercase tracked labels

Permitted for genuine section labels only. Rules: minimum 12px, `letter-spacing: 0.08em`,
weight 600, at most one per region, never two in immediate sequence, never as a caption
directly beneath the heading it duplicates.

---

## 2. Colour and semantic roles

Values are the current `app/globals.css` definitions and are unchanged. What this gate defines
is the **role each token plays**, so that colour choices stop being ad hoc.

### 2.1 Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `ink` | `#1B2A4A` | `#F5F2E9` | Primary text, headings, primary button fill |
| `inkSoft` | `#33456B` | `#A9B4C7` | Secondary text, metadata |
| `paper` | `#EDE8DC` | `#131A28` | Page background |
| `paperRaised` | `#F7F4EC` | `#1C2536` | Raised surface: cards, inputs, bars |
| `hair` | `#D8D2C1` | `#33405A` | Borders, dividers, rules |
| `tamarind` | `#2F6B4F` | `#5FA37E` | **In force / open / success** |
| `tamarindDark` | `#245640` | `#4A8A67` | Hover for tamarind fills |
| `turmeric` | `#E8A33D` | `#F0B45C` | **Attention / amended / lifecycle stepper** |
| `turmericDeep` | `#CB8624` | `#E8A33D` | Turmeric text on light fills; hover |
| `kumkum` | `#B5432E` | `#E0705A` | **Superseded / deadline / error** |
| `masthead` | `#1B2A4A` | *(does not flip)* | Letterhead panels |
| `mastheadText` | `#EDE8DC` | *(does not flip)* | Text on letterhead |

`.agents/skills/design-tokens.md` documents `turmericDeep` as `#C7811F`; the implemented value
is `#CB8624`. **`app/globals.css` is authoritative**; `UI-SYSTEM-1` should correct the skill
doc rather than the code.

### 2.2 Semantic roles — the mapping to use

| Meaning | Token | Notes |
|---|---|---|
| In force, open, available, verified | `tamarind` | |
| Needs attention, amended, in progress | `turmeric` / `turmericDeep` | |
| Superseded, past deadline, error, destructive | `kumkum` | |
| Historical, archived, inactive, neutral | `hair` + `inkSoft` | |
| Chrome and navigation | `ink` / `inkSoft` on `paper` / `paperRaised` | Never a status colour |

**Status colours may not be borrowed for chrome, and chrome colours may not be borrowed for
status.** This is what went wrong with `accent`.

### 2.3 The masthead does not invert

`--color-masthead` and `--color-masthead-text` are deliberately fixed in both themes so
letterhead panels read identically light and dark. `app/globals.css` documents this. **Do not
add an `html.dark` override for these two variables.**

Consequence for `UI-SYSTEM-1`: any element placed on a masthead panel must be styled for a
dark navy ground in *both* themes — including focus rings (§6).

### 2.4 Never encode meaning in colour alone

Every status carries a **word**. The colour is reinforcement. A colour-blind user, a
greyscale print, and a screen reader must all get the same answer.

---

## 3. Document state, lifecycle and freshness

This is the product's most consequential presentation. `lib/posts/lifecycle.ts` and
`app/(public)/_components/lifecyclePill.ts` own the logic; this section owns the appearance.
**Do not re-derive the rules per surface — read them from those modules.**

### 3.1 Which indicator a document gets

Only `documentType === "notification"` has an application lifecycle and receives the
recruitment stepper (Notified → Apply open → Hall ticket → Results). Every other document type
— GO, circular, memo, proceeding — shows its **order state** instead.

### 3.2 Order state palette — corrected

| State | In force | Badge variant | Rationale |
|---|---|---|---|
| `current` | yes | `tamarind` | Operative |
| `amended` | yes | `turmeric` | Operative, but read with its amendment |
| `superseded` | **no** | **`kumkum`** | **Changed.** A later order replaced it; acting on it causes real harm |
| `archived` | no | `neutral` | Historical record, no successor to redirect to |

`superseded` currently maps to `tamarind` — the green family — because `Badge` has no `kumkum`
variant. The mapping comment in `lifecyclePill.ts` already names this as the intended fix.
`UI-SYSTEM-1` adds the variant (§8.2) and updates `ORDER_STATE_VARIANT`.

### 3.3 The recruitment stepper

A numbered sequence is justified here because the content genuinely is one. Completed stages
`tamarind`, current stage `turmeric` with the strongest weight in the row, future stages
`hair`/`inkSoft`. An expired notification renders the stepper in a spent state and pairs it
with a `kumkum` deadline statement. Stage position comes from `statusBadge`; never infer it
from the date.

### 3.4 Freshness — dates always carry their label

`lib/dates.ts` distinguishes **`Issued`** (the department's date) from **`Added to portal`**
(ours, used when `documentDate` is null). The label is not optional decoration:

- **Never render a bare date.** Every date is preceded by its `dateLabel()` value.
- The label and the date are one unit and may not be split across a wrap or a truncation.
- Both are `meta`/mono.
- Relative phrasing ("2 days ago") is not used for official dates — a teacher citing an order
  needs the actual date.

### 3.5 Action deadlines

A future deadline is `turmeric`. A deadline within the next 7 days is `kumkum`. A passed
deadline renders as passed and the document reads as closed — never as an active call to
action. Deadlines are computed in IST (`lib/dates.ts`); never against a UTC instant.

---

## 4. Navigation and active state

### 4.1 The `accent` problem

`bg-accent/15`, `text-accent`, `border-accent` are used for the active sidebar item, the
active submenu item, and the current pagination page. `accent` is in neither
`tailwind.config.js` nor Tailwind's default palette, so **every colour in those active
branches is dropped** and the active item is visually identical to its siblings.

**Resolution: retire `accent`.** Do not define it. Per §2.2, navigation position is chrome and
must not borrow a status colour.

### 4.2 The active-navigation treatment

Active state is a composition of existing tokens plus a **structural indicator**, so it
survives greyscale and colour-blindness:

- **Surface:** `paperRaised` fill (against the `paper` page ground).
- **Text:** `ink` at weight 700 (inactive siblings are `inkSoft` at 500).
- **Indicator:** a solid `turmeric` rule, 3px — the leading edge for vertical menus (sidebar,
  submenu), the bottom edge for horizontal ones (tabs, desktop nav).
- **Bottom tab bar:** `ink` icon and label plus the 3px `turmeric` rule along the item's top
  edge. The current perpetual `animate-pulse` dot is removed (`DESIGN.md` §7).
- **Pagination current page:** `ink` fill, `paperRaised` text, no rule needed — the inversion
  is the indicator.

### 4.3 Active state must be announced, not only drawn

Every active navigation item sets **`aria-current="page"`**. Currently only `Pagination` and
`Breadcrumb` do; `BottomNav`, `DesktopNav` and the sidebar menus do not.

### 4.4 Landmarks

Each `<nav>` gets a distinguishing `aria-label` — the shell currently mounts three unlabelled
ones. A **skip-to-content link** is required as the first focusable element in the public
layout.

---

## 5. Layout, spacing, containers, density

### 5.1 Spacing scale

4px base; use `0.5 1 1.5 2 3 4 6 8 12` (2–48px) from Tailwind's default scale. Arbitrary
spacing values (`p-[13px]`) require a comment justifying them.

Grouping over padding: separation between *groups* carries the hierarchy; padding *within* an
item stays tight. Sibling groups are laid out with flex/grid `gap`, never with per-element
margins or source whitespace — gap survives direct manipulation and reordering.

### 5.2 Containers

| Container | Max width | Use |
|---|---|---|
| `shell` | 1800px | Header and main content wrapper |
| `document` | 1700px | Post detail templates |
| `prose` | ~72ch | Reading measure for `prose-gazette` body copy |
| `form` | 640px | Single-column calculator forms |

Horizontal padding steps: 16px → 24px (`sm`) → 32px (`lg`) → 40px (`xl`).

The `shell` and `document` widths are the existing values, kept deliberately: they are
`max-w-*`, not fixed widths, and the audit found no overflow caused by them.

### 5.3 Density

Target on a 390px-wide phone: **at least three document rows visible without scrolling** below
the header. Card padding 12–16px on mobile, 16–20px on desktop. Row height is driven by
content, not by a fixed minimum.

### 5.4 Bottom-anchored elements

**At most one fixed bottom bar may be mounted on any route.** Post detail pages currently
mount two (`ThumbZoneBar` and `BottomNav`, both `fixed bottom-0 z-50`).

- The shell reserves space equal to the bar actually present, at the widths where it is
  present — not an unconditional `pb-[64px]`.
- Every fixed bottom bar adds `env(safe-area-inset-bottom)` to its bottom padding.
- The page-level scrim sits above the bottom bar, not below it (§7.2).

---

## 6. Focus treatment

### 6.1 Why this is specified in detail

Focus is defeated twice in the current build:

1. `.outline-none { outline: 2px solid transparent }` is emitted in the utilities layer at the
   same specificity `(0,1,0)` as the `@layer base` `:where(…):focus-visible` rule and later in
   source order, so it **wins** and cancels the global outline.
2. `focus:ring-<color>` sets `--tw-ring-color` only. With no ring-*width* utility,
   `--tw-ring-shadow` stays at its `0 0 #0000` initial value and **the ring never paints**.

`Input` and `NativeSelect` do both, leaving a 1px border colour change as the only focus
affordance on every form control in the product.

### 6.2 The specification

One treatment, defined once in `app/globals.css`:

```
outline: 2px solid var(--focus-ring);
outline-offset: 2px;
border-radius: 4px;
```

applied on `:focus-visible` to `a, button, input, select, textarea, summary, [tabindex]`.

`--focus-ring` is context-dependent so the ring is visible on every ground the product uses:

| Context | `--focus-ring` |
|---|---|
| Default (light `paper` / `paperRaised`) | `ink` |
| `html.dark` | `turmeric` |
| Masthead / letterhead panels (both themes) | `turmeric` |

`ink` on cream and `turmeric` on navy are both high-contrast; using one colour everywhere
would fail on one of the two grounds. Because the masthead does not invert (§2.3), its
override applies in both themes.

### 6.3 Rules

- **No bare `outline-none`.** A component that suppresses the outline must supply
  `focus-visible:outline` or `focus-visible:ring-2` **plus** a ring colour in the same
  declaration. Ring width and ring colour always travel together.
- Focus must never be conveyed by a border-colour change alone.
- Focus is visible for keyboard users (`:focus-visible`) and not drawn on mouse click.
- `UI-SYSTEM-1` replaces the current file-level a11y guard with an **element-level** one: the
  existing test matches `focus:outline-none` and therefore does not see the bare
  `outline-none` that causes this defect.

---

## 7. Radius, borders, shadows, elevation

### 7.1 Radius

Tailwind's default radius scale is kept. Radius scales with the size of the thing; one radius
on everything is a listed anti-pattern (`DESIGN.md`). Nothing exceeds 16px except pills.

| Class | Value | Use |
|---|---|---|
| `rounded` | 4px | Badges, chips, inline marks |
| `rounded-lg` | 8px | Buttons, inputs, small controls |
| `rounded-xl` | 12px | Cards, list rows, panels |
| `rounded-2xl` | 16px | Letterhead panels, drawers |
| `rounded-full` | — | Pills and dots only |

*(Corrected during `UI-SYSTEM-1`.* This table originally specified a custom `sm 4 / md 8 /
lg 12 / xl 16` scale. Implementing it would have redefined Tailwind's own token names under
163 existing usages — every `rounded-lg` silently shifting 8px → 12px, and `rounded-2xl`
disappearing entirely — which is a breaking rename dressed as a token definition. The intent
of the rule is the hierarchy, not the names, and Tailwind's existing scale already expresses
it.*)

### 7.2 Borders and elevation

**Bordered surfaces are the default; shadow is the exception.** Elevation is expressed as:

1. a background step (`paper` → `paperRaised`), then
2. a 1px `hair` border, then
3. a shadow — only if the surface genuinely floats above content.

Shadow scale — v3 names only (§R0.1):

| Level | Class | Use |
|---|---|---|
| 0 | *(none)* | Default for cards, rows, inputs, badges |
| 1 | `shadow-sm` | Sticky header, raised bars |
| 2 | `shadow-md` | Drawers, sheets, popovers, dialogs |

`shadow-lg` and above are not used in content. The audit found 28 shadow classes that never
compiled, so the product has been shipping effectively flat — evidence that heavier shadows
were never load-bearing.

**Z-index scale** — fixes the current scrim-below-tab-bar inversion:

| Layer | z |
|---|---|
| Sticky content (in-page summary bars) | 10 |
| Sticky header | 40 |
| Fixed bottom bar | 45 |
| Overlay scrim | 50 |
| Drawer / sheet / dialog | 60 |

The scrim must be above every bar it is meant to disable.

---

## 8. Component states

### 8.1 Every interactive component defines all seven

`default · hover · focus-visible · active · disabled · loading · error`

Rules that apply to all of them:

- **Touch targets: 44×44px minimum**; 48px for the primary action on a mobile-anchored bar.
  This applies to the *hit area*, which may exceed the visible box. Currently below the floor:
  `Button` `sm` (~28px) and `md` (~32px), `Input` / `NativeSelect` (~34px), pagination links
  (32px), bottom-nav items (~32px), and the search clear control.
- **Disabled** = `opacity-50` + `cursor-not-allowed` + `aria-disabled`. A disabled control
  stays in the accessibility tree with its reason available.
- **Loading** = `aria-busy="true"`; the control keeps its width so nothing reflows; the
  spinner is decorative and `aria-hidden`, with the state conveyed in text.
- **Error** = `aria-invalid="true"` on the control plus `aria-describedby` pointing at the
  message id. A colour change alone is not an error state.

### 8.2 Badge

Variants map to §2.2 and use **project tokens only**. `success` and `warning` currently use
`emerald-*` and `amber-*` from the default palette — including on "GOIR Verified" and
"Current", the two most trust-bearing markers in the product — which violates `AGENTS.md` and
means they do not participate in the dark-mode flip.

| Variant | Fill / text / border | Meaning |
|---|---|---|
| `tamarind` | `tamarind/10` · `tamarind` · `tamarind/25` | In force, open, verified |
| `turmeric` | `turmeric/15` · `turmericDeep` · `turmeric/30` | Attention, amended |
| `kumkum` | `kumkum/10` · `kumkum` · `kumkum/25` | **New.** Superseded, past deadline |
| `neutral` | `hair/50` · `inkSoft` · `hair` | Archived, historical |
| `ink` | `ink` · `paperRaised` · `ink` | Selected filter (replaces `dark`) |

`success` and `warning` are removed as names — they duplicate `tamarind` and `turmeric` while
implying a judgement the product does not make. Sizes: `sm` 12px, `md` 12px, `lg` 13px; the
9px size is removed.

### 8.3 Button

Variants: `primary` (`ink` fill), `secondary` (`paperRaised` + `hair` border), `tamarind`,
`turmeric`, `ghost`, `outline`, `danger`. **`danger` uses `kumkum`**, not `red-600`.

Sizes meet the 44px floor: `sm` 36px tall with a 44px hit area, `md` 44px, `lg` 48px.

### 8.4 Input, NativeSelect, Field

- Font-size **16px on mobile** (§1.2), 14px permitted at `≥sm`.
- Height 44px minimum.
- Focus per §6 — no bare `outline-none`, ring width and colour together.
- `Field` wires `aria-describedby` from control to helper text and to `FieldError`, and sets
  `aria-invalid` when `errorMessage` is present. Error text uses `kumkum`, minimum 12px.
- Every `Field` passes `htmlFor`, and every `Input` inside it carries the matching `id`.
  The `NumF` wrapper in `TaxCalculatorUI` (line 133) omits both and is used **33 times**, so
  a third of the product's form fields have labels that are not programmatically associated.
  Wrappers that render a `Field` must generate an id (`useId`) and thread it through.

### 8.5 Overlays — drawer, sheet, dialog

Required behaviour for anything that overlays the page:

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- **Escape closes.**
- Focus moves into the panel on open and returns to the trigger on close.
- Focus is trapped while open.
- Body scroll is locked while open.
- When closed, the panel is removed from the DOM or made `inert` — translating it off-screen
  is not enough, because its links stay focusable and screen-reader reachable.
- The scrim is dismissible by pointer **and** by Escape; a scrim with only an `onClick` is not
  an accessible control.
- Triggers are `<button>` elements. A `<div onClick>` is not a trigger.

### 8.6 Disclosure — Accordion

Keeps its current correct `aria-expanded` / `aria-controls` wiring. Collapsed content must be
`hidden` or `inert`: collapsing with `grid-rows-[0fr]` + `opacity-0` alone leaves the content
in the tab order.

### 8.7 Table

Horizontal scroll inside a table wrapper is permitted and preferred over shrinking type. The
wrapper is focusable (`tabIndex={0}`) with `role="region"` and an accessible name so keyboard
users can scroll it. `<th>` carries `scope`. Never suppress page-level overflow to hide a
table that is too wide.

---

## 9. Responsive philosophy

Mobile-first: base styles target the phone; breakpoints add. Tailwind defaults, unchanged:
`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

### 9.1 One navigation breakpoint

**`lg` (1024px) is the single navigation breakpoint.** Below it: bottom tab bar plus
off-canvas drawer. At and above it: desktop navigation and rails, no bottom bar.

`SidebarProvider` currently switches on `window.innerWidth < 768` while the tab bar and
desktop nav switch at `lg`, so 768–1023px gets a mixed model. Any JS viewport check must use
the same value as the CSS, and should derive it from one shared constant.

### 9.2 Verification widths

320 · 360 · 375 · 390 · 430 · 768 · 1024 · 1440.

320px is a correctness floor, not a nicety: content must be usable, not merely non-overflowing.

### 9.3 Overflow rules

- No accidental page-level horizontal scroll at any width.
- **`overflow-x-hidden` on `body` or the page wrapper is forbidden** — it conceals structural
  bugs rather than fixing them.
- Intentional horizontal scroll is allowed for tables, filter chip rows, breadcrumbs and tag
  strips. Where the scrollbar is hidden, `no-scrollbar` **must actually be defined** (§R0.1) —
  it is used in 7 places today and does not exist.
- Long unbroken strings (GO references, URLs) use `break-words`; truncation must expose the
  full value via `title` or an accessible alternative.

---

## 10. Motion

- Durations: **150ms** for colour and opacity, **200ms** for transforms and disclosure.
  Nothing exceeds 300ms.
- Easing: `ease-out` for entrances, `ease-in` for exits.
- **Motion responds to user action only.** No perpetual or ambient animation — this removes
  the `animate-pulse` dot on the active bottom-nav item.
- No scroll-triggered reveals, no staggered section entrances.
- `prefers-reduced-motion: reduce` is already honoured globally in `app/globals.css`; keep it,
  and never bypass it with inline styles or JS-driven animation.
- Transforms used for feedback (`active:scale-[0.98]`) are acceptable; they must not shift
  surrounding layout.

---

## 11. Dark mode

Class-based (`html.dark`), toggled by `ThemeToggle`, pre-applied by the inline script in
`app/layout.tsx` to avoid a flash. Preference order: stored choice → system preference.

Rules:

- **Every colour must come from a token that has a dark value.** Off-palette colours
  (`emerald-*`, `amber-*`, `red-*`) do not flip and are banned (§R0.2).
- The masthead pair does not flip (§2.3), and elements placed on it are styled for navy in
  both themes.
- Dark mode is not merely inverted: `paper` in dark is a desaturated navy, not black, so it
  belongs to the same family as the masthead.
- The theme toggle sets `aria-pressed` and has an accessible name. Its pre-mount placeholder
  must not be focusable.
- Both themes are held to the same contrast requirements; `UI-A11Y-1` measures them.

---

## 12. Trust and GOIR presentation

The product's credibility depends on this section more than on any other. `PRODUCT.md` states
the promises; these are the presentation rules.

### 12.1 Verification is provenance, not endorsement

"GOIR Verified" means *a check against `goir.ap.gov.in` was recorded for this document*. It is
not a quality rating and must not be styled like one.

- Rendered **only** when `verifiedAgainstGoir` is true.
- Presented as metadata: `meta`/mono, badge scale, adjacent to the other document facts —
  never as a large or promotional element.
- Uses the `tamarind` variant per §8.2 (currently the off-palette `success`).

### 12.2 There is no "unverified" state

Absence of a recorded check renders **nothing**. No grey badge, no "not verified" label, no
warning icon. Absence of a check is not evidence of a problem, and implying otherwise would
misrepresent our own coverage.

Where a surface explains verification at all, it uses the existing framing: *GOIR status is
shown per document where recorded.*

### 12.3 Independence is stated on document surfaces

The disclaimer that AP Teacher Desk is an independent, unofficial information service stays on
post detail surfaces. It is quiet — `inkSoft`, small, below the content — but never removed,
and never redesigned into something a reader would skip.

### 12.4 The product must never look official

No government insignia, emblems, seals, or department logotypes. The navy masthead is a
gazette convention, not an assertion of authority. Nothing may imply endorsement by the AP
School Education Department.

### 12.5 The source document always has a route

Every post surface keeps a visible path to its original PDF or source URL. Summaries never
substitute for the source, and numeric or tabular content is never lifted out of it
(`AGENTS.md` hard rule 1).

### 12.6 Nothing is invented to fill space

Missing contact details, statistics, verification claims and counters stay missing. An empty
region is a content problem and is solved with content or with layout — never with an invented
value or a plausible-looking placeholder.

---

## 13. Content and copy rules

- Sentence case for headings, labels and buttons. Not Title Case, not ALL CAPS except §1.3.
- Buttons name the action: *Open source PDF*, not *Click here*. The name stays the same across
  the whole flow.
- Errors say what happened and what to do, in the interface's voice, and never expose internal
  detail. `app/(public)/error.tsx` is the model: bilingual, specific, offers a retry.
- Empty states say what would appear here and what to do next; they are not apologies.
- English and Telugu carry the same meaning. Telugu is never a shortened caption of the
  English.
- The `→` glyph never replaces a verb, is always `aria-hidden`, and is reserved for directional
  links.
- No emoji in product content or as iconography. Icons are inline SVG: stroke-based, 1.5–2px,
  on a 16/20/24px grid, `currentColor`, decorative ones `aria-hidden`.

---

## 14. Accessibility floor

Non-negotiable, and the definition of done for `UI-A11Y-1`:

- Exactly **one `h1` per route**, and no skipped heading levels. Three routes currently have
  no `h1`; `/tools/tax-calculator` has two.
- Visible focus on every interactive element (§6).
- 44px minimum touch targets (§8.1).
- Every form control has a programmatically associated label; errors are associated via
  `aria-describedby` and `aria-invalid`.
- Icon-only controls have an accessible name — `aria-label`, not `title` alone.
- Overlays follow §8.5 in full.
- `aria-current="page"` on active navigation; distinguishing `aria-label` on each `<nav>`; a
  skip-to-content link.
- Telugu text carries `lang="te"`.
- Contrast: 4.5:1 for body text, 3:1 for large text and for UI component boundaries, in both
  themes. Not yet measured — `UI-A11Y-1` owns verification.
- `prefers-reduced-motion` honoured (§10).

---

## 15. Implementation status

`UI-SYSTEM-1` closed the foundation items below. Component migration is `UI-SYSTEM-2`;
responsive repair is `UI-RESPONSIVE-1`; navigation behaviour is `UI-MOBILE-NAV-1`.

| # | Item | Status |
|---|---|---|
| 1 | Dead-class guard test (§R0.1) | Done — `test/tailwind-classes.test.ts` |
| 2 | Remove/replace the non-compiling utilities; define `no-scrollbar` and the animation | Done |
| 3 | Remove every `accent` usage; active-navigation treatment (§4.2, §4.3) | Done |
| 4 | Focus treatment (§6) + element-level guard | Done — `test/focus-visible.test.ts` |
| 5 | `kumkum` Badge variant, `superseded` remap, palette cleanup (§3.2, §8.2) | Done — `test/order-state-colour.test.tsx` |
| 6 | Replace `--label-*`; apply the §1.2 floors | Done in shared primitives; see backlog |
| 7 | z-index scale and motion keyframes in `tailwind.config.js` (§7, §10) | Done |
| 8 | Correct `turmericDeep` in `.agents/skills/design-tokens.md` (§2.1) | Done |

### Carried forward

- **Sub-12px type outside the shared primitives.** All 21 occurrences in
  `app/(public)/_components` were raised to 12px. Roughly 100 remain in route-local
  components across 42 files. Raising those is per-component work with a visible density
  effect that cannot be checked without a browser, so it belongs to `UI-SYSTEM-2` /
  `UI-A11Y-1`. The guard in `test/order-state-colour.test.tsx` covers Badge only.
- **44px touch targets (§8.1).** `Input`, `NativeSelect` and the bottom-nav items now meet it.
  `Button`'s `sm` and `md` sizes and the pagination links do not; resizing them changes
  density on every page and belongs to `UI-SYSTEM-2`.
- **`Field` error association (§8.4).** `Input` and `NativeSelect` now set `aria-invalid`.
  Wiring `aria-describedby` from control to `FieldError`, and giving `TaxCalculatorUI`'s
  `NumF` wrapper a generated id, is `UI-A11Y-1`.
- **Overlay behaviour (§8.5)** — Escape, focus trap, scroll lock, closed-state inertness —
  remains `UI-MOBILE-NAV-1`. Only the z-index inversion was fixed here.

Each item needed a test that can fail for the right reason. That is not a formality here: the
`accent` defect survived an existing colour-token test that checked only that *defined* tokens
compile, never that *used* classes resolve. Every guard added in this gate was run against a
deliberate reintroduction of the bug it covers, and one of them had to be rewritten when the
mutation showed it scanned line by line and could not see a class inside a multi-line template
literal.
