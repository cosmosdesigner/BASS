---
name: bass-review
description: Return a cited, severity-gated review of a BASS artifact without persistence.
---

# BASS Review

## Canonical Workflow

Explicit command entry point for **Review**. Target: one canonical BASS artifact and
applicable cited evidence and Decisions. Gate: reject a missing or ambiguous artifact;
missing read context may produce a cited `warning`. Route: BASS -> Reviewer.

Interpret `$ARGUMENTS` as the canonical BASS artifact and its applicable cited
evidence and Decision records. Call `bass_review_artifact` exactly once with that
context. Return its structured Review Report conversationally, including the
artifact version, status, severity-ranked cited findings, unresolved questions,
review decision, and sources.

Critical and Major findings block local approval and ADO publication unless they
are resolved or an explicit user Decision waiver cites the finding ID, rationale,
and residual risk. Preserve waived findings and their Decision references in the
report. Minor and Advisory findings remain visible but do not block.

Do not persist a report or artifact, invoke an ADO or MCP tool, request approval,
 or modify host `.opencode/` files. This is a portable source-only workflow.

Return the uniform BASS response envelope with the Review Report as `Result`; retain
sources, locations, classifications, confidence, gaps, and conflicts.
