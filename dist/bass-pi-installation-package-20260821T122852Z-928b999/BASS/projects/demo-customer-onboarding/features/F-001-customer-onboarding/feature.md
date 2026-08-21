---
id: F-001
title: Customer onboarding
version: v1.1
created_date: 2026-08-12
updated_date: 2026-08-12
ado_work_item_id: 1001
ado_work_item_url: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1001
derived_from: F-001@v1.0
supersedes: F-001@v1.0
provenance:
  classification: Inference
  sources:
    - type: ado_work_item
      reference: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1001
      location: "Description and acceptance criteria"
      retrieved_date: 2026-08-12
  actor: BASS
  date: 2026-08-12
  confidence: medium
  source_version: v1.1
  related_items:
    - US-001
    - EVD-001
    - DEC-001
---

# Feature: Customer onboarding

## Objective

Provide a fictional customer onboarding capability that begins with account creation.

## Scope

This feature contains [US-001: Create account](user-stories/US-001-create-account/user-story.md).

## Requirements

The onboarding experience must let a prospective customer submit account details.

## Acceptance Criteria

- A prospective customer can provide an email address and accept terms.
- The account creation step confirms successful submission.

## Dependencies and Constraints

This is fictional demonstration data and has no live service dependency.

## ADO Link

- Work item 1001: `https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1001`

## Related Evidence and Decisions

- [EVD-001: Illustrative onboarding inference](evidence/EVD-001-customer-research.md)
- [DEC-001: Account creation scope](decisions/DEC-001-account-creation-scope.md)
- [OUT-001: Feature summary](outputs/OUT-001-feature-summary.md)
- [Q-001: Identity verification question](evidence/Q-001-identity-verification-question.md)
- [CON-001: Eligibility rule conflict](evidence/CON-001-eligibility-rule-conflict.md)

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| 2026-08-12 | v1.1 | Added D3 provenance, lineage, and linked evidence-gap records. | Scope treatment is documented by the account-creation decision. | DEC-001 |
