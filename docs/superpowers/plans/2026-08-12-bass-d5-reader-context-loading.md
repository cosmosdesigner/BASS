# BASS D5 Reader and Context Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a portable Reader workflow that produces bounded, source-linked Context Briefs for uniquely resolved BASS items.

**Architecture:** The portable integration bundle gains Reader capability guidance, deterministic local target/context inspection, and two conversational command templates. The deterministic local tool is authoritative for exact target resolution, relevance limits, fixture behavior, and Context Brief formatting; target-host ADO read capability names are configured during installation and only used after being verified as read-only.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown command and agent definitions, Markdown/YAML BASS project records.

## Global Constraints

- Reader loads in this order: local project context, resolved item, direct local evidence/decisions/outputs, functional and technical ADO Wiki, ADO Work Item, direct relations, relevant history.
- Default relevance is target plus direct links only; D5 performs no broad discovery or indirect hierarchy traversal.
- Target resolution accepts typed ID or exact title only and searches only selected-project Feature, nested User Story, and Idea records.
- Zero or multiple local matches return a blocked Context Brief; D6 owns broad discovery.
- Every material brief statement includes source reference, source location, D3 classification, and confidence.
- Missing ADO source, unavailable Wiki, missing Work Item, or insufficient permissions becomes an explicit source-linked gap, not an assumption.
- Context Brief is chat-first; save an `OUT-...` record only on explicit user request.
- `bass_context_brief` is the deterministic local API. `/bass load-context` and `/bass understand` are conversational convenience commands.
- Reader uses only target-host verified read-capability categories: Wiki page, Work Item, relation, and history/comment. It rejects unknown or write-capable ADO tools.
- Each project maps those categories in `project-context/ado-read-capabilities.md`; target installation copies its exact verified read-only tool names into Reader's ordered `ado_*` deny-then-allow permissions.
- Do not install the portable bundle into this workspace's host `.opencode/`.

---

### Task 1: Portable Reader Contract and Commands

**Files:**
- Modify: `BASS/integration/opencode/agents/reader.md`
- Create: `BASS/integration/opencode/commands/bass/load-context.md`
- Create: `BASS/integration/opencode/commands/bass/understand.md`
- Create: `BASS/templates/ado-read-capabilities-template.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: Reader permissions and conversational entry points for the deterministic Context Brief API.

- [ ] **Step 1: Update Reader's portable agent contract**

Keep Reader as a hidden subagent with no edit, bash, task delegation, or ADO write access. Add a `Target-host ADO read capability` section that permits only installation-verified tools in the categories Wiki page read, Work Item read, relation read, and history/comment read. State that unknown and write-capable MCP tools remain denied.

- [ ] **Step 2: Create load-context command template**

Create `BASS/integration/opencode/commands/bass/load-context.md` using `$ARGUMENTS`. Instruct BASS to call `bass_context_brief` once for the selected target, use only the result, and return the full Context Brief conversationally. State that it saves no output unless the user explicitly requests it.

- [ ] **Step 3: Create understand command template**

Create `BASS/integration/opencode/commands/bass/understand.md` using `$ARGUMENTS`. Instruct BASS to call `bass_context_brief` once, produce a concise explanation derived only from the returned brief, retain inline sources, and save nothing unless explicitly requested.

- [ ] **Step 4: Document installation-time ADO read capability configuration**

Add README guidance requiring target-host installers to map available `azure-devops` MCP read tools to the four D5 categories and verify none can mutate ADO resources before enabling Reader ADO access.

- [ ] **Step 5: Create the project ADO read-capability template**

Create `BASS/templates/ado-read-capabilities-template.md` with one entry each for Wiki, Work Item, relations, and history/comments. Each entry contains `tool_name`, `supported_input`, `verified_read_only`, and `verification_date`. State that installation must copy the four verified tool names into Reader's `ado_*` deny-then-allow permissions.

- [ ] **Step 6: Verify Reader and commands statically**

Run: `rg -n "read capability|Wiki|Work Item|relation|history|write-capable|bass_context_brief|save" BASS/integration/opencode/agents/reader.md BASS/integration/opencode/commands/bass BASS/README.md`

Expected: Reader denies write-capable ADO tools and both commands use the same Context Brief API without automatic local persistence.

### Task 2: Deterministic Local Context Brief Tool

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-context-brief.ts`
- Create: `BASS/integration/opencode/plugins/bass-context-brief.js`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-read-capabilities.ts`
- Create: `BASS/integration/opencode/plugins/bass-validate-ado-read-capabilities.js`

**Interfaces:**
- Consumes: `{ projectName?: string, target: string }`.
- Produces: A fixed Markdown Context Brief with Status, Coverage, Goal, State, Decisions, Evidence, Conflicts, Gaps, Questions, and Sources sections.

- [ ] **Step 1: Define target and project input validation**

Reject project names with slash, backslash, dot, traversal, or non-direct-child forms before filesystem access. Require a non-empty target. Return a blocked fixed-format Context Brief when input is invalid.

- [ ] **Step 2: Implement exact local target resolution**

Search only `features/<F-ID>-*/feature.md`, nested `features/*/user-stories/<US-ID>-*/user-story.md`, and `ideas/<IDEA-ID>-*/idea.md` under the selected project. Match target against YAML `id` or exact YAML `title`. Return blocked for zero or multiple matches.

- [ ] **Step 3: Implement ordered bounded local loading**

Load only: project context registry and functional/technical context files; resolved item; direct Markdown links from its Related Evidence and Decisions section; and direct parent/child item link when present. Do not recursively follow links or scan unrelated records.

- [ ] **Step 4: Generate the fixed Context Brief**

Return exactly:

```markdown
# Context Brief: <target>

Status: ready | warning | blocked
Coverage: <loaded and unavailable sources>

## Goal
## State
## Decisions
## Evidence
## Conflicts
## Gaps
## Questions
## Sources
```

Every nonempty material entry must include source path, location, classification, and confidence from record provenance. Use local evidence to populate sections and create explicit ADO gaps only for structural front-matter configuration: provenance `type: ado_wiki` requires Wiki read. An item Work Item ID/URL or provenance `type: ado_work_item` requires Work Item, direct relations, and relevant history reads using that Work Item reference. YAML `ado_relation_references` and provenance `type: ado_comment` are supplemental relation and history references or scope. Body text does not configure categories; unconfigured categories produce no gap.

- [ ] **Step 5: Implement status rules**

Return `ready` only when exact target resolution succeeds and no required source is unavailable. Return `warning` for a resolved target with source-linked gaps or conflicts. Return `blocked` for invalid input, unavailable/ambiguous target, or unavailable selected project.

- [ ] **Step 6: Build JavaScript from TypeScript and verify parity**

Generate `bass-context-brief.js` from the TypeScript source using the available transpiler. Verify both files contain target validation, direct-only search paths, all Context Brief headings, status rules, and no MCP call.

- [ ] **Step 7: Define Reader-mediated mapped ADO retrieval**

Update Reader and `/bass load-context` so BASS supplies Reader the deterministic local brief and project capability map. Reader validates each map entry as verified read-only, invokes only the categories represented by local brief gaps through its target-installed synchronized MCP allowlist, and returns cited result extracts to BASS. BASS merges only matching successful extracts; unmapped, failed, or unauthorized categories remain gaps. The deterministic plugin does not invoke MCP tools.

- [ ] **Step 8: Create deterministic capability validator**

Create TypeScript and JavaScript `bass_validate_ado_read_capabilities`. It parses the four capability sections, validates each independently configured mapping has `tool_name`, `supported_input`, `verified_read_only: true`, and `verification_date`, then returns the exact ordered Reader `ado_*` deny-then-allow permission fragment and a required-category dispatch plan from Context Brief gaps. It permits partial valid mappings and marks unmapped required categories as gaps. It does not invoke MCP tools.

### Task 3: D5 Fixtures and Expected Briefs

**Files:**
- Create: `BASS/fixtures/d5-context/complete/`
- Create: `BASS/fixtures/d5-context/incomplete/`
- Create: `BASS/fixtures/d5-context/contradictory/`
- Create: `BASS/fixtures/d5-context/expected-complete-context-brief.md`
- Create: `BASS/fixtures/d5-context/expected-incomplete-context-brief.md`
- Create: `BASS/fixtures/d5-context/expected-contradictory-context-brief.md`

**Interfaces:**
- Consumes: The deterministic Context Brief tool from Task 2.
- Produces: Minimal local projects that prove complete, incomplete, and contradictory behavior without live ADO dependencies.

- [ ] **Step 1: Create complete fixture**

Create a single exact Feature target with functional/technical local context, linked evidence, Decision, and no conflict/gap. Expected brief has `Status: ready` and source-linked Goal, State, Decisions, Evidence, and Sources content.

- [ ] **Step 2: Create incomplete fixture**

Create a single exact User Story target with local context but missing ADO Work Item support. Expected brief has `Status: warning`, an explicit Work Item gap with expected source, reason, impact, and next action.

- [ ] **Step 3: Create contradictory fixture**

Create a single exact Feature target with a linked open Conflict record preserving two competing sources. Expected brief has `Status: warning`, an unresolved Conflict, and no invented resolution.

- [ ] **Step 4: Add Question and flow-list coverage**

Add a directly linked Question record to one fixture. Its expected brief entry must retain the Question classification, confidence, source, location, and unresolved state. Add both `ado_relation_references: [relation/2]` and block-list syntax across fixtures.

- [ ] **Step 5: Verify fixture constraints**

Run: `rg -n "Status: (ready|warning)|## (Goal|State|Decisions|Evidence|Conflicts|Gaps|Questions|Sources)|classification: Conflict|evidence_gap:" BASS/fixtures/d5-context`

Expected: Fixture inputs and expected outputs demonstrate all three status cases and required Context Brief sections.

### Task 4: D5 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/reader.md`
- Verify: `BASS/integration/opencode/commands/bass/load-context.md`
- Verify: `BASS/integration/opencode/commands/bass/understand.md`
- Verify: `BASS/integration/opencode/plugins/bass-context-brief.ts`
- Verify: `BASS/integration/opencode/plugins/bass-context-brief.js`
- Verify: `BASS/fixtures/d5-context/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that Reader can explain a Feature or User Story through a bounded, evidenced brief before changes are proposed.

- [ ] **Step 1: Test complete fixture**

Invoke the deterministic tool implementation against the complete fixture. Confirm exact target resolution, `ready` status, required sections, and source-linked material claims.

- [ ] **Step 2: Test incomplete fixture**

Invoke the tool against the incomplete fixture. Confirm `warning` status, explicit unavailable ADO gap, no assumption, and source-linked local content remains present.

- [ ] **Step 3: Test contradictory fixture**

Invoke the tool against the contradictory fixture. Confirm `warning` status, conflict source references, open status, and no resolution is inferred.

- [ ] **Step 4: Test relevance and resolution limits**

Invoke with an unknown target, an ambiguous exact title, and a project traversal value. Confirm blocked output and no scan outside allowed project paths. Confirm the output does not include indirect fixture records.

- [ ] **Step 5: Test mapped ADO read behavior**

Use a controlled target-host test double to confirm only mapped verified read-only category tools are invoked, successful results replace their local gaps, and unmapped/failed/unauthorized categories remain source-linked gaps. Confirm Reader's target installation permission instructions use deny `ado_*` before the exact four allow rules.

- [ ] **Step 6: Verify portable-only delivery**

Confirm all D5 runtime artifacts are under `BASS/integration/opencode/`; do not create or install `.opencode/` runtime paths in this workspace. Run `git status --short`; do not initialize Git.
