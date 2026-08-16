# BASS D12 Quality, Documentation, and Demo Design

## Status

Approved design for D12. This specification defines Phase 1 release readiness, quality evidence, target-host validation, documentation, demonstrations, Phase 2 backlog, and truthful publication gating.

## Two-Tier Readiness

Phase 1 has two readiness tiers:

| Tier | Meaning | Required evidence |
| --- | --- | --- |
| `source_ready` | Portable BASS source is internally verified without a live target-host ADO environment. | D1-D11 source-only suites, traceability checks, documentation checks, source demo, and quality matrix pass. |
| `target_ready` | BASS is validated in an isolated target-host ADO environment. | `source_ready` plus live Wiki, Work Item, repository, PR, pipeline, confirmed Work Item operation, conflict, MCP/permission, and end-to-end publication evidence. |

No report may claim `target_ready` without recorded target-host evidence. Source-only tests and fixtures are valuable but do not substitute for live Azure DevOps validation.

## Quality Matrix and Runner

D12 creates a consolidated matrix by agent, command, workflow, capability, fixture, source-only result, target-host result, owner, and readiness tier. A quality runner executes portable suites, documentation checks, traceability checks, and source demo checks, then produces a `source_ready` or blocked report.

The target-host matrix adds live validation for Wiki, Work Items, repositories, PRs, pipelines, deployments, confirmed Work Item creation/updates/relations/comments/transitions, conflicts, MCP failures, permissions, and the full Feature-to-publication flow.

## Safe ADO Test Setup

D12 includes an operator-run provisioning runbook and declarative fixture for an isolated ADO test project or work-item set. It includes:

- Test Work Item hierarchy and relations.
- Functional and technical Wiki pages.
- Harmless repository, PR, commit, pipeline, deployment, and blocker evidence.
- Least-privilege test identity.
- Capability maps for verified target-host read and Work Item write tools.
- Cleanup and reset procedure.

Production ADO projects, credentials, secrets, and tokens are never stored in BASS files.

## Documentation

`BASS/docs/` contains separate focused guides:

- BA quick-start.
- Technical installation and configuration.
- Command catalogue.
- Context and evidence structure.
- Contribution guide for agents, workflows, and templates.

README links each guide and explains `source_ready` versus `target_ready`, including the target-host prerequisites that remain outside portable source verification.

## Demonstrations

D12 provides:

- A reproducible source demo: Feature -> User Story -> review -> approved local persistence -> simulated ADO publication token.
- A target-host live ADO demo runbook: the same flow using isolated test ADO resources and individual confirmed Work Item operations.

The source demo does not claim real ADO publication. The target-host demo records actual Action Log and evidence outcomes.

## Phase 2 and Publication

D12 creates a Phase 2 backlog ranked by value, risk, and dependency. It includes deferred Phase 1 exclusions and hardening gaps revealed by source-only verification, such as advanced memory, dashboards, autonomous automation, non-ADO connectors, deeper target-host validation, and technical-delivery expansion.

The release checklist versions, commits, and publishes only when a Git repository, intended remote, release authority, and required readiness tier are actually available. It records a blocked publication state rather than initializing Git, creating credentials, or claiming publication.

## Acceptance Criteria

BASS can be installed, demonstrated end-to-end, and trusted to preserve traceability. Portable source verification is explicit, target-host validation is separately evidenced, documentation supports BA and technical users, and release publication claims are truthful.
