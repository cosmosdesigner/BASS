---
name: bass-transition
description: Preview and confirm one Azure DevOps Work Item state and reason transition.
---

# BASS Transition

## Canonical Workflow

Explicit command entry point for **Sync/Execute ADO**. Target: exactly one Work Item
state and reason transition. Gate: current mapped snapshot, capability, cited evidence,
relevant Decisions, and a valid plan are required; otherwise `blocked`. Route: BASS ->
Executor for preparation, then BASS -> Executor only after confirmation.

Interpret `$ARGUMENTS` as exactly one selected project, target Work Item, current
mapped relevant Work Item snapshot/read, mapped state and reason transition,
before/after field-level diff, cited evidence, and relevant Decision records. Before
planning, require a current mapped Work Item read and reject a missing, stale,
unmapped, failed, or unauthorized snapshot. Reject missing context, an unsupported or
unmapped tool, or input that requests more than one transition. Call
`bass_plan_ado_operation` once and return its one preview and plan token.

Require explicit user confirmation of that exact token before sending it unchanged to
Executor. Do not execute a second operation, repeat the token, batch transitions,
mutate repository, code, pull-request, or pipeline resources, or perform an ADO
 operation in this portable Task 1 contract. Do not modify host `.opencode/` files.

Return the uniform BASS response envelope. Include `## Confirmation` only for the
exact plan token required to execute the one planned operation.
