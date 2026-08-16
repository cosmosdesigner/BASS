# BASS D9 Executor and ADO Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a capability-mapped, individually confirmed Azure DevOps Work Item Executor with three-way synchronization and complete local auditability.

**Architecture:** Deterministic portable validators create single-operation plan tokens from local artifacts, mapped target-host capabilities, and current Work Item snapshots. Executor only dispatches an exact mapped operation after confirmation; it records durable outcomes and stops safely on conflicts, version mismatches, MCP failures, permissions errors, or local-recording failures.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown command/agent definitions, Markdown/YAML BASS projects, target-host Azure DevOps MCP mappings.

## Global Constraints

- Executor is the only agent allowed to perform a confirmed Azure DevOps Work Item operation.
- Every ADO Work Item write requires a field-level preview and explicit confirmation for that one operation.
- Durable issued-token records require target-host `BASS_TOKEN_SIGNING_KEY` HMAC signing; Executor fails closed if it cannot verify a canonical signed issuer record.
- Multi-operation plans pause for separate confirmation before each operation.
- Every operation must map to a verified exact tool in `ado-write-capabilities.md`; unknown tools and fields are unavailable and never guessed.
- Allowed operations: create Work Items, mapped field updates, tag add/remove, structured comments, relation create/remove, state/reason transitions, and approved local imports.
- Code, repository, pull-request, and pipeline mutation are prohibited.
- Sync uses local state, ADO state, and last synchronized baseline. Overlap is a D3 Conflict and blocks both directions pending Decision.
- Every local import also requires field-level preview and explicit confirmation.
- Remote success plus local recording failure is `remote_succeeded_local_recording_failed`; stop with recovery instructions and never auto-reverse remotely.
- All runtime artifacts remain under `BASS/integration/opencode/`; do not install this workspace host `.opencode/`.

---

### Task 1: Executor Contracts, Capability Templates, and Commands

**Files:**
- Modify: `BASS/integration/opencode/agents/executor.md`
- Create: `BASS/templates/ado-write-capabilities-template.md`
- Create: `BASS/templates/configured-work-item-fields-template.md`
- Create: `BASS/integration/opencode/commands/bass/sync-ado.md`
- Create: `BASS/integration/opencode/commands/bass/update-ado.md`
- Create: `BASS/integration/opencode/commands/bass/link-items.md`
- Create: `BASS/integration/opencode/commands/bass/transition.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Portable Executor operation boundaries, target capability templates, and one-operation command entry points.

- [ ] **Step 1: Update Executor contract**

Specify mapped create, fields, tags, comments, relations, transitions, query/import operation categories; deny all other `ado_*` tools. Require exact plan token, evidence/Decision context, confirmation, and Action Log outcome. State every local import requires approval and remote success/local recording failure stops without reversal.

- [ ] **Step 2: Create write capability template**

Create sections for create, field update, tags, comments, relations, transitions, query/import. Each includes exact `tool_name`, `operation`, `supported_input`, `verified_read_write`, and `verification_date`. Include ordered Executor permission synchronization instructions.

- [ ] **Step 3: Create configured Work Item fields template**

Map standard fields and organization-specific custom fields with local field name, ADO field reference, supported Work Item types, and verification status. State unknown/unmapped fields remain unavailable.

- [ ] **Step 4: Create command contracts**

Each command invokes plan-token generation and shows one operation preview. `sync-ado` may enumerate multiple tokens but requires per-token confirmation. `update-ado`, `link-items`, and `transition` reject unsupported/multi-operation input.

- [ ] **Step 5: Update installation guide**

Document capability mapping, Executor exact allowlist synchronization, configured-field maps, every-write confirmation, three-way sync, no automatic reversal, and D9 exclusions.

### Task 2: Plan Token, Sync, and Execution Tools

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-write-capabilities.ts`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-write-capabilities.js`
- Create: `BASS/integration/opencode/plugins/bass-plan-ado-operation.ts`
- Create: `BASS/integration/opencode/plugins/bass-plan-ado-operation.js`
- Create: `BASS/integration/opencode/plugins/bass-compare-ado-sync.ts`
- Create: `BASS/integration/opencode/plugins/bass-compare-ado-sync.js`
- Create: `BASS/integration/opencode/plugins/bass-execute-confirmed-ado-operation.ts`
- Create: `BASS/integration/opencode/plugins/bass-execute-confirmed-ado-operation.js`
- Create: `BASS/integration/opencode/plugins/bass-ado-executor.behavior-test.mjs`

**Interfaces:**
- Write validator consumes capability/field maps and returns exact safe Executor permission fragment plus available operations.
- Planner consumes local artifact, ADO snapshot, baseline, requested operation, cited evidence, Decision context, and mapping; returns one integrity-bound token.
- Comparator returns local-only, ADO-only, and overlapping changes.
- Executor consumes confirmed token and a target-host dispatch adapter; returns actual outcome and local Action Log record status.

- [ ] **Step 1: Implement capability and configured-field validation**

Validate exact safe tool identifiers, known operation categories, `verified_read_write: true`, input shape, date, and field mapping. Produce `ado_*` deny followed by exact mapped allows. Reject repository/PR/pipeline mutation mappings.

- [ ] **Step 2: Implement one-operation plan tokens**

Generate operation, target, Work Item type, field-level before/after, evidence, Decision IDs, capability entry, baseline version, timestamps, expiry, and SHA-256 integrity hash. Reject missing evidence, missing Decision context, unknown fields/tools, and more than one operation.

When durable restart support is configured, write a canonical issuer-store record signed by `BASS_TOKEN_SIGNING_KEY`. Do not serialize the signing key. Executor must verify the signature and canonical issuer-store path before accepting a token after process restart.

- [ ] **Step 3: Implement three-way comparator**

Compare local artifact state, ADO snapshot, and baseline per mapped field. Return local-only proposals, ADO-only local-import proposals, and overlap conflicts with both values and sources. Do not select a winner.

- [ ] **Step 4: Implement confirmed operation dispatch boundary**

Verify token hash, expiry, explicit confirmation, capability map, current target version, exact operation, and adapter response. Invoke only the mapped target-host adapter operation. Reject batch, altered, replayed, expired, or concurrent-change tokens.

- [ ] **Step 5: Implement durable outcome recording**

Atomically write canonical Action Log rows and local artifact/baseline updates where applicable. If remote success recording fails, persist best-effort durable failure record at approved recovery path with `remote_succeeded_local_recording_failed`, then stop. Never dispatch compensating remote reversal.

- [ ] **Step 6: Build JS and source-only test adapter**

Generate JS from TS. Use a controlled adapter double to simulate all mapped operations, MCP errors, permission errors, partial responses, concurrent changes, and remote success/local failure. Do not call real MCP or ADO.

### Task 3: D9 Fixtures and Exact Outcomes

**Files:**
- Create: `BASS/fixtures/d9-executor/capabilities/`
- Create: `BASS/fixtures/d9-executor/operations/`
- Create: `BASS/fixtures/d9-executor/sync/`
- Create: `BASS/fixtures/d9-executor/failures/`
- Create: `BASS/fixtures/d9-executor/expected/`

**Interfaces:**
- Consumes: D9 validators, token planner, comparator, and executor adapter.
- Produces: Exact source-only plan/outcome fixtures covering every operation and failure class.

- [ ] **Step 1: Create mapped operation fixtures**

Cover create Epic/Feature/User Story/Bug/Task; standard/custom field update; tag add/remove; structured comment; relation create/remove; state/reason transition; and each expected token preview.

- [ ] **Step 2: Create sync fixtures**

Cover local-only ADO proposal, ADO-only local import proposal, and overlapping field D3 Conflict blocking both directions.

- [ ] **Step 3: Create confirmation and integrity fixtures**

Cover absent confirmation, expired token, hash tampering, operation mutation, batch attempt, replay, unknown capability, and unmapped custom field.

- [ ] **Step 4: Create failure fixtures**

Cover MCP unavailable, permission denied, partial remote failure, concurrent version mismatch, local recording failure after remote success, and prohibited technical mutation.

- [ ] **Step 5: Verify exact outcomes**

Normalize dynamic token IDs/timestamps/hashes only. Exactly compare plan fields, dispatch calls, Action Log status/links, local artifact changes, conflicts, and recovery records.

### Task 4: D9 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/executor.md`
- Verify: `BASS/integration/opencode/commands/bass/{sync-ado,update-ado,link-items,transition}.md`
- Verify: `BASS/integration/opencode/plugins/bass-*-ado-*.{ts,js}`
- Verify: `BASS/fixtures/d9-executor/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that D9 manages mapped Work Items with one-operation control and auditability.

- [ ] **Step 1: Run all D9 source-only suites**

Run validator, planner, comparator, executor adapter, and fixture suites. Confirm emitted-TS/shipped-JS parity and exact normalized outcomes.

- [ ] **Step 2: Verify every-write and import confirmation**

Confirm no remote dispatch or local import occurs without a valid, unexpired, unaltered single-operation confirmed token.

- [ ] **Step 3: Verify sync and conflict behavior**

Confirm local-only and ADO-only changes create directional proposals; overlapping changes create D3 Conflicts that block execution pending Decision.

- [ ] **Step 4: Verify audit and failure behavior**

Confirm every outcome has schema-valid Action Log evidence/Decision links; remote/local partial failures stop with actual status and no remote reversal.

- [ ] **Step 5: Verify boundaries**

Confirm no code/repository/PR/pipeline mutation mapping or dispatch exists; no real MCP/ADO call or host `.opencode/` installation occurs during source-only tests. Run `git status --short`; do not initialize Git.
