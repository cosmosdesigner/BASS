# Omitted Wiki URL Initialization Design

## Goal

Allow `/bass init` to initialize a project when Functional and Technical ADO Wiki URLs are omitted.

## Scope

Normalize each omitted Wiki URL at the `/bass init` command-to-tool boundary to the empty string before invoking `bass_init_project`.

The existing initializer remains responsible for accepting empty URL values, writing the existing replacement markers to the context registry, and returning a warning envelope with one `Question` gap for each missing Wiki reference.

## Implementation

Update the command integration that parses `/bass init` arguments so absent Functional and Technical Wiki URL values are passed as `""`, never `undefined`. Do not require callers to supply placeholders and do not change valid URL validation.

Add a regression test that exercises the command/tool boundary with project slug and title `agentlab` and no Wiki URLs. It must confirm that initialization succeeds, the scaffold is created, and the response retains both missing-source gaps.

## Error Handling

Supplied URLs that fail the existing Azure DevOps Wiki URL validation remain blocked. Only omitted values are normalized.

## Verification

Run the focused regression test and the existing P0 behavior test suite. Confirm the omitted-URL result has warning status and two missing-source `Question` gaps.
