# BASS D1 Operating Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish and verify the authoritative Phase 1 BASS operating contract covering roles, workflows, controls, and exclusions.

**Architecture:** The contract is a single Markdown document in `dev_docs/` that establishes BASS as the sole user-facing orchestrator and Reader, Explorer, Creator, Reviewer, Editor, and Executor as isolated subagents. A companion design record documents the approved decisions and links to the authoritative contract.

**Tech Stack:** Markdown, OpenCode repository conventions, Azure DevOps terminology.

## Global Constraints

- BASS is the sole user-facing orchestrator.
- Reader, Explorer, Creator, Reviewer, Editor, and Executor are isolated subagents that only receive input from and return output to BASS.
- Phase 1 has exactly six canonical workflows: Understand, Discover, Create, Review, Improve, and Sync/Execute ADO.
- Local workspace drafts and artifacts do not require confirmation.
- Every ADO write requires a preview or diff and explicit user confirmation.
- Missing evidence or source conflicts block ADO writes until the user decides.
- Phase 1 excludes non-ADO connectors, advanced memory, dashboards, autonomous automation, and code, pull-request, and pipeline mutation.

---

### Task 1: Authoritative Operating Contract

**Files:**
- Create: `dev_docs/BASS_Phase_1_Operating_Contract.md`

**Interfaces:**
- Consumes: Approved D1 design decisions in `docs/superpowers/specs/2026-08-12-bass-d1-operating-contract-design.md`.
- Produces: The authoritative reference for D1 roles, collaboration, workflows, controls, exclusions, and completion standard.

- [ ] **Step 1: Create the contract heading and authority statement**

```markdown
# BASS Phase 1 Operating Contract

## Purpose and Authority

This document is the authoritative Phase 1 contract for the Business ASSistant (BASS).
```

- [ ] **Step 2: Document the strict hub-and-spoke role model**

```markdown
## Roles and Collaboration Model

BASS is the sole user-facing orchestrator.

Subagents are isolated. A subagent receives inputs only from BASS and returns results only to BASS. A subagent must not invoke, delegate to, or communicate directly with another subagent.
```

Add the complete named taxonomy: Reader, Explorer, Creator, Reviewer, Editor, and Executor, with one bounded responsibility per role.

- [ ] **Step 3: Document all six workflow contracts**

For Understand, Discover, Create, Review, Improve, and Sync/Execute ADO, add a table containing these exact contract elements:

```markdown
| Contract element | Definition |
| --- | --- |
| Trigger | ... |
| Required inputs | ... |
| Steps | ... |
| Local outputs | ... |
| ADO behavior | ... |
| Confirmation | ... |
| Acceptance criteria | ... |
```

- [ ] **Step 4: Document evidence and ADO change controls**

```markdown
## Change Control and Evidence Handling

Before every ADO write, BASS must show an understandable plan or diff and request explicit user confirmation.

If necessary evidence is absent or sources conflict, BASS must present the cited gap or conflict and request a user decision. BASS must not infer a resolution or create or modify ADO artifacts until the user resolves the issue.
```

- [ ] **Step 5: Document exclusions and completion standard**

```markdown
## Phase 1 Exclusions

Phase 1 does not include non-ADO connectors, advanced memory, dashboards, autonomous automation, or code, pull-request, or pipeline mutation.
```

State that D1 is complete when a user can determine roles, workflow selection, collaboration boundaries, confirmation requirements, and exclusions from this document alone.

- [ ] **Step 6: Verify the contract contents**

Run: `rg -n "sole user-facing|Subagents are isolated|Understand|Discover|Create|Review|Improve|Sync/Execute ADO|explicit user confirmation|source conflicts|Phase 1 Exclusions" dev_docs/BASS_Phase_1_Operating_Contract.md`

Expected: The command returns evidence for every required architecture, workflow, control, and exclusion topic.

### Task 2: Approved Design Record

**Files:**
- Create: `docs/superpowers/specs/2026-08-12-bass-d1-operating-contract-design.md`

**Interfaces:**
- Consumes: User-approved D1 decisions.
- Produces: A concise decision record that identifies `dev_docs/BASS_Phase_1_Operating_Contract.md` as the authoritative implementation document.

- [ ] **Step 1: Record the approved architecture decision**

```markdown
# BASS D1 Operating Contract Design

## Status

Approved design. The authoritative implementation document is `dev_docs/BASS_Phase_1_Operating_Contract.md`.
```

- [ ] **Step 2: Record workflow, control, and scope decisions**

Include the six fixed workflows, strict BASS-only orchestration, explicit confirmation for every ADO write, local-draft behavior, evidence-conflict blocking, and all Phase 1 exclusions.

- [ ] **Step 3: Verify no design-document ambiguity remains**

Run: `rg -n "TBD|TODO|implement later|fill in" docs/superpowers/specs/2026-08-12-bass-d1-operating-contract-design.md`

Expected: No matches.

### Task 3: Close D1

**Files:**
- Verify: `dev_docs/BASS_Phase_1_Plan.md`
- Verify: `dev_docs/BASS_Phase_1_Operating_Contract.md`
- Verify: `docs/superpowers/specs/2026-08-12-bass-d1-operating-contract-design.md`

**Interfaces:**
- Consumes: The completed contract and approved design record.
- Produces: Verified D1 closure.

- [ ] **Step 1: Verify each D1 checklist requirement against the contract**

Confirm the contract includes the following: all seven role names; BASS as sole orchestrator; direct subagent communication prohibition; all six workflows; workflow inputs, outputs, and acceptance criteria; confirmation controls; Phase 1 exclusions; and a completion standard.

- [ ] **Step 2: Read the complete contract for consistency**

Run: `Get-Content -Raw dev_docs/BASS_Phase_1_Operating_Contract.md`

Expected: No contradiction between the role model, workflow contracts, controls, or exclusions.

- [ ] **Step 3: Check repository status before attempting a commit**

Run: `git status --short`

Expected: If this is a Git repository, review only the D1 documentation files before committing. If the command reports that no repository exists, report that commit and publication are unavailable in this workspace.

- [ ] **Step 4: Commit when a Git repository is available**

```bash
git add dev_docs/BASS_Phase_1_Operating_Contract.md docs/superpowers/specs/2026-08-12-bass-d1-operating-contract-design.md docs/superpowers/plans/2026-08-12-bass-d1-operating-contract.md
git commit -m "docs: add BASS phase 1 operating contract"
```

If no Git repository is available, do not initialize one. Record the limitation in the completion report.
