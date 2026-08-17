# Phase 1 Quality Matrix

**Classification:** Fact. **Confidence:** High for local source paths; target-host entries are pending evidence.

| Scope | Portable source evidence | Target-host validation requirement | Owner | Readiness tier |
| --- | --- | --- | --- | --- |
| P0 project initialization and status | P0 initialization, status, routing, brainstorm, and challenge behavior suite | Confirm initialization and local health behavior in an isolated target host | BASS | source_ready |
| Reader agent | D5 context, capability, and Reader boundary harnesses | Verified Wiki and Work Item read mappings with least-privilege permissions | Reader | source_ready |
| Explorer agent | D6 discovery and D10 technical-delivery harnesses | Cited isolated-target read outcomes only | Explorer | source_ready |
| Creator agent | D7 preview and approved-persistence harnesses | Confirm preview remains local until a separately confirmed Executor operation | Creator | source_ready |
| Reviewer agent | D8 review and fixture harnesses | Validate review evidence and approval gates in an isolated target host | Reviewer | source_ready |
| Editor agent | D8 improvement and persistence harnesses | Validate evidence-only edits and re-review gates | Editor | source_ready |
| Executor agent | D9 executor, recovery, journal, capability, and wrapper-load harnesses | Confirm mapped Work Item operations after explicit confirmation; record outcomes and conflicts | Executor | source_ready |
| BASS orchestrator | D11 behavior, fixture, and wrapper-load harnesses | Validate routing, authorization, and specialist invocation in a target-host OpenCode session | BASS | source_ready |
| `/bass load-context`, `/bass understand` | D5 context brief and Reader boundary harnesses | Live Wiki and Work Item mapping reads | Reader | source_ready |
| `/bass discover` | D6 discovery behavior harness | Live discovery mapping reads | Explorer | source_ready |
| `/bass create-feature`, `/bass create-us`, `/bass create-ac`, `/bass create-proposal` | D7 preview and persistence harnesses | Confirm local preview and approval boundaries | Creator | source_ready |
| `/bass review`, `/bass improve` | D8 review, improvement, persistence, fixture, and regression harnesses | Confirm review and waiver behavior | Reviewer / Editor | source_ready |
| `/bass create-ado`, `/bass sync-ado`, `/bass update-ado`, `/bass link-items`, `/bass transition` | D9 executor, recovery, journal, capability, and wrapper-load harnesses | Confirm each supported Work Item operation individually | Executor | source_ready |
| `/bass technical-delivery` | D10 behavior and fixture harnesses | Read repository, commit, PR, pipeline, and deployment evidence without technical mutation | Explorer | source_ready |
| `/bass next`, `/bass diagnose` | D11 behavior and fixture harnesses | Validate advisory-only operation | BASS | source_ready |
| Canonical Understand, Discover, Create, Review, Improve workflows | D5-D8 harnesses and acceptance reports | Target-host inputs and approval evidence | BASS and specialist owner | source_ready |
| Canonical Sync/Execute ADO workflow | D9 executor and D11 orchestration harnesses | Confirmed isolated Work Item operations and Action Log evidence | BASS / Executor | source_ready |
| Canonical technical-delivery workflow | D10 and D11 harnesses | Isolated target technical read evidence | BASS / Explorer | source_ready |
| ADO read, discovery, and technical-delivery capability mappings | D5, D6, D9, and D10 validation harnesses | Exact verified least-privilege target-host tool mappings | Reader / Explorer | source_ready |
| ADO Work Item write capability mappings | D9 executor and capability harnesses | Confirmed create, field, tag, comment, relation, transition, and import evidence | Executor | source_ready |
| D5 fixtures | Context, capability, and Reader contract suites | Live read validation evidence | D5 owner | source_ready |
| D6 fixtures | Discovery behavior suite | Live discovery validation evidence | D6 owner | source_ready |
| D7 fixtures | Creator preview and persistence suites | Operator confirmation of local-only preview boundary | D7 owner | source_ready |
| D8 fixtures | Fixture snapshots and P1/P2 regressions | Isolated review and approval evidence | D8 owner | source_ready |
| D9 fixtures | Executor behavior, recovery, journal, and wrapper-load suites | Isolated confirmed Work Item operation and failure evidence | D9 owner | source_ready |
| D10 fixtures | Technical-delivery behavior and fixture harness | Isolated target technical evidence | D10 owner | source_ready |
| D11 fixtures | Orchestration behavior, fixture, and wrapper-load suites | Target-host routing and authorization evidence | D11 owner | source_ready |
| D1 operating contract | `BASS/AGENTS.md`, rules, and acceptance evidence | Confirm operator adoption and target-host policy enforcement | BASS owner | source_ready |
| D2 workspace context model | Project context, canonical registers, and template paths | Confirm isolated-project workspace setup | BASS owner | source_ready |
| D3 provenance and decisions | Evidence Register, Decision Log, Action Log, templates, and prior reports | Confirm target-host evidence links and operation records | BASS owner | source_ready |
| D4 OpenCode foundation | `BASS/integration/opencode/` agents, commands, and plugins | Confirm target-host discovery and installation compatibility | BASS owner | source_ready |
| D5-D11 acceptance reports | `BASS/reports/task-*-d*-acceptance-verification.md` and D6 Task 1 report | Retain target-host validation evidence alongside each capability | D5-D11 owners | source_ready |
| Documentation and demos | D12 Task 3 paths checked by `run-source-readiness.mjs` | Run source and isolated target-host demos with recorded evidence | D12 owner | source_ready |
| Full Feature-to-publication workflow | Source harnesses and source demo only | Isolated ADO Feature, User Story, review, confirmed Work Item operations, repository/PR/pipeline/deployment evidence | D12 owner | target_ready |

`source_ready` requires every configured portable harness, report, documentation, and demo-path check to pass. `target_ready` is always pending until recorded isolated target-host ADO evidence exists; this matrix and runner do not infer it.

## Target-Host Check Catalogue

Each ID below represents the target-host validation requirement in the corresponding matrix row, in row order. `run-source-readiness.mjs` emits every ID with a `pending` or `skipped` status, reason, and evidence requirement.

`reader-agent`, `explorer-agent`, `creator-agent`, `reviewer-agent`, `editor-agent`, `executor-agent`, `bass-orchestrator`, `reader-commands`, `discover-command`, `creator-commands`, `review-improve-commands`, `executor-commands`, `technical-delivery-command`, `advisory-commands`, `understand-through-improve`, `sync-execute-workflow`, `technical-delivery-workflow`, `read-discovery-capabilities`, `write-capabilities`, `d5-fixtures`, `d6-fixtures`, `d7-fixtures`, `d8-fixtures`, `d9-fixtures`, `d10-fixtures`, `d11-fixtures`, `d1-operating-contract`, `d2-workspace-context`, `d3-provenance`, `d4-opencode-foundation`, `d5-d11-reports`, `docs-and-demos`, `feature-to-publication`.
