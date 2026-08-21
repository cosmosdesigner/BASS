# D10 Task 2 Technical Tools Verification

## Scope

Source-only verification of D10 Task 2 capability validation, technical report
classification, and approved technical-evidence persistence. No Azure DevOps,
MCP, network, or host installation is used.

## Red Evidence

Command:

```text
node BASS/adapters/opencode/plugins/bass-technical-delivery.behavior-test.mjs
```

Historical RED output was not retained as a standalone artifact. The following
failure was observed before the D3 source-type fix, but is reported here as
historical evidence rather than a reproducible current command result.
Persistence serialized normalized categories as invalid D3 types:

```text
AssertionError: persisted evidence must have D3 provenance frontmatter
```

The failing persisted record contained `type: pull_request`, `type: pipeline`,
and `type: deployment` instead of D3 source types.

## Green Evidence

Command:

```text
node BASS/adapters/opencode/plugins/bass-technical-delivery.behavior-test.mjs
```

Result:

```text
bass technical delivery behavioral contract passed
```

The suite verifies D10 category-to-D3 mappings in the persistence implementation
(`adapters/opencode/plugins/bass-persist-approved-technical-evidence.js:10,28-33`)
and behavioral contract (`adapters/opencode/plugins/bass-technical-delivery.behavior-test.mjs:117-131`):

- Repository/file: `ado_repository`.
- Pull request: `ado_pull_request`.
- Commit: `ado_commit`.
- Direct Work Item: `ado_work_item`.
- Pipeline/deployment: `ado_pipeline`.
- Unknown category or source mapping: persistence is blocked before writes.

The suite also verifies that `toString`, `constructor`, and `__proto__` are
blocked through a null-prototype category map and `Object.hasOwn` lookup. For
each unknown or inherited category it snapshots the Evidence Register bytes and
every technical-evidence record byte before persistence, then verifies no file
or register row changes after the blocked result.

It also verifies that persisted records and Evidence Register rows retain only
the mapped D3 source types.

## Verification Boundary

Verification is JS-only. TypeScript host-dependency compilation and emitted-JS
parity are unverified because local `@types/node` and `@opencode-ai/plugin`
declarations are unavailable. No typecheck or TS/JS parity claim is made.
