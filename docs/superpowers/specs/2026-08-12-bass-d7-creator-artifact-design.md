# BASS D7 Creator and BA Artifact Design

## Status

Approved design for D7. This specification defines approval-first BA artifact creation, cited previews, local-write boundaries, testable acceptance criteria, and ADO Work Item previews.

## Preview-First Creation

The portable integration bundle provides:

- `/bass create-feature`
- `/bass create-us`
- `/bass create-ac`
- `/bass create-proposal`

Each command uses a deterministic Creator preview tool fed by D5 Context Brief and D6 Discovery Report evidence. The preview visibly distinguishes Facts, Inferences, Assumptions, Proposals, Questions, and Conflicts.

Creator returns a chat preview first. BASS writes a local artifact only after explicit user approval of that specific preview. No D7 command writes ADO resources.

When context is insufficient, conflicted, or only assumption-based, Creator returns a partial draft with explicit gaps, assumptions, and questions. That preview is write-blocked and has no ADO publication preview until the user supplies evidence or a decision.

## Artifact Types and Templates

D7 adds or updates canonical templates for:

- Feature.
- User Story.
- Acceptance criteria.
- Functional proposal.

Feature and User Story records include goal, scope, out of scope, business rules, dependencies, risks, assumptions, questions, cited evidence, and Given/When/Then acceptance criteria.

`/bass create-ac` proposes a scoped update to an existing Feature or User Story draft. It does not create a standalone acceptance-criteria record.

Functional proposals use a dedicated `PRO-001-<lowercase-kebab-name>/proposal.md` record. The proposal includes problem or opportunity, proposed change, expected value, scope, out of scope, rules, dependencies, risks, assumptions, questions, cited evidence, and next step.

## ADO Work Item Preview

Every publication-capable Feature and User Story preview includes a field-level local-only ADO Work Item preview:

- Work Item type.
- Title.
- Description.
- Acceptance criteria.
- Parent or link target.
- Tags.
- Area.
- Iteration.
- Priority.
- Effort.
- Unavailable mappings.

The preview does not create, update, or otherwise mutate ADO. A functional proposal receives an ADO preview only when the user explicitly requests promotion to a Feature or User Story.

## Local Approval and Persistence

After explicit approval, BASS creates the artifact under the selected project using D2 IDs, naming, YAML provenance, lineage, and project registers. It links the new artifact to cited evidence and decisions. BASS records the approval context in the artifact changelog and project Decision Log where applicable.

## Fixture Coverage

D7 adds deterministic fixtures and tests for:

- A complete evidence-grounded User Story preview.
- A partial blocked draft with gaps and unresolved questions.
- Given/When/Then acceptance criteria.
- Approved local-write payloads.
- Feature and User Story ADO field previews.
- Optional proposal promotion.

Source-only tests validate preview content, explicit approval gates, provenance, field mappings, and absence of ADO writes. Target-host ADO publication remains D9 work.

## Acceptance Criteria

BASS can create a clear, evidence-grounded User Story that is ready for review and later ADO publication. It is locally persisted only after explicit user approval, includes testable Given/When/Then criteria, preserves assumptions and questions, and has a field-level ADO preview without mutating ADO.
