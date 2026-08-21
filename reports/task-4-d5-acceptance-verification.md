# Task 4 D5 Acceptance Verification Report

## Current Verification and Supersession

**This section supersedes active claims in the historical Commands and Results
sections below.** `bass-reader-ado` runner behavior was removed and is not
executed. Source-only coverage consists only of:

- `node BASS/integration/opencode/plugins/bass-context-brief.behavior-test.mjs`
- `node BASS/integration/opencode/plugins/bass-validate-ado-read-capabilities.behavior-test.mjs`
- `node BASS/integration/opencode/plugins/bass-reader-contract.behavior-test.mjs`

These cover deterministic local Context Brief behavior, validator permission and
dispatch-plan behavior, and Reader instruction/permission assertions. Target-host
MCP calls are not executed in this workspace.

## Commands

- `node BASS/integration/opencode/plugins/bass-context-brief.behavior-test.mjs`
- `node BASS/integration/opencode/plugins/bass-reader-ado.behavior-test.mjs`

## Results

- Context Brief behavior passed for complete, incomplete, contradictory, and
  question fixtures; exact resolution, traversal rejection, direct-only loading,
  ADO gaps, and TS/JS parity were exercised.
- Mapped ADO behavior passed for one mapped success, an unmapped gap, and a
  rejected non-read mapping through an injected tool runner.
- Reader, commands, README, and capability template now document target-only
  installation, mapping copy, and ordered `"ado_*": deny` followed by exact
  allows.
- No `.opencode/` host installation was created.

- Direct `npx tsc --noEmit` could not type-check portable OpenCode plugins because
  this source-only workspace deliberately has neither `@opencode-ai/plugin` nor
  Node type declarations. The existing behavior suite transpiles the local tool
  with a temporary host shim and confirms TS/JS output parity.

## Concern

- The portable plugin intentionally has no live MCP invocation. Target-host
  installation must provide the verified mapped runner and exact Reader allowlist.

## Execution-Boundary Revision

- Removed the impossible public ADO plugin. No portable plugin claims to execute
  MCP calls.
- Added Reader instruction and permission-contract assertions, including the
  ordered `"ado_*": deny` then exact allow installation requirement.
- Added capability-template parsing checks for Wiki, Work Item, Relations, and
  History/comments, including the final-section boundary.

## Validator Correction

- Current evidence is `bass-context-brief.behavior-test.mjs`,
  `bass-validate-ado-read-capabilities.behavior-test.mjs`, and
  `bass-reader-contract.behavior-test.mjs`.
- The validator tests TS/JS parity, partial valid mappings, malformed/unverified
  entries, and the final History/comments section. Target-host MCP calls are not
  executed in this source-only workspace.

## Validator Review Fix Evidence

- Validator tests now reject wildcard `ado_*`, whitespace, quoted, slash,
  punctuation, and multiline tool-name injection values in both TS and JS paths.
- No invalid name enters the generated exact Reader permission fragment.
