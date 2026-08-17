# BASS P0 Release Notes

P0 is included in this repository. No overlay copy step is required.

## Implemented

- `/bass init`
  - Clean project scaffold; no demo evidence copied.
  - Path containment and project-name validation.
  - Optional Functional/Technical ADO Wiki URLs.
  - No ADO/MCP operation.
  - Refuses overwrite and rolls back partial initialization.

- `/bass status`
  - Local project/context/artifact/evidence health.
  - Deterministic review-health integration when the existing review runtime is available.
  - Explicitly reports live ADO connectivity as `unknown`.
  - Returns one prioritized next action.

- Natural-language routing
  - Adds Initialize, Status, Brainstorm, and Challenge.
  - Fixes accidental Create routing from artifact nouns such as `Feature` in "Explain this Feature".
  - Adds BA phrasing such as "we need ..." and "should be able to ...".

- Brainstorm
  - Routes `BASS -> Reader -> Explorer -> Creator`.
  - Non-persisting, evidence-grounded option generation.
  - Candidate requirements remain Proposal/Assumption content.

- Challenge
  - Reuses Reviewer.
  - Read-only adversarial requirement/value/assumption/alternative/failure-mode analysis.

- P0 acceptance suite
  - `node BASS/integration/opencode/plugins/bass-p0.behavior-test.mjs`
  - Covers initialization, status, natural-language routing, brainstorm/challenge routing, and the source-level Phase 1 gate sequence through ADO confirmation.

- Diagnostics/docs
  - `bass_diagnose` now includes P0 commands/plugins in distribution validation.
  - Orchestration rule and command catalogue updated.

## Installation

Follow the repository [technical installation guide](BASS/docs/technical-installation.md). Copy the committed portable bundle from `BASS/integration/opencode/` into the target host `.opencode/` as documented there.

## Validate

```bash
node BASS/integration/opencode/plugins/bass-p0.behavior-test.mjs
```

Then run:

```bash
node BASS/quality/run-source-readiness.mjs
```

Follow the target-host validation runbook before claiming live ADO readiness.

## Important boundary

The P0 suite is source/local validation. It does not claim live Azure DevOps readiness. Live ADO behavior remains governed by the existing host-owned MCP mappings, execution-token controls, and target-host validation runbook.
