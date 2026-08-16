# BASS D11 Orchestration and Complete Commands Design

## Status

Approved design for D11. This specification defines BASS intent routing, hub-and-spoke coordination, uniform response envelopes, workflow gates, complete Phase 1 commands, and contextual next-step recommendations.

## Intent and Workflow Selection

Explicit commands select their workflow and override natural-language intent detection. BASS still validates target, context, evidence, approvals, confirmations, and capability requirements before delegating.

For natural-language requests, BASS selects the least-mutating workflow that can answer the request:

1. Understand.
2. Discover.
3. Review.
4. Create.
5. Improve.
6. Sync/Execute ADO.

When ambiguity affects target, scope, or a write-capable workflow, BASS asks one focused clarifying question rather than guessing.

## Specialist Coordination

BASS is the sole user-facing orchestrator. It coordinates bounded specialist outputs as required:

```text
Reader -> Explorer -> Creator / Reviewer / Editor -> Executor
```

The sequence is conditional on workflow. BASS validates every specialist result against the selected workflow’s gates before forwarding bounded context. Specialists receive inputs only from BASS, return outputs only to BASS, and never communicate directly.

## Response Envelope

Every BASS response uses:

```markdown
## Status
## Workflow
## Result
## Evidence
## Gaps and Conflicts
## Next Action
```

An additional `## Approval` or `## Confirmation` section appears only when a local write, ADO Work Item write, local import, or Decision waiver is required.

Every material result retains cited source, location, D3 classification, and confidence. Useful errors identify the failed workflow stage, reason, available evidence, impact, and safe next action.

## Context and Conflict Gates

Understand, Discover, and Review may return bounded partial `warning` results with explicit gaps and conflicts.

Create, Improve, Sync, and Execute ADO return `blocked` when required context is insufficient or an unresolved conflict affects the requested mutation. BASS requests evidence or a user Decision; it never turns gaps into assumptions.

Local writes require their workflow-specific explicit approval. Every ADO Work Item write and local import requires its own confirmed D9 token. Code, repository, pull-request, pipeline, and deployment mutation remain prohibited.

For source-independent orchestration gates, D8 and D9 validators issue HMAC-signed gate attestations using the target-host `BASS_TOKEN_SIGNING_KEY`. The router verifies the attestation's workflow, target, status, expiry, and integrity before routing a mutation-capable workflow. Missing, expired, altered, or wrong-target attestations fail closed. The signing key is never included in BASS records, commands, reports, or tool arguments.

## Commands

Phase 1 commands are:

- `/bass understand`
- `/bass load-context`
- `/bass discover`
- `/bass create-feature`
- `/bass create-us`
- `/bass create-ac`
- `/bass create-proposal`
- `/bass review`
- `/bass improve`
- `/bass create-ado`
- `/bass sync-ado`
- `/bass update-ado`
- `/bass link-items`
- `/bass transition`
- `/bass technical-delivery`
- `/bass next`

`/bass next` reads the latest workflow result and returns one safest contextual recommendation. It never executes a workflow, persists an artifact, imports local data, or writes ADO.

## Fixture Coverage

D11 adds source-only end-to-end fixtures for:

- Natural-language requests mapped to each workflow.
- Explicit command precedence.
- Ambiguous target or write intent clarification.
- Insufficient context and conflict gating.
- Approval and confirmation gates.
- Specialist failure propagation.
- Uniform response envelopes.
- Contextual `/bass next` recommendations.

Target-host live ADO execution remains installation-dependent. Source-only tests validate deterministic routing, gate enforcement, response composition, and no unintended execution.

## Acceptance Criteria

A BA can use a natural request or explicit command without selecting specialists manually. BASS starts and completes the appropriate workflow or returns a clear evidence-grounded block, clarification, approval request, or confirmation request.
