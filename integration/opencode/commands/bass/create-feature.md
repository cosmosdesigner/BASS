---
description: Preview an evidence-grounded Feature; require approval before local persistence.
---

## Canonical Workflow

Explicit command entry point for **Create**. Target: one Feature in the selected
project. Gate: project, title, and cited context must be present and no material
conflict may affect the draft; otherwise `blocked`. Route: BASS -> Reader/Explorer as
needed -> Creator.

Interpret `$ARGUMENTS` as the selected BASS project, Feature title, cited D5 Context
Brief and/or D6 Discovery Report evidence, and optional assumptions. Require a
non-empty project, title, and cited evidence. Call `bass_creator_preview` with
`artifactType: feature` and the supplied values. Return its preview
conversationally, including claim classifications, sources, gaps, questions,
conflicts, write status, evidence-or-assumption-linked Given/When/Then criteria,
and any local-only ADO Work Item field preview.

Do not write an artifact, invoke an ADO or MCP tool, or describe the ADO preview as
publication. Ask for explicit approval of this specific preview before any local
persistence. Only BASS may then call the separate approved-payload persistence tool;
 if approval is absent or the preview is blocked, do not persist anything. This is a
 portable source-only workflow: do not install or modify host `.opencode/` files.

Return the uniform BASS response envelope. Include `## Approval` only when a ready
local preview needs explicit persistence approval.
