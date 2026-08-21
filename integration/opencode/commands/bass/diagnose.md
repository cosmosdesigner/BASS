---
description: Conversationally summarize the local BASS diagnostic for an optional project name.
---

## Canonical Workflow

Explicit command entry point for the read-only BASS diagnostic utility. Target: an
optional project name. Gate: no mutation or ADO capability is required. Route: BASS
only; do not delegate to a specialist.

Call `bass_diagnose` exactly once with `projectName` bound to `$ARGUMENTS`. Base the response exclusively on that result. Do not use any other tool or delegate work. This conversational convenience command does not promise verbatim or machine-parseable output; target users and automations requiring the fixed diagnostic contract must invoke `bass_diagnose` directly.

Return the uniform BASS response envelope, translating only the diagnostic result into
the envelope without adding inferred evidence or actions.
