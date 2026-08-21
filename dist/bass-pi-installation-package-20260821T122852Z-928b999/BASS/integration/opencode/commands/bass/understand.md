---
description: Concisely explain a selected BASS target from its Context Brief.
---

## Canonical Workflow

Explicit command entry point for **Understand**. Target: `$ARGUMENTS` must identify
an item, URL, local artifact, or sufficient search terms. Gate: target must be
unambiguous; missing ADO access remains a cited gap, not a block. Route: BASS ->
Reader, then BASS -> Explorer only when targeted discovery is needed.

Use the same full `/bass load-context` workflow for `$ARGUMENTS`, including its
Reader-mediated mapped ADO reads and merge rules. Return a concise explanation
derived only from the merged Context Brief and retain its inline sources. Preserve
unmapped, failed, or unauthorized ADO sources as gaps. Do not save an output
unless the user explicitly requests that the brief be saved.

Return the uniform BASS response envelope. Classify material statements with source,
location, D3 classification, and confidence; a partial result is `warning`.
