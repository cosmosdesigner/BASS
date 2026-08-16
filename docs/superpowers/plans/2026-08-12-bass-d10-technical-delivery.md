# BASS D10 Technical Delivery Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver read-only, evidence-grounded repository, pull-request, pipeline, and deployment reporting that explains a Feature or User Story's technical delivery state.

**Architecture:** A deterministic portable technical-delivery report tool combines local artifact context with capability-mapped target-host technical extracts. Explorer invokes only verified read-only mappings; direct Work Item links are Facts, text-based matches are lower-confidence Inferences, and approved persistence is handled through a separate local evidence tool.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown Explorer contract, Markdown/YAML BASS records, target-host Azure DevOps MCP mappings.

## Global Constraints

- D10 technical categories are repository/file search, PR details/comments/links, Work Item-to-PR/commit association, and pipeline/deployment status.
- D10 is read-only: code, repository, pull-request, pipeline, and deployment mutation are prohibited.
- Direct Work Item associations are Facts; title, branch, tag, commit-message, and file-text matches are lower-confidence Inferences.
- Only direct Work Item-associated pipeline or deployment evidence may establish release state.
- Unknown, unavailable, unauthorized, or contradictory technical evidence remains a cited gap/conflict; release state is `unknown` rather than inferred.
- Technical Delivery Report is chat-first; local technical evidence persists only after explicit approval.
- Persisted technical evidence uses D3 provenance and canonical Evidence Register updates.
- All runtime artifacts remain in `BASS/integration/opencode/`; no host `.opencode/` install or real ADO/MCP call occurs in source-only verification.

---

### Task 1: Explorer Technical Contract, Capability Template, and Report Command

**Files:**
- Modify: `BASS/integration/opencode/agents/explorer.md`
- Create: `BASS/templates/ado-technical-delivery-capabilities-template.md`
- Create: `BASS/integration/opencode/commands/bass/technical-delivery.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Portable D10 read-only capability boundaries and Technical Delivery Report entry point.

- [ ] **Step 1: Extend Explorer D10 capability contract**

Add repository/file, PR, Work Item association, and pipeline/deployment read categories. Require target-installed exact read-only allowlist entries. Explicitly deny every technical mutation category.

- [ ] **Step 2: Create technical delivery capability template**

Create four sections, each with `toolName`, `supportedInput`, `verifiedReadOnly`, and `verificationDate`. Include permission synchronization guidance: deny `ado_*` then permit only validated exact tool names.

- [ ] **Step 3: Create Technical Delivery Report command**

Create `/bass technical-delivery <Feature-or-User-Story>` using `$ARGUMENTS`. It calls deterministic report generation, validates mapped categories, directs Explorer to collect only mapped reads, and returns chat-first report. It performs no local persistence without explicit approval.

- [ ] **Step 4: Update README**

Document direct-link-first association, inference labels, unknown release state, approved evidence persistence, target capability mapping, and permanent D10 no-mutation boundary.

### Task 2: Technical Delivery Report and Capability Validator Tools

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-technical-delivery-capabilities.ts`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-technical-delivery-capabilities.js`
- Create: `BASS/integration/opencode/plugins/bass-technical-delivery-report.ts`
- Create: `BASS/integration/opencode/plugins/bass-technical-delivery-report.js`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-technical-evidence.ts`
- Create: `BASS/integration/opencode/plugins/bass-persist-approved-technical-evidence.js`
- Create: `BASS/integration/opencode/plugins/bass-technical-delivery.behavior-test.mjs`

**Interfaces:**
- Validator consumes technical-delivery capability map and returns exact safe Explorer permission fragment plus available categories.
- Report tool consumes Feature/User Story, local context, and normalized target-host technical extracts; returns fixed Technical Delivery Report.
- Persistence tool consumes explicit approval and integrity-bound technical evidence preview; writes local evidence record/register only under selected project.

- [ ] **Step 1: Validate technical capability map**

Require exact safe tool identifiers, independently verified `verifiedReadOnly: true`, known category, valid date, and `resourceType` limited to repository, pull_request, commit, pipeline, or deployment reads. Reject all mutation operations and unknown resources.

- [ ] **Step 2: Resolve Feature/User Story context safely**

Resolve canonical selected-project Feature/User Story only, using containment and symlink checks. Read local ADO Work Item ID/title and D3 evidence links as association inputs.

- [ ] **Step 3: Classify associations**

Normalize technical extracts. Explicit Work Item IDs/links are Fact/high. Exact title, branch, tag, commit-message, or file-text match produces Inference/low or medium with matching basis. Never promote inference to Fact.

- [ ] **Step 4: Generate fixed Technical Delivery Report**

Return exact sections from D10 specification. Include implementation evidence, PR/commit state/comments/links, pipeline/deployment statuses, validation, blockers, release state, gaps/conflicts, and sources. Every material claim has source/location/classification/confidence.

- [ ] **Step 5: Enforce unknown release state**

Set release state `unknown` when required pipeline/deployment evidence is absent, unavailable, unauthorized, or conflicting. Do not infer a release state from PR or repository evidence alone.

- [ ] **Step 6: Implement approval-bound technical evidence persistence**

Require explicit approval plus preview integrity hash. Create an `EVD-...` record with D3 provenance and an Evidence Register row atomically. Validate local paths/register schema and rollback on failure. Do not write automatically.

- [ ] **Step 7: Build JS and behavior tests**

Generate JS from TS. Test direct and inferred associations, gaps/conflicts/unknown release, capability safety, approval/hash persistence, rollback, prohibited mutation, and no MCP/network calls.

### Task 3: Technical Delivery Fixtures and Expected Reports

**Files:**
- Create: `BASS/fixtures/d10-technical/direct/`
- Create: `BASS/fixtures/d10-technical/inferred/`
- Create: `BASS/fixtures/d10-technical/unavailable/`
- Create: `BASS/fixtures/d10-technical/conflicting/`
- Create: `BASS/fixtures/d10-technical/expected/`

**Interfaces:**
- Consumes: Technical report/validator/persistence tools.
- Produces: Exact source-only association and delivery-status oracles.

- [ ] **Step 1: Create direct association fixture**

Include explicit Work Item-to-PR/commit association plus PR state/comments/links and successful pipeline/deployment status. Expected report classifies associations as Facts and reports cited release state.

- [ ] **Step 2: Create inferred association fixture**

Include branch/title/commit/file-text match without explicit Work Item link. Expected report labels implementation association Inference with matching basis and lower confidence.

- [ ] **Step 3: Create unavailable fixture**

Include missing or unauthorized PR/pipeline/deployment category. Expected report has cited gaps, technical blocker/question, and `Release State: unknown`.

- [ ] **Step 4: Create conflicting fixture**

Include contradictory pipeline/deployment evidence. Expected report records D3 Conflict and unknown release state; no inferred outcome.

- [ ] **Step 5: Verify exact normalized results**

Normalize dynamic preview IDs/hashes only. Compare complete report, classifications, confidence, gaps/conflicts, release state, and approved evidence persistence outcomes.

### Task 4: D10 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/explorer.md`
- Verify: `BASS/integration/opencode/commands/bass/technical-delivery.md`
- Verify: `BASS/integration/opencode/plugins/bass-*-technical-*.{ts,js}`
- Verify: `BASS/fixtures/d10-technical/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that BASS explains functional and technical state from ADO evidence without technical mutation.

- [ ] **Step 1: Run D10 source-only suites**

Run validator/report/persistence fixtures; confirm emitted-TS/shipped-JS parity where host dependencies permit, otherwise qualify JS-only evidence.

- [ ] **Step 2: Verify association and report rules**

Confirm direct links are Facts, match-based links are Inferences, unavailable/conflicting evidence yields gaps/conflicts, and release state is unknown where required.

- [ ] **Step 3: Verify approved persistence**

Confirm no evidence record/register update occurs without approval/hash; approved evidence has D3 provenance and canonical Evidence Register row with atomic rollback.

- [ ] **Step 4: Verify no-mutation boundary**

Confirm capability validator rejects mutation resources/operations, tools contain no write dispatch, and fixtures cover repository/code/PR/pipeline/deployment mutation prohibition.

- [ ] **Step 5: Verify portable-only delivery**

Confirm D10 runtime artifacts are portable under `BASS/integration/opencode/`; no live ADO/MCP or host `.opencode/` installation is used. Run `git status --short`; do not initialize Git.
