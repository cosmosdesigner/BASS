# Release Checklist

**Classification:** Release gate. **Confidence:** High for portable checks; publication state depends on actual environment evidence.

## Required Gate

- [ ] Record version and release scope.
- [ ] Run applicable source checks and retain actual output.
- [ ] Verify documentation, demos, quality matrix, and prior reports are current.
- [ ] Record the required readiness tier: `source_ready` or `target_ready`.
- [ ] For `target_ready`, retain the complete isolated target-host validation ledger and evidence.
- [ ] Confirm the current directory is an existing Git repository.
- [ ] Confirm the intended remote and release destination.
- [ ] Obtain explicit release authority for the version, scope, and destination.
- [ ] Review status and intended diff; commit and publish only after every applicable gate passes.

## Blocked Publication

If no Git repository, intended remote, release authority, required readiness evidence, or required validation exists, record `publication: blocked` with the missing gate. Do not initialize Git, create credentials, commit, push, tag, or claim publication. This workspace has no Git repository evidence until an operator supplies one.
