# BASS D9 Acceptance Report

**Classification:** Fact, source-only verification evidence

## Acceptance Status

**Pass, source-only.** All D9 behavioral, fixture, core, recovery, and journal
suites pass. Live Azure DevOps acceptance and host-installation acceptance remain
unavailable.

Final Task 4 rerun covers maps, tokens, all mapped operations, sync/conflicts,
audit/replay/create/local-import durability, and prohibited mutation boundaries.
Durable success paths are injected-adapter source-only evidence; missing default
marker durability is verified fail-closed.

The all-suite rerun also covers canonical UTC expiry rejection, actual create result
auditing, concurrent audit outcomes, and journal recovery/cleanup.

Shipped JavaScript source-only behavior is verified. Emitted-TypeScript parity is
host/dependency-unverified and is not claimed.

## Requirement-To-Location Mapping

| D9 requirement | Canonical implementation and evidence locations | Status |
| --- | --- | --- |
| Exact mapped Work Item capabilities and configured fields only | `BASS/templates/ado-write-capabilities-template.md`; `BASS/templates/configured-work-item-fields-template.md`; `BASS/adapters/opencode/plugins/bass-validate-ado-write-capabilities.js:3-21` | Pass |
| Executor-only, deny-first, individually confirmed operation boundary | `BASS/adapters/opencode/agents/executor.md:19-45`; `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:22-33` | Pass |
| `/bass sync-ado`, update, relation, and transition command controls | `BASS/adapters/opencode/commands/bass/{sync-ado,update-ado,link-items,transition}.md` | Pass |
| One-operation HMAC issuer-bound plan token with preview, evidence, Decision, canonical expiry, and SHA-256 integrity | `BASS/adapters/opencode/plugins/bass-plan-ado-operation.js:4-17,36-41` | Pass |
| Every supported create/update/tag/comment/relation/transition/import operation | `BASS/fixtures/d9-executor/operations/mapped-operations.json`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:77-101` | Pass |
| Confirmation absence, future canonical RFC3339 UTC millisecond expiry, caller-rehashed operation mutation, forged issuer record, missing signing key, batch, replay, impossible/noncanonical/malformed expiry, and unavailable field blocking before adapter access | `BASS/fixtures/d9-executor/failures/confirmation-integrity.json`; `BASS/fixtures/d9-executor/expected/{confirmation-outcomes,batch-blocked,unavailable-field}.json`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:98-128,141-144` | Pass |
| Tags, structured comments, relations, and transitions accept only their exact category payloads and reject missing, arbitrary, and cross-category payloads before a token exists | `BASS/adapters/opencode/plugins/bass-plan-ado-operation.js:6-19`; `BASS/fixtures/d9-executor/failures/rejected-category-payloads.json`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:116-120` | Pass, JS source-only |
| Executor revalidates the token's mapped category payload and capability category; a rehashed tag token carrying a field-shaped payload is blocked with zero adapter dispatches | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:24-27`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:117-127` | Pass, JS source-only |
| Planner and Executor validate fields, creates, and imports against exact schemas, configured mappings, and supported Work Item types; rehashed field-to-tag, unsupported-create, and import-extra-value tokens block before snapshot, dispatch, or local write | `BASS/adapters/opencode/plugins/bass-plan-ado-operation.js:6-29`; `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:24-27`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:126-144` | Pass, JS source-only |
| Every non-create operation has exactly one change. Rehashed tags, comments, relations, and transitions with a valid first plus injected second change block before snapshot or adapter dispatch | `BASS/adapters/opencode/plugins/bass-plan-ado-operation.js:8-16`; `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:24-27`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:126-138` | Pass, JS source-only |
| Three-way directional sync and D3 Conflict blocking | `BASS/adapters/opencode/plugins/bass-compare-ado-sync.js:4-6`; `BASS/fixtures/d9-executor/sync/three-way-sync.json`; `BASS/fixtures/d9-executor/expected/sync-outcomes.json` | Pass |
| Current-version validation, adapter boundary, failure outcomes, Action Log, recovery, and no remote reversal. Durable `remote_succeeded_local_recording_failed` is returned only when atomic recovery persistence succeeds; any post-dispatch final-outcome or recovery durability failure returns `remote_outcome_recovery_durability_failed` with preserved `originalOutcome`, remote result/status, and `recoveryDurable: false` | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:12,25-40`; `BASS/fixtures/d9-executor/failures/adapter-failures.json`; `BASS/adapters/opencode/plugins/bass-ado-executor-{behavior,recovery,journal,journal-p1,journal-durability,journal-cleanup}.red-test.mjs` | Pass, injected-adapter source-only |
| Valid creates bypass only current-snapshot lookup and dispatch once with Action Log evidence; restart replay is blocked by durable dispatch records; concurrent version mismatches record a `concurrent_version` outcome with evidence/Decision links | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:10-11,25-34`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:55-68` | Pass, JS source-only |
| Pre-dispatch replay markers use atomic temp write, file fsync, rename, and directory fsync. Default execution fails closed when real marker durability is unavailable; injected file/directory failures block before adapter dispatch, and marker persistence failure explicitly reports a retained-recovery durable failure | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:15-16,30-31`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:69-82` | Pass, JS source-only |
| Post-dispatch recovery uses atomic temp write, file fsync, rename, and directory fsync through an injected recovery adapter. Any outcome whose final record and recovery persistence fail returns `remote_outcome_recovery_durability_failed` with preserved `originalOutcome`, remote result/status, non-durable state, and no remote reversal | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:12,15-16,40`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:95-120` | Pass, JS source-only |
| Final remote outcome is atomically persisted through an injected outcome-durability adapter. Succeeded, permission, partial, and adapter-throw results cannot report success when final and recovery persistence both fail | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:15-16,38-40`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:111-120` | Pass, injected-adapter source-only |
| Create final Action Log outcome records actual adapter-returned Work Item ID, URL, version, and result. JavaScript plugin entrypoint exposes and forwards optional recovery, dispatch, recovery-durability, and outcome-durability arguments | `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:9,41`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:12-38,102-107` | Pass, JS source-only |
| Production plugin entrypoints capture runtime-owned OpenCode context in closures and public planner/executor APIs or tool schemas expose no context/store/path/project inputs. Production modules export no trusted-context factory or test hook; direct public caller `trustedContext` injection blocks before token/cache/store side effects. `BASS/test-support/d9/executor-harness.mjs` is isolated non-portable source-only test support and drives actual production plugin closures. TypeScript wrappers compile/load with a minimal local plugin shim and register delegated tools without referencing nonexistent runtime factories. | `BASS/adapters/opencode/plugins/bass-plan-ado-operation.js:29-52`; `BASS/adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js:32-57`; `BASS/adapters/opencode/plugins/bass-*-ado-operation.ts`; `BASS/test-support/d9/*`; `BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs:12-40` | Pass, JS source-only |
| TypeScript wrapper compile/load with a minimal local OpenCode plugin shim; both wrappers register delegated tools | `BASS/test-support/d9/ts-wrapper-load-regression.mjs`; `BASS/adapters/opencode/plugins/bass-*-ado-operation.ts` | Pass, source-only regression |
| Prohibited technical mutation and no host/runtime ADO client | `BASS/adapters/opencode/plugins/bass-validate-ado-write-capabilities.js:6`; `BASS/fixtures/d9-executor/capabilities/prohibited-capabilities.json`; `BASS/README.md:75-78` | Pass, source-only |
| Mapped ADO read and discovery capability contracts | `BASS/adapters/opencode/plugins/bass-validate-ado-{read,discovery}-capabilities.behavior-test.mjs` | Pass, source-only |

## Source-Only Execution Evidence

`node BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs` passed its behavior and fixture assertions. Its adapter is an in-process double (`bass-ado-executor.behavior-test.mjs:37,92,111-129`); no live MCP or Azure DevOps call is made.

The post-P1 rerun also passed all six supplemental executor suites and the source-only
ADO read/discovery capability behavior contracts.

## Acceptance Gaps

- Live ADO requires a target-host verified mapping and host-owned MCP authorization. No such evidence exists in this source workspace.
- The workspace is not a Git repository (`git status --short` fails), and `.opencode/` already exists. There is no baseline evidence proving whether it was modified. No Git repository was initialized.
- Emitted-TypeScript parity requires the target-host plugin dependency and emission environment; it is unverified here. The acceptance result covers shipped JavaScript behavior only.
- Real marker durability requires target-host fsync/directory-sync support or an explicitly supplied durable adapter. The source-only default is verified fail-closed; host durability is unverified.
- Post-dispatch recovery durability is tested with injected source-only adapters only; target-host recovery durability is unverified.
- Final Action Log outcome durability is tested with injected source-only adapters only; target-host outcome durability is unverified.
- `BASS_TOKEN_SIGNING_KEY`, runtime context identity, issuer-store permissions, and durability are verified only with source-only host material; target-host secret provisioning, runtime context integrity, and storage behavior are unverified.
- The TypeScript load regression uses a minimal local shim and source-only compiled
  copies; target-host OpenCode loading and emitted-TypeScript runtime parity remain
  unverified.

See `BASS/reports/task-4-d9-acceptance-verification.md` for exact commands and observed output.
