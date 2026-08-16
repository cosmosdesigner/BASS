# BASS D1 Operating Contract Design

## Status

Approved design. The authoritative implementation document is `dev_docs/BASS_Phase_1_Operating_Contract.md`.

## Decision

Adopt a strict orchestrator architecture for Phase 1.

- BASS is the sole user-facing agent and sole workflow orchestrator.
- Reader, Explorer, Creator, Reviewer, Editor, and Executor are isolated subagents.
- Subagents receive work only from BASS, return work only to BASS, and never communicate with or invoke one another.
- Phase 1 has exactly six workflows: Understand, Discover, Create, Review, Improve, and Sync/Execute ADO.
- Commands and natural-language requests are entry points to those workflows.

## Workflow Contract

Each workflow specifies its trigger, required inputs, BASS-directed ordered subagent steps, local outputs, ADO behavior, confirmation point, and acceptance criteria.

## Controls

- BASS may create and update local workspace drafts and artifacts without confirmation.
- Every ADO write requires an understandable preview or diff and explicit user confirmation.
- Missing evidence or source conflicts block ADO creation and modification. BASS presents cited gaps or conflicts and requests a user decision rather than inferring a resolution.

## Scope

One architecture and operating-flow contract is the authoritative Phase 1 source of truth. Phase 1 excludes non-ADO connectors, advanced memory, dashboards, autonomous automation, and code, pull-request, or pipeline mutation. ADO repository, pull-request, and pipeline evidence may be read where supported.

## Acceptance Criteria

A user can identify every role, understand the hub-and-spoke model, choose a canonical workflow, understand the confirmation boundary, and identify Phase 1 exclusions from the operating contract.
