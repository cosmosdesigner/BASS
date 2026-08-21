# Task 1 D6 Explorer Contract, Capability Template, and Command Report

## Scope Completed

- Updated the portable hidden Explorer contract with read-only target-host ADO
  discovery categories: Work Item search/filtering, hierarchy/relations,
  comments/history, and Wiki search/read.
- Added the portable discovery-capability template with four independently mapped
  sections. Each section requires `tool_name`, `supported_input`,
  `verified_read_only`, and `verification_date`.
- Added `/bass discover`, which calls the deterministic local report tool,
  validates discovery capabilities, dispatches only mapped required categories to
  Explorer, merges successful cited extracts, and leaves unavailable categories as
  gaps without persistence.
- Documented target-host installation, exact safe tool names, partial mappings,
  ordered Explorer permission synchronization, D6 exclusions, and gap behavior.

## Portable and Access Boundaries

- All runtime artifacts are under `BASS/integration/opencode/`; no host
  `.opencode/` path was created or installed.
- Explorer remains hidden, read-only, unable to delegate, and unable to write
  local files or Azure DevOps resources.
- Explorer begins with `"ado_*": deny`. Target installation adds only validator-
  approved exact read-only tool-name allow rules after that deny.
- Repository, pull-request, and pipeline discovery are expressly prohibited for
  D6 and assigned to D10.

## Verification

The Task 1 portable contract search was run against the agent, command,
templates, and README. It confirms the required search, hierarchy/relations,
comments/history, Wiki, repository/pull-request/pipeline exclusion, `ado_*`, and
`bass_discovery_report` boundaries are present.

No target-host MCP invocation, ADO read, ADO write, or host `.opencode/`
installation occurred. Task 2 supplies the referenced deterministic report and
capability-validator plugins; this Task 1 command intentionally documents their
planned interfaces.
