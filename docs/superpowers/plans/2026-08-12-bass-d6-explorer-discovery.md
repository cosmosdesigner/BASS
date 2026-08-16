# BASS D6 Explorer and Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a portable Explorer workflow that discovers bounded local and mapped ADO context, dependencies, and knowledge gaps through an evidenced Discovery Report.

**Architecture:** A deterministic portable local discovery tool resolves AND-combined filters, one-hop local relationships, and a fixed node-and-edge Evidence Map. A separate deterministic discovery-capability validator produces safe Explorer permission fragments and a dispatch plan; Explorer uses only target-installed mapped read tools to enrich the local report, while unmapped or unavailable categories remain gaps.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown agent and command definitions, Markdown/YAML BASS project records.

## Global Constraints

- D6 supports filters: ID, URL, text, type, tag, state, area, and iteration; supplied filters combine with AND semantics.
- Local discovery searches only the selected BASS project.
- ADO traversal is one hop in each direction for hierarchy and `related`, `predecessor`, `successor`, and dependency relations.
- D6 excludes repository, pull-request, and pipeline discovery; D10 owns those categories.
- Explorer uses only independently verified exact read-only tools mapped in `ado-discovery-capabilities.md`.
- Explorer permissions deny `ado_*` first, then allow only valid mapped exact tools during target installation.
- Evidence Map nodes and edges include source, classification, confidence, and directness.
- Found information and inference are distinct; conflicts are isolated and cannot support dependency conclusions.
- Discovery is chat-first and creates no local output unless explicitly requested.
- Do not install runtime files into this workspace's host `.opencode/`.

---

### Task 1: Explorer Contract, Capability Template, and Command

**Files:**
- Modify: `BASS/integration/opencode/agents/explorer.md`
- Create: `BASS/templates/ado-discovery-capabilities-template.md`
- Create: `BASS/integration/opencode/commands/bass/discover.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Portable Explorer boundaries, target-host capability configuration, and `/bass discover` entry point.

- [ ] **Step 1: Update Explorer contract**

Keep Explorer hidden, read-only, unable to delegate, and unable to write ADO. Add target-host discovery categories: Work Item search/filter, hierarchy/relations, comments/history, and Wiki search/read. State repository, PR, and pipeline discovery are prohibited in D6.

- [ ] **Step 2: Create discovery capability template**

Create `ado-discovery-capabilities-template.md` with four sections. Each contains `tool_name`, `supported_input`, `verified_read_only`, and `verification_date`. Include instructions for ordered Explorer `ado_*` deny-then-exact-allow permissions.

- [ ] **Step 3: Create discover command**

Create `/bass discover` command template accepting `$ARGUMENTS`. It directs BASS to call `bass_discovery_report`, validate discovery capabilities, delegate mapped required categories to Explorer, and return the merged Discovery Report without local persistence.

- [ ] **Step 4: Update installation guide**

Document target installation mapping, exact safe tool names, independent partial mappings, Explorer permission synchronization, D6 exclusions, and unmapped-category gap behavior.

- [ ] **Step 5: Verify portable contract**

Run: `rg -n "search|hierarchy|relations|history|Wiki|repository|pull request|pipeline|ado_\*|bass_discovery_report" BASS/integration/opencode BASS/templates BASS/README.md`

Expected: D6 categories are explicit; D10 categories are excluded; command and mapping boundaries are documented.

### Task 2: Deterministic Local Discovery and Capability Validator

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-discovery-report.ts`
- Create: `BASS/integration/opencode/plugins/bass-discovery-report.js`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-discovery-capabilities.ts`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-discovery-capabilities.js`
- Create: `BASS/integration/opencode/plugins/bass-discovery-report.behavior-test.mjs`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-discovery-capabilities.behavior-test.mjs`

**Interfaces:**
- `bass_discovery_report` consumes `{ projectName?: string, filters: { id?: string, url?: string, text?: string, type?: string, tag?: string, state?: string, area?: string, iteration?: string } }`.
- It produces a fixed Discovery Report with Evidence Map nodes and edges plus source-linked findings, inferences, gaps, conflicts, risks, questions, and sources.
- `bass_validate_ado_discovery_capabilities` consumes project mapping and required discovery gaps; produces exact safe Explorer permission fragment and category dispatch plan.

- [ ] **Step 1: Validate inputs and selected project containment**

Reject traversal project names before filesystem access. Reject empty filter sets. Resolve only direct child projects using real-path containment and reject symlinks/junctions.

- [ ] **Step 2: Implement AND local filters**

Search only canonical Feature, nested User Story, and Idea directories. Apply every supplied filter as an AND requirement against YAML metadata and artifact body text where appropriate. Return blocked when no local item matches.

- [ ] **Step 3: Implement one-hop nodes and edges**

Create nodes for matched records, direct parent/children, and directly linked local evidence, decisions, outputs, Questions, and Conflicts. Create edges for parent/child, related local links, and explicit `ado_relation_references`. Do not traverse beyond one hop.

- [ ] **Step 4: Generate fixed Discovery Report**

Return exactly:

```markdown
# Discovery Report: <scope>

Status: ready | warning | blocked
Coverage: <searched and unavailable sources>

## Evidence Map
### Nodes
### Edges
## Found Information
## Inferences
## Gaps
## Conflicts
## Risks
## Questions
## Sources
```

Each node/edge and material claim includes source, classification, confidence, and directness. A local open Conflict is isolated from dependency conclusions.

- [ ] **Step 5: Emit mapped ADO discovery gaps**

Derive required categories from the scoped local records: configured Wiki registry, Work Item references, explicit relation references or linked Work Items, and `ado_comment` provenance. Add explicit gaps for required unmapped or locally unexecuted categories; exclude D10 technical categories.

- [ ] **Step 6: Implement capability validator**

Parse the four capability-map sections independently. Accept only exact safe tool identifiers matching `^[A-Za-z0-9_-]+$`, `verified_read_only: true`, nonempty supported input, and valid verification date. Return `ado_*` deny followed by valid exact allows and a required-category dispatch plan. Partial mappings are valid.

- [ ] **Step 7: Build JavaScript and behavior tests**

Generate JS from TS. Test TS-emitted and shipped JS parity for traversal rejection, AND filters, one-hop limits, conflicts, gaps, safe identifier rejection, partial mappings, and no MCP/mutation calls.

### Task 3: Discovery Fixtures and Expected Reports

**Files:**
- Create: `BASS/fixtures/d6-discovery/complete/`
- Create: `BASS/fixtures/d6-discovery/incomplete/`
- Create: `BASS/fixtures/d6-discovery/conflicting/`
- Create: `BASS/fixtures/d6-discovery/expected-complete-discovery-report.md`
- Create: `BASS/fixtures/d6-discovery/expected-incomplete-discovery-report.md`
- Create: `BASS/fixtures/d6-discovery/expected-conflicting-discovery-report.md`

**Interfaces:**
- Consumes: Deterministic local discovery tool from Task 2.
- Produces: Executable fixture corpus and exact expected Discovery Reports.

- [ ] **Step 1: Create complete discovery fixture**

Create a Feature with a direct User Story, evidence, Decision, output, and one direct relation. Expected report uses AND filters, one-hop node/edge map, found information, and no gaps/conflicts.

- [ ] **Step 2: Create incomplete discovery fixture**

Create an item with configured Wiki, Work Item, relations, and history requirements but no mapped live results. Expected report is `warning` with source-linked gaps, risks, and questions.

- [ ] **Step 3: Create conflicting discovery fixture**

Create local evidence and an ADO reference that disagree over a direct dependency. Expected report is `warning`, preserves a Conflict with both sources, and excludes the disputed edge from dependency conclusions.

- [ ] **Step 4: Verify fixture outputs**

Run: `rg -n "Status: (ready|warning)|### Nodes|### Edges|## (Found Information|Inferences|Gaps|Conflicts|Risks|Questions|Sources)|directness|classification|confidence" BASS/fixtures/d6-discovery`

Expected: Fixture inputs and expected reports cover all required D6 output sections and status cases.

### Task 4: D6 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/explorer.md`
- Verify: `BASS/integration/opencode/commands/bass/discover.md`
- Verify: `BASS/integration/opencode/plugins/bass-discovery-report.ts`
- Verify: `BASS/integration/opencode/plugins/bass-discovery-report.js`
- Verify: `BASS/integration/opencode/plugins/bass-validate-ado-discovery-capabilities.ts`
- Verify: `BASS/integration/opencode/plugins/bass-validate-ado-discovery-capabilities.js`
- Verify: `BASS/fixtures/d6-discovery/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that Explorer can answer what exists, direct dependencies, and gaps within a bounded scope.

- [ ] **Step 1: Run all source-only behavior suites**

Run Context Brief-independent D6 discovery and capability-validator behavior tests. Confirm TS/JS parity and exact expected report comparison for each fixture.

- [ ] **Step 2: Verify filters and traversal bounds**

Confirm AND filters reject partial matches; no-match is blocked; exact one-hop hierarchy and relation nodes are included; indirect nodes are excluded; project traversal and symlink paths are blocked.

- [ ] **Step 3: Verify report provenance and conflicts**

Confirm every node, edge, and material report claim has source, classification, confidence, and directness. Confirm conflict edges are isolated, no resolution is inferred, and risks/questions are preserved.

- [ ] **Step 4: Verify capability-map safety and dispatch behavior**

Confirm only valid exact read-only mapped names appear after `ado_*` deny; partial maps yield explicit gaps; repository/PR/pipeline tools are excluded. Confirm source-only testing does not claim live target-host MCP execution.

- [ ] **Step 5: Verify portable-only delivery**

Confirm all D6 runtime artifacts are under `BASS/integration/opencode/`. Do not create or install this workspace host `.opencode/` runtime paths. Run `git status --short`; do not initialize Git.
