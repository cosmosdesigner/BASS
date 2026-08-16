# BASS D3 Provenance, Evidence, and Decisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every BASS claim, decision, version change, and ADO action traceable through a shared provenance schema, canonical logs, reusable templates, and complete fictional examples.

**Architecture:** D3 augments all provenance-bearing templates and the demonstration project with a shared YAML `provenance` block and record-level lineage. The project Evidence Register, Decision Log, and ADO Action Log become canonical indexes of scoped records; Question and Conflict records make missing evidence and contradictory sources explicit rather than inferred.

**Tech Stack:** Markdown with YAML front matter, BASS workspace conventions, Azure DevOps URL examples.

## Global Constraints

- Every provenance-bearing record has exactly one primary classification: `Fact`, `Inference`, `Assumption`, `Proposal`, `Question`, `Conflict`, or `Decision`.
- Documents may contain additional individually labeled claims.
- Shared provenance fields are `classification`, `sources`, `actor`, `date`, `confidence`, `source_version`, and `related_items`.
- `sources` is a typed YAML list; permitted types are `local_file`, `ado_wiki`, `ado_work_item`, `ado_comment`, `ado_pull_request`, and `ado_pipeline`.
- Every source object has `type`, `reference`, and `location`; `retrieved_date` is optional.
- Confidence is exactly one of `high`, `medium`, or `low`.
- Missing evidence uses a `Question` record with `sources: []`, `confidence: low`, and `evidence_gap`; it is not converted to an assumption.
- Conflicts use a `Conflict` record with all competing sources, a disputed claim, `status: open` or `resolved`, and a Decision link only after user resolution.
- Edited artifacts retain their path, increment `version`, provide `derived_from` and `supersedes`, and append a dated changelog with related review or Decision IDs.
- Project-level Evidence Register, Decision Log, and ADO Action Log are canonical indexes.
- The demonstration remains fictional and performs no live ADO operation.

---

### Task 1: Shared Provenance and Lineage Templates

**Files:**
- Modify: `BASS/templates/functional-context-template.md`
- Modify: `BASS/templates/technical-context-template.md`
- Modify: `BASS/templates/feature-template.md`
- Modify: `BASS/templates/user-story-template.md`
- Modify: `BASS/templates/idea-template.md`
- Modify: `BASS/templates/evidence-template.md`
- Modify: `BASS/templates/decision-template.md`
- Modify: `BASS/templates/context-registry-template.md`
- Create: `BASS/templates/question-template.md`
- Create: `BASS/templates/conflict-template.md`

**Interfaces:**
- Produces: Canonical copy-ready provenance metadata and lineage structures used by all D3 records.

- [ ] **Step 1: Add shared provenance and lineage fields to every existing provenance-bearing template**

Add this YAML structure after each template's existing metadata:

```yaml
provenance:
  classification: Fact
  sources:
    - type: local_file
      reference: <relative-source-path>
      location: <specific-location>
      retrieved_date: YYYY-MM-DD
  actor: BASS
  date: YYYY-MM-DD
  confidence: high
  source_version: v1.0
  related_items: []
derived_from: null
supersedes: null
```

Add a `## Changelog` table with columns Date, Version, Change, Reason, and Related records to each artifact template.

- [ ] **Step 2: Create the Question template**

Create `BASS/templates/question-template.md` with YAML containing `id: Q-001`, standard metadata, and:

```yaml
provenance:
  classification: Question
  sources: []
  actor: BASS
  date: YYYY-MM-DD
  confidence: low
  source_version: v1.0
  related_items: []
evidence_gap: ""
```

Add headings: Question, Evidence Required, Why Evidence Is Missing, Impact, and Resolution.

- [ ] **Step 3: Create the Conflict template**

Create `BASS/templates/conflict-template.md` with YAML containing `id: CON-001`, standard metadata, `classification: Conflict`, two typed source-object examples, and:

```yaml
conflict:
  disputed_claim: ""
  status: open
  decision_id: null
```

Add headings: Disputed Claim, Competing Sources, Impact, Resolution Status, and Linked Decision.

- [ ] **Step 4: Verify template provenance coverage**

Run: `rg -n "classification:|sources:|actor:|confidence:|source_version:|related_items:|derived_from:|supersedes:|## Changelog" BASS/templates`

Expected: Every provenance-bearing template contains the shared metadata and lineage fields; Question and Conflict templates contain their mandatory special fields.

### Task 2: Canonical Project Logs

**Files:**
- Modify: `BASS/projects/demo-customer-onboarding/evidence-register.md`
- Modify: `BASS/projects/demo-customer-onboarding/decision-log.md`
- Modify: `BASS/projects/demo-customer-onboarding/action-log.md`

**Interfaces:**
- Consumes: The typed record metadata from Task 1.
- Produces: Canonical project-wide indexes with traceability fields and record links.

- [ ] **Step 1: Expand the Evidence Register**

Replace the current table with:

```markdown
| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Include rows for all demo evidence-bearing records, including the Question and Conflict records created in Task 3.

- [ ] **Step 2: Expand the Decision Log**

Replace the current table with:

```markdown
| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Include the demonstration Decision record.

- [ ] **Step 3: Expand the ADO Action Log**

Replace its prose-only entry with:

```markdown
| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

Add one `ACT-001` row whose status is `not_performed` and whose result is `No ADO write was performed because this is fictional demonstration data.`

- [ ] **Step 4: Verify canonical log columns and no-write status**

Run: `rg -n "Classification|Supporting evidence|Before/after or result|not_performed|No ADO write" BASS/projects/demo-customer-onboarding/*-log.md BASS/projects/demo-customer-onboarding/evidence-register.md`

Expected: All required columns exist and the fictional no-write action is explicitly recorded.

### Task 3: Provenance-Rich Demonstration Records

**Files:**
- Modify: `BASS/projects/demo-customer-onboarding/project-context/context-registry.md`
- Modify: `BASS/projects/demo-customer-onboarding/project-context/functional/functional-context.md`
- Modify: `BASS/projects/demo-customer-onboarding/project-context/technical/technical-context.md`
- Modify: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/feature.md`
- Modify: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/user-stories/US-001-create-account/user-story.md`
- Modify: `BASS/projects/demo-customer-onboarding/ideas/IDEA-001-guided-onboarding/idea.md`
- Modify: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/evidence/EVD-001-customer-research.md`
- Modify: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/decisions/DEC-001-account-creation-scope.md`
- Modify: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/outputs/OUT-001-feature-summary.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/evidence/Q-001-identity-verification-question.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/evidence/CON-001-eligibility-rule-conflict.md`

**Interfaces:**
- Consumes: Templates from Task 1 and log table layouts from Task 2.
- Produces: Fictional examples for all classifications and all allowed source types, with record-level traceability and lineage.

- [ ] **Step 1: Add provenance and lineage to all existing demo records**

Add the shared provenance block and `derived_from: null`, `supersedes: null` to every listed existing record. Preserve existing D2 IDs, fictional URLs, and titles. Use `2026-08-12`, actor `BASS`, and an appropriate allowed source type for each record.

- [ ] **Step 2: Demonstrate all six source types across records**

Use exactly these source-type examples at least once across the demo:

```yaml
type: local_file
type: ado_wiki
type: ado_work_item
type: ado_comment
type: ado_pull_request
type: ado_pipeline
```

Every example includes a fictional `example-org` reference, a precise `location`, and `retrieved_date: 2026-08-12` for ADO sources.

- [ ] **Step 3: Demonstrate Fact, Inference, Assumption, Proposal, and Decision**

Use the listed primary classifications across the updated context, Feature, User Story, Idea, evidence, Decision, and output records. Add visible body labels for any secondary claims needed to make all distinctions explicit.

- [ ] **Step 4: Add the evidence-gap Question record**

Create `Q-001-identity-verification-question.md` with `classification: Question`, `sources: []`, `confidence: low`, `evidence_gap`, and a clear unresolved question about identity verification. Link it to `F-001` and the Evidence Register.

- [ ] **Step 5: Add the open Conflict record**

Create `CON-001-eligibility-rule-conflict.md` with `classification: Conflict`, competing `ado_wiki` and `ado_work_item` sources, a specific disputed eligibility claim, `status: open`, and `decision_id: null`. Link it to `F-001` and the Evidence Register.

- [ ] **Step 6: Demonstrate an edited version**

Update `feature.md` from `v1.0` to `v1.1`; set `derived_from: F-001@v1.0` and `supersedes: F-001@v1.0`; add a dated changelog row citing `DEC-001` as the reason. The Feature remains at its existing path.

- [ ] **Step 7: Update the canonical logs with all new records**

Add Q-001 and CON-001 to the Evidence Register with classifications, source summaries, confidence, locations, related items, and links. Ensure DEC-001's Decision Log row cites its evidence and that ACT-001 remains the only action-log entry.

- [ ] **Step 8: Verify all classifications, sources, and lineage**

Run: `rg -n "classification: (Fact|Inference|Assumption|Proposal|Question|Conflict|Decision)|type: (local_file|ado_wiki|ado_work_item|ado_comment|ado_pull_request|ado_pipeline)|evidence_gap:|status: open|decision_id: null|derived_from: F-001@v1.0|supersedes: F-001@v1.0" BASS/projects/demo-customer-onboarding`

Expected: Every classification and source type occurs at least once; Q-001 and CON-001 meet their mandatory fields; F-001 demonstrates version lineage.

### Task 4: D3 Acceptance Verification

**Files:**
- Verify: `BASS/templates/`
- Verify: `BASS/projects/demo-customer-onboarding/`
- Verify: `docs/superpowers/specs/2026-08-12-bass-d3-provenance-evidence-decisions-design.md`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that D3 distinguishes claims and makes important claims and ADO actions traceable.

- [ ] **Step 1: Verify every provenance-bearing template uses the shared schema**

Read each template and confirm all seven required shared provenance fields, valid confidence values, typed source structure, lineage fields, and changelog. Confirm Question and Conflict special fields.

- [ ] **Step 2: Verify source and classification coverage in the demo**

Confirm every one of the seven classifications and six source types appears in the demo. Confirm Question uses empty sources and an evidence gap; confirm Conflict preserves two competing sources, remains open, and has no Decision ID.

- [ ] **Step 3: Verify logs and lineage**

Confirm each canonical log has its approved columns and links to the appropriate records. Confirm `feature.md` is `v1.1`, retains its path, includes `derived_from`, `supersedes`, and a DEC-001-linked changelog row.

- [ ] **Step 4: Verify no live ADO write or repository initialization occurred**

Run: `git status --short`

Expected: The command reports that the workspace is not a Git repository. Do not initialize Git. Confirm the Action Log is the only action evidence and records `not_performed`.
