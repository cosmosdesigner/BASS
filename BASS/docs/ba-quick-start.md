# BA Quick Start

**Classification:** Fact for portable command behavior; Proposal for project-specific use. **Confidence:** High for the source bundle.

1. Install BASS and configure only verified host ADO mappings as described in the [README](../README.md).
2. Copy `BASS/projects/demo-customer-onboarding/` to a project directory and replace the fictional Wiki URLs with approved project URLs.
3. Run `/bass diagnose <project>` and resolve `blocked` results before a dependent workflow.
4. Use `/bass understand <project>` or `/bass discover <scope>` to obtain cited context; preserve gaps and conflicts.
5. Run `/bass create-feature` or `/bass create-us` for a preview. Review it with `/bass review`; approve local persistence only when ready.
6. Use `/bass create-ado` only after current mapped ADO evidence, a field-level preview, and explicit confirmation. Executor performs one confirmed Work Item operation.

Every response states evidence, gaps, and the next safe action. BASS does not infer missing requirements, resolve conflicts, or mutate repository, PR, pipeline, or deployment resources.

## Readiness

`source_ready` means portable source checks passed; it does not prove host ADO access or publication. `target_ready` requires recorded evidence from the isolated live-validation runbook. See [Source Demo](source-demo.md) and [Target-Host Demo](target-host-demo.md).
