# UI Active Gate

## Active gate

`UI-DEVICE-1`

## Status

**BLOCKED** — closed without device-verified evidence, per explicit user instruction after
confirming no real device access exists. Not silently skipped: what was checked and why it's
blocked are both recorded below.

## Purpose

Real-device mobile acceptance where environment and device access permit, per
`UI_SYSTEM_MASTER_PLAN.md` Phase 18. The user's own framing for this gate, given before work
started: **not** a repeat of `UI-ACCEPTANCE-1`'s Playwright/desktop-emulation pass — this gate
exists specifically to catch what desktop browser emulation structurally cannot prove: touch
behavior, real mobile browser chrome, virtual keyboard behavior, safe-area behavior as
experienced on real hardware, real (not synthetic) scrolling, and perceived usability.

## Why this is BLOCKED, not closed with substitute work

Every other tool-unavailability this program has hit so far (`UI-DESIGN-1`/`UI-IMPECCABLE-1`'s
Impeccable, `UI-21DEV-1`'s 21st.dev) had a meaningful fallback: do the same structured review
manually against the design system, which is still real, valuable work. This gate is
different in kind. The specific things it exists to catch — touch behavior, real mobile
browser chrome, a real virtual keyboard, safe areas and scrolling as actually experienced on
hardware, perceived usability — are not things source reading or Playwright's desktop
viewport-resize emulation can produce evidence for, by construction. Proceeding with a
source-level or emulated substitute and presenting it as this gate's output would have been
exactly the kind of unverifiable claim this program's own discipline (established across
`UI-SEO-1`, `UI-404-1`, `UI-IMPECCABLE-1`, `UI-ACCEPTANCE-1`) has consistently refused to make.
Per explicit instruction, this was escalated to the user rather than guessed at, and the
user confirmed: close as BLOCKED.

## What was checked before concluding no device access exists

- **`claude-in-chrome`'s `list_connected_browsers`** — returned an empty list. No Chrome
  browser instance (extension) is paired to this account at all, on any device. (Chrome
  extensions also do not run on mobile Chrome or mobile Safari by design, so even a paired
  instance could never have been a genuine mobile browser — this path was structurally
  incapable of reaching a real phone regardless.)
- **`.mcp.json`** — only the `magic` (21st.dev) server is configured; no BrowserStack, Sauce
  Labs, LambdaTest, or other device-lab MCP server exists.
- **`adb`** (Android device/emulator bridge) — not present on `PATH`.
- **`xcrun`** (iOS simulator tooling) — not present, and could not be: this environment is
  Windows, and Xcode/iOS tooling is macOS-only.
- No new device-lab tooling, browser stack, or credentials were installed or requested,
  matching the standing "do not install unrelated substitutes" rule this program has applied
  to every prior tool-unavailability finding.

## Decision, from the user directly

Asked which of four paths to take (close as BLOCKED; the user tests manually on a real phone
and reports findings for me to act on; the user has a device-cloud account to configure; or
something else). The user chose: **close as BLOCKED.**

## Verification

No application code was changed — there is nothing to verify beyond confirming the tree is
exactly as `UI-ACCEPTANCE-1` left it. `git diff --check` on the working tree (aside from the
pre-existing, unrelated `.gitignore` change from the user's own `/plugin` session activity,
already noted and left alone across the last several gates) shows no unintended changes.
`npx tsc --noEmit` and the full Vitest suite were not re-run for this reason — no application
code changed, matching the precedent `UI-BASELINE-0`/`UI-AUDIT-1` set for docs-only gates.

## Next gate after closure

`UI-REGRESSION-1` (Phase 19, the master plan's own sequential next step — complete full
regression verification. No explicit instruction has named a different next gate for after
this one; confirm with the user before assuming this is still correct if a gap in time or
context has passed).
