# BASS D8 Reviewer and Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver evidence-grounded review and approval-first improvement that preserves unresolved issues and produces a revalidated, traceable artifact version.

**Architecture:** Deterministic portable review tools analyze a selected artifact and emit severity-gated reports. Improvement tools receive the original artifact and report, produce a non-persisted revision preview, automatically re-review it, and persist only an explicitly approved preview with D3 lineage plus an immutable improvement record.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown agent and command definitions, Markdown/YAML BASS artifact records.

## Global Constraints

- Reviewer and Editor are isolated read-only subagents; BASS performs approval-bound persistence.
- Review checks: clarity, ambiguity, completeness, consistency, testability, dependencies, risks, and provenance.
- Finding severities are Critical, Major, Minor, and Advisory.
- Critical/Major findings block local approval and ADO publication unless a user Decision record explicitly waives them.
- Editor never invents content or resolves an unresolved question by assumption; unresolvable findings become `needs_decision`.
- `/bass improve` always re-runs Reviewer before requesting local-write approval.
- Every approved improvement increments version, sets lineage, appends a valid artifact changelog row, and creates an immutable `OUT-...` improvement record.
- D8 does not mutate ADO or install this workspace host `.opencode/`.

---

### Task 1: Reviewer and Editor Contracts

**Files:**
- Modify: `BASS/integration/opencode/agents/reviewer.md`
- Modify: `BASS/integration/opencode/agents/editor.md`
- Create: `BASS/integration/opencode/commands/bass/review.md`
- Create: `BASS/integration/opencode/commands/bass/improve.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Portable review/improve command contracts and agent boundaries.

- [ ] **Step 1: Expand Reviewer contract**

State all eight required checks, severity meanings, cited finding evidence, and read-only report behavior. Critical/Major findings block approval/publication until resolved or Decision-waived.

- [ ] **Step 2: Expand Editor contract**

Require original artifact, cited evidence, Decision records, and Review Report as inputs. Require revised preview, change summary, `needs_decision` handling, and no local/ADO writes.

- [ ] **Step 3: Create review command**

`/bass review <artifact>` calls `bass_review_artifact`, returns the structured report, and does not persist or mutate ADO.

- [ ] **Step 4: Create improve command**

`/bass improve <artifact>` calls `bass_improve_artifact`, then `bass_review_artifact` on the revised preview, and returns original findings, changes, unresolved issues, and re-review result before approval request.

- [ ] **Step 5: Document D8 gate behavior**

Update README to state Critical/Major approval/publication blocks, Decision waivers, automatic re-review, and immutable improvement records.

### Task 2: Deterministic Review and Improvement Tools

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-review-artifact.ts`
- Create: `BASS/integration/opencode/plugins/bass-review-artifact.js`
- Create: `BASS/integration/opencode/plugins/bass-improve-artifact.ts`
- Create: `BASS/integration/opencode/plugins/bass-improve-artifact.js`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-improvement.ts`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-improvement.js`
- Create: `BASS/integration/opencode/plugins/bass-review-artifact.behavior-test.mjs`
- Create: `BASS/integration/opencode/plugins/bass-improve-artifact.behavior-test.mjs`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs`

**Interfaces:**
- `bass_review_artifact` consumes canonical artifact path and cited context; returns fixed Review Report.
- `bass_improve_artifact` consumes original artifact, Review Report, cited evidence, and Decision waivers; returns integrity-bound revised preview plus change summary.
- `bass_persist_approved_improvement` consumes explicit approval, preview ID/hash, and complete revised payload; writes artifact and immutable output record atomically.

- [ ] **Step 1: Implement artifact resolution and review checks**

Resolve canonical Feature, User Story, Idea, or Proposal under selected project with containment checks. Detect each review category through deterministic template/provenance rules and cite exact artifact locations.

- [ ] **Step 2: Emit fixed Review Report**

Return header, summary, severity-ranked findings table, unresolved questions, review decision, and sources. Each finding includes ID, severity, check, evidence/location, impact, recommendation, and status.

- [ ] **Step 3: Implement severity gate and Decision waiver validation**

Critical/Major findings set `Status: blocked` unless an exact cited Decision waiver includes finding ID, rationale, and residual risk. Minor/Advisory remain visible but non-blocking.

- [ ] **Step 4: Implement improvement preview**

Apply only evidence-supported findings. Preserve unresolved text and add labeled `needs_decision` entries for unresolvable findings. Generate change summary with finding IDs, justification, source, and status. Issue integrity hash for an approval-eligible revalidated preview only.

- [ ] **Step 5: Automatically re-review revised preview**

Call review logic over the in-memory revised artifact, include re-review report in improvement result, and block approval when remaining Critical/Major findings lack a Decision waiver.

- [ ] **Step 6: Implement atomic approved improvement persistence**

Verify approval/hash/current artifact version. Atomically update artifact version, `updated_date`, `derived_from`, `supersedes`, and changelog. Create `outputs/OUT-...-improvement-record.md` containing original report, changes, unresolved/waived findings, approval, and re-review. Update project registers and Action Log with rollback on every commit-stage failure.

- [ ] **Step 7: Build JS and behavior tests**

Use installed local TypeScript compiler without package-runner network fallback. Test shipped JS/emitted TS parity, severity gates, waivers, automatic re-review, `needs_decision`, atomic rollback, immutable output record, and no ADO/MCP calls.

### Task 3: D8 Fixtures and Expected Reports

**Files:**
- Create: `BASS/fixtures/d8-review/blocked/`
- Create: `BASS/fixtures/d8-review/improved/`
- Create: `BASS/fixtures/d8-review/unresolved/`
- Create: `BASS/fixtures/d8-review/waived/`
- Create: `BASS/fixtures/d8-review/expected-blocked-review.json`
- Create: `BASS/fixtures/d8-review/expected-improvement-result.json`
- Create: `BASS/fixtures/d8-review/expected-unresolved-result.json`
- Create: `BASS/fixtures/d8-review/expected-waived-review.json`

**Interfaces:**
- Consumes: Review, improvement, and persistence tools.
- Produces: Exact source-only fixture oracles.

- [ ] **Step 1: Create blocking fixture**

Create an artifact with a Critical/Major cited defect. Expected report blocks approval/publication.

- [ ] **Step 2: Create successful improvement fixture**

Create evidence-supported defects resolved by Editor. Expected result includes change summary and automatic passing re-review.

- [ ] **Step 3: Create unresolved fixture**

Create a finding without sufficient evidence. Expected improvement preserves text, adds `needs_decision`, and remains blocked.

- [ ] **Step 4: Create waiver fixture**

Create blocking finding plus valid user Decision waiver. Expected report retains the finding, Decision rationale, and residual risk while allowing approval.

- [ ] **Step 5: Verify full result snapshots**

Normalize dynamic preview IDs/hashes only. Exactly compare status, report, findings, change summary, re-review, lineage, immutable output content, and no ADO fields.

### Task 4: D8 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/reviewer.md`
- Verify: `BASS/integration/opencode/agents/editor.md`
- Verify: `BASS/integration/opencode/commands/bass/review.md`
- Verify: `BASS/integration/opencode/commands/bass/improve.md`
- Verify: `BASS/integration/opencode/plugins/bass-*-artifact.*`
- Verify: `BASS/fixtures/d8-review/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that D8 returns improved, justified, automatically revalidated artifacts safely.

- [ ] **Step 1: Run D8 source-only suites**

Run review, improvement, and persistence suites; confirm emitted-TS/shipped-JS parity and exact fixture comparisons.

- [ ] **Step 2: Verify severity gates and waivers**

Confirm Critical/Major block approval/publication; only explicit Decision waiver with finding ID/rationale/residual risk permits continuation.

- [ ] **Step 3: Verify automatic re-review and unresolved handling**

Confirm improve invokes re-review before approval, and no unresolved question is closed by assumption.

- [ ] **Step 4: Verify versioning and immutable records**

Confirm approved changes increment version, set lineage, append canonical changelog row, create immutable output record, and atomically update registers/logs.

- [ ] **Step 5: Verify portable and no-ADO boundary**

Confirm all runtime files are in `BASS/integration/opencode/`; no ADO/MCP calls or this-workspace host `.opencode/` changes exist. Run `git status --short`; do not initialize Git.
