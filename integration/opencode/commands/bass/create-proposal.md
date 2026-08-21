---
description: Preview an evidence-grounded functional proposal; require approval before local persistence.
---

## Canonical Workflow

Explicit command entry point for **Create**. Target: one functional proposal in the
selected project. Gate: project, title, and cited context are required; unresolved
material conflict blocks. Route: BASS -> Reader/Explorer as needed -> Creator.

Interpret `$ARGUMENTS` as the selected BASS project, proposal title, cited D5
Context Brief and/or D6 Discovery Report evidence, optional assumptions, and an
optional explicit `promoteTo: feature` or `promoteTo: user_story` request. Require a
non-empty project, title, and cited evidence. Call `bass_creator_preview` with
`artifactType: proposal` and the supplied values. Return its preview
conversationally, including classifications, sources, gaps, questions, conflicts,
and write status. Return a local-only ADO Work Item field preview only for an
explicit valid promotion request.

Do not write an artifact, invoke an ADO or MCP tool, or describe an ADO preview as
publication. Ask for explicit approval of this specific preview before any local
persistence. Only BASS may then call the separate approved-payload persistence tool;
 if approval is absent or the preview is blocked, do not persist anything. This is a
 portable source-only workflow: do not install or modify host `.opencode/` files.

Return the uniform BASS response envelope. Include `## Approval` only when a ready
local preview needs explicit persistence approval.
