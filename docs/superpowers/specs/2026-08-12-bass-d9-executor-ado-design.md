# BASS D9 Executor and ADO Synchronization Design

## Status

Approved design for D9. This specification defines safe Work Item execution, operation-mapped target-host capabilities, one-operation confirmation tokens, three-way synchronization, and auditable outcomes.

## Target-Host Capabilities

Each project contains:

- `project-context/ado-write-capabilities.md`
- `project-context/configured-work-item-fields.md`

The write capability map independently records verified exact target-host tools for Work Item create, field update, tag add/remove, structured comment, relation create/remove, state/reason transition, and query/import. Each mapping includes tool name, operation, supported input, read/write verification, and verification date.

The configured fields map records standard and organization-specific Work Item field mappings. Unknown or unmapped fields are shown as unavailable and are never guessed or written.

Target installation synchronizes only valid exact write tools into Executor's ordered `ado_*` deny-then-allow permissions. Repository, code, pull-request, and pipeline mutation remain prohibited.

## Plan Tokens and Confirmation

`/bass sync-ado`, `/bass update-ado`, `/bass link-items`, and `/bass transition` create deterministic single-operation plan tokens.

Each token contains:

- Operation type.
- Exact target Work Item or local artifact.
- Field-level before/after diff.
- Supporting evidence and Decision context.
- Capability-map entry.
- Creation and expiry timestamps.
- Integrity hash.

For restart-safe execution, a durable issued-token record is signed with the target-host `BASS_TOKEN_SIGNING_KEY` environment secret. BASS never stores, exposes, or includes this key in project files, tokens, reports, or Action Logs. Executor verifies the signature and loads issued records only from the canonical issuer store; if the key, valid signature, or issuer record is unavailable, execution fails closed.

BASS presents the plan or diff and obtains explicit user confirmation before Executor performs exactly that single operation. Every ADO write, including an individual field update, comment, tag change, relation change, or transition, requires its own confirmation.

Multi-step sync plans are shown in order but pause for separate confirmation before every operation. Executor does not expand, repeat, substitute, or batch a confirmed token.

## Supported Work Item Operations

Executor reads all relevant Work Item fields before planning. Supported mapped operations are:

- Create Epic, Feature, User Story, Bug, and Task Work Items.
- Update title, description, acceptance criteria, priority, effort, assignee, area, iteration, and configured fields.
- Add or remove simple tags.
- Add structured comments.
- Create or remove relations.
- Change state and reason.
- Import approved ADO-only changes into local artifacts.

Every operation records its actual outcome in the canonical Action Log with evidence and Decision links.

If an ADO operation succeeds but local recording fails, Executor records status `remote_succeeded_local_recording_failed` through the available durable path and stops for manual recovery. It does not automatically reverse the remote operation.

## Three-Way Synchronization

Sync compares local artifact state, current ADO Work Item state, and their last synchronized baseline:

- Local-only changes are proposed for ADO.
- ADO-only changes are proposed for local import.
- Overlapping changes become D3 Conflicts and block both directions until a user Decision resolves them.

Every local import has a field-level preview and requires explicit user approval. MCP failures, permissions errors, partial failures, and concurrent version changes stop the operation and record actual outcome.

## Fixture Coverage

D9 adds source-only fixtures and test doubles for every supported operation, token expiry and tampering, confirmation enforcement, configured-field maps, each sync direction, overlap conflicts, MCP and permission errors, partial and concurrent failures, Action Log outcomes, and prohibited technical mutation.

Live ADO execution is target-host installation-dependent. Source-only tests verify plan-token integrity, capability validation, dispatch constraints, local atomic updates, and outcome recording without invoking a real Azure DevOps service.

## Acceptance Criteria

BASS can manage mapped Azure DevOps Work Items end-to-end with control and auditability: every operation is capability-validated, field-previewed, individually confirmed, evidence-linked, logged, and safely stopped on conflicts or failures.
