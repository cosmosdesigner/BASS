---
description: Explore a problem or opportunity and return evidence-grounded options without persistence.
---

## Canonical Workflow

Explicit command entry point for **Brainstorm**. `$ARGUMENTS` may be a problem,
opportunity, Idea, Feature, User Story, or bounded question. Brainstorm is exploratory
and non-persisting: it helps the user think about what could exist; it does not claim
that generated options are requirements.

## Gate And Route

Route: BASS -> Reader as needed -> Explorer -> Creator. BASS supplies a bounded
problem statement and selected project scope. Reader loads only relevant cited context.
Explorer finds existing related work, constraints, dependencies, gaps, conflicts, and
questions. Creator receives only that evidence and may generate candidate alternatives
as `Proposal` or `Assumption`, never as Fact.

Partial evidence may return `warning`. A conflict remains visible and does not prevent
exploration, but no option may silently resolve it. Do not persist the Brainstorm
Report, create an artifact, or invoke an ADO write.

## Brainstorm Report

Return the uniform BASS response envelope with `Result` containing these sections:

1. Problem or Opportunity
2. Known Facts
3. Assumptions
4. Questions
5. Opportunities
6. Alternatives
7. Constraints
8. Risks
9. Possible Features
10. Possible User Stories
11. Recommendation
12. Evidence Gaps

Every material statement must retain source, location, D3 classification, and
confidence. Candidate Features/User Stories are proposals only until the user chooses
to start a Create workflow.
