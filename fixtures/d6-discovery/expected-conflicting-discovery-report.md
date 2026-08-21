# Discovery Report: F-X-001

Status: warning

Coverage: Searched conflicting local records; 2 mapped ADO category gap(s) remain unexecuted. [source: local discovery; location: complete local search and unexecuted mapped ADO categories; classification: Fact; confidence: high; directness: direct]

## Evidence Map

### Nodes

- F-X-001 (matched) [source: records/F-X-001; location: feature.md; classification: Fact; confidence: high; directness: direct; relationship: matched]

- CON-X-001 (local artifact) [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]

### Edges

- F-X-001 -> CON-X-001 (local artifact) [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]

## Found Information

- F-X-001 was found locally [source: records/F-X-001; location: feature.md; classification: Fact; confidence: high; directness: direct; relationship: matched]

## Inferences

## Gaps

- Required Work Item Search and Filtering is not executed by this local-only tool [source: local configuration; location: selected records; classification: Fact; confidence: high; directness: direct].

- Required Hierarchy and Relations is not executed by this local-only tool [source: local configuration; location: selected records; classification: Fact; confidence: high; directness: direct].

## Conflicts

- CON-X-001 status: open; competing sources: local_file: evidence/local-dependency-assessment (conflict.md); ado_work_item: related/F-X-002 (Related Feature F-X-002) [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]

## Risks

- The disputed dependency is isolated and cannot support a dependency conclusion [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]

- Risk: Work Item Search and Filtering remains unexecuted and may leave discovery incomplete [source: local configuration; location: selected records; classification: Fact; confidence: high; directness: direct].

- Risk: Hierarchy and Relations remains unexecuted and may leave discovery incomplete [source: local configuration; location: selected records; classification: Fact; confidence: high; directness: direct].

## Questions

- What decision resolves CON-X-001? [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]

- Question: What evidence from Work Item Search and Filtering is needed to complete discovery? [source: none; location: Work Item Search and Filtering; classification: Question; confidence: low; directness: direct; evidence_gap: local-only tool did not execute the required category].

- Question: What evidence from Hierarchy and Relations is needed to complete discovery? [source: none; location: Hierarchy and Relations; classification: Question; confidence: low; directness: direct; evidence_gap: local-only tool did not execute the required category].

## Sources

- BASS/projects/conflicting/features/F-X-001-dependency/feature.md [source: records/F-X-001; location: feature.md; classification: Fact; confidence: high; directness: direct; relationship: matched]

- BASS/projects/conflicting/features/F-X-001-dependency/conflict.md [source: evidence/local-dependency-assessment; location: conflict.md; classification: Conflict; confidence: medium; directness: one-hop; relationship: local artifact]
