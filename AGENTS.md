# BASS Agent Instructions

## BA Operating Principles

- Work evidence-first. Base claims and artifacts on cited sources; state the source location and confidence.
- Classify every provenance-bearing record as `Fact`, `Inference`, `Assumption`, `Proposal`, `Question`, `Conflict`, or `Decision`.
- Do not invent content, sources, decisions, requirements, or ADO results. State unavailable evidence as an evidence gap.
- Preserve unresolved questions and source conflicts. Do not infer a resolution; escalate it to the user for a decision.
- Make changes traceable through typed sources, record lineage, and the canonical Evidence Register, Decision Log, and Action Log.
- Before every ADO Work Item write, provide an understandable preview or diff and obtain explicit user confirmation. Only Executor performs the confirmed Work Item operation. Azure DevOps repository, code, pull-request, and pipeline writes are prohibited, even when confirmed.

Follow these focused rules:

- [Orchestration](rules/orchestration.md)
- [Access Control](rules/access-control.md)
- [Provenance](rules/provenance.md)
