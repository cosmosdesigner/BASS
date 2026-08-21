---
id: F-001
title: "Resolve enrolment eligibility"
version: v1.0
created_date: 2026-08-14
updated_date: 2026-08-14
derived_from: null
supersedes: null
ado_work_item_id: null
ado_work_item_url: null
provenance:
  classification: Proposal
  sources:
    - type: local_file
      reference: project-context/functional/enrolment.md
      location: "Eligibility"
      retrieved_date: 2026-08-14
    - type: ado_wiki
      reference: ADO Wiki/Enrolment
      location: "Open questions"
      retrieved_date: 2026-08-14
    - type: ado_work_item
      reference: ADO WI 421
      location: "Acceptance notes"
      retrieved_date: 2026-08-14
  actor: BASS
  date: 2026-08-14
  confidence: high
  source_version: v1.0
---

# Feature: Resolve enrolment eligibility

## Goal

Eligibility must be evaluated before enrolment is approved.

## Scope

- Eligibility must be evaluated before enrolment is approved. [source: project-context/functional/enrolment.md; type: local_file; location: Eligibility; classification: Fact; confidence: medium]
- Which eligibility policy is authoritative? [source: ADO Wiki/Enrolment; type: ado_wiki; location: Open questions; classification: Question; confidence: low]
- The wiki permits manual approval while the work item requires automatic approval. [source: ADO WI 421; type: ado_work_item; location: Acceptance notes; classification: Conflict; confidence: medium]

## Out of Scope

- None identified.

## Business Rules

- None identified.

## Dependencies

- None identified.

## Risks

- None identified.

## Assumptions

- None.

## Questions

- Which eligibility policy is authoritative?

## Cited Evidence

| Classification | Source type | Source | Location | Confidence | Claim or relevance |
| --- | --- | --- | --- | --- | --- |
| Fact | local_file | project-context/functional/enrolment.md | Eligibility | medium | Eligibility must be evaluated before enrolment is approved. |
| Question | ado_wiki | ADO Wiki/Enrolment | Open questions | low | Which eligibility policy is authoritative? |
| Conflict | ado_work_item | ADO WI 421 | Acceptance notes | medium | The wiki permits manual approval while the work item requires automatic approval. |

## Given/When/Then Acceptance Criteria

### AC-001: Resolve enrolment eligibility

- Given Eligibility must be evaluated before enrolment is approved.
- When the user performs the proposed action
- Then the observable outcome meets the cited need
- Evidence or assumption: Fact [source: project-context/functional/enrolment.md; type: local_file; location: Eligibility; confidence: medium]

## ADO Link

- Local preview only; no ADO operation occurred.

## Related Evidence and Decisions

- Eligibility must be evaluated before enrolment is approved. [source: project-context/functional/enrolment.md; type: local_file; location: Eligibility; classification: Fact; confidence: medium]
- Which eligibility policy is authoritative? [source: ADO Wiki/Enrolment; type: ado_wiki; location: Open questions; classification: Question; confidence: low]
- The wiki permits manual approval while the work item requires automatic approval. [source: ADO WI 421; type: ado_work_item; location: Acceptance notes; classification: Conflict; confidence: medium]

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| 2026-08-14 | v1.0 | Initial preview. | Awaiting explicit approval. | project-context/functional/enrolment.md, ADO Wiki/Enrolment, ADO WI 421 |
