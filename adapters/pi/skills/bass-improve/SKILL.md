---
name: bass-improve
description: Preview an evidence-grounded artifact improvement and automatically re-review it before approval.
---

# BASS Improve

## Canonical Workflow

Explicit command entry point for **Improve**. Target: one canonical artifact and its
Review Report. Gate: cited context and review findings are required; unresolved material
conflicts or remaining Critical/Major findings block persistence. Route: BASS -> Editor
-> BASS -> Reviewer.

Interpret `$ARGUMENTS` as the canonical BASS artifact, original Review Report,
applicable cited evidence, and Decision records. Call `bass_improve_artifact` with
the original artifact and that context. It must return a non-persisted revised
preview and a change summary. Then call `bass_review_artifact` on the revised
preview before asking for approval.

Return the original findings, change summary, unresolved items, and automatic
re-review result conversationally. Preserve every unresolved question, conflict,
or unsupported issue as `needs_decision`; do not close it by assumption. Critical
and Major findings remaining after re-review block local approval and ADO
publication unless an explicit user Decision waiver cites the finding ID, rationale,
and residual risk. Preserve waived findings, the Decision reference, and residual
risk in the result.

Do not write the preview or artifact, invoke an ADO or MCP tool, or modify host
`.opencode/` files. Ask for explicit approval only after the automatic re-review is
returned and only if its severity gate permits local persistence. Only BASS may then
 call the separate approval-bound persistence tool. This is a portable source-only
 workflow.

Return the uniform BASS response envelope. Include `## Approval` only when the
re-reviewed preview is eligible for explicit local persistence approval.
