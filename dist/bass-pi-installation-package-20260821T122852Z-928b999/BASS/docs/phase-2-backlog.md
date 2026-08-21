# Phase 2 Backlog

**Classification:** Proposal. **Confidence:** Medium; prioritization follows the D12 design and known Phase 1 boundaries.

| Rank | Item | Value | Risk | Dependency |
| --- | --- | --- | --- | --- |
| 1 | Complete isolated target-host validation and retain evidence | High | High | Current `source_ready`, provisioned host, verified mappings |
| 2 | Harden Work Item execution from target-host findings | High | High | Rank 1 evidence and user Decisions |
| 3 | Expand technical-delivery coverage and evidence links | High | Medium | Verified read-only repository/PR/pipeline/deployment mappings |
| 4 | Add advanced memory and cross-session context controls | Medium | High | Provenance, retention, privacy, and conflict design |
| 5 | Add operational dashboards and readiness reporting | Medium | Medium | Stable source and target evidence schemas |
| 6 | Evaluate autonomous automation | Medium | High | Proven confirmation, access, audit, and recovery controls |
| 7 | Add non-ADO connectors | Medium | High | Connector-specific least privilege and provenance model |

Ranking favors closing the live-validation gap before expanding scope. No item authorizes Phase 1-prohibited repository, code, PR, pipeline, deployment, or release mutation without an approved future design.
