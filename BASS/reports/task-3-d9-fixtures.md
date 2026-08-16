# Task 3 D9 Fixtures Report

## Delivered

- Added source-only D9 fixtures under `BASS/fixtures/d9-executor/` for all create Work Item types, plus Feature-based fixtures for standard/custom fields, tags, comments, relations, transitions, and local imports. Additional coverage includes sync directions, conflicts, confirmation integrity, adapter failures, replay, and prohibited repository/code/pull-request/pipeline mutation mappings.
- Capability fixtures use immutable exact-operation entries. Categories with add/remove operations contain separate entries; validator, planner, and executor resolve the same `category:operation` key.
- Added exact fixture-backed plan, dispatch, normalized outcome, and Action Log assertions for every mapped operation. MCP, permission, and partial failures assert operation, target, evidence, Decision, actor, date, status, and normalized record token columns.
- Prohibited mutation cases run through validator and planner, then conditionally attempt executor dispatch only if a token is incorrectly produced; all assert blocked validation/planning and zero adapter calls.
- Every permitted mapping declares `resourceType: work_item`; missing, unknown, and non-Work-Item resource types are blocked independently of tool name. The write-capability template uses the validator's camelCase keys: `toolName`, `resourceType`, `supportedInput`, `verifiedReadWrite`, and `verificationDate`.

## Verification

- `node BASS/integration/opencode/plugins/bass-ado-executor.behavior-test.mjs`
- The suite makes no MCP or Azure DevOps calls. Adapter doubles provide snapshots and dispatch outcomes entirely in process.

## Remaining Scope

- A target-host verified capability map and live ADO behavior remain outside this source-only task.
