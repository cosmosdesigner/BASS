---
name: bass-link-items
description: Preview and confirm one Azure DevOps Work Item relation operation.
---

# BASS Link Items

## Canonical Workflow

Explicit command entry point for **Sync/Execute ADO**. Target: exactly one source Work
Item, target relation, and create-or-remove relation operation. Gate: current mapped
source snapshot, capability, cited evidence, relevant Decisions, and valid plan are
required; otherwise `blocked`. Route: BASS -> Executor for preparation, then BASS ->
Executor only after confirmation.

Interpret `$ARGUMENTS` as exactly one selected project, source Work Item, current
mapped relevant source Work Item snapshot/read, one target relation reference, mapped
create-or-remove relation operation, cited evidence, and relevant Decision records.
Before planning, require a current mapped source Work Item read and reject a missing,
stale, unmapped, failed, or unauthorized snapshot. Reject missing context, an
unsupported or unmapped tool, or input that requests more than one relation operation.
Call `bass_plan_ado_operation` once and return its one field-level relation preview
and plan token.

Require explicit user confirmation of that exact token before sending it unchanged to
Executor. Do not execute a second operation, repeat the token, batch links, mutate
repository, code, pull-request, or pipeline resources, or perform an ADO operation in
 this portable Task 1 contract. Do not modify host `.opencode/` files.

Return the uniform BASS response envelope. Include `## Confirmation` only for the
exact plan token required to execute the one planned operation.
