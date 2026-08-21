---
name: bass-status
description: Show deterministic local BASS project health and one safe next action. Use for /bass status requests.
---

# BASS Status

Use the repository's deterministic local status workflow.

1. Read `AGENTS.md`, `README.md`, and the applicable files under `rules/`.
2. Inspect only the selected local BASS project under `BASS/projects/`.
3. Report context configuration, artifact counts, evidence classifications, review health, and explicit gaps.
4. Label live Azure DevOps connectivity as `unknown` unless current approved evidence exists.
5. Do not call Azure DevOps or mutate any file.
6. Return exactly one highest-priority next action.
