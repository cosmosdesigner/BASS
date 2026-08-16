---
description: Return the full Context Brief for a selected BASS target.
---

## Canonical Workflow

Explicit command entry point for **Understand**. Target: one item, URL, local artifact,
or sufficient search terms in `$ARGUMENTS`. Gate: reject an ambiguous or absent target;
unavailable mapped ADO categories are cited gaps. Route: BASS -> Reader.

Call `bass_context_brief` exactly once for target `$ARGUMENTS`. Read the selected
project's `project-context/ado-read-capabilities.md`, then call
`bass_validate_ado_read_capabilities` with that local brief before Reader dispatch.
Give Reader only the validator's mapped required categories and matching gaps.
Reader may invoke only its target-installed synchronized permission allowlist and
returns cited extracts. Merge only successful extracts into their matching gaps
and return the resulting full Context Brief conversationally. Preserve validator
unmapped, failed, or unauthorized ADO sources as gaps. Do not save an output unless
the user explicitly requests that the brief be saved.

Return the uniform BASS response envelope with the Context Brief as `Result`; mark a
partial brief `warning` and retain sources, locations, classifications, and confidence.
