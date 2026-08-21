# D7 Task 2 Creator Preview Repair Report

## Scope

This report covers D7 Task 2 Creator preview and approved Acceptance Criteria persistence behavior.

## Verified Preview Behavior

- Evidence types are restricted to the D3 allowlist: `local_file`, `ado_wiki`, `ado_work_item`, `ado_comment`, `ado_pull_request`, and `ado_pipeline`.
- An evidence set must contain at least one `Fact` or `Inference` before the Creator renders an artifact or allocates a preview ID, integrity hash, or ADO preview.
- An Inference-only evidence set is eligible for a ready Feature preview, retains `Inference` in YAML provenance and the cited-evidence classification, and includes a local-only Feature ADO preview.
- Question-only and assumption-only evidence sets return `writeStatus: blocked` with an empty preview ID and no integrity hash or ADO preview.
- Canonical proposal IDs are allocated by scanning `BASS/projects/<project>/proposals/PRO-*/proposal.md`; fixture records ending at `PRO-014` result in `PRO-015`.
- Functional proposal previews include `## Next Step`.
- Feature and User Story ADO previews remain local-only. Proposal ADO previews remain limited to explicit `promoteTo: feature` or `promoteTo: user_story` requests.

## Test Evidence

Command run:

```text
node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs
```

Result:

```text
bass-creator-preview behavioral contract passed
```

The suite compiles the TypeScript preview source and asserts parity against the shipped JavaScript for every exercised invocation.

## Boundaries

- No host `.opencode/` installation was performed.
- The Creator preview tool contains no MCP or ADO write invocation; it produces local-only preview data.

## Acceptance-Criteria Persistence Cycle

- An approved, intact Acceptance Criteria preview updates only the target Feature or User Story `## Acceptance Criteria` or `## Given/When/Then Acceptance Criteria` section, plus YAML lineage/version/date fields and one valid Changelog table row.
- The update does not create an Acceptance Criteria record or directory. It writes traceable rows to the canonical Evidence Register, Decision Log, and Action Log.
- Acceptance Criteria persistence uses the same explicit approval, issued-preview identity, full payload hash, canonical containment, and single-use preview checks as other local artifacts.
- Its target artifact and all three canonical logs are staged and committed atomically; target, Evidence Register, Decision Log, and Action Log commit-stage failures restore original bytes and remove transaction remnants.

## D7 Task 2 Test Evidence

RED command:

```text
node BASS/integration/opencode/plugins/bass-persist-approved-artifact.behavior-test.mjs
```

RED result:

```text
AssertionError: expected approved Acceptance Criteria persistence to be persisted; received blocked.
```

GREEN commands:

```text
node BASS/integration/opencode/plugins/bass-persist-approved-artifact.behavior-test.mjs
node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs
```

GREEN result:

```text
bass-persist-approved-artifact behavioral contract passed
bass-creator-preview behavioral contract passed
```

- The persistence behavior suite covers an approved canonical `## Acceptance Criteria` table replacement; `v1.0` to `v1.1` lineage; preserved D3 provenance metadata; valid Changelog table append; no standalone record; canonical log rows; unapproved, tampered, and stale replay blocking; and target/log commit-stage rollback for shipped JavaScript and TypeScript emission.
