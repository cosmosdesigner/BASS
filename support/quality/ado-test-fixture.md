# Isolated ADO Target-Host Test Fixture

**Classification:** Proposal. **Confidence:** High for the required fixture shape; every live ADO result is an evidence gap until recorded by the operator.

## Safety Contract

Use this fixture only in an ADO project created or explicitly designated for isolated BASS validation. Do not substitute a production project, a project containing production Work Items, or a shared project without written test-owner approval. This file contains no usable URL, organization, project name, account, token, secret, or credential.

All names below are declarative placeholders. The operator replaces `<RUN_ID>` once per run with a locally recorded, collision-resistant value and keeps the resulting identifiers in the run evidence. BASS files must retain placeholders only.

| Fixture value | Declarative value | Purpose |
| --- | --- | --- |
| isolated project | `<ISOLATED_PROJECT>` | Dedicated non-production ADO project |
| run tag | `BASS-VALIDATION-<RUN_ID>` | Finds only this run's resources |
| test identity | `<BASS_VALIDATION_IDENTITY>` | Least-privilege identity used for BASS validation |
| evidence location | `<OPERATOR_CONTROLLED_EVIDENCE_LOCATION>` | Access-controlled operator storage; reference only, never credentials |

## Source-Readiness Gate

Before evaluating any target-host evidence for readiness, run `node BASS/support/quality/run-source-readiness.mjs` and retain the current `BASS/support/reports/phase-1-source-readiness.md` report with its command output in the private run manifest. The report must state `source_ready` and contain `executedHarnesIds` equal to the exact complete `configuredHarnessIds` set. A prior report, an incomplete run, an omitted or failed configured D5-D11 harness, an environment-based skip, or a manually edited report is not sufficient.

When the current report states `blocked`, the operator may perform isolated target-host checks only as exploratory work. Label every resulting record `Question` or `Fact` as appropriate, retain it for diagnosis, and do not evaluate it as target-readiness evidence or claim `target_ready`. Re-run source readiness after its blockers are resolved before beginning a target-ready evaluation.

## Work Item Fixture

Create only the Work Items supported by the target process template. Record actual IDs as operator evidence; do not add them to this file.

| Logical key | Type | Title | Required fields and tags | Relations | Validation use |
| --- | --- | --- | --- | --- | --- |
| `FTR-<RUN_ID>` | Feature | `[BASS TEST] Feature <RUN_ID>` | Description identifies this as isolated test data; tag `BASS-VALIDATION-<RUN_ID>` | Parent of `US-<RUN_ID>` | Feature context and end-to-end flow |
| `US-<RUN_ID>` | User Story | `[BASS TEST] User Story <RUN_ID>` | Acceptance criteria are harmless and testable; same run tag | Child of Feature; related to `BLK-<RUN_ID>` | Read, hierarchy, create/update/relation validation |
| `TSK-<RUN_ID>` | Task, if supported | `[BASS TEST] Task <RUN_ID>` | Same run tag | Child of User Story | Child hierarchy and state transition validation |
| `BLK-<RUN_ID>` | Bug or Task, whichever the process supports | `[BASS TEST] Blocker <RUN_ID>` | Description says it is a simulated blocker; tag `BASS-VALIDATION-<RUN_ID>` | Related to User Story using the process-supported relation | Conflict/blocker discovery and traceability |

Use a benign test field value for every write, for example a title suffix or an explicitly mapped custom text field containing `[BASS TEST]`. Do not use customer, employee, incident, release, or production data. Before any write, capture the mapped field's actual before value in the preview and Action Log.

## Wiki Fixture

Create these pages only in an isolated test Wiki. Their content is harmless fixture text and must include the run tag.

| Logical page | Required content | Validation use |
| --- | --- | --- |
| `BASS Validation/<RUN_ID>/Functional` | Feature and User Story logical keys, one stated acceptance criterion, and the run tag | Reader Wiki read and provenance citation |
| `BASS Validation/<RUN_ID>/Technical` | Logical repository, PR, commit, pipeline, and deployment evidence keys below; no real endpoint or secret | Explorer technical-context read |
| `BASS Validation/<RUN_ID>/Conflict` | A deliberately stale or contradictory harmless statement, labeled simulated conflict | Conflict preservation without invented resolution |

## Technical Evidence Fixture

Use existing non-production resources only. Phase 1 prohibits BASS from mutating repositories, code, pull requests, or pipelines. If a requested resource cannot be safely supplied as read-only test evidence, mark its check `blocked` or `unmapped`; do not create it through BASS.

| Logical key | Required harmless evidence | Required association | Validation use |
| --- | --- | --- | --- |
| `REPO-<RUN_ID>` | Isolated repository or pre-existing test repository containing a harmless text fixture | Referenced by Technical Wiki page | Repository/file read |
| `COMMIT-<RUN_ID>` | Existing benign commit whose message includes the run tag | Associated with test User Story when host supports read-only association | Commit and Work Item association read |
| `PR-<RUN_ID>` | Existing completed or abandoned test PR with no production content | References run tag and test User Story where host supports it | PR details/comments/links read |
| `PIPE-<RUN_ID>` | Existing completed test pipeline run | Run tag appears in available read-only metadata | Pipeline status read |
| `DEPLOY-<RUN_ID>` | Existing non-production deployment record, if the host exposes one | Links or correlates to `PIPE-<RUN_ID>` | Deployment status read |

Do not queue, cancel, rerun, edit, merge, approve, comment on, deploy, or delete these resources through BASS. A missing repository, PR, pipeline, or deployment mapping is a documented capability gap, not a reason to grant broader permissions.

## Capability Map Worksheet

Populate only actual target-host mappings in operator-controlled configuration using the cited template and validator. Do not replace an unmapped category with a guessed tool name. Every map remains `verified...: false` until the isolated live check succeeds and evidence is recorded.

| Capability family | Template and validator | Allowed resource boundary | Fixture checks |
| --- | --- | --- | --- |
| Reader read | `templates/ado-read-capabilities-template.md`; `bass_validate_ado_read_capabilities` | Read-only Wiki, Work Item, relation, history/comment | Functional Wiki, Feature/User Story, relation, history/comment |
| Explorer discovery | `templates/ado-discovery-capabilities-template.md`; `bass_validate_ado_discovery_capabilities` | Read-only search, hierarchy, comments/history, Wiki search | Run-tag search, hierarchy, simulated blocker/conflict |
| Explorer technical delivery | `templates/ado-technical-delivery-capabilities-template.md`; `bass_validate_ado_technical_delivery_capabilities` | Read-only repository, PR, commit association, pipeline/deployment | `REPO`, `COMMIT`, `PR`, `PIPE`, `DEPLOY` logical keys |
| Executor Work Item write | `templates/ado-write-capabilities-template.md`; `bass_validate_ado_write_capabilities` | One confirmed Work Item operation only | create, one field update, tag, comment, relation, transition, import/query when mapped |

For every family, preserve blanket `"ado_*": deny` before exact verified tool allows. Read maps must not include a mutating tool. Write maps must declare only `resourceType: work_item`; repository, code, pull-request, and pipeline mutation are always prohibited.

## Required Negative Cases

| Case | Setup | Expected result |
| --- | --- | --- |
| Missing MCP | Run a read with the host ADO MCP unavailable | `blocked` or unavailable result; no invented ADO data and no retry with another connector |
| Unauthorized capability | Use the least-privilege identity against an intentionally unmapped or disallowed category | Denied result recorded as an evidence gap; no permission escalation during the run |
| Missing confirmation | Prepare one valid Work Item plan but do not provide explicit confirmation | No ADO write and no Action Log success claim |
| Stale or conflicting state | Change a harmless mapped field outside BASS after preview, or use the Conflict Wiki page | Conflict/version rejection or preserved Conflict; no silent overwrite or inferred resolution |
| Unsupported technical mutation | Request a repository, PR, or pipeline change | Rejected before any call as Phase 1 prohibited |

## Reset Identifiers and Cleanup Inputs

The operator maintains a private run manifest containing: source-readiness command output, current source-readiness report reference, source-readiness outcome and generation time, exact `configuredHarnessIds` and `executedHarnesIds` sets from that output, confirmation that every configured D5-D11 harness passed, isolated project reference, run tag, actual Work Item IDs, Wiki page paths, technical evidence references, capability-map version/date, evidence links, Action Log references, and cleanup outcome. The manifest must contain no credentials and must not be committed to BASS.

Cleanup uses the run tag and manifest, never broad project-wide search-and-delete. Retain enough evidence to support the validation record before deleting or archiving fixture resources. See `BASS/docs/target-host-ado-provisioning.md` for the ordered cleanup and reset process.
