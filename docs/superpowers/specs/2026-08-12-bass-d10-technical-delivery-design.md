# BASS D10 Technical Delivery Evidence Design

## Status

Approved design for D10. This specification defines read-only Azure DevOps repository, pull-request, pipeline, and deployment evidence for BA-facing technical delivery analysis.

## Technical Delivery Capabilities

Each project contains `project-context/ado-technical-delivery-capabilities.md`. It independently maps verified read-only target-host tools for:

- Repository and file search.
- Pull-request search, details, comments, and links.
- Work Item-to-pull-request and commit association.
- Pipeline and deployment status.

Each mapping records exact tool name, supported input, read-only verification, and verification date. Target installation synchronizes only valid exact tool names into Explorer's ordered `ado_*` deny-then-allow permissions.

Code, repository, pull-request, pipeline, and deployment mutation remain prohibited in Phase 1.

## Technical Delivery Report

Explorer produces a chat-first Technical Delivery Report:

```markdown
# Technical Delivery Report: <Feature or User Story>

Status: ready | warning | blocked
Coverage: <loaded and unavailable sources>

## Feature or User Story Context
## Implementation Evidence
## Pull Requests and Commits
## Pipeline and Deployment Status
## Technical Validation
## Technical Blockers
## Release State
## Gaps and Conflicts
## Sources
```

The report explains implementation and release state from cited ADO evidence. It surfaces technical blockers in the Feature/User Story context.

## Association Rules

Explorer associates technical evidence with a Feature or User Story in this order:

1. Explicit Work Item links and IDs in repository, pull-request, commit, pipeline, or deployment evidence are Facts.
2. Title, branch, tag, commit-message, or file-text matches are Inferences with lower confidence and the matching basis.

Direct links take precedence over inferred associations. An inference is never presented as a confirmed implementation or release association.

Only direct Work Item-associated pipeline or deployment evidence may establish a release state. Inferred technical associations can inform implementation context but cannot establish release.

## Gaps, Conflicts, and Persistence

Unavailable or unauthorized technical sources produce source-linked gaps. Contradictory repository, PR, pipeline, or deployment evidence produces a D3 Conflict. When required release evidence is unavailable or contradictory, release state is `unknown`; Explorer must not infer it.

D10 does not automatically write local evidence. BASS may persist approved technical validation or deployment evidence through an approval-bound local record and canonical Evidence Register update. The persisted record retains source, location, classification, confidence, related Feature/User Story, and approval context.

## Fixture Coverage

D10 adds source-only fixtures and test doubles for:

- Direct Work Item associations.
- Inferred repository, branch, commit, tag, and file-text associations.
- Pull-request state, comments, and links.
- Pipeline and deployment status.
- Technical blockers.
- Unavailable and contradictory technical evidence.
- Approved technical-evidence persistence.
- Prohibited technical mutation.

Source-only tests do not invoke a real Azure DevOps service. Target-host live technical reads remain installation-dependent.

## Acceptance Criteria

BASS can explain a Feature's or User Story's functional and technical state from Azure DevOps evidence. It distinguishes direct associations from inference, surfaces blockers and unknown release state, records approved technical evidence with provenance, and never mutates code, pull requests, pipelines, or deployments.
