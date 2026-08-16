# BASS D4 OpenCode Foundation Design

## Status

Approved design for D4. This specification defines the installable OpenCode foundation for the BASS distribution.

## Agent Definitions

The portable runtime integration bundle is stored at `BASS/integration/opencode/agents/`. A target repository copies the contents of `BASS/integration/opencode/` into its own `.opencode/` directory, where OpenCode discovers the seven Markdown agent definitions. This distribution workspace's host `.opencode/` directory remains untouched.

| Agent | Role |
| --- | --- |
| `bass` | Sole user-facing orchestrator. Understands intent, selects workflows, delegates bounded work, consolidates results, and requests decisions or confirmations. |
| `reader` | Loads cited local and ADO context supplied through BASS. |
| `explorer` | Discovers related context, dependencies, gaps, conflicts, and questions. |
| `creator` | Drafts evidence-grounded BA artifacts and ADO publication previews. |
| `reviewer` | Evaluates artifacts for quality, provenance, and unresolved issues. |
| `editor` | Improves artifacts using the original artifact and review findings. |
| `executor` | Prepares and performs confirmed ADO Work Item operations and records outcomes. |

Each definition has OpenCode front matter that enforces its mode and permissions, followed by its role, allowed inputs, required outputs, permitted tools, prohibited actions, and communication boundary. `bass` is the only primary user-facing agent. Every specialist is an isolated subagent: it receives inputs only from BASS, returns outputs only to BASS, and must not invoke or communicate with another subagent. Non-Executor specialists deny edit and Azure DevOps write permissions. Executor is restricted to the intended Azure DevOps Work Item tools. BASS may delegate only to the six named specialists.

## Operating Policies

`BASS/AGENTS.md` provides concise BA operating principles and points to three focused policy documents in `BASS/rules/`:

| File | Policy |
| --- | --- |
| `orchestration.md` | BASS-only orchestration, isolated subagent boundaries, canonical workflow selection, and decision escalation. |
| `access-control.md` | Workspace and ADO read/write boundaries, host-owned MCP configuration, and confirmation requirements. |
| `provenance.md` | D3 evidence, classification, traceability, conflict, and lineage requirements. |

The policies require evidence-first analysis, distinguish facts from interpretations and proposals, prohibit invented content, and preserve unresolved questions and conflicts.

## Access Control

BASS and its subagents may read host-repository files needed to perform an approved workflow. They may write only inside `BASS/projects/<project-name>/` and BASS-owned distribution files. They must not modify host application code unless a later approved workflow explicitly expands this boundary.

The host repository owns the `azure-devops` MCP configuration and credentials. BASS must not ship credentials, tokens, or a duplicate MCP server definition.

When the host's `azure-devops` MCP is available, ADO read operations are permitted. The Executor is the only subagent authorized to perform an ADO write. Before every ADO write, BASS must ensure cited evidence and relevant decisions exist, show a clear operation preview or diff, and obtain explicit user confirmation. BASS records the outcome through the project Action Log.

## Diagnostic Command

`BASS/integration/opencode/plugins/bass-diagnose.ts` registers authoritative deterministic read-only tool `bass_diagnose`. It validates the project name before any filesystem lookup and returns the fixed, machine-parseable four-section response. Target users and automations requiring this exact contract invoke `bass_diagnose` directly. `BASS/integration/opencode/commands/bass/diagnose.md` defines `/bass diagnose` as a conversational convenience command that calls this tool exactly once and bases its response exclusively on the result; it does not promise verbatim or machine-parseable output:

1. Distribution structure status.
2. Selected BASS project and `context-registry.md` status.
3. `azure-devops` MCP availability.
4. Effective workspace and ADO read/write policy.

The tool rejects path separators and traversal components before any path lookup. It makes no local or ADO changes. Each response uses the four headings exactly, with separate `Status:`, `Observed condition:`, and `Next step:` lines. Missing configuration or incomplete context registry values are reported as actionable status and must not be silently ignored. D4 does not make live MCP calls; later deliverables own ADO-backed diagnostics and operations.

## Installation and Minimum Working Example

The installation guide instructs users to:

1. Copy `BASS/` into the target host repository.
2. Copy the contents of `BASS/integration/opencode/` into the target repository's `.opencode/` directory, preserving `agents/`, `commands/bass/diagnose.md`, and `plugins/bass-diagnose.ts` at OpenCode discovery paths.
3. Configure the host OpenCode environment with the `azure-devops` MCP server and required credentials.
4. Copy `BASS/projects/demo-customer-onboarding/` to `BASS/projects/<project-name>/`.
5. Replace the fictional values in the copied project's `project-context/context-registry.md` with official functional and technical ADO Wiki URLs.
6. Run `/bass diagnose` for conversational validation of the local distribution, project context, and effective access rules; invoke `bass_diagnose` directly when fixed machine-parseable output is required.

The guide states that the distribution contains no credentials and does not configure or duplicate the host's MCP server.

## D3 Compatibility Correction

The project-level Evidence Register, Decision Log, and ADO Action Log are provenance-bearing records. Each includes the D3 shared provenance block with a truthful classification, typed source objects, actor, date, confidence, source version, and related items.

## Acceptance Criteria

BASS can be copied into a repository, identify its distribution structure and selected project context, report `azure-devops` MCP availability, and clearly state the tools and access rules available to it. The foundation preserves the D1 orchestration and confirmation controls and the D3 provenance rules.
