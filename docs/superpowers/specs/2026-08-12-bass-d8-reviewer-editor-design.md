# BASS D8 Reviewer and Editor Design

## Status

Approved design for D8. This specification defines evidence-grounded review, severity gates, approval-first improvement, automatic revalidation, and immutable improvement records.

## Review Workflow

The portable integration bundle provides:

- `/bass review <artifact>`
- `/bass improve <artifact>`

Reviewer returns a chat-first review report with:

```markdown
# Review Report: <artifact>

Artifact version: <version>
Status: pass | pass_with_advisories | blocked

## Summary
## Findings
## Unresolved Questions
## Review Decision
## Sources
```

The findings table includes ID, severity, check, finding, evidence and location, impact, recommendation, and status.

Reviewer checks clarity, ambiguity, completeness, consistency, testability, dependencies, risks, and provenance. Findings must be cited and must not invent missing content.

## Severity and Gates

| Severity | Meaning | Gate |
| --- | --- | --- |
| Critical | A defect that makes the artifact unsafe, materially incorrect, or untraceable. | Blocks local approval and ADO publication. |
| Major | A material quality, testability, dependency, risk, or provenance defect. | Blocks local approval and ADO publication. |
| Minor | A non-blocking defect that should be addressed. | Visible but does not block. |
| Advisory | A supported improvement suggestion. | Visible but does not block. |

Critical and Major findings must be resolved or explicitly waived by a user Decision record before D7 local approval or D9 ADO publication. A waiver preserves the finding, Decision reference, user rationale, and residual risk.

## Improvement Workflow

`/bass improve` supplies Editor the original artifact, cited evidence, decisions, and the Review Report. Editor returns a revised preview and change summary.

Editor may resolve a finding only through cited evidence or an explicit user Decision. If it cannot resolve an issue without inventing content or closing an unresolved question, it leaves the relevant content unchanged, adds a labeled gap or unresolved question, and marks the finding `needs_decision`.

BASS automatically re-runs Reviewer on the revised preview. The improve response includes original findings, change summary, unresolved items, and re-review result before BASS asks for explicit local-write approval.

## Persistence and Traceability

After explicit approval, BASS persists the improved version using D3 version and lineage rules. It increments `version`, updates `updated_date`, records `derived_from` and `supersedes`, and adds a valid artifact changelog row.

Each approved improvement also creates an immutable `OUT-...` record under the artifact's `outputs/` folder. The record contains the original Review Report, applied changes, unresolved or waived findings, Decision references, approval context, revised artifact version, and automatic re-review result.

## Fixture Coverage

D8 adds source-only fixtures and tests for:

- Critical/Major findings that block approval and publication.
- Successful evidence-grounded improvement with automatic re-review.
- Unresolved questions that remain open and become `needs_decision`.
- User Decision waiver of a blocking finding.
- Version, lineage, artifact changelog, and immutable improvement record persistence.

No D8 tool mutates ADO. Target-host ADO publication remains D9 work.

## Acceptance Criteria

BASS can return an improved, justified, and automatically revalidated artifact. Review findings are cited and severity-gated; unresolved questions remain open; every approved edit is versioned, justified, and traceable through an immutable improvement record.
