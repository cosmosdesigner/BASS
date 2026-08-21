---
name: bass
description: Business Analysis Support System workflows for Pi. Use when the user invokes /bass, asks to install/init/status a BASS project, or requests BASS BA workflows such as understand, discover, brainstorm, challenge, create, improve, review, sync/update ADO, or technical delivery.
---

# BASS Pi Skill

This Pi package bundles a portable BASS distribution at `../../BASS/` relative to this skill. Target repositories should also have a project-local `BASS/` directory for normal workflows.

## Installation handling

- If the user asks to install BASS into the current repository, use `bass_install_distribution`.
- If a BASS workflow is requested and `BASS/` is missing from the current repository root, explain that the bundled distribution must be installed first and offer to run `bass_install_distribution`.
- `/bass init` and `/bass status` are local workflows and must not call MCP or Azure DevOps.

## Required context to read

Before executing a BASS workflow, read these files as needed. Prefer the project-local path when `BASS/` exists in the current repository; otherwise use the bundled package path relative to this skill:

1. Project-local `BASS/AGENTS.md` or bundled `../../BASS/AGENTS.md`.
2. Project-local `BASS/integration/opencode/agents/bass.md` or bundled `../../BASS/integration/opencode/agents/bass.md`.
3. For explicit commands, read `BASS/integration/opencode/commands/bass/<command>.md` or bundled `../../BASS/integration/opencode/commands/bass/<command>.md`.
4. For specialist behavior, read the relevant file under `BASS/integration/opencode/agents/` only when required by the chosen workflow.

## Pi tool mapping

- `bass_install_distribution` — copies the bundled `BASS/` distribution into the current repository root; refuses overwrite by default.
- `bass_init_project` — initializes one contained BASS project scaffold; local filesystem only; never calls Azure DevOps.
- `bass_project_status` — deterministic local project health; read-only; live ADO connectivity remains `unknown` unless a separate approved workflow provides current evidence.

Other BASS plugin files remain available under `BASS/integration/opencode/plugins/`. If no Pi tool wrapper exists, use built-in `read`, `grep`, `find`, `ls`, and narrowly scoped `bash`/Node commands only when the BASS command contract permits it.

## Workflow rules

- BASS is the sole user-facing orchestrator. Do not speak as a specialist to the user.
- Use the uniform response envelope from `agents/bass.md`: `## Status`, `## Workflow`, `## Result`, `## Evidence`, `## Gaps and Conflicts`, `## Next Action`; add `## Approval` or `## Confirmation` only when required.
- Work evidence-first. Cite source file paths/locations, D3 classification, and confidence for material claims.
- Do not invent evidence, requirements, decisions, ADO results, or source availability.
- Never perform Azure DevOps writes directly. Before every ADO Work Item write, provide preview/diff and obtain explicit confirmation; repository/code/PR/pipeline/deployment/release mutations remain prohibited.

## Command handling

When the transformed prompt says to interpret a canonical BASS command:

1. Parse the first argument as the command name, for example `install`, `init`, `status`, `brainstorm`, or `challenge`.
2. For `install`, offer or use `bass_install_distribution` depending on the user's wording.
3. For other explicit commands, read the matching command file from project-local or bundled `BASS/integration/opencode/commands/bass/`.
4. Follow its Gate And Route exactly.
5. Use the Pi tool mapping above for local deterministic tools.
6. Return the BASS response envelope concisely.
