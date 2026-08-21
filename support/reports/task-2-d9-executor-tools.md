# D9 Task 2 Report: Plan Token, Sync, and Execution Tools

## Delivered

- Added portable TypeScript and JavaScript OpenCode plugin entries for capability validation, single-operation planning, three-way comparison, and confirmed execution.
- The validator accepts only verified exact `ado_*` Work Item mappings, rejects technical-delivery tool names, validates configured field maps, and returns deny-first Executor permissions.
- The planner requires one mapped operation, one field-level diff, cited evidence, Decision IDs, a current mapped authorized snapshot for existing Work Items, expiry, and a SHA-256 integrity hash.
- The comparator preserves local-only and ADO-only directions and emits open D3 `Conflict` records for overlapping values without selecting a winner.
- The executor accepts only the exact confirmation string for an unexpired, unaltered, unused token; it revalidates capability and target version, dispatches only to an injected adapter double, and appends a schema-valid Action Log record.
- On simulated post-remote local-record failure, execution returns `remote_succeeded_local_recording_failed`, writes the supplied durable recovery record when available, and never sends a compensating operation.

## Test Evidence

- RED: `node BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs` initially failed because the D9 modules were absent.
- GREEN: `node BASS/adapters/opencode/plugins/bass-ado-executor.behavior-test.mjs` passed.
- Regression: D7/D8 behavior suites passed: creator preview, improvement, and approved improvement persistence.

## Core Finding Repair

- RED evidence is preserved in `task-2-d9-core-findings-red.md`. The separate core suite initially stopped at the absent final `getCurrentSnapshot` boundary, returning `blocked` where safe dispatch was expected.
- GREEN: `node BASS/adapters/opencode/plugins/bass-ado-executor-core-findings.red-test.mjs` passed after the repair.
- Executor now obtains `adapter.getCurrentSnapshot(target)` immediately before either remote dispatch or approved local import and requires exact Work Item ID and version equality.
- Dispatch exceptions, permission denial, and partial adapter results append actual-status rows to the canonical Action Log. A remote success whose Action Log append fails emits the recovery status only when the bounded recovery path is provided; it never reverses the remote operation.
- Confirmed `query/import` updates only approved in-root JSON local artifact and baseline files atomically and does not call `adapter.dispatch`.
- Create and query/import validate every requested configured field against the declared Work Item type. Comparator convergence creates no proposal.

## Recovery Repair

- Added executable RED evidence at `bass-ado-executor-recovery.red-test.mjs`; its captured pre-repair assertion is retained in `task-2-d9-recovery-red-output.txt`. The pre-repair planner issued a token for an extra unvalidated import value.
- Import values now exactly match the complete tokenized, configured, type-compatible field diff. The preview continues to carry every tokenized change through `operation.changes`.
- Local import writes staged files and byte-preserving backups. An injected second replacement failure restores artifact and baseline bytes and removes all temporary and backup files.
- Every remote operation requires a writable recovery destination contained by the supplied recovery root before dispatch. Recovery files use the canonical Action Log heading, header, delimiter, and row schema.
- A remote success whose Action Log write fails records `remote_succeeded_local_recording_failed` in recovery. A non-success outcome whose Action Log write fails records `remote_outcome_local_recording_failed`; neither path silently ignores the failure or attempts remote reversal.

## Journal Repair

- Added `bass-ado-executor-journal.red-test.mjs` and captured its pre-repair failure in `task-2-d9-journal-red-output.txt`.
- Before a local import replacement, executor writes a project-contained import journal holding both original bytes, new bytes, and commit state. A later execution deterministically restores any incomplete journal before beginning another operation.
- The import journal remains after an interruption or Action Log failure, and is removed only after both local files commit and Action Log success. Local-import Action Log failure writes a unique canonical recovery Action Log file and stops.
- Remote recovery records are unique Markdown files in the prevalidated recovery directory, preserving multiple failures without overwriting prior evidence.

## Journal P1 Repair

- Added `bass-ado-executor-journal-p1.red-test.mjs` and captured its pre-repair failure in `task-2-d9-journal-p1-red-output.txt`.
- Journal creation and every state transition use temp write, file sync, atomic rename, a second file sync, and a directory-sync hook before a target replacement. Test instrumentation verifies both file and directory sync events occur before the first replacement. Serialized journals contain lifecycle state and phase only; runtime durability results are not persisted.
- After Action Log success, the journal receives durable `logged` state before cleanup. A cleanup interruption retains the imported artifact and baseline; next execution removes the stale logged journal without rolling those values back. Pre-logged journals still restore their original bytes.
- Node/Windows directory synchronization limitations are retained as explicit durability status (`directory_fsync_unavailable_by_host` or a captured error) rather than silently asserted as durable fsync.

## Journal P1 Fail-Closed Repair

- Added `bass-ado-executor-journal-durability.red-test.mjs` and captured its pre-repair failure in `task-2-d9-journal-durability-red-output.txt`.
- Journal and restore writes fail closed when file or directory synchronization is unavailable or errors. Import returns `journal_durability_unsupported` before any target replacement; recovery returns `journal_recovery_durability_failed` and retains the journal.
- Journal serialization carries lifecycle `state` and `phase` only; runtime durability results are not persisted. Restoration uses the same temp-write, file-sync, atomic-rename, and directory-sync protocol, then removes the journal only after durable restore succeeds.
- Default host behavior now reports directory fsync as unavailable, so production import does not proceed without an installation-provided supported durability adapter. This is deliberate fail-closed behavior on Windows/Node hosts that cannot establish required directory durability.

## Journal Cleanup Repair

- Added `bass-ado-executor-journal-cleanup.red-test.mjs` for post-unlink directory-sync failure and retry recovery.
- Cleanup now writes durable `cleanup_pending` state before unlink, then syncs the journal directory. If that sync fails, executor recreates the pending journal with the durable protocol and returns `journal_cleanup_durability_failed`; if recreation fails it returns the explicit catastrophic status with no normal-success claim.
- Recovery recognizes `cleanup_pending` and logged-complete journals as cleanup retries, never rolls their imported values back, and removes the journal only after a successful retry.
- Durability metadata no longer claims serialized fsync results. Journal records serialize only lifecycle `state` and `phase`; actual durability success is established by the fail-closed operation itself.

## Constraints

- The implementation has no MCP, HTTP, Azure DevOps SDK, or host-install path. The only dispatch boundary is an explicit `adapter.dispatch` test/target-host integration input.
- This Task 2 behavior suite covers the secure core interfaces. Task 3 remains responsible for the complete fixture matrix and exact outcomes for every mapped operation and failure class.
