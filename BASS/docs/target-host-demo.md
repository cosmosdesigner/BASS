# Target-Host Demo

**Classification:** Operator runbook. **Confidence:** High for required controls; live outcome pending operator evidence.

## Preconditions

1. A current `BASS/reports/phase-1-source-readiness.md` outcome is `source_ready`.
2. An operator completed [Target-Host ADO Provisioning](target-host-ado-provisioning.md) using isolated resources and verified capability mappings.
3. The operator has a run ID, least-privilege identity, private evidence location, and Action Log/Evidence Register locations. Do not record credentials or real URLs in BASS.

## Live Flow

1. Read fixture Feature/User Story context and create a cited Context Brief.
2. Create local Feature and User Story previews; review and approve local persistence.
3. Prepare one mapped Work Item create or update plan with current snapshot, evidence, Decision context, field-level preview, and one token.
4. Obtain explicit confirmation for that exact plan. Executor performs exactly that one operation.
5. Record actual host response, Action Log entry, Evidence Register links, and any gap, conflict, or failure.
6. Repeat only as separately planned and separately confirmed operations require; complete cleanup.

## Outcome

Run every applicable check in [Target-Host Validation](target-host-validation.md). The demo is live only when retained isolated evidence shows actual operations. `target_ready` remains unclaimed for missing, failed, blocked, unauthorized, or unmapped checks; a source-demo token never substitutes for this evidence.
