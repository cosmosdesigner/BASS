---
id: US-001
title: Create account
version: v1.0
created_date: 2026-08-12
updated_date: 2026-08-12
parent_feature_id: F-001
ado_work_item_id: 1002
ado_work_item_url: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1002
derived_from: null
supersedes: null
provenance:
  classification: Fact
  sources:
    - type: ado_comment
      reference: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1002#comment-2001
      location: "Comment 2001"
      retrieved_date: 2026-08-12
  actor: BASS
  date: 2026-08-12
  confidence: high
  source_version: v1.0
  related_items:
    - F-001
    - EVD-001
    - DEC-001
---

# User Story: Create account

## User Story

As a prospective customer, I want to create an account so that I can begin the fictional onboarding journey.

## Acceptance Criteria

- The customer can provide an email address.
- The customer can accept the demonstration terms.
- The experience confirms the account creation submission.

## Dependencies and Constraints

This User Story belongs to [F-001: Customer onboarding](../../feature.md) and uses fictional demonstration data only.

## ADO Link

- Work item 1002: `https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1002`

## Related Evidence and Decisions

- Parent Feature: [F-001: Customer onboarding](../../feature.md)
- [EVD-001: Illustrative onboarding inference](../../evidence/EVD-001-customer-research.md)
- [DEC-001: Account creation scope](../../decisions/DEC-001-account-creation-scope.md)

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| 2026-08-12 | v1.0 | Created the account creation user story. | Define the initial onboarding step within the feature scope. | F-001, EVD-001, DEC-001 |
