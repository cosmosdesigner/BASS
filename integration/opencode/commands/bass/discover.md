---
description: Return a bounded Discovery Report for selected BASS work.
---

## Canonical Workflow

Explicit command entry point for **Discover**. Target: selected project and bounded
filters in `$ARGUMENTS`. Gate: require valid non-empty filters; unavailable read
categories remain gaps. Route: BASS -> Explorer, with BASS -> Reader only when a
consolidated context is required.

Interpret `$ARGUMENTS` as an optional `projectName` selection and one or more
named filters. The only accepted filter keys are exactly `id`, `url`, `text`,
`type`, `tag`, `state`, `area`, and `iteration`. Reject an unsupported filter,
missing filter value, or request with no filters; do not infer a filter from free
text or guess an alternative key.

Pass every supplied filter unchanged to `bass_discovery_report` in its `filters`
object, with the optional selected `projectName`. All supplied filters combine
with AND semantics. Call `bass_discovery_report` exactly once after validation.
Deterministically extract the canonical required category names from its `## Gaps`
entries beginning `Required ` and ending ` is not executed by this local-only tool`.
Call `bass_validate_ado_discovery_capabilities` with the selected direct-child
`projectDirectory` and that exact `requiredCategories` array. Do not pass a report
string or infer categories from prose. Give Explorer only the validator's mapped
required categories and matching gaps. Explorer may invoke only its target-installed
synchronized permission allowlist and returns cited discovery extracts. Merge only
successful extracts into their matching gaps and return the resulting full
Discovery Report conversationally. Preserve validator unmapped, failed, or
unauthorized ADO sources as gaps. Do not search repositories, pull requests, or
pipelines. Do not save an output unless the user explicitly requests that the
 Discovery Report be saved. This is a portable source-only workflow: do not install
 or modify host `.opencode/` files.

Return the uniform BASS response envelope with the Discovery Report as `Result`; mark
partial discovery `warning` and retain sources, locations, classifications, confidence,
gaps, and conflicts.
