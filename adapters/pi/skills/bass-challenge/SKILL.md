---
name: bass-challenge
description: Challenge one BASS artifact's necessity, value, assumptions, alternatives, and failure modes without mutation.
---

# BASS Challenge

## Canonical Workflow

Explicit command entry point for **Challenge**. Target: one canonical BASS Idea,
Feature, User Story, or Proposal in `$ARGUMENTS` plus its applicable cited evidence and
Decisions. Challenge is deliberately more adversarial than normal quality review.

## Gate And Route

Gate: reject a missing or ambiguous target. Route: BASS -> Reviewer. BASS provides
the artifact, cited evidence, applicable Decisions, and these challenge criteria:

- Is the problem evidenced and worth solving?
- Who benefits and what measurable outcome is expected?
- What happens if nothing is changed?
- Which assumptions are hidden or weakly supported?
- Is the proposed scope solving a cause or only a symptom?
- Is there a simpler or already-existing alternative?
- Is functionality duplicated elsewhere in discovered scope?
- Which business rules, dependencies, edge cases, and failure modes are missing?
- What evidence would falsify or materially change the proposal?
- Which success metric would demonstrate value?

Reviewer must distinguish supported findings from open questions. Lack of evidence is a
Question or gap, not a negative Fact. Do not invent duplicate features, risks, metrics,
or business rules.

## Challenge Report

Return the uniform BASS response envelope. `Result` contains: artifact/version,
challenge summary, strongest supported objections, assumptions under pressure,
alternatives, missing evidence, edge/failure cases, value/metric questions, and a
recommendation of `proceed`, `revise`, `investigate`, or `stop` with cited rationale.

Challenge is read-only. Do not persist, improve, waive, or publish anything from this
workflow automatically.
