# Task 2 D5 Reader Integration Report

## Current Verification and Supersession

**Supersedes active interpretation of the historical sections below.**
`bass-reader-ado` runner behavior was removed and is not executed. Source-only
coverage executes only the deterministic local Context Brief behavior test, the
validator plan/parity behavior test, and Reader instruction/permission contract
assertions. No target-host MCP calls run in this workspace.

## Changes

- Added portable `bass-reader-ado` TypeScript and JavaScript integration.
- Reads project ADO mappings, accepts only verified read-only mapped names, and
  uses an injected runner for target-host invocation.
- Merges successful cited ADO results into matching local gaps; unmapped, failed,
  and unauthorized reads remain gaps.
- Added flow-style `ado_relation_references` parsing with JS/TS parity coverage.

## Verification

- `node BASS/adapters/opencode/plugins/bass-context-brief.behavior-test.mjs`
- `node BASS/adapters/opencode/plugins/bass-reader-ado.behavior-test.mjs`

Both commands passed. No MCP server or host installation was used.

## Execution-Boundary Revision

- Removed the unusable `bass-reader-ado` public plugin and runner test double.
- Reader-mediated ADO reads are now documented as target-host agent behavior:
  BASS supplies only the deterministic gaps and mapped categories, Reader uses its
  synchronized allowlist, returns cited extracts, and BASS merges matching results.
- Tests now verify the possible portable contracts, not an impossible plugin MCP
  invocation.

## Validator Correction

- Added deterministic `bass_validate_ado_read_capabilities` TypeScript and
  JavaScript tools. They validate independent category mappings, emit the ordered
  Reader permission fragment, and plan dispatch from local brief gaps without MCP.
- Reader and `/bass load-context` now use the validator dispatch plan. Partial
  valid maps are permitted; invalid or unmapped required categories remain gaps.

## Validator Review Fix Evidence

- `tool_name` is valid only when it is a single ASCII identifier containing letters,
  digits, `_`, or `-`. Wildcards, whitespace, quotes, slashes, punctuation, empty,
  and multiline injection values are rejected before permission-fragment emission.
- The validator TS/JS parity test now covers those unsafe inputs.
