---
id: EVD-001
title: ""
version: v1.0
created_date: YYYY-MM-DD
updated_date: YYYY-MM-DD
derived_from: null
supersedes: null
provenance:
  classification: Fact
  sources:
    - type: local_file
      reference: path/to/source.md
      location: "Lines 1-10"
      retrieved_date: YYYY-MM-DD
  actor: BASS
  date: YYYY-MM-DD
  confidence: high
  source_version: v1.0
  related_items:
    - F-001
---

# Evidence: <title>

## Summary

## Source

Use D3 `provenance` front matter for every Evidence record. For aggregated
technical evidence, preserve each source in `provenance.sources` with typed
`type`, `reference`, `location`, and `retrieved_date` values; retain actor,
date, confidence, source version, and related items at record level. Keep
approval tokens and hashes in a separate Approval Context section.

For D10 technical delivery evidence, source types are constrained as follows:
repository or file evidence uses `ado_repository`; pull-request evidence uses
`ado_pull_request`; commit evidence uses `ado_commit`; direct Work Item evidence
uses `ado_work_item`; pipeline and deployment evidence use `ado_pipeline`. Reject
unknown technical categories rather than writing an unrecognized source type.

## Findings

## Impact

## Related Items

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | v1.0 | Initial record. | Initial creation. | F-001 |
