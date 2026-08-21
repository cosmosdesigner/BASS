---
description: Return one safest non-executing recommendation from the latest BASS workflow result.
---

## Canonical Workflow

This is a BASS orchestration utility, not a canonical workflow entry point. Target:
the latest BASS workflow response supplied by BASS for `$ARGUMENTS` or the active
conversation. Reject a missing or ambiguous latest result rather than guessing one.

## Gate And Route

Gate: require a prior response with Status, Workflow, Result, Evidence, Gaps and
Conflicts, and Next Action. Route: BASS alone reads that response and selects exactly one safest
recommendation: resolve a blocking conflict or gap first, request required approval or
confirmation next, otherwise name the least-mutating useful follow-up. Do not delegate
to a specialist.

## Response Envelope And Boundary

Return the uniform BASS response envelope, with `Result` containing one recommendation
and its rationale. Do not execute a workflow, persist an artifact, import local data,
issue or consume a confirmation token, invoke an ADO or MCP tool, or write Azure
DevOps. This is a portable source-only command: do not install or modify host
`.opencode/` files.
