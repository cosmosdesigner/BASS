# Contribution Guide

**Classification:** Proposal for contribution process; Fact for safety boundaries. **Confidence:** High.

Keep changes focused and evidence-first. Add or update an agent, workflow, command, plugin, or template only when its responsibility, inputs, outputs, permissions, provenance, tests, and failure behavior are explicit.

1. Preserve BASS orchestration: specialists receive bounded inputs and return to BASS.
2. Default ADO access to deny; allow only verified exact read-only mappings or Executor's confirmed Work Item mappings.
3. Never add credentials, host MCP configuration, production ADO details, or repository/PR/pipeline mutation capability.
4. Add behavior tests for executable changes and run the applicable source harnesses.
5. Update affected guides, quality matrix, and readiness requirements; do not turn `source_ready` evidence into a `target_ready` claim.

Submit an evidence-grounded change summary identifying tests run, unresolved gaps, and target-host validation still required. Release publication follows [Release Checklist](release-checklist.md); do not initialize Git or publish from an unprepared workspace.
