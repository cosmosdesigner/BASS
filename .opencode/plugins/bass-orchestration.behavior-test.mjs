import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { composeResponse } from "./bass-compose-response.js"
import { recommendNext } from "./bass-recommend-next.js"
import { routeWorkflow } from "./bass-route-workflow.js"

const citedEvidence = [{ type: "local_file", source: "context.md", location: "# Scope", classification: "Fact", confidence: "high", actor: "BASS", date: "2026-08-16", source_version: "v1", related_items: ["US-001"], claim: "The selected feature has an approved scope." }]
const signingKey = "test-target-host-key"
process.env.BASS_TOKEN_SIGNING_KEY = signingKey
function attestation(workflow, target, status = "ready", expiresAt = "2099-01-01T00:00:00.000Z") { const payload = { workflow, target, status, expiresAt }; return { ...payload, integrity: createHmac("sha256", signingKey).update(JSON.stringify(payload)).digest("hex") } }

function test(name, run) {
  try { run(); console.log(`PASS ${name}`) }
  catch (error) { console.error(`FAIL ${name}\n${error.stack}`); process.exitCode = 1 }
}

test("explicit commands take precedence and preserve the bounded specialist route", () => {
  const route = routeWorkflow({ command: "/bass create-feature", request: "find related work", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Create", "F-001", "approval_required")] } })
  assert.equal(route.status, "awaiting_approval")
  assert.equal(route.workflow, "Create")
  assert.deepEqual(route.specialistRoute, ["Reader", "Explorer", "Creator"])
})

test("unknown and injection-like commands are rejected without natural fallback", () => {
  const route = routeWorkflow({ command: "/bass create-feature; sync-ado", request: "create a feature", context: { target: "F-001", contextStatus: "ready" } })
  assert.equal(route.status, "blocked")
  assert.equal(route.error.code, "invalid_command")
})

test("natural write intent without a target asks one clarification instead of selecting a mutation", () => {
  const route = routeWorkflow({ request: "publish this to Azure DevOps", context: { contextStatus: "ready" } })
  assert.equal(route.status, "clarification_required")
  assert.equal(route.workflow, "Sync/Execute ADO")
  assert.match(route.clarification, /canonical item ID|artifact path/i)
})

test("natural read-only ties select the least-mutating workflow", () => {
  const route = routeWorkflow({ request: "review and assess the current artifact", context: { target: "US-001", contextStatus: "ready" } })
  assert.equal(route.status, "ready")
  assert.equal(route.workflow, "Review")
})

test("mixed natural read and write intent asks one clarification instead of selecting Review", () => {
  const route = routeWorkflow({ request: "review this artifact and publish it to ADO", context: { target: "US-001", contextStatus: "ready" } })
  assert.equal(route.status, "clarification_required")
  assert.equal(route.workflow, null)
  assert.match(route.clarification, /read-only|write-capable/i)
})

test("read workflows retain a partial-context warning while mutations are blocked", () => {
  const read = routeWorkflow({ command: "/bass understand", context: { target: "US-001", contextStatus: "partial" } })
  const write = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus: "partial" } })
  assert.equal(read.status, "warning")
  assert.equal(write.status, "blocked")
  assert.match(write.gates[0].reason, /context/i)
})

test("write-capable commands and natural routes require explicit context before specialist routing", () => {
  const command = routeWorkflow({ command: "/bass improve", context: { target: "US-001", attestations: [attestation("Improve", "US-001", "approved")] } })
  const natural = routeWorkflow({ request: "refine this artifact", context: { target: "US-001", attestations: [attestation("Improve", "US-001", "approved")] } })
  const ready = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus: "ready", attestations: [attestation("Improve", "US-001", "approved")] } })
  const partialRead = routeWorkflow({ command: "/bass understand", context: { target: "US-001", contextStatus: "partial" } })
  assert.equal(command.status, "blocked")
  assert.equal(command.error.code, "context_missing")
  assert.deepEqual(command.specialistRoute, [])
  assert.equal(natural.error.code, "context_missing")
  assert.equal(ready.status, "ready")
  assert.equal(partialRead.status, "warning")
})

test("mutation context status accepts only exact strings and rejects falsey values without routing", () => {
  for (const contextStatus of [undefined, null, "", false, 0, "READY", "unknown"]) {
    const route = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus, attestations: [attestation("Improve", "US-001", "approved")] } })
    assert.equal(route.status, "blocked")
    assert.equal(route.error.code, "context_missing")
    assert.deepEqual(route.specialistRoute, [])
  }
  for (const contextStatus of ["ready", "warning", "blocked", "partial"]) {
    const route = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus, attestations: [attestation("Improve", "US-001", "approved")] } })
    assert.notEqual(route.error?.code, "context_missing")
  }
})

test("mutation routes wait for applicable gates and never route Executor before an exact token", () => {
  const draft = routeWorkflow({ command: "/bass create-feature", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Create", "F-001", "approval_required")] } })
  const sync = routeWorkflow({ command: "/bass sync-ado", context: { target: "US-001", contextStatus: "ready", attestations: [attestation("Sync/Execute ADO", "US-001", "confirmation_required")] } })
  const confirmed = routeWorkflow({ command: "/bass sync-ado", context: { target: "US-001", contextStatus: "ready", attestations: [attestation("Sync/Execute ADO", "US-001", "confirmed")] } })
  assert.equal(draft.status, "awaiting_approval")
  assert.deepEqual(draft.specialistRoute, ["Reader", "Explorer", "Creator"])
  assert.equal(sync.status, "awaiting_confirmation")
  assert.deepEqual(sync.specialistRoute, [])
  assert.equal(confirmed.status, "ready")
  assert.deepEqual(confirmed.specialistRoute, ["Executor"])
})

test("mutation routing requires valid target-host signed gate attestations and ignores caller booleans", () => {
  const unsigned = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus: "ready", approvalConfirmed: true, evidenceStatus: "ready", decisionStatus: "ready", previewStatus: "ready", reviewStatus: "ready" } })
  const altered = { ...attestation("Improve", "US-001", "approved"), status: "approved" }
  altered.integrity = "bad"
  const wrongTarget = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus: "ready", attestations: [attestation("Improve", "US-002", "approved")] } })
  const valid = routeWorkflow({ command: "/bass improve", context: { target: "US-001", contextStatus: "ready", attestations: [attestation("Improve", "US-001", "approved")] } })
  assert.equal(unsigned.status, "blocked")
  assert.equal(altered.integrity, "bad")
  assert.equal(wrongTarget.status, "blocked")
  assert.equal(valid.status, "ready")
})

test("mutation targets require one canonical ID or canonical artifact path", () => {
  const multiple = routeWorkflow({ command: "/bass create-feature", context: { target: "F-001, F-002", contextStatus: "ready" } })
  const scope = routeWorkflow({ command: "/bass improve", context: { target: "all user stories", contextStatus: "ready" } })
  const canonical = routeWorkflow({ command: "/bass create-feature", context: { target: "features/F-001-login/feature.md", contextStatus: "ready", attestations: [attestation("Create", "features/F-001-login/feature.md", "approval_required")] } })
  assert.equal(multiple.status, "clarification_required")
  assert.equal(scope.status, "clarification_required")
  assert.equal(canonical.status, "awaiting_approval")
})

test("specialist failures block delegation with the failed stage", () => {
  const route = routeWorkflow({ command: "/bass review", context: { target: "US-001", contextStatus: "ready", specialist: { Reviewer: { status: "failed", reason: "artifact unreadable" } } } })
  assert.equal(route.status, "blocked")
  assert.equal(route.error.stage, "Reviewer")
  assert.match(route.error.safeNextAction, /failure context/i)
})

test("specialist failures preserve a complete structured failure context", () => {
  const route = routeWorkflow({ command: "/bass review", context: { target: "US-001", contextStatus: "ready", specialist: { Reviewer: { status: "failed", stage: "Reviewer", reason: "artifact unreadable", availableEvidence: citedEvidence, impact: "Review cannot continue.", safeNextAction: "Provide a readable artifact." } } } })
  assert.equal(route.error.stage, "Reviewer")
  assert.deepEqual(route.error.availableEvidence, citedEvidence)
  assert.equal(route.error.impact, "Review cannot continue.")
})

test("response composition returns six sections with cited evidence metadata", () => {
  const response = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], claim: "Artifact is reviewable." }, evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Review the findings." } })
  assert.deepEqual(response.sections, ["Status", "Workflow", "Result", "Evidence", "Gaps and Conflicts", "Next Action"])
  assert.match(response.markdown, /^## Status/m)
  assert.match(response.markdown, /source: context\.md; location: # Scope; classification: Fact; confidence: high/)
  assert.deepEqual(response.sources, citedEvidence)
})

test("response composition rejects material claims without complete provenance", () => {
  const response = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], claim: "Artifact is reviewable." }, evidence: [{ source: "context.md" }], gaps: [], conflicts: [], nextAction: "Review the findings." } })
  assert.equal(response.status, "blocked")
  assert.equal(response.error.code, "invalid_provenance")
})

test("response composition rejects raw material result gaps conflicts and invalid D3 classifications", () => {
  const rawResult = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: "Artifact is reviewable.", evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Review the findings." } })
  const rawGap = composeResponse({ workflowResult: { status: "warning", workflow: "Review", result: citedEvidence[0], evidence: citedEvidence, gaps: ["Missing source"], conflicts: [], nextAction: "Review the findings." } })
  const invalidClass = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: citedEvidence[0], evidence: [{ ...citedEvidence[0], classification: "Verified" }], gaps: [], conflicts: [], nextAction: "Review the findings." } })
  assert.equal(rawResult.error.code, "invalid_provenance")
  assert.equal(rawGap.error.code, "invalid_provenance")
  assert.equal(invalidClass.error.code, "invalid_provenance")
})

test("response provenance requires supported D3 source types including repository and commit", () => {
  const missingType = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], type: undefined }, evidence: [{ ...citedEvidence[0], type: undefined }], gaps: [], conflicts: [], nextAction: "Review." } })
  const unsupportedType = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], type: "internet" }, evidence: [{ ...citedEvidence[0], type: "internet" }], gaps: [], conflicts: [], nextAction: "Review." } })
  const technical = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], type: "ado_repository" }, evidence: [{ ...citedEvidence[0], type: "ado_repository" }, { ...citedEvidence[0], type: "ado_commit", location: "abc123" }], gaps: [], conflicts: [], nextAction: "Review." } })
  assert.equal(missingType.error.code, "invalid_provenance")
  assert.equal(unsupportedType.error.code, "invalid_provenance")
  assert.equal(technical.status, "ready")
})

test("response provenance requires complete D3 lineage and rejects non-D3 explicit input", () => {
  const incomplete = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], actor: undefined }, evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Review." } })
  const explicit = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: { ...citedEvidence[0], type: "explicit_input" }, evidence: [{ ...citedEvidence[0], type: "explicit_input" }], gaps: [], conflicts: [], nextAction: "Review." } })
  assert.equal(incomplete.error.code, "invalid_provenance")
  assert.equal(explicit.error.code, "invalid_provenance")
})

test("response composition adds only the required approval or confirmation section", () => {
  const approval = composeResponse({ workflowResult: { status: "ready_for_approval", workflow: "Create", result: { ...citedEvidence[0], claim: "Preview ready." }, evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Approve the preview.", requiresApproval: true } })
  const confirmation = composeResponse({ workflowResult: { status: "awaiting_confirmation", workflow: "Sync/Execute ADO", result: { ...citedEvidence[0], claim: "One operation is planned." }, evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Confirm the displayed operation.", requiresConfirmation: true } })
  assert.match(approval.markdown, /^## Approval/m)
  assert.doesNotMatch(approval.markdown, /^## Confirmation/m)
  assert.match(confirmation.markdown, /^## Confirmation/m)
})

test("response composition rejects conflicting or inapplicable approval and confirmation flags", () => {
  const conflicting = composeResponse({ workflowResult: { status: "ready", workflow: "Create", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Approve.", requiresApproval: true, requiresConfirmation: true } })
  const inapplicable = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Review.", requiresApproval: true } })
  assert.equal(conflicting.error.code, "invalid_gate")
  assert.equal(inapplicable.error.code, "invalid_gate")
})

test("response allows approval for an explicit Decision waiver in Review", () => {
  const waiver = composeResponse({ workflowResult: { status: "awaiting_approval", workflow: "Review", result: { ...citedEvidence[0], type: "local_file" }, evidence: [{ ...citedEvidence[0], type: "local_file" }], gaps: [], conflicts: [], nextAction: "Approve waiver.", requiresApproval: true, approvalGate: "decision_waiver" } })
  assert.equal(waiver.status, "awaiting_approval")
  assert.match(waiver.markdown, /^## Approval/m)
})

test("specialist failure renders stage reason evidence impact and safe action in the envelope", () => {
  const response = composeResponse({ workflowResult: { status: "blocked", workflow: "Review", result: { ...citedEvidence[0], claim: "Reviewer could not read the artifact." }, evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Provide a readable artifact.", specialistFailure: { stage: "Reviewer", reason: "artifact unreadable", availableEvidence: citedEvidence, impact: "Review cannot continue.", safeNextAction: "Provide a readable artifact." } } })
  const headings = [...response.markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1])
  assert.deepEqual(headings, ["Status", "Workflow", "Result", "Evidence", "Gaps and Conflicts", "Next Action"])
  assert.match(response.markdown, /Stage: Reviewer/)
  assert.match(response.markdown, /Reason: artifact unreadable/)
  assert.match(response.markdown, /Impact: Review cannot continue/)
  assert.match(response.markdown, /Safe next action: Provide a readable artifact/)
})

test("next returns one safe recommendation and rejects execution requests", () => {
  const envelope = composeResponse({ workflowResult: { status: "blocked", workflow: "Create", result: citedEvidence[0], evidence: citedEvidence, gaps: [{ ...citedEvidence[0], classification: "Question", claim: "Cited context is required." }], conflicts: [], nextAction: "Provide context.", gates: [{ state: "blocked", reason: "Cited context is required." }] } })
  const next = recommendNext({ envelope })
  const unsafe = recommendNext({ envelope, request: "execute the operation now" })
  assert.equal(next.status, "ready")
  assert.equal(next.recommendation, "Provide the cited context required to unblock Create.")
  assert.equal(Object.hasOwn(next, "execute"), false)
  assert.equal(unsafe.status, "blocked")
  assert.equal(unsafe.error.code, "execution_not_allowed")
})

test("next rejects execution synonyms and unsupported inputs without action", () => {
  const envelope = composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Review findings." } })
  for (const request of ["perform it", "do it", "run it", "apply it", "publish now", "synchronize it", "dispatch it", "trigger it", "submit it", "invoke it", "send it", "delete it", "remove it"]) {
    const result = recommendNext({ envelope, request, execute: true })
    assert.equal(result.status, "blocked")
    assert.equal(result.error.code, "execution_not_allowed")
    assert.equal(Object.hasOwn(result, "action"), false)
  }
  assert.equal(recommendNext({ envelope, extra: "untrusted" }).error.code, "invalid_input")
})

test("next requires a full envelope and prioritizes conflict, approval, then confirmation", () => {
  const incomplete = recommendNext({ envelope: { status: "ready", workflow: "Review" } })
  const conflict = composeResponse({ workflowResult: { status: "blocked", workflow: "Create", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [{ ...citedEvidence[0], classification: "Conflict", claim: "Sources disagree." }], nextAction: "Resolve conflict." } })
  const approval = composeResponse({ workflowResult: { status: "awaiting_approval", workflow: "Create", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Approve preview.", requiresApproval: true } })
  const confirmation = composeResponse({ workflowResult: { status: "awaiting_confirmation", workflow: "Sync/Execute ADO", result: citedEvidence[0], evidence: citedEvidence, gaps: [], conflicts: [], nextAction: "Confirm token.", requiresConfirmation: true } })
  assert.equal(incomplete.error.code, "invalid_envelope")
  assert.match(recommendNext({ envelope: conflict }).recommendation, /conflict/i)
  assert.match(recommendNext({ envelope: approval }).recommendation, /approve/i)
  assert.match(recommendNext({ envelope: confirmation }).recommendation, /confirm/i)
})

if (process.exitCode) process.exit(process.exitCode)
