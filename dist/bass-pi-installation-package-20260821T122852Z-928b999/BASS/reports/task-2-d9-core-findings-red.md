# D9 Task 2 Core Findings RED Record

The separate source-only test `bass-ado-executor-core-findings.red-test.mjs` is expected to fail against the pre-repair runtime for these reasons:

1. The executor does not call `adapter.getCurrentSnapshot` immediately before dispatch and instead trusts `currentVersion`.
2. Dispatch exceptions, permission results, and partial results return before a canonical Action Log row is recorded.
3. `query/import` follows remote dispatch and has no atomic local artifact and baseline update path.
4. Create and import plans do not validate every mapped field against the Work Item type.
5. The comparator produces a local proposal when independently changed local and ADO values converge.

No live MCP, Azure DevOps, host installation, or network action is used by this test.
