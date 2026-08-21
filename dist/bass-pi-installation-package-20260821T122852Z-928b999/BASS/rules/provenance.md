# Provenance Rule

## Classification and Sources

Every provenance-bearing record has one primary D3 classification: `Fact`, `Inference`, `Assumption`, `Proposal`, `Question`, `Conflict`, or `Decision`. Additional claims in a record must be visibly labeled with their classification.

Each claim or record must be traceable to typed sources. D3 source types are `local_file`, `ado_wiki`, `ado_work_item`, `ado_comment`, `ado_repository`, `ado_commit`, `ado_pull_request`, and `ado_pipeline`. Each source reference identifies its type, reference, and precise location; records also identify actor, date, confidence, source version, and related items.

## Evidence Gaps and Conflicts

Do not silently turn missing evidence into an assumption. Record it as a `Question` with an explicit evidence gap, empty sources when none exist, and low confidence.

Record incompatible sources as a `Conflict` that preserves every competing typed source, states the disputed claim, and remains open until the user resolves it. Link a conflict to a `Decision` only after that user decision; BASS must not infer a resolution.

## Lineage and Canonical Logs

When an artifact is edited, retain its path, increment its `vX.Y` version, record `derived_from` and `supersedes`, and add a dated changelog entry with the reason and applicable review or Decision IDs.

Maintain the project canonical logs:

| Log | Required traceability |
| --- | --- |
| Evidence Register | Evidence ID, classification, title, typed sources, confidence, location, related items, and record link. |
| Decision Log | Decision ID, decision, alternatives, supporting evidence, actor, date, related items, and record link. |
| Action Log | Action ID, operation, target, before/after or result, supporting evidence, decision, actor, date, status, and action record link where applicable. |

Every executed ADO operation must be indexed in the Action Log and linked to its evidence and decision. Failed or partial operations remain recorded with their actual status and result.
