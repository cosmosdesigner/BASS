# BASS D4 OpenCode Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make BASS installable in a host OpenCode repository with defined agent contracts, safe operating rules, a diagnostic command, and guided onboarding.

**Architecture:** `BASS/` owns workspace artifacts, templates, rules, project records, and the portable OpenCode bundle at `BASS/integration/opencode/`. A target repository copies that bundle into host `.opencode/`; its plugin supplies authoritative deterministic, machine-parseable `bass_diagnose` for target users and automations, while `/bass diagnose` is a conversational convenience prompt based exclusively on that tool result. The host owns the `azure-devops` MCP configuration and credentials; BASS validates availability but does not duplicate server configuration or retain secrets.

**Tech Stack:** OpenCode Markdown agent and command definitions, Markdown documentation, BASS workspace conventions.

## Global Constraints

- BASS is the sole user-facing orchestrator; Reader, Explorer, Creator, Reviewer, Editor, and Executor are isolated subagents.
- A subagent receives inputs only from BASS, returns outputs only to BASS, and never invokes or communicates directly with another subagent.
- BASS may read host repository files required by an approved workflow.
- BASS writes only within `BASS/projects/<project-name>/` and BASS-owned distribution files; it never modifies host application code unless a later approved workflow explicitly expands the boundary.
- The host owns the `azure-devops` MCP configuration and credentials. BASS must not define a duplicate server or ship credentials, tokens, or secrets.
- ADO reads are permitted only when `azure-devops` is available.
- Executor alone performs confirmed ADO writes. Every ADO write needs cited evidence, relevant decision context, preview/diff, and explicit user confirmation.
- `bass_diagnose` is the authoritative read-only API for fixed machine-parseable distribution, project/context, MCP, and effective access-policy status. `/bass diagnose` is a conversational convenience based exclusively on that tool result.
- D4 must preserve D1 orchestration/confirmation controls and D3 provenance controls.
- The distribution workspace's host `.opencode/` is not modified. Target repositories install the contents of `BASS/integration/opencode/` into host `.opencode/`.
- Agent Markdown front matter must set `description`, `mode`, and `permission`; `bass` is `primary`, while the six specialists are hidden `subagent` agents.
- The required portable command path is `BASS/integration/opencode/commands/bass/diagnose.md`; its installed path is `.opencode/commands/bass/diagnose.md`.
- `BASS/integration/opencode/plugins/bass-diagnose.ts` implements authoritative deterministic project validation and fixed four-section machine-parseable diagnostic formatting. Target users and automations invoke `bass_diagnose` directly for this contract. The slash command calls `bass_diagnose` exactly once and bases its conversational response exclusively on the result without promising verbatim output.

---

### Task 1: Agent Contracts

**Files:**
- Create: `BASS/integration/opencode/agents/bass.md`
- Create: `BASS/integration/opencode/agents/reader.md`
- Create: `BASS/integration/opencode/agents/explorer.md`
- Create: `BASS/integration/opencode/agents/creator.md`
- Create: `BASS/integration/opencode/agents/reviewer.md`
- Create: `BASS/integration/opencode/agents/editor.md`
- Create: `BASS/integration/opencode/agents/executor.md`

**Interfaces:**
- Produces: The complete D1 taxonomy as OpenCode agent instruction files.

- [ ] **Step 1: Define the primary BASS agent**

Create `bass.md` with front matter: `description`, `mode: primary`, and task permissions that deny `*` then allow exactly `reader`, `explorer`, `creator`, `reviewer`, `editor`, and `executor`. Add sections: Role, Inputs, Outputs, Permitted Tools, Prohibited Actions, and Collaboration Boundary. State that BASS alone is user-facing, selects canonical workflows, delegates bounded tasks, consolidates results, requests decisions, and requests explicit confirmation before every ADO Work Item write.

- [ ] **Step 2: Define the six isolated subagents**

Create one file for each named specialist using `mode: subagent`, `hidden: true`, a description, restrictive permissions, and the same six sections. State each specialist's bounded responsibility, BASS-provided inputs, BASS-returned outputs, read/write limits, and prohibition on direct subagent communication.

- [ ] **Step 3: Set Executor-only ADO write authority**

In `executor.md`, permit only intended ADO Work Item tool names and deny all other `ado_*` tools. State that Executor prepares and performs only one BASS-confirmed ADO Work Item operation and records the result. In every other specialist definition, deny `edit` and all `ado_*` tools.

- [ ] **Step 4: Verify agent contract coverage**

Read the seven files under `BASS/integration/opencode/agents/`.

Expected: `bass` has `mode: primary`; the six specialists have `mode: subagent` and `hidden: true`; all definitions remain portable source files. Do not install or discover them through this workspace's host `.opencode/`.

### Task 2: BA Principles and Focused Rules

**Files:**
- Modify: `BASS/AGENTS.md`
- Create: `BASS/rules/orchestration.md`
- Create: `BASS/rules/access-control.md`
- Create: `BASS/rules/provenance.md`

**Interfaces:**
- Consumes: D1 operating contract and D3 provenance design.
- Produces: Distribution-wide policy that agents and commands reference.

- [ ] **Step 1: Replace AGENTS placeholder with BA operating principles**

Include principles for evidence-first work, explicit classification, no invented content, preserving unresolved questions/conflicts, traceable changes, user confirmation for ADO writes, and references to all three rule files.

- [ ] **Step 2: Create orchestration rule**

Define BASS as sole orchestrator, all seven roles, hub-and-spoke communication, canonical workflow selection, and escalation of missing evidence/conflicts to the user.

- [ ] **Step 3: Create access-control rule**

State host-owned `azure-devops` MCP configuration/credentials; BASS read boundaries; BASS-owned write boundaries; ADO read availability; Executor-only ADO writes; preview/diff and explicit confirmation requirements; and Action Log recording.

- [ ] **Step 4: Create provenance rule**

Reference D3 classifications, typed sources, required evidence gaps and conflicts, lineage, and canonical Evidence, Decision, and Action Logs.

- [ ] **Step 5: Verify policy consistency**

Run: `rg -n "azure-devops|credentials|sole orchestrator|evidence-first|Question|Conflict|explicit confirmation|Action Log" BASS/AGENTS.md BASS/rules`

Expected: All mandatory operating, access, and provenance controls are present without contradictory write permissions.

### Task 3: Read-Only Diagnostic Command

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-diagnose.ts`
- Create: `BASS/integration/opencode/commands/bass/diagnose.md`

**Interfaces:**
- Consumes: BASS distribution root, `BASS/projects/<project-name>/project-context/context-registry.md`, and D4 access rules.
- Produces: The authoritative four-part fixed machine-parseable `bass_diagnose` report with actionable status and no writes; `/bass diagnose` is a conversational convenience based exclusively on that tool result.

- [ ] **Step 1: Define command metadata and invocation**

Create `bass_diagnose` as the authoritative deterministic local plugin tool, with optional `projectName` validation before filesystem access. Create `/bass diagnose [project-name]` as a portable conversational command using `$ARGUMENTS`; it calls `bass_diagnose` exactly once and bases its response exclusively on the result. If no project name is supplied, the tool selects the only project directory; if zero or more than one project exists, it reports that explicit selection is required.

- [ ] **Step 2: Specify four diagnostic report sections**

Require `bass_diagnose` to return exactly these headings:

```markdown
## Distribution Structure
## Project Context
## Azure DevOps MCP
## Effective Access Policy
```

For each tool section, report `ready`, `warning`, or `blocked`, the observed condition, and one actionable next step. Target users and automations invoke `bass_diagnose` directly when they require this exact machine-parseable contract; the slash command does not promise verbatim output.

- [ ] **Step 3: Define read-only checks and failure handling**

Check required local BASS directories/files, selected project and context registry, and explicit replacement of fictional/placeholder Wiki URLs. State that the plugin makes no mutations or MCP calls and reports Azure DevOps MCP as a host-setup/later-workflow warning rather than inspecting it. The command uses only the plugin result.

- [ ] **Step 4: Verify the diagnostic contract**

Read `BASS/integration/opencode/plugins/bass-diagnose.ts` and `BASS/integration/opencode/commands/bass/diagnose.md`.

Expected: the plugin validates before filesystem access, produces the fixed four-section report without mutations or MCP calls, and the command binds `$ARGUMENTS`, calls `bass_diagnose` exactly once, and is documented as conversational. Do not install or execute OpenCode runtime definitions in this workspace.

### Task 4: Installation Guide and Minimum Working Example

**Files:**
- Create: `BASS/README.md`

**Interfaces:**
- Consumes: BASS distribution, demo project, host `azure-devops` MCP, and `/bass diagnose`.
- Produces: Copy-in installation instructions and a repeatable minimum working example.

- [ ] **Step 1: Document installation prerequisites**

State that OpenCode is required, `azure-devops` must already be configured in the host environment, and BASS does not ship credentials or duplicate MCP configuration.

- [ ] **Step 2: Document installation and project creation**

Show exact end-user steps to copy `BASS/` into a target host repository, then copy the contents of `BASS/integration/opencode/` into that target's `.opencode/`, preserving `agents/`, `commands/bass/diagnose.md`, and `plugins/bass-diagnose.ts`; copy `projects/demo-customer-onboarding/` to `projects/<project-name>/`; and replace fictional values in `project-context/context-registry.md` with official functional and technical ADO Wiki URLs.

- [ ] **Step 3: Document the minimum working example**

Show `/bass diagnose <project-name>` as conversational validation and `bass_diagnose` as the exact fixed-output API for target users and automations. Explain that the D4 tool reports MCP as a host-setup/later-workflow warning and that ADO-backed work requires host configuration and authorization.

- [ ] **Step 4: Verify onboarding coverage**

Run: `rg -n "azure-devops|credentials|demo-customer-onboarding|context-registry.md|/bass diagnose|fictional|blocked" BASS/README.md`

Expected: Every prerequisite, copy step, context replacement, diagnostic step, and MCP ownership boundary is documented.

### Task 5: D4 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/`
- Verify: `BASS/integration/opencode/commands/bass/diagnose.md`
- Verify: `BASS/integration/opencode/plugins/bass-diagnose.ts`
- Verify: `BASS/AGENTS.md`
- Verify: `BASS/rules/`
- Verify: `BASS/README.md`

**Interfaces:**
- Consumes: Tasks 1 through 4.
- Produces: Evidence that BASS is installable and can identify its context and tools safely.

- [ ] **Step 1: Verify distribution completeness**

Run: `rg --files BASS/integration/opencode BASS | sort`

Expected: The portable bundle contains seven agent definitions, the command, and `bass-diagnose.ts`, alongside BASS rules, AGENTS.md, README.md, templates, and demo project. Do not install the bundle into this workspace host `.opencode/`.

- [ ] **Step 2: Verify agent roles and access boundaries**

Read all seven agent files. Confirm BASS is sole user-facing agent; every specialist is BASS-isolated; only Executor can write ADO; and no agent allows host application-code changes.

- [ ] **Step 3: Verify diagnose and onboarding behavior**

Read `BASS/integration/opencode/plugins/bass-diagnose.ts`, `BASS/integration/opencode/commands/bass/diagnose.md`, and `README.md`. Confirm `bass_diagnose` is the read-only authoritative fixed four-section API, the command receives `$ARGUMENTS`, calls the tool exactly once as a conversational convenience, the MCP/context handling is documented, and the guide provides a target-host-only installation path with host-owned MCP configuration.

- [ ] **Step 4: Verify no credentials or duplicate MCP definition exist**

Run: `rg -n "(token|password|secret|api[_-]?key|mcp.*azure-devops|azure-devops.*mcp)" BASS`

Expected: References only describe host-owned MCP configuration; no credential values or duplicate server configuration are present.

- [ ] **Step 5: Check Git availability without initializing a repository**

Run: `git status --short`

Expected: The command reports that the workspace is not a Git repository. Do not initialize Git; report that D4 cannot be committed from this workspace.
