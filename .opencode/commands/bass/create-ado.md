---
description: Preview and confirm one mapped Azure DevOps Epic, Feature, User Story, Bug, or Task create operation.
---

## Canonical Workflow

Explicit command entry point for **Sync/Execute ADO**. Target: exactly one requested
Work Item create in one selected project. Gate: require mapped capability, cited
evidence, relevant Decisions, and a valid single-operation plan; otherwise `blocked`.
Route: BASS -> Executor for preparation, then BASS -> Executor only after confirmation.

Interpret `$ARGUMENTS` as exactly one selected project, one requested Work Item type,
mapped create operation, mapped field values, cited evidence, and relevant Decision
records. Accept only `Epic`, `Feature`, `User Story`, `Bug`, or `Task`. Reject missing
context, an unsupported Work Item type, unmapped field or tool, or input that requests
more than one Work Item create. Call `bass_plan_ado_operation` once and return its one
field-level create preview and plan token.

Require explicit user confirmation of that exact token before sending it unchanged to
Executor. Do not create a second Work Item, repeat the token, batch creates, guess a
configured field, or mutate repository, code, pull-request, or pipeline resources.
Do not perform an ADO operation in this portable Task 1 contract or modify host
 `.opencode/` files.

Return the uniform BASS response envelope. Include `## Confirmation` only for the
exact plan token required to execute the one planned operation.
