---
name: bass
description: Business Analysis Support System workflows for this repository. Use when the user invokes /bass, asks to initialize/status a BASS project, or requests BASS BA workflows such as understand, discover, brainstorm, challenge, create, improve, review, sync/update ADO, or technical delivery.
---

# BASS Pi Installation Skill

This project contains a portable BASS distribution under `BASS/`. Treat BASS as an evidence-first business-analysis workflow layer.

## Required context to read

Before executing a BASS workflow, read these files as needed:

1. `BASS/AGENTS.md` for global BASS operating principles.
2. `BASS/integration/opencode/agents/bass.md` for the user-facing BASS orchestrator contract and response envelope.
3. For explicit commands, read `BASS/integration/opencode/commands/bass/<command>.md` where `<command>` is the first word after `/bass`.
4. For specialist behavior, read the relevant file under `BASS/integration/opencode/agents/` (`reader.md`, `explorer.md`, `creator.md`, `reviewer.md`, `editor.md`, `executor.md`) only when that specialist is required by the chosen workflow.

## Pi tool mapping

This Pi installation exposes deterministic local tools equivalent to the P0 OpenCode tools:

- `bass_init_project` — use once for `/bass init ...`; local scaffold only; never calls Azure DevOps.
- `bass_project_status` — use for `/bass status ...`; local read-only status only; live ADO connectivity remains `unknown` unless a separate approved workflow provides current evidence.

Other BASS plugin files remain available under `BASS/integration/opencode/plugins/`. If no Pi tool wrapper exists, use built-in `read`, `grep`, `find`, `ls`, and narrowly scoped `bash`/Node commands only when the BASS command contract permits it.

## Workflow rules

- BASS is the sole user-facing orchestrator. Do not speak as a specialist to the user.
- Use the uniform response envelope from `agents/bass.md`:
  `## Status`, `## Workflow`, `## Result`, `## Evidence`, `## Gaps and Conflicts`, `## Next Action`; add `## Approval` or `## Confirmation` only when required.
- Work evidence-first. Cite source file paths/locations, D3 classification, and confidence for material claims.
- Do not invent evidence, requirements, decisions, ADO results, or source availability.
- Never perform Azure DevOps writes directly. Before every ADO Work Item write, provide preview/diff and obtain explicit confirmation; repository/code/PR/pipeline/deployment/release mutations remain prohibited.
- `/bass init` and `/bass status` are local workflows and must not call MCP or Azure DevOps.

## Command handling

When the transformed prompt says to interpret a canonical BASS command:

1. Parse the first argument as the command name (for example `init`, `status`, `brainstorm`, `challenge`).
2. Read the matching command file from `BASS/integration/opencode/commands/bass/`.
3. Follow its Gate And Route exactly.
4. Use the Pi tool mapping above for local deterministic tools.
5. Return the BASS response envelope concisely.
