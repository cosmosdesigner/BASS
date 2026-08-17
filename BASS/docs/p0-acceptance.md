# Phase 1 P0 Acceptance

P0 is complete at source level when all of the following are true:

- `/bass init` creates a clean project scaffold, refuses path escape/overwrite, never copies demo evidence, and never calls ADO.
- `/bass status` reports local context/artifact/evidence/review health and never presents local configuration as live ADO evidence.
- Natural language routes normal BA phrasing without requiring slash-command vocabulary.
- Brainstorm is distinct from Discover and returns non-persisting Proposal/Assumption options.
- Challenge reuses Reviewer and remains read-only.
- Existing Create/Review/Improve/ADO approval and confirmation gates remain intact.

Run the source-level P0 behavior suite with:

```bash
node BASS/integration/opencode/plugins/bass-p0.behavior-test.mjs
```

This suite validates local orchestration and deterministic project tooling only. Live Azure DevOps acceptance still requires the existing isolated target-host validation runbook and verified host-owned MCP configuration.
