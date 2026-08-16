# Technical Installation

**Classification:** Fact for portable installation boundaries. **Confidence:** High.

1. Copy `BASS/` into the target repository root.
2. Copy `BASS/integration/opencode/` contents into target `.opencode/` discovery paths.
3. Configure the host-owned `azure-devops` MCP server and credentials outside BASS.
4. Copy the required capability templates to `project-context/`; map only exact, verified, least-privilege tools and retain deny-first permissions.
5. Set `BASS_TOKEN_SIGNING_KEY` only in the target-host secret environment before enabling D9 Work Item execution.
6. Run `/bass diagnose <project>`; run `node BASS/quality/run-source-readiness.mjs` from the distribution root for portable readiness evidence.

Do not put credentials, tokens, real target details, or host MCP configuration in BASS. Reader and Explorer use verified read-only mappings. Executor may make only individually confirmed Work Item operations; repository, code, PR, pipeline, deployment, and release mutations remain prohibited.

## Readiness

The runner can establish `source_ready` only. Host installation, mapped tool availability, permissions, and isolated live ADO evidence are prerequisites for a separately evaluated `target_ready` claim. Use [Target-Host ADO Provisioning](target-host-ado-provisioning.md) and [Target-Host Validation](target-host-validation.md).
