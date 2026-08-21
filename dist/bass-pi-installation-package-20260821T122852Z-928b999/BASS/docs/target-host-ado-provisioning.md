# Target-Host ADO Provisioning Runbook

**Classification:** Proposal. **Confidence:** High for policy alignment with `BASS/rules/access-control.md` and the capability templates; target-host suitability remains unverified until the operator records evidence.

## Purpose and Boundary

This runbook provisions an isolated Azure DevOps test target for D12 validation. It does not provision production access, credentials, tokens, an MCP server, or BASS configuration containing host secrets. The host repository owns the Azure DevOps MCP configuration and all credentials. BASS must never store, request, expose, or duplicate them.

Use the declarative resource set in `BASS/quality/ado-test-fixture.md`. Do not begin if an isolated non-production project cannot be identified and authorized by the target-host owner.

## Preconditions

- An authorized operator has identified `<ISOLATED_PROJECT>` as non-production and suitable for disposable validation data.
- The operator can create or use the least-privilege `<BASS_VALIDATION_IDENTITY>` without sharing its credentials with BASS.
- An operator-controlled, access-controlled evidence location exists for validation outputs and run manifests.
- The target process supports the planned Work Item types and transitions, or unsupported entries will be left unmapped and marked `blocked`.
- The operator has read `BASS/rules/access-control.md`, `BASS/rules/provenance.md`, and the four capability templates.

If any precondition is missing, record a `Question` with the evidence gap and stop. Do not use a production project as a fallback.

## Provisioning Steps

1. Create or designate the isolated project. Record its authorization and non-production classification in operator-controlled evidence. Do not put its URL or identifier in BASS files.
2. Generate a unique `<RUN_ID>` and create a private run manifest using the fixture's logical identifiers. Record actor, date, project reference, and run tag; omit credentials.
3. Create the harmless Work Item hierarchy and Wiki pages specified in the fixture. Apply only `BASS-VALIDATION-<RUN_ID>` to fixture resources so cleanup is exact.
4. Identify existing harmless, read-only technical evidence for repository, commit, PR, pipeline, and deployment checks. Do not create, alter, queue, merge, approve, deploy, or delete technical resources through BASS.
5. Create `<BASS_VALIDATION_IDENTITY>` or an equivalent dedicated identity. Grant the minimum permissions required by the mapped check set and no broader role. Prefer a temporary project-scoped group over organization-wide permissions.
6. Configure the host-owned ADO MCP outside BASS distribution files. Confirm that BASS receives no token, secret, connection string, browser session export, or MCP configuration file.
7. Populate capability maps in operator-controlled target configuration. Start with every category unmapped and denied. Add one exact tool only after the corresponding isolated read or planned Work Item operation is understood.
8. Run each capability validator before synchronizing permissions:

```text
bass_validate_ado_read_capabilities
bass_validate_ado_discovery_capabilities
bass_validate_ado_technical_delivery_capabilities
bass_validate_ado_write_capabilities
```

9. Preserve `"ado_*": deny` first in Reader, Explorer, and Executor permissions. Add only exact validated target-host tool names. Never use wildcards. Keep unmapped, unauthorized, or failed categories denied.
10. Record the map version, exact validated tool names, verification date, allowed resource type, identity scope, and evidence link in the private run manifest. Do not record secrets.

## Least-Privilege Matrix

| Validation scope | Identity permission | Explicitly excluded |
| --- | --- | --- |
| Wiki and Work Item reads | Read only for the isolated project resources | Project administration, organization read, write, delete |
| Discovery and technical delivery | Read only for isolated Work Items, Wiki, repository, PR, pipeline, and deployment evidence where mapped | Repository/code/PR/pipeline mutation, approvals, queue/cancel, deployment |
| Work Item write validation | Minimum Work Item create/edit/comment/tag/link/transition permissions required by an individually mapped test; only in isolated project | Bulk edit, delete, process administration, cross-project write, repository/code/PR/pipeline mutation |
| Negative authorization test | No permission for one selected unmapped category | Any temporary elevation to make the test pass |

Permission names differ by host process and organization policy. The operator must record the actual grant and its rationale as a `Fact`; this table is a minimum-boundary requirement, not a claim that a particular permission name exists.

## Cleanup and Reset

Perform cleanup immediately after validation or when a run is abandoned.

1. Stop BASS validation and invalidate/revoke the dedicated identity's temporary grants according to host policy. Do not copy credentials into the run manifest.
2. Save immutable references or approved exports for required evidence, Action Log records, capability-map results, and cleanup decision. Classify unavailable evidence as a `Question`.
3. Use the private manifest and exact run tag to archive or delete only fixture Work Items and Wiki pages. Do not perform project-wide cleanup and do not delete technical evidence owned by another test process.
4. Remove temporary test-only permissions, group membership, and non-BASS host configuration only where the host owner authorizes it. Record actual completion or failure.
5. Re-run a scoped search for `BASS-VALIDATION-<RUN_ID>` and record remaining resources. A remaining resource is a cleanup exception, not an assumed deletion.
6. Mark the run reset-ready only when the manifest records cleanup status, remaining-resource disposition, and the previous run's evidence references. Use a new `<RUN_ID>` for every later run.

## Evidence Required Before Live Validation

The operator must retain links or references to: isolated-project authorization, run manifest, least-privilege grant record, capability-validator outputs, mapped permission fragment, fixture creation results, and cleanup plan. These are target-host prerequisites, not evidence that BASS is `target_ready`.
