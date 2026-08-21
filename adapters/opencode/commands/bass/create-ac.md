---
description: Preview a scoped acceptance-criteria update; require approval before local persistence.
---

## Canonical Workflow

Explicit command entry point for **Create**. Target: one existing Feature or User
Story's scoped acceptance criteria. Gate: require project, target, proposed criteria,
and cited context; unresolved material conflict blocks. Route: BASS -> Reader/Explorer
as needed -> Creator.

Interpret `$ARGUMENTS` as the selected BASS project, an existing target Feature or
User Story ID, a proposed Given/When/Then update, cited D5 Context Brief and/or D6
Discovery Report evidence, and optional assumptions. Require all four inputs. Call
`bass_creator_preview` with `artifactType: acceptance_criteria`, the target ID, and
the supplied values. Return only the scoped target acceptance-criteria update
preview and proposed changelog entry, including classifications, sources, gaps,
questions, conflicts, write status, and the target's standard Date, Version, Change,
Reason, and Related records changelog row.

Do not create a standalone acceptance-criteria record. Do not write an artifact, invoke an
ADO or MCP tool, or return an ADO publication preview. Ask for explicit approval of
this specific preview before any local persistence. Only BASS may then call the
separate approved-payload persistence tool; if approval is absent or the preview is
 blocked, do not persist anything. This is a portable source-only workflow: do not
 install or modify host `.opencode/` files.

Return the uniform BASS response envelope. Include `## Approval` only when a ready
scoped local update needs explicit persistence approval.
