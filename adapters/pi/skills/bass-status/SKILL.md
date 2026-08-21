---
name: bass-status
description: Show deterministic local BASS project health and the highest-priority next action.
---

# BASS Status

## Canonical Workflow

Explicit command entry point for **Status**. Target: `$ARGUMENTS` as one BASS project
name, or the only available project when selection is unambiguous.

## Gate And Route

Route: BASS only. Call `bass_project_status` exactly once. This workflow is read-only
and local: it does not invoke MCP or Azure DevOps and must label live ADO connectivity
as unknown unless another current approved workflow supplied that evidence.

## Result

Return the uniform BASS response envelope with a concise project dashboard covering:

- configured Functional and Technical context references;
- local ADO capability mapping presence and live-connectivity unknown state;
- Idea, Feature, User Story, and Proposal counts;
- evidence classifications, especially Questions and Conflicts;
- deterministic review health for canonical artifacts when the review tool is available;
- explicit gaps;
- exactly one highest-priority next action.

Do not infer remote status from local configuration and do not mutate any file.
