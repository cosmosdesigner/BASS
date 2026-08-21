---
name: bass-sync-ado
description: Preview three-way ADO synchronization as separately confirmed single operations.
---

# BASS Sync Ado

## Canonical Workflow

Explicit command entry point for **Sync/Execute ADO**. Target: one selected project,
local artifact, current Work Item snapshot, and synchronized baseline. Gate: current
mapped snapshots, cited evidence, Decisions, and conflict-free field direction are
required; otherwise `blocked`. Route: BASS -> Executor for each preparation and, after
separate confirmation, one Executor operation at a time.

Interpret `$ARGUMENTS` as one selected BASS project, local artifact, current mapped
relevant Work Item snapshot/read, last synchronized baseline, cited evidence, and
relevant Decision records. Before comparison, require a current mapped Work Item read
for every existing target Work Item and reject a missing, stale, unmapped, failed, or
unauthorized snapshot. Call `bass_compare_ado_sync` once only after that validation.
Preserve every overlapping field as a D3 Conflict and do not select a direction or
execute either side until a user Decision resolves it.

For each non-overlapping local-only or ADO-only change, call `bass_plan_ado_operation`
separately. Return the ordered field-level previews and their distinct plan tokens. An
ADO-only local import is also a single operation and requires its own preview and
explicit user confirmation. Do not request one confirmation for the whole sync. After
each explicit user confirmation, invoke Executor only with that one unchanged,
unexpired token. Stop the remaining operations on a failed, unauthorized, expired,
altered, stale, or concurrent-change token. Do not batch, infer fields, call unmapped
tools, mutate technical ADO resources, or modify host `.opencode/` files. Do not
 perform an ADO operation in this portable Task 1 contract.

Return the uniform BASS response envelope. Include `## Confirmation` only for the
next exact plan token; conflicts and failed operations remain explicit in Gaps and
Conflicts.
