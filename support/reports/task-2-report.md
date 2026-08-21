# D8 Task 2 Report: Reviewer, Improvement, and Approved Persistence Tools

## Delivered

- Rebuilt the D8 review, improvement, and approved-persistence tools in `BASS/adapters/opencode/plugins/`.
- Canonical artifact resolution rejects traversal, noncanonical paths, symbolic links, and junctions before artifact reads. Findings cite exact artifact path, line, and triggering section.
- Critical/Major waivers are accepted only from a canonical project `decisions/DEC-...` Decision record that contains the exact finding ID, rationale, and residual risk. Caller-supplied waiver objects do not waive a finding.
- JS and TypeScript entries retain plain function exports and expose OpenCode plugin registrations for `bass_review_artifact`, `bass_improve_artifact`, and `bass_persist_approved_improvement` through `@opencode-ai/plugin`.
- Improvement uses evidence-supported edits only, retains unsupported findings as explicit `needs_decision` entries, and automatically re-reviews before creating an approval-bound preview.
- Persistence verifies approval, issued preview/hash, current version, and complete payload. It writes typed Evidence, Decision, and Action register entries and an immutable `OUT-...` record containing the original report, applied changes, unresolved/waived findings, approval context, and re-review.
- Transaction failure injection after artifact, Evidence, Decision, Action, output, and cleanup stages restores the original artifact and all register bytes.

## TDD Evidence

RED tests ran before runtime replacement:

- `node BASS/adapters/opencode/plugins/bass-review-artifact.behavior-test.mjs` failed because traversal normalized to an allowed read.
- `node BASS/adapters/opencode/plugins/bass-improve-artifact.behavior-test.mjs` failed because the unresolved entry was not explicitly labeled `needs_decision`.
- `node BASS/adapters/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs` failed because the immutable record omitted required original-report, unresolved/waived, and approval sections.

GREEN verification:

- `node BASS/adapters/opencode/plugins/bass-review-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-improve-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs` passed.

## Header-Position TDD Cycle

RED before correction:

- The persistence suite constructed `# Evidence Register` with a malformed first table and a later valid-looking decoy. The broad header scan accepted the decoy and persisted an improvement.

GREEN verification:

- Header validation now resolves the exact `# Evidence Register`, `# Decision Log`, or `# Action Log` heading and validates the first nonblank line immediately following it as the canonical table header. Later tables are ignored.
- The decoy test confirms blocked persistence, byte-identical artifact/registers, and no output record.
- `node BASS/adapters/opencode/plugins/bass-review-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-improve-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs` passed.

## Remaining-Finding TDD Cycle

RED before correction:

- Persistence behavior accepted a caller-supplied `pass` re-review and issued a token for revised Markdown whose trusted canonical review contained a Major testability finding.
- Register headers were not validated before staging, so malformed canonical register structures could reach the transaction path.

GREEN verification:

- `issueImprovementPreview` now invokes `bass-review-artifact` directly over the canonical project context and revised Markdown. It stores that trusted automatic re-review and denies issuance for blocked reviews, invalid canonical resolution, or `needs_decision` items; caller report fields cannot override it.
- Persistence validates exact canonical header cells for Evidence, Decision, and Action registers before creating staging files or output directories. The malformed-header test confirms blocked status, byte-identical artifact/registers, and no immutable output record.
- `node BASS/adapters/opencode/plugins/bass-review-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-improve-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs` passed.
- Review behavior verifies an emitted TypeScript entry point delegates identically to the shipped JS runtime. TypeScript reports only the expected absent local `@opencode-ai/plugin` declarations while emitting output; OpenCode supplies that host dependency.

## Constraints

- No remote, MCP, ADO, network, host `.opencode/` installation, or Git initialization was used.

## Review-Fix TDD Cycle

RED before each correction:

- Stable identity: review behavior failed with ordinal `REV-001` rather than a stable check/location/evidence-fingerprint-derived identity.
- Approval bypass: persistence behavior received a nonempty preview ID from exported `issueImprovementPreview` for a blocked Major re-review.
- Register schemas: persistence behavior rejected the incomplete placeholder rows against the canonical Evidence (8 columns), Decision (8 columns), and Action (10 columns) headers.
- TS parity: the prior test copied shipped JS over emitted output. The replacement test initially exposed output-name collision when compiling JS and TS together; it now compiles actual TS entries only, keeps emitted files intact, and imports them with their runtime sidecars.

GREEN verification:

- Stable findings use `REV-<16 hex>` derived from SHA-256 over check, canonical artifact-relative line location, and evidence; waiver Decisions must additionally match check, location, and the full evidence fingerprint. Reordering a different finding cannot waive it.
- Exported issuance rejects blocked/unwaived Critical/Major or `needs_decision` re-reviews, so no persistable token exists for bypass callers.
- Persisted rows now match canonical headers and retain typed `local_file` source, confidence where the Evidence schema supports it, actor/date where the Decision/Action schemas require them, completion status, and immutable record links.
- `node BASS/adapters/opencode/plugins/bass-review-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-improve-artifact.behavior-test.mjs` passed.
- `node BASS/adapters/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs` passed.
