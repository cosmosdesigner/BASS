# D9 Task 4 Acceptance Verification Report

**Verification date:** 2026-08-15 (final post-repair Task 4 rerun, all D9 suites)

## Result

**Pass, source-only verification.** All D9 behavioral, fixture, core, recovery, and
journal suites passed. They verify every supported mapped operation, token and
confirmation enforcement, three-way synchronization, conflicts, adapter failures,
Action Log outcomes, recovery records, and prohibited technical mutation. No live
Azure DevOps, MCP, or target-host installation was exercised.

The final rerun includes create-without-snapshot, durable-marker restart replay,
fail-closed marker durability, atomic post-dispatch recovery outcomes, local-import
journaling, and recovery cleanup. Durable-marker and recovery success paths use
explicit source-only durability adapters; default missing marker durability is
verified fail-closed.

It also covers canonical UTC expiry rejection before adapter access, actual create
result auditing, every mapped payload category, fixture operation matrix, three-way
sync conflicts, and prohibited mutation boundaries.

The verified runtime is the shipped JavaScript implementation. TypeScript source
entries remain target-host wrappers around that runtime; emitted-TypeScript parity is
host/dependency-unverified and is not claimed by this report.

## Test Results

| Command | Result | Evidence |
| --- | --- | --- |
| `node BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs` | Pass | `bass-ado-executor behavior tests passed`; `bass-ado-executor fixture tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-core-findings.red-test.mjs` | Pass | `bass-ado-executor core finding RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-recovery.red-test.mjs` | Pass | `bass-ado-executor recovery RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-journal.red-test.mjs` | Pass | `bass-ado-executor journal RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-journal-p1.red-test.mjs` | Pass | `bass-ado-executor journal P1 RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-journal-durability.red-test.mjs` | Pass | `bass-ado-executor journal durability RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-ado-executor-journal-cleanup.red-test.mjs` | Pass | `bass-ado-executor journal cleanup RED tests passed` |
| `node BASS/adapters/opencode/plugins/bass-validate-ado-read-capabilities.behavior-test.mjs` | Pass | `bass-validate-ado-read-capabilities behavioral contract passed` |
| `node BASS/adapters/opencode/plugins/bass-validate-ado-discovery-capabilities.behavior-test.mjs` | Pass | `bass-validate-ado-discovery-capabilities behavioral contract passed` |
| `node BASS/test-support/d9/ts-wrapper-load-regression.mjs` | Pass | TypeScript wrappers compile/load with a minimal local plugin shim and register both tools |

## Requirement Evidence

| Requirement | Evidence location | Outcome |
| --- | --- | --- |
| Executor and four D9 command boundaries require a current mapped snapshot, one operation, preview, exact token, and explicit confirmation | `adapters/opencode/agents/executor.md:19-45`; `commands/bass/{sync-ado,update-ado,link-items,transition}.md` | Pass, source review |
| Write map categories, exact safe tools, deny-first permissions, configured fields, and unavailable unknown fields | `templates/ado-write-capabilities-template.md:3-72`; `templates/configured-work-item-fields-template.md:3-26`; `plugins/bass-validate-ado-write-capabilities.js:3-21` | Pass |
| All supported operations: five Work Item creates, standard/custom fields, tag add/remove, comment, relation add/remove, transition, and import | `fixtures/d9-executor/operations/mapped-operations.json:3-16`; `plugins/bass-ado-executor.behavior-test.mjs:77-101` | Pass |
| A token is single-operation, HMAC issuer-bound, evidence/Decision-linked, confirmation-gated, and requires a future canonical RFC3339 UTC millisecond expiry (`YYYY-MM-DDTHH:mm:ss.sssZ`) that round-trips through `Date#toISOString`; replay, impossible/noncanonical/malformed expiry, caller-rehashed mutation, batch, and unmapped fields are blocked before adapter access | `plugins/bass-plan-ado-operation.js:5-17,36-41`; `plugins/bass-execute-confirmed-ado-operation.js:25-29`; `fixtures/d9-executor/failures/confirmation-integrity.json`; `plugins/bass-ado-executor.behavior-test.mjs:98-128,141-144` | Pass |
| Category-specific token payloads reject missing, arbitrary, and cross-category tags, comments, relations, and transitions before token creation; valid previews retain exact payloads | `plugins/bass-plan-ado-operation.js:6-19`; `fixtures/d9-executor/failures/rejected-category-payloads.json`; `fixtures/d9-executor/{operations,expected/mapped-operation-plans}.json`; `plugins/bass-ado-executor.behavior-test.mjs:116-120` | Pass, JS source-only |
| Executor revalidates mapped category payload and capability category before adapter dispatch; a rehashed tag token with a field-shaped payload is blocked with zero dispatches | `plugins/bass-execute-confirmed-ado-operation.js:24-27`; `plugins/bass-ado-executor.behavior-test.mjs:117-127` | Pass, JS source-only |
| Planner and Executor validate every category: fields require one mapped before/after change; create requires a supported Work Item type and mapped allowed fields; imports require one mapped change and exact local values. Rehashed field-to-tag, unsupported create type, and import extra-value tokens block before snapshot, dispatch, or local write | `plugins/bass-plan-ado-operation.js:6-29`; `plugins/bass-execute-confirmed-ado-operation.js:24-27`; `plugins/bass-ado-executor.behavior-test.mjs:126-144` | Pass, JS source-only |
| Every non-create category has exactly one change at planning and execution. Rehashed tags, comments, relations, and transitions with a valid first plus injected second change block before snapshot or adapter dispatch | `plugins/bass-plan-ado-operation.js:8-16`; `plugins/bass-execute-confirmed-ado-operation.js:24-27`; `plugins/bass-ado-executor.behavior-test.mjs:126-138` | Pass, JS source-only |
| Three-way local-only and ADO-only proposals; overlap becomes an open D3 Conflict and blocks directions | `plugins/bass-compare-ado-sync.js:4-6`; `fixtures/d9-executor/sync/three-way-sync.json`; `plugins/bass-ado-executor.behavior-test.mjs:102-104` | Pass |
| Current target ID/version revalidation, adapter-only dispatch, actual outcomes, Action Log, failure status, and no compensation | `plugins/bass-execute-confirmed-ado-operation.js:25-33`; `fixtures/d9-executor/failures/adapter-failures.json:3-7`; `plugins/bass-ado-executor.behavior-test.mjs:117-139` | Pass |
| Valid creates bypass only current-snapshot lookup, dispatch once, and record an Action Log outcome; all other pre-dispatch gates remain enforced | `plugins/bass-execute-confirmed-ado-operation.js:25-34`; `plugins/bass-ado-executor.behavior-test.mjs:55-58` | Pass, JS source-only |
| A durable `dispatch_started` Action Log marker blocks replay after process-memory reset; token is not consumed on pre-dispatch validation failure | `plugins/bass-execute-confirmed-ado-operation.js:10-11,27-31`; `plugins/bass-ado-executor.behavior-test.mjs:59-64` | Pass, JS source-only |
| Pre-dispatch replay markers use atomic temp write, file fsync, rename, and directory fsync. Default execution fails closed with `dispatch_preflight_durability_unavailable` when real durable marker support is unavailable; injected file/directory failures block before adapter dispatch, and failed marker persistence reports `dispatch_preflight_durability_failed` with retained recovery data when possible | `plugins/bass-execute-confirmed-ado-operation.js:15-16,30-31`; `plugins/bass-ado-executor.behavior-test.mjs:69-82` | Pass, JS source-only |
| Concurrent ID/version mismatch blocks with a schema-valid `concurrent_version` Action Log outcome carrying evidence and Decision links, with recovery fallback if logging fails | `plugins/bass-execute-confirmed-ado-operation.js:28-30`; `plugins/bass-ado-executor.behavior-test.mjs:65-68` | Pass, JS source-only |
| Remote success plus failed local record produces durable `remote_succeeded_local_recording_failed` only when atomic recovery persistence succeeds. If final outcome or recovery durability fails after any post-dispatch outcome, it returns `remote_outcome_recovery_durability_failed` with preserved `originalOutcome`, remote result/status, and `recoveryDurable: false`. Imports have journal/recovery handling | `plugins/bass-execute-confirmed-ado-operation.js:12,15-20,30,40`; `bass-ado-executor-{recovery,journal,journal-p1,journal-durability,journal-cleanup}.red-test.mjs` | Pass, injected-adapter source-only |
| Post-dispatch recovery uses atomic temp write, file fsync, rename, and directory fsync through an explicitly supplied recovery adapter. Any post-dispatch outcome whose final record and recovery persistence fail returns `remote_outcome_recovery_durability_failed` with `originalOutcome`, original remote result/status, and `recoveryDurable: false`; no reversal occurs | `plugins/bass-execute-confirmed-ado-operation.js:12,15-16,40`; `plugins/bass-ado-executor.behavior-test.mjs:95-120` | Pass, JS source-only |
| Final remote outcome is atomically persisted through an explicit outcome-durability adapter. Succeeded, permission, partial, and adapter-throw outcomes use the same explicit non-durable recovery status if both persistence paths fail, never success | `plugins/bass-execute-confirmed-ado-operation.js:15-16,38-40`; `plugins/bass-ado-executor.behavior-test.mjs:111-120` | Pass, injected-adapter source-only |
| Create final Action Log outcome uses adapter-returned Work Item ID, URL, version, and result rather than planned `new` target; JavaScript plugin entrypoint accepts and forwards `recoveryRoot`, `recoveryPath`, `dispatchDurability`, `recoveryDurability`, and `outcomeDurability` | `plugins/bass-execute-confirmed-ado-operation.js:9,41`; `plugins/bass-ado-executor.behavior-test.mjs:12-38,102-107` | Pass, JS source-only |
| Production plugin entrypoints capture runtime-owned OpenCode context in closures; public planner/executor APIs and tool schemas do not accept context, store, path, or project inputs, and production modules export no trusted-context factory or test hook. Direct public calls with caller-supplied `trustedContext` block with no token/cache/store side effect. `BASS/test-support/d9/executor-harness.mjs` is isolated non-portable source-only test support and drives actual plugin closures. TypeScript wrappers compile/load with a minimal local plugin shim and register delegated tools without referencing nonexistent runtime factories. | `plugins/bass-plan-ado-operation.js:29-52`; `plugins/bass-execute-confirmed-ado-operation.js:32-57`; `plugins/bass-*-ado-operation.ts`; `test-support/d9/*`; `plugins/bass-ado-executor.behavior-test.mjs:12-40` | Pass, JS source-only |
| Repository, code, pull-request, pipeline, build, and release mappings are rejected with zero dispatch | `plugins/bass-validate-ado-write-capabilities.js:6,13`; `fixtures/d9-executor/capabilities/prohibited-capabilities.json:3-6`; `plugins/bass-ado-executor.behavior-test.mjs:145-151` | Pass |
| Source-only and no host installation | `plugins/bass-execute-confirmed-ado-operation.js:31`; source scan of D9 runtime found no network/MCP/ADO client/process-launch path; `README.md:75-78` | Pass, source-only |
| Mapped ADO read and discovery capability contracts remain source-only validated | `plugins/bass-validate-ado-{read,discovery}-capabilities.behavior-test.mjs` | Pass, source-only |

## Host And Live-ADO Limitations

- Live ADO/MCP behavior is unavailable: this workspace contains no target-host verified
  capability map, host MCP authorization, credentials, or live service evidence.
- `git status --short` returned `fatal: not a git repository`; Git was not initialized.
- A workspace `.opencode/` directory exists, but there is no Git or before-state
  baseline to attribute its contents. D9 source contracts prohibit host modification,
  but no-host-install compliance cannot be proven from host history.
- Host-baseline evidence remains unavailable; this source-only pass does not claim
  that the existing host `.opencode/` directory was untouched.
- Emitted-TypeScript parity is unverified because this source workspace lacks the
  target-host plugin dependency/emission environment. This report verifies shipped JS
  behavior only.
- Durable marker execution requires target-host real fsync/directory-sync support or
  an explicitly supplied durable adapter. This source-only environment verifies the
  fail-closed default and simulated durable adapter paths, not host durability.
- Post-dispatch recovery durability is verified only with injected source-only
  adapters. Target-host recovery fsync/directory-sync support is unverified.
- Final Action Log outcome durability is verified only with injected source-only
  adapters. Target-host outcome fsync/directory-sync support is unverified.
- `BASS_TOKEN_SIGNING_KEY`, runtime context identity, issuer-store permissions, and
  issuer-record durability are tested only with source-only host material. Target-host
  secret provisioning, runtime context integrity, and storage behavior are unverified.
- The TypeScript load regression uses a minimal local shim and source-only compiled
  copies; target-host OpenCode loading and emitted-TypeScript runtime parity remain
  unverified.
