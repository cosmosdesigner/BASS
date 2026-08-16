# Target-Host ADO Live Validation Runbook

**Classification:** Proposal. **Confidence:** High for required checks derived from the D12 plan, `BASS/quality/phase-1-test-matrix.md`, and BASS access/provenance rules. This runbook cannot claim a live result; each check is pending until an operator records the actual outcome.

## Completion Rule

`source_ready` is not `target_ready`, but it is a mandatory prerequisite for evaluating target-host evidence. Before target-ready evaluation, run `node BASS/quality/run-source-readiness.mjs` and retain the current `BASS/reports/phase-1-source-readiness.md` report and command output in the run manifest. Its outcome must be `source_ready`, and its `executedHarnesIds` must exactly equal its complete `configuredHarnessIds` set with every configured D5-D11 harness passed.

If the current source-readiness report is `blocked`, a target run is exploratory only. Its results may be recorded for diagnosis, but they cannot be evaluated as target-ready evidence and cannot yield a `target_ready` claim. Resolve the source blockers, generate a new `source_ready` report, and start a new target-ready evaluation before considering live evidence.

Only after this gate passes, mark the target `target_ready` when every applicable check below has a recorded pass using isolated fixture resources, or an approved scope decision explicitly excludes an unavailable host capability. Any failed, blocked, unauthorized, unmapped, or missing-evidence check leaves `target_ready` unclaimed.

Use `BASS/quality/ado-test-fixture.md` and complete `BASS/docs/target-host-ado-provisioning.md` first. Save live evidence in the operator-controlled location and add typed source references to the project Evidence Register. Every executed Work Item operation also requires an Action Log record under `BASS/rules/provenance.md`.

## Per-Check Record

For each check, record: check ID; `Fact`, `Conflict`, or `Question` classification; operator and date; run ID; current source-readiness report reference, generation time, outcome, `configuredHarnessIds`, `executedHarnesIds`, and complete-pass confirmation; exact mapped tool; identity scope; fixture logical key and actual private reference; input; expected and actual result; source type and evidence link; related Evidence/Decision/Action IDs; and cleanup disposition. Never paste credentials, tokens, real URLs, or production references into BASS artifacts.

## Read and Discovery Checks

| ID | Check | Expected evidence |
| --- | --- | --- |
| `TH-READ-01` | Reader retrieves Functional Wiki page using one validated read-only mapping. | Page content and run tag are returned; citation identifies `ado_wiki`; no mutation occurs. |
| `TH-READ-02` | Reader retrieves Feature, User Story, relation, and available history/comment using validated mappings. | Actual data is cited as `ado_work_item` or `ado_comment`; absent categories are explicit gaps. |
| `TH-DISC-01` | Explorer searches the run tag and follows Feature/User Story/blocker relations. | Only isolated fixture results are reported and hierarchy is accurately cited. |
| `TH-DISC-02` | Explorer reads simulated blocker and Conflict Wiki evidence. | The contradictory claim is preserved as `Conflict`; no inferred resolution. |
| `TH-TECH-01` | Explorer reads each mapped repository, commit association, PR, pipeline, and deployment resource. | Every result has the applicable typed source (`ado_repository`, `ado_commit`, `ado_pull_request`, or `ado_pipeline`); unavailable categories stay gaps. |

## Capability and Permission Checks

| ID | Check | Expected evidence |
| --- | --- | --- |
| `TH-CAP-01` | Validate every populated Reader, Explorer discovery, Explorer technical, and Executor write mapping with its named validator. | Exact validator output, map date/version, and deny-first permission fragment. |
| `TH-CAP-02` | Attempt one selected unmapped or unauthorized read. | Host denial/unavailability is recorded; BASS does not invent data or broaden permission. |
| `TH-CAP-03` | Run with host ADO MCP unavailable. | BASS reports unavailable/blocked state and does not retry through an unapproved connector. |
| `TH-CAP-04` | Request repository, code, PR, or pipeline mutation. | Request is rejected before a host mutation; Phase 1 prohibition is cited. |

## Confirmed Work Item Operation Checks

Each row is a separate operation. Before it, BASS must show a field-level preview/diff, cited supporting evidence, relevant Decision context, exact mapped capability, unexpired integrity-valid one-operation plan token, and request explicit confirmation. Executor alone performs the confirmed operation. Do not batch operations or reuse a token.

| ID | Operation | Expected evidence |
| --- | --- | --- |
| `TH-WRITE-01` | Create one supported test Work Item, if the create map is validated. | Preview, explicit confirmation, actual result, and Action Log create entry. |
| `TH-WRITE-02` | Update one mapped harmless field. | Before/after values, confirmation, actual version/result, and Action Log entry. |
| `TH-WRITE-03` | Add or remove one run tag. | Exact tag change and Action Log entry. |
| `TH-WRITE-04` | Add one structured harmless comment. | Comment reference, source link, and Action Log entry. |
| `TH-WRITE-05` | Create or remove one supported relation. | Before/after relation evidence and Action Log entry. |
| `TH-WRITE-06` | Execute one supported state transition. | Before/after state and reason, confirmation, and Action Log entry. |
| `TH-WRITE-07` | Query/import one approved ADO-only change, if mapped. | Exact approved scope, result, and Action Log entry. |

If a process lacks a type, field, relation, or transition, do not substitute a different capability. Mark that row `blocked` or `unmapped`, cite the process limitation, and leave `target_ready` unclaimed unless an explicit scope decision resolves the applicability.

## Conflict and Failure Checks

| ID | Check | Expected evidence |
| --- | --- | --- |
| `TH-FAIL-01` | Submit a prepared plan without explicit confirmation. | No host write occurs; the denied/no-op outcome is recorded. |
| `TH-FAIL-02` | Cause harmless stale state between preview and confirmation. | Version/conflict rejection or actual host response is preserved; no overwrite or invented success. |
| `TH-FAIL-03` | Cause a mapped operation to fail through a safe host condition. | Executor records actual failed or partial outcome in Action Log; no automatic reversal claim. |
| `TH-FAIL-04` | Verify a failed local evidence/log persistence after a remote result, if safely testable. | Actual remote status and local-record failure are both retained for recovery; no claim that remote work was reversed. |

## Full Feature-to-Publication Flow

Run this sequence only with isolated resources and individually confirmed Work Item operations:

1. Read Feature and User Story context from the fixture and create a cited Context Brief.
2. Run discovery and technical-delivery reads; preserve gaps and conflicts.
3. Create or revise a local Feature/User Story artifact, review it, and retain provenance and review outcome.
4. Prepare exactly one Work Item publication plan with evidence, Decision context, field-level preview, capability mapping, and plan token.
5. Obtain explicit confirmation for that plan only, then have Executor perform the one Work Item operation.
6. Save the actual ADO response, Action Log record, Evidence Register links, and any conflict or failure outcome.
7. Repeat only as separately planned and separately confirmed operations require. Do not call repository, PR, or pipeline mutation a publication step.

The flow passes only when all actual records link Feature, User Story, cited evidence, Decision context, confirmation, exact ADO operation result, and Action Log. A simulated source-demo token or a local preview is not live publication evidence.

## Closeout Decision

The validation owner first verifies that the run manifest retains a current `source_ready` report whose `executedHarnesIds` exactly equal the complete `configuredHarnessIds` set and whose configured harnesses all passed. If the report is absent or `blocked`, any configured ID is missing, any ID is unexecuted or failed, or the sets differ, record `Question`, classify the run as exploratory only, and do not evaluate the check ledger for `target_ready`. Otherwise, review the complete check ledger, capability-map outputs, evidence links, Action Log entries, and cleanup record. Record one of:

- `Fact`: all applicable checks passed with retained isolated target-host evidence; `target_ready` may be claimed for that recorded scope.
- `Question`: source readiness is absent or blocked, or one or more checks are unavailable, blocked, unmapped, or lack evidence; `target_ready` remains pending.
- `Conflict`: host behavior or evidence contradicts a required control; preserve both sources and obtain a user decision before rerun or scope change.

Complete cleanup using the provisioning runbook. Retain evidence references and cleanup outcome; remove only exact run-tagged fixture resources.
