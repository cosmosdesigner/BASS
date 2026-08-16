# BASS D12 Quality, Documentation, and Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an honest Phase 1 release-readiness bundle with source-ready verification, target-host ADO validation guidance, focused documentation, demos, and a Phase 2 backlog.

**Architecture:** D12 consolidates existing D1-D11 source-only evidence into a quality matrix and runnable readiness report. It ships target-host ADO provisioning and live-validation runbooks as declarative documentation, never credentials or production-project access. Separate documentation and demo artifacts distinguish `source_ready` from `target_ready`.

**Tech Stack:** Markdown, Node.js source-only quality runner, existing BASS test harnesses and reports.

## Global Constraints

- `source_ready` is not `target_ready`.
- `target_ready` requires recorded isolated target-host ADO evidence.
- No production ADO credentials, tokens, secrets, or project details in BASS files.
- No Git initialization, commit, push, or publication without an actual Git repository and explicit release authority.
- Source demo uses a simulated ADO publication token only; it must not claim live publication.
- Documentation must distinguish verified facts from target-host prerequisites.

---

### Task 1: Quality Matrix and Source Readiness Runner

**Files:**
- Create: `BASS/quality/phase-1-test-matrix.md`
- Create: `BASS/quality/run-source-readiness.mjs`
- Create: `BASS/quality/expected-source-readiness.json`
- Create: `BASS/reports/phase-1-source-readiness.md`

**Interfaces:**
- Consumes: Existing D1-D11 source-only tests, reports, and documentation.
- Produces: Repeatable `source_ready` or blocked readiness outcome.

- [ ] **Step 1: Create matrix**

Create rows for every agent, command, canonical workflow, capability, fixture suite, source-only result, target-host validation requirement, owner, and readiness tier.

- [ ] **Step 2: Create source readiness runner**

Run documented Node source-only harnesses for D5-D11, verify required D1-D11 reports/guides/demo files exist, and emit normalized JSON with pass/fail, skipped target-host checks, and `source_ready` only when all portable checks pass.

- [ ] **Step 3: Verify readiness runner**

Run: `node BASS/quality/run-source-readiness.mjs`

Expected: A report states `source_ready` or an evidence-grounded blocked result; it never states `target_ready`.

### Task 2: Target-Host ADO Validation Bundle

**Files:**
- Create: `BASS/quality/ado-test-fixture.md`
- Create: `BASS/docs/target-host-ado-provisioning.md`
- Create: `BASS/docs/target-host-validation.md`

**Interfaces:**
- Consumes: Target-host Azure DevOps configuration and capability maps.
- Produces: Operator-run isolated ADO test setup and evidence checklist.

- [ ] **Step 1: Define declarative test fixture**

Specify test Work Item hierarchy, Wiki pages, repository/PR/commit/pipeline/deployment evidence, blocker scenarios, and reset identifiers without real URLs, credentials, or production data.

- [ ] **Step 2: Write provisioning runbook**

Document isolated project/work-item setup, least-privilege identity, capability mappings, cleanup, and reset. Explicitly prohibit production projects and BASS-stored credentials.

- [ ] **Step 3: Write live validation runbook**

Document exact target-ready checks: reads, confirmed Work Item operations, conflicts, MCP/permission failures, traceability, and full Feature-to-publication flow. Require saved evidence links and Action Log records.

### Task 3: Guides, Demo, and Phase 2 Backlog

**Files:**
- Create: `BASS/docs/ba-quick-start.md`
- Create: `BASS/docs/technical-installation.md`
- Create: `BASS/docs/command-catalogue.md`
- Create: `BASS/docs/context-and-evidence-guide.md`
- Create: `BASS/docs/contribution-guide.md`
- Create: `BASS/docs/source-demo.md`
- Create: `BASS/docs/target-host-demo.md`
- Create: `BASS/docs/phase-2-backlog.md`
- Create: `BASS/docs/release-checklist.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Audience-focused onboarding, reproducible demo, backlog, and truthful release checklist.

- [ ] **Step 1: Write focused guides**

Create BA, technical, command, context/evidence, and contribution guides. Link each from README and state readiness tier limitations.

- [ ] **Step 2: Create source and target-host demos**

Source demo covers Feature -> User Story -> review -> approved local persistence -> simulated ADO token. Target-host demo covers the same flow with isolated live ADO evidence and per-operation confirmation.

- [ ] **Step 3: Create ranked Phase 2 backlog**

Rank deferred/excluded capabilities and source-only hardening gaps by value, risk, and dependency.

- [ ] **Step 4: Create release checklist**

Require Git repository, intended remote, release authority, version, readiness tier, documentation, and target-host evidence before commit/publish. Report blocked publication otherwise.

### Task 4: D12 Acceptance Verification

**Files:**
- Verify: `BASS/quality/`
- Verify: `BASS/docs/`
- Verify: `BASS/reports/phase-1-source-readiness.md`
- Verify: `BASS/README.md`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Verified D12 closure with readiness-tier evidence.

- [ ] **Step 1: Run source readiness**

Run: `node BASS/quality/run-source-readiness.mjs`

Expected: `source_ready` only if every configured portable check passes; target-host checks remain explicitly pending.

- [ ] **Step 2: Validate documentation coverage**

Confirm all five guides, both demos, ADO runbooks, Phase 2 backlog, and release checklist exist and are linked from README.

- [ ] **Step 3: Validate no-overclaim policy**

Search D12 artifacts for `target_ready`, `published`, and `live ADO`. Confirm each is conditional on recorded target-host evidence and no document claims unavailable validation.

- [ ] **Step 4: Verify publication boundary**

Run: `git status --short`

Expected: The command reports no Git repository. Record publication as blocked; do not initialize Git.
