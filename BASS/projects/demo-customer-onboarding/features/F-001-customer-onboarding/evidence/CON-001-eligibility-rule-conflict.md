---
id: CON-001
title: Eligibility rule conflict
version: v1.0
created_date: 2026-08-12
updated_date: 2026-08-12
derived_from: null
supersedes: null
provenance:
  classification: Conflict
  sources:
    - type: ado_wiki
      reference: https://dev.azure.com/example-org/demo-customer-onboarding/_wiki/wikis/demo-functional.wiki?pagePath=/Eligibility
      location: "Eligibility section"
      retrieved_date: 2026-08-12
    - type: ado_work_item
      reference: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1001
      location: "Description: eligibility restriction"
      retrieved_date: 2026-08-12
  actor: BASS
  date: 2026-08-12
  confidence: low
  source_version: v1.0
  related_items:
    - F-001
    - REG-EVD-001
conflict:
  disputed_claim: "The ADO Wiki permits every prospective customer with an email address and accepted terms to create an account, while work item 1001 restricts account creation to invited prospective customers."
  status: open
  decision_id: null
---

# Conflict: Eligibility rule conflict

## Disputed Claim

Whether all prospective customers or only invited prospective customers are eligible to create an account in F-001.

## Competing Sources

- The fictional ADO Wiki Eligibility section permits every prospective customer with an email address and accepted terms.
- Fictional work item 1001 restricts account creation to invited prospective customers.

## Impact

F-001 and US-001 cannot state a definitive eligibility rule while the conflict is open.

## Resolution Status

Open. No resolution has been inferred.

## Linked Decision

None. `decision_id` remains null until a user resolves the conflict.

## Related Items

- [F-001: Customer onboarding](../feature.md)
- [Project evidence register](../../../evidence-register.md)

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| 2026-08-12 | v1.0 | Initial conflict record. | Competing eligibility sources require user resolution. | F-001, REG-EVD-001 |
