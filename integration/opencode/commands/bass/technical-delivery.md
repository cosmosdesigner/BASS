---
description: Return a read-only Technical Delivery Report for one selected Feature or User Story.
---

## Canonical Workflow

Explicit command entry point for **Discover** technical-delivery evidence. Target: one
Feature or User Story reference. Gate: require an unambiguous supported target;
unavailable technical read categories remain cited gaps. Route: BASS -> Explorer.

Interpret `$ARGUMENTS` as exactly one selected Feature or User Story reference.
Reject an empty, ambiguous, or unsupported reference; do not infer a target from
free text. Call `bass_technical_delivery_report` once with the validated
reference to generate the deterministic local report. Extract its exact required
technical categories and call
`bass_validate_ado_technical_delivery_capabilities` with the selected direct-child
`projectDirectory` and those categories. Do not infer categories from report prose.

Give Explorer only the validator's mapped required categories and matching gaps.
Explorer may collect only its target-installed synchronized exact read-only
allowlist. Merge only cited successful extracts into their matching gaps and
return the complete Technical Delivery Report conversationally. Preserve
unmapped, failed, unauthorized, unavailable, and contradictory sources as gaps
or conflicts. Classify explicit Work Item links or IDs as Facts; label title,
branch, tag, commit-message, and file-text matches as Inferences with their
matching basis and lower confidence. Do not infer release state from repository
or pull-request evidence; required missing or contradictory pipeline/deployment
evidence means `Release State: unknown`.

The report is chat-first. Do not create or update local evidence, the Evidence
Register, code, repositories, files, pull requests, commits, pipelines, builds,
environments, deployments, releases, or Work Items. Persist technical evidence
only after explicit user approval of the specific preview through
`bass_persist_approved_technical_evidence`. This is a portable source-only
workflow: do not install or modify host `.opencode/` files and do not call a live
 ADO or MCP service from this command contract.

Return the uniform BASS response envelope with the Technical Delivery Report as
`Result`; mark partial read evidence `warning` and retain sources, locations,
classifications, confidence, gaps, and conflicts.
