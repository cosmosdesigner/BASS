# BASS D3 Provenance, Evidence, and Decisions Design

## Status

Approved design for D3. This specification defines the provenance schema, source-reference model, evidence gaps, conflicts, version lineage, canonical logs, reusable templates, and fictional examples needed to keep BASS claims and ADO actions traceable.

## Provenance Model

Every provenance-bearing record uses Markdown with YAML front matter containing a shared provenance block. A record has one primary classification. A document may also contain multiple additional claims in its body, provided each additional claim is visibly labeled with its classification.

Allowed primary classifications are:

- `Fact`
- `Inference`
- `Assumption`
- `Proposal`
- `Question`
- `Conflict`
- `Decision`

The shared provenance block contains the following fields:

```yaml
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
```

`confidence` is required and must be one of `high`, `medium`, or `low`.

## Source References

`sources` is a YAML list of typed source objects. Every source object contains `type`, `reference`, and `location`; it may also contain `retrieved_date`.

Allowed source types are:

| Type | Use |
| --- | --- |
| `local_file` | A BASS workspace file or another local repository file. |
| `ado_wiki` | An Azure DevOps Wiki page. |
| `ado_work_item` | An Azure DevOps Work Item. |
| `ado_comment` | An Azure DevOps Work Item or pull-request comment. |
| `ado_pull_request` | An Azure DevOps pull request. |
| `ado_pipeline` | An Azure DevOps pipeline or deployment record. |
| `ado_repository` | An Azure DevOps repository or file search result. |
| `ado_commit` | An Azure DevOps commit record. |

The `reference` value is a relative local path or an ADO URL/identifier. `location` identifies a page section, field, line range, comment identifier, pipeline stage, or equivalent precise source location.

## Evidence Gaps and Conflicts

Missing evidence is never silently converted into an assumption. It is represented by a `Question` record with this minimum provenance:

```yaml
provenance:
  classification: Question
  sources: []
  actor: BASS
  date: YYYY-MM-DD
  confidence: low
  source_version: v1.0
  related_items:
    - F-001
evidence_gap: "State the evidence required and why it is missing."
```

A source conflict is represented by a `Conflict` record. It preserves all competing typed sources, identifies the disputed claim, and uses `status: open` or `status: resolved`. A conflict links to a Decision record only after a user resolves it. BASS must not infer a resolution.

```yaml
provenance:
  classification: Conflict
  sources:
    - type: ado_wiki
      reference: https://dev.azure.com/example-org/project/_wiki/wikis/functional.wiki/page
      location: "Eligibility section"
    - type: ado_work_item
      reference: https://dev.azure.com/example-org/project/_workitems/edit/1001
      location: "Description"
  actor: BASS
  date: YYYY-MM-DD
  confidence: low
  source_version: v1.0
  related_items:
    - F-001
conflict:
  disputed_claim: "State the incompatible claims."
  status: open
  decision_id: null
```

## Lineage and Edited Versions

An edited artifact remains at its current path. Its `version` increments using `vX.Y`; its YAML front matter records `derived_from` and `supersedes`; and its body includes a dated changelog entry. Each changelog entry states the reason for the change and links to applicable review or Decision IDs.

```yaml
version: v1.1
derived_from: F-001@v1.0
supersedes: F-001@v1.0
```

```markdown
## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | v1.1 | Describe the edit. | Describe why it was made. | DEC-001 |
```

## Canonical Project Logs

Each project-level log is the canonical index of its scoped records and uses YAML front matter plus a Markdown table.

### Evidence Register

The Evidence Register contains: ID, classification, title, sources, confidence, location, related items, and record link.

### Decision Log

The Decision Log contains: ID, decision, alternatives, supporting evidence, actor, date, related items, and record link.

### ADO Action Log

The ADO Action Log contains: ID, operation, target, before/after or result, supporting evidence, decision, actor, date, status, and record link where an action record exists.

Every executed ADO operation must be indexed in the ADO Action Log and linked to its evidence and decision. A failed or partial operation remains recorded with its actual status and result.

## Templates and Demonstration Coverage

D3 updates all provenance-bearing templates to use the shared provenance block and lineage fields. It adds these canonical templates to `BASS/templates/`:

- `question-template.md`
- `conflict-template.md`

The fictional `demo-customer-onboarding` project demonstrates all seven classifications and all six allowed source types. It includes an evidence-gap Question with empty sources and low confidence, and an open Conflict with separate competing sources and no Decision link. The demonstration does not perform a live ADO operation.

## Acceptance Criteria

Every important claim and ADO change can be traced through a classification, typed source references or an explicit evidence gap, actor, date, confidence, source version, related items, record lineage, and a canonical project log. Facts, interpretations, assumptions, proposals, unresolved questions, conflicts, and decisions remain distinguishable.
