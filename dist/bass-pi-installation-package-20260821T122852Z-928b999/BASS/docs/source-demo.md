# Source Demo

**Classification:** Demonstration procedure. **Confidence:** High for local portable behavior; no live ADO claim.

## Preconditions

- Complete installation through the portable bundle.
- Use the included demo project or an equivalent local project context.
- Run `node BASS/quality/run-source-readiness.mjs`; record its actual result. A blocked result stops this as a readiness demonstration.

## Flow

1. Run `/bass diagnose demo-customer-onboarding` and retain the result.
2. Run `/bass understand demo-customer-onboarding`; cite available local context and retain gaps caused by fictional/non-live demo URLs.
3. Run `/bass create-feature` and `/bass create-us` to produce cited previews.
4. Run `/bass review <preview>`; resolve or explicitly waive Critical/Major findings through a Decision.
5. Explicitly approve a ready preview for local persistence and retain the provenance, approval, and resulting local artifact.
6. Request a Work Item publication plan. Inspect its field-level simulated ADO preview and plan token; do not represent either as an ADO call.

## Expected Result

The demonstration proves the source flow Feature -> User Story -> review -> approved local persistence -> simulated ADO publication token. It makes no network call and creates no live Work Item. This may contribute to `source_ready`, never `target_ready`.
