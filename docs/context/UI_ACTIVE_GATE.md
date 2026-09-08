# UI Active Gate

## Active gate

`UI-BASELINE-0`

## Purpose

Establish the verified branch baseline and create repository-native roadmap and state
tracking for the UI System & Production Readiness program.

## Change boundary

No UI redesign or production changes are permitted until `UI-BASELINE-0` is closed.
This gate may only add or update the three UI program context documents under
`docs/context/` and perform non-mutating repository inspection and validation.

Application code, styles, components, routes, assets, database files, and runtime
configuration are out of scope for this gate.

## Required closure evidence

- The starting worktree was clean on `main`.
- `HEAD`, local `main`, `origin/main`, and live remote `refs/heads/main` matched the
  authoritative baseline SHA.
- Branch `ui-system-production-readiness` was created from that exact SHA.
- The master plan and current-state record exist and contain the required program data.
- Documentation-only validation and `git diff --check` pass.
- The context files are committed and pushed on the program branch.
- Local branch HEAD and live remote branch SHA agree.

## Next gate after closure

`UI-AUDIT-1`
