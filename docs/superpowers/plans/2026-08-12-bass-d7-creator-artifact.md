# BASS D7 Creator and BA Artifact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver approval-first, evidence-grounded Feature, User Story, acceptance-criteria, and functional-proposal creation with local-only ADO Work Item previews.

**Architecture:** A deterministic portable Creator preview tool converts cited D5/D6 evidence into a classified artifact preview and optional field-level ADO preview. A separate narrow local persistence tool accepts only an approved preview payload and writes inside the selected BASS project; no D7 tool invokes ADO.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown command/agent definitions, Markdown/YAML BASS templates and records.

## Global Constraints

- Creator previews are chat-first; BASS writes a local artifact only after explicit approval of that specific preview.
- D7 never creates, updates, or otherwise mutates ADO resources.
- Artifact preview material distinguishes Fact, Inference, Assumption, Proposal, Question, and Conflict with cited source/location/confidence.
- Insufficient, conflicted, or assumption-only context produces a partial write-blocked preview with no ADO publication preview.
- Feature and User Story criteria use Given/When/Then and link each scenario to evidence or an explicit assumption.
- `create-ac` proposes a scoped update to an existing Feature/User Story draft; it creates no standalone record.
- Functional proposals are `PRO-001-<lowercase-kebab-name>/proposal.md` records.
- Feature/User Story ADO previews contain type, title, description, acceptance criteria, parent/link target, tags, area, iteration, priority, effort, and unavailable mappings.
- Functional proposal ADO preview occurs only on explicit promotion request.
- All D7 runtime artifacts stay in `BASS/integration/opencode/`; do not install this workspace host `.opencode/`.

---

### Task 1: Creator Contract, Commands, and Templates

**Files:**
- Modify: `BASS/integration/opencode/agents/creator.md`
- Create: `BASS/integration/opencode/commands/bass/create-feature.md`
- Create: `BASS/integration/opencode/commands/bass/create-us.md`
- Create: `BASS/integration/opencode/commands/bass/create-ac.md`
- Create: `BASS/integration/opencode/commands/bass/create-proposal.md`
- Modify: `BASS/templates/feature-template.md`
- Modify: `BASS/templates/user-story-template.md`
- Create: `BASS/templates/acceptance-criteria-template.md`
- Create: `BASS/templates/functional-proposal-template.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Portable Creator instructions, four preview-first commands, and canonical artifact templates.

- [ ] **Step 1: Update Creator contract**

State that Creator receives cited D5/D6 evidence only, produces previews only, labels every claim classification, preserves gaps/conflicts/questions, and has no local-write or ADO permissions. BASS alone may request the separate approved-payload persistence tool.

- [ ] **Step 2: Create Feature, User Story, and proposal commands**

Each command accepts `$ARGUMENTS`, requests the appropriate `bass_creator_preview` artifact type, returns preview conversationally, asks for explicit approval before persistence, and does not invoke ADO.

- [ ] **Step 3: Create acceptance-criteria command**

Require an existing target Feature/User Story ID and a proposed Given/When/Then update. Command calls preview tool with `artifactType: acceptance_criteria`, returns scoped update preview, and blocks persistence without approval.

- [ ] **Step 4: Expand Feature and User Story templates**

Add sections: Goal, Scope, Out of Scope, Business Rules, Dependencies, Risks, Assumptions, Questions, Cited Evidence, and Given/When/Then Acceptance Criteria. Preserve existing D2/D3 metadata, ADO link, related records, and changelog conventions.

- [ ] **Step 5: Create acceptance criteria and proposal templates**

Acceptance template contains target ID, Given/When/Then scenarios, scenario evidence/assumption links, and changelog. Proposal template contains PRO ID metadata plus Problem or Opportunity, Proposed Change, Expected Value, Scope, Out of Scope, Rules, Dependencies, Risks, Assumptions, Questions, Cited Evidence, Next Step, and changelog.

- [ ] **Step 6: Document approval-first installation behavior**

Update README to explain commands produce local-only previews, explicit approval is required to persist, ADO preview is not publication, and D9 owns actual ADO operations.

### Task 2: Deterministic Creator Preview and Approved Persistence Tools

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-creator-preview.ts`
- Create: `BASS/integration/opencode/plugins/bass-creator-preview.js`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-artifact.ts`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-artifact.js`
- Create: `BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-artifact.behavior-test.mjs`

**Interfaces:**
- `bass_creator_preview` consumes `{ projectName, artifactType, title, evidence, assumptions?, targetId?, promoteTo? }`.
- It produces `{ previewId, writeStatus, artifactMarkdown, adoPreview?, gaps, questions, conflicts }`.
- `bass_persist_approved_artifact` consumes `{ projectName, previewId, approvedArtifactMarkdown }` and writes only if preview status is `ready_for_approval` and payload hash matches issued preview.

- [ ] **Step 1: Validate Creator inputs and provenance**

Reject traversal project names, unsupported artifact types, empty title, missing evidence, and evidence entries lacking source/location/classification/confidence. Preserve evidence categories without converting questions/conflicts to facts.

- [ ] **Step 2: Generate Feature, User Story, and proposal previews**

Use templates to generate Markdown preview with required sections and YAML provenance. Assign next typed IDs by scanning selected project records. Build User Story parent relation from explicit target Feature only. Add Given/When/Then scenarios with a cited evidence or labeled assumption per scenario.

- [ ] **Step 3: Generate scoped acceptance criteria update preview**

Resolve exact existing Feature/User Story target. Return only proposed `## Acceptance Criteria` replacement/addition and a changelog entry; do not create a standalone artifact.

- [ ] **Step 4: Enforce partial and blocked preview behavior**

When evidence is incomplete, assumptions-only, or contains unresolved conflicts, return `writeStatus: blocked`, explicit gaps/questions/conflicts, and omit ADO preview. Complete evidence-grounded drafts return `writeStatus: ready_for_approval`.

- [ ] **Step 5: Generate local-only field-level ADO preview**

For ready Feature/User Story previews, generate fields: type, title, description, acceptance criteria, parent/link target, tags, area, iteration, priority, effort, unavailable mappings. For proposal, generate only on `promoteTo: feature|user_story`; otherwise omit. Do not call MCP or ADO tools.

- [ ] **Step 6: Implement approval-bound persistence**

Issue an integrity hash with each ready preview. Persistence verifies matching preview ID/hash, explicit approval flag, safe project containment, canonical typed directory naming, and no existing collision. It writes only under selected BASS project, updates registers, and records approval in changelog/Decision Log. Block unapproved, partial, stale, altered, collision, or traversal payloads.

- [ ] **Step 7: Build JS and behavior tests**

Generate JS from TS. Test TS-emitted/shipped parity for complete Feature/User Story/proposal previews, blocked partial preview, Given/When/Then criteria, ADO fields, proposal promotion, approval-bound persistence, hash tampering, and no ADO/MCP calls.

### Task 3: Creator Fixtures and Expected Previews

**Files:**
- Create: `BASS/fixtures/d7-creator/complete/`
- Create: `BASS/fixtures/d7-creator/partial/`
- Create: `BASS/fixtures/d7-creator/promotion/`
- Create: `BASS/fixtures/d7-creator/expected-user-story-preview.md`
- Create: `BASS/fixtures/d7-creator/expected-partial-preview.md`
- Create: `BASS/fixtures/d7-creator/expected-proposal-promotion-preview.md`

**Interfaces:**
- Consumes: Creator preview and persistence tools.
- Produces: Executable source-only fixtures and exact previews.

- [ ] **Step 1: Create complete User Story fixture**

Provide complete cited evidence, explicit parent Feature, and all required field mappings. Expected preview is ready for approval with evidence-linked Given/When/Then scenarios and field-level User Story ADO preview.

- [ ] **Step 2: Create partial blocked fixture**

Provide insufficient/conflicted context. Expected preview has write status blocked, gaps, questions, conflicts, and no ADO preview.

- [ ] **Step 3: Create proposal promotion fixture**

Provide proposal evidence and explicit promotion request. Expected preview is a PRO record with optional Feature or User Story ADO preview and no ADO mutation.

- [ ] **Step 4: Verify fixture outputs**

Run: `rg -n "Given|When|Then|writeStatus|ready_for_approval|blocked|ADO Work Item Preview|Assumption|Question|Conflict|source:|confidence:" BASS/fixtures/d7-creator`

Expected: Fixtures and expected previews cover complete, blocked, and promotion behavior with provenance.

### Task 4: D7 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/creator.md`
- Verify: `BASS/integration/opencode/commands/bass/create-*.md`
- Verify: `BASS/integration/opencode/plugins/bass-creator-preview.*`
- Verify: `BASS/integration/opencode/plugins/bass-persist-approved-artifact.*`
- Verify: `BASS/templates/`
- Verify: `BASS/fixtures/d7-creator/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that BASS can create a review-ready and later publication-ready User Story safely.

- [ ] **Step 1: Run source-only Creator suites**

Run preview and persistence behavior suites. Confirm TS/JS parity and exact fixture previews.

- [ ] **Step 2: Verify approval and write boundaries**

Confirm no artifact is persisted without explicit approval and matching preview integrity hash. Confirm all persistence paths stay under selected BASS project and no D7 tool contains ADO/MCP invocation.

- [ ] **Step 3: Verify artifact quality rules**

Confirm Feature/User Story/proposal templates include all required sections, Given/When/Then scenarios remain linked to evidence/assumptions, and partial contexts block local approval plus ADO preview.

- [ ] **Step 4: Verify field-level ADO preview**

Confirm Feature/User Story preview contains all ten mapped/unavailable fields; proposal preview appears only on explicit promotion request; no ADO write is claimed.

- [ ] **Step 5: Verify portable-only delivery**

Confirm D7 runtime files are under `BASS/integration/opencode/`; do not add or modify this workspace host `.opencode/`. Run `git status --short`; do not initialize Git.
