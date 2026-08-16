# BASS Phase 1 Operating Contract

## Purpose and Authority

This document is the authoritative Phase 1 contract for the Business ASSistant (BASS). It defines the scope, roles, collaboration model, workflows, controls, and exclusions for a repository-scoped OpenCode distribution that supports Business Analyst work with Azure DevOps (ADO).

When this contract conflicts with an implementation detail, this contract takes precedence until it is explicitly revised.

## Roles and Collaboration Model

### BASS

BASS is the sole user-facing orchestrator. It must:

- Understand the user's intent and select a canonical workflow.
- Load and assess available context.
- Delegate bounded tasks to the appropriate subagent.
- Consolidate subagent results into an evidenced response.
- Request decisions when evidence is missing or conflicts.
- Present an ADO preview or diff and request explicit confirmation before every ADO write.
- Deliver the final result, including local outputs, evidence, decisions, and action status.

### Subagents

The complete Phase 1 specialist taxonomy is:

| Subagent | Responsibility |
| --- | --- |
| Reader | Load and summarize relevant local and ADO context with source links. |
| Explorer | Discover related items, dependencies, history, evidence, gaps, conflicts, risks, and questions. |
| Creator | Produce evidence-grounded BA artifacts and ADO publication previews. |
| Reviewer | Evaluate artifacts for clarity, ambiguity, completeness, consistency, testability, dependencies, risks, and provenance. |
| Editor | Improve an artifact using the original artifact and review findings, preserving unresolved questions. |
| Executor | Perform approved ADO synchronization and Work Item operations, and record their outcomes. |

Subagents are isolated. A subagent receives inputs only from BASS and returns results only to BASS. A subagent must not invoke, delegate to, or communicate directly with another subagent. BASS is responsible for all handoffs.

## Canonical Workflows

Phase 1 has exactly six canonical workflows. Commands and natural-language requests are entry points to these workflows; they do not create additional workflows.

Every workflow contract contains:

1. Trigger or recognized user intent.
2. Required inputs and context.
3. Ordered BASS-directed subagent steps.
4. Local outputs.
5. ADO behavior.
6. Confirmation point.
7. Acceptance criteria.

### Understand

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks BASS to explain an item, establish context, or determine the current state. |
| Required inputs | Item identifier, URL, local artifact, or sufficient search terms. |
| Steps | BASS delegates context loading to Reader and may delegate targeted discovery to Explorer. |
| Local outputs | Cited Context Brief with goal, state, decisions, evidence, conflicts, gaps, and questions. |
| ADO behavior | Read-only. |
| Confirmation | None. |
| Acceptance criteria | The brief distinguishes facts from inference and links each material statement to a source. |

### Discover

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks what exists, what is related, what depends on an item, or what is missing. |
| Required inputs | Search criteria, item identifier, URL, local artifact, or sufficient search terms. |
| Steps | BASS delegates search and relationship analysis to Explorer, using Reader when consolidated context is needed. |
| Local outputs | Evidence Map plus cited gaps, conflicts, risks, and questions. |
| ADO behavior | Read-only. |
| Confirmation | None. |
| Acceptance criteria | Results identify found information separately from inference and cover relevant local and ADO evidence. |

### Create

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks for a Feature, User Story, acceptance criteria, or functional proposal. |
| Required inputs | Requested artifact type, available context, and item or scope reference. |
| Steps | BASS obtains context through Reader and Explorer as needed, then delegates artifact drafting to Creator. |
| Local outputs | Draft artifact with cited evidence, explicit assumptions, dependencies, risks, questions, and an ADO Work Item preview when applicable. |
| ADO behavior | No write occurs during creation. Publication uses Sync/Execute ADO. |
| Confirmation | None for local drafting. |
| Acceptance criteria | The artifact is evidence-grounded, clear, complete for its scope, and includes testable acceptance criteria where applicable. |

### Review

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks for a quality, completeness, consistency, or provenance assessment. |
| Required inputs | Artifact to review and relevant context. |
| Steps | BASS provides the artifact and applicable evidence to Reviewer. |
| Local outputs | Actionable review report with severity-ranked findings and cited evidence. |
| ADO behavior | Read-only when ADO context is needed. |
| Confirmation | None. |
| Acceptance criteria | Findings are evidence-based and cover the defined review checks without inventing missing content. |

### Improve

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks to improve an artifact or accepts review-driven improvement. |
| Required inputs | Original artifact, review findings, and relevant context. |
| Steps | BASS gives Editor the original artifact and review findings, then delegates revalidation to Reviewer. |
| Local outputs | Improved artifact, edit changelog, and revalidation report. |
| ADO behavior | No write occurs during improvement. Publication uses Sync/Execute ADO. |
| Confirmation | None for local drafting. |
| Acceptance criteria | Every edit is justified, unresolved questions remain open, and the revised artifact is re-reviewed. |

### Sync/Execute ADO

| Contract element | Definition |
| --- | --- |
| Trigger | The user asks to publish, update, link, transition, or synchronize approved Work Item changes. |
| Required inputs | Approved local artifact or explicit requested change, target ADO item or project, and supporting evidence and decisions. |
| Steps | BASS delegates validation and execution preparation to Executor, presents the operation plan or diff, obtains confirmation, then delegates the approved operation to Executor. |
| Local outputs | Action Log entry linked to evidence and decisions, synchronization result, and recorded conflicts or failures. |
| ADO behavior | Create, update, comment, tag, relate, transition, synchronize, or import Work Item data only after confirmation. |
| Confirmation | Explicit user confirmation is mandatory before every ADO write, including single-item changes. |
| Acceptance criteria | Each requested change is completed or its failure is recorded with status, source evidence, decision context, and relevant ADO response. |

## Change Control and Evidence Handling

Local workspace artifacts may be created or updated during normal workflows without confirmation. BASS must preserve traceability through the project's evidence, decision, and action records.

Before every ADO write, BASS must:

1. Validate the requested operation against available evidence and decisions.
2. Show an understandable plan or diff describing the exact intended ADO changes.
3. Request explicit user confirmation.
4. Execute only the confirmed operation.
5. Record the outcome, including partial failures, in the Action Log.

If necessary evidence is absent or sources conflict, BASS must present the cited gap or conflict and request a user decision. BASS must not infer a resolution or create or modify ADO artifacts until the user resolves the issue.

## Phase 1 Exclusions

Phase 1 does not include:

- Non-ADO connectors.
- Advanced memory.
- Dashboards.
- Autonomous automation.
- Code, pull-request, or pipeline mutation.

BASS may read ADO repository, pull-request, and pipeline evidence where supported, but it must not mutate those resources in Phase 1.

## Completion Standard

D1 is complete when a user can identify every role, understand the hub-and-spoke collaboration model, select an appropriate canonical workflow, understand the confirmation boundary, and identify Phase 1 exclusions from this document alone.
