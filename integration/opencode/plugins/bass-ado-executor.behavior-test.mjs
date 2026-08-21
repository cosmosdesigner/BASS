import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateAdoWriteCapabilities } from "./bass-validate-ado-write-capabilities.js";
import plannerRuntime from "./bass-plan-ado-operation.js";
import { compareAdoSync } from "./bass-compare-ado-sync.js";
import executorRuntime, { BassExecuteConfirmedAdoOperationPlugin, consumed, executeConfirmedAdoOperation as rawExecuteRuntime } from "./bass-execute-confirmed-ado-operation.js";
import { canonical, createExecutorHarness, createPlannerHarness, hash } from "../../../test-support/d9/executor-harness.mjs";
const dispatchDurability = { syncFile: () => "fsynced", syncDirectory: () => "fsynced" };
const tokenSigningKey = "source-only-test-token-signing-key";
process.env.BASS_TOKEN_SIGNING_KEY = tokenSigningKey;
const suiteTrustedContext = { directory: mkdtempSync(join(tmpdir(), "bass-d9-trusted-")), projectId: "source-only" };
const planRuntime = plannerRuntime.planAdoOperation;
assert.equal(plannerRuntime.createPlannerForTrustedContext, undefined); assert.equal(executorRuntime.createExecutorForTrustedContext, undefined);
const planAdoOperation = createPlannerHarness(suiteTrustedContext);
const executeRuntime = createExecutorHarness(suiteTrustedContext);
const executeConfirmedAdoOperation = (input) => executeRuntime({ ...input, dispatchDurability: input.dispatchDurability || dispatchDurability, recoveryDurability: input.recoveryDurability || dispatchDurability, outcomeDurability: input.outcomeDurability || dispatchDurability });

const executorPlugin = await BassExecuteConfirmedAdoOperationPlugin(suiteTrustedContext);
const executorTool = executorPlugin.tool.bass_execute_confirmed_ado_operation;
for (const key of ["recoveryRoot", "recoveryPath", "dispatchDurability", "recoveryDurability", "outcomeDurability"]) assert.ok(executorTool.args[key], `JS tool args include ${key}`);

const capabilities = {
  create: { toolName: "ado_create_work_item", operation: "create_work_item", resourceType: "work_item", supportedInput: "workItemType,fields", verifiedReadWrite: true, verificationDate: "2026-08-15" },
  fields: { toolName: "ado_update_work_item_field", operation: "update_field", resourceType: "work_item", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" },
  "query/import": { toolName: "ado_import_work_item_field", operation: "import_field", resourceType: "work_item", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" }
};
const fields = { title: { adoFieldReference: "System.Title", supportedWorkItemTypes: ["Feature"], verificationStatus: "verified" } };
const validation = validateAdoWriteCapabilities({ capabilities, fields });
assert.equal(validation.status, "ready");
assert.deepEqual(validation.executorPermissions, ["ado_*: deny", "ado_create_work_item: allow", "ado_import_work_item_field: allow", "ado_update_work_item_field: allow"]);
assert.equal(validateAdoWriteCapabilities({ capabilities: { fields: { ...capabilities.fields, toolName: "ado_update_repo" } }, fields }).status, "blocked");

const operation = { category: "fields", kind: "update_field", workItemType: "Feature", target: { workItemId: "42", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "42", version: "7" }, changes: [{ field: "title", before: "Old", after: "New" }] };
const untrustedStore = join(tmpdir(), "bass-d9-untrusted-store");
const untrustedPlan = planRuntime({ validation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
assert.equal(untrustedPlan.status, "blocked"); assert.equal(untrustedPlan.token, undefined); assert.equal(existsSync(untrustedStore), false);
const callerTrustedPlan = planRuntime({ validation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], trustedContext: suiteTrustedContext, now: "2026-08-15T00:00:00.000Z" });
assert.equal(callerTrustedPlan.status, "blocked"); assert.equal(callerTrustedPlan.token, undefined);
const plan = planAdoOperation({ validation, operation, evidence: [{ id: "EVD-001", source: "evidence-register.md", location: "row 1" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z", ttlMs: 60000 });
assert.equal(plan.status, "ready_for_confirmation");
assert.equal(plan.token.operation.changes.length, 1);
assert.equal(planAdoOperation({ validation, operation: { ...operation, snapshot: { status: "stale", workItemId: "42", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"] }).status, "blocked");
assert.equal(planAdoOperation({ validation, operation: { ...plan.token.operation, changes: [{ field: "title", before: "a", after: "b" }, { field: "title", before: "b", after: "c" }] }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"] }).status, "blocked");
const entrypointPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "entrypoint", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "entrypoint", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let entrypointDispatches = 0;
const entrypointLog = join(mkdtempSync(join(tmpdir(), "bass-d9-entrypoint-")), "action-log.md");
writeFileSync(entrypointLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const entrypointOutcome = await executorTool.execute({ token: entrypointPlan.token, confirmation: entrypointPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "entrypoint", version: "7" }), dispatch: () => { entrypointDispatches++; return { status: "succeeded" }; } }, actionLogPath: entrypointLog, recoveryRoot: tmpdir(), recoveryPath: join(tmpdir(), "bass-d9-entrypoint-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(entrypointOutcome.status, "succeeded"); assert.equal(entrypointDispatches, 1);

const comparison = compareAdoSync({ fields: ["title"], baseline: { title: "Base" }, local: { title: "Local" }, ado: { title: "ADO" } });
assert.equal(comparison.conflicts[0].classification, "Conflict");
assert.equal(compareAdoSync({ fields: ["title"], baseline: { title: "Base" }, local: { title: "Local" }, ado: { title: "Base" } }).localOnly.length, 1);
assert.equal(compareAdoSync({ fields: ["title"], baseline: { title: "Base" }, local: { title: "Base" }, ado: { title: "ADO" } }).adoOnly[0].direction, "ado_to_local");

const root = mkdtempSync(join(tmpdir(), "bass-d9-"));
const actionLog = join(root, "action-log.md");
writeFileSync(actionLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const calls = [];
const adapter = { getCurrentSnapshot: (target) => ({ workItemId: target.workItemId, version: target.version }), dispatch: (request) => { calls.push(request); return { status: "succeeded", targetVersion: "8", result: "updated" }; } };
const executed = executeConfirmedAdoOperation({ token: plan.token, confirmation: plan.token.confirmation, validation, adapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery.md"), outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(executed.status, "succeeded");
assert.equal(calls.length, 1);
assert.match(readFileSync(actionLog, "utf8"), /\| ACT-D9-/);
assert.equal(executeConfirmedAdoOperation({ token: plan.token, confirmation: plan.token.confirmation, validation, adapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery.md"), now: "2026-08-15T00:00:30.000Z" }).status, "blocked");
assert.equal(executeConfirmedAdoOperation({ token: { ...plan.token, integrityHash: "tampered" }, confirmation: plan.token.confirmation, validation, adapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery.md"), now: "2026-08-15T00:00:30.000Z" }).status, "blocked");

const concurrent = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "45", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "45", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
assert.equal(executeConfirmedAdoOperation({ token: concurrent.token, confirmation: concurrent.token.confirmation, validation, adapter: { ...adapter, getCurrentSnapshot: (target) => ({ workItemId: target.workItemId, version: "8" }) }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery.md"), now: "2026-08-15T00:00:30.000Z" }).status, "blocked");
assert.equal(calls.length, 1);

const second = planAdoOperation({ validation, operation: { ...plan.token.operation, target: { workItemId: "43", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "43", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z", ttlMs: 1 });
assert.equal(executeConfirmedAdoOperation({ token: second.token, confirmation: second.token.confirmation, validation, adapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery.md"), now: "2026-08-15T00:01:00.000Z" }).status, "blocked");
const recordFailure = planAdoOperation({ validation, operation: { ...plan.token.operation, target: { workItemId: "44", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "44", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
const recordFailureLog = join(root, "record-failure.md"); writeFileSync(recordFailureLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const failure = executeConfirmedAdoOperation({ token: recordFailure.token, confirmation: recordFailure.token.confirmation, validation, adapter, actionLogPath: recordFailureLog, recoveryRoot: root, recoveryPath: join(root, "recovery.json"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, failRecording: true, now: "2026-08-15T00:00:30.000Z" });
assert.equal(failure.status, "remote_succeeded_local_recording_failed");
assert.equal(calls.length, 2);
const createPlan = planAdoOperation({ validation, operation: { category: "create", kind: "create_work_item", workItemType: "Feature", target: { workItemId: "new-create", version: "new" }, changes: [{ field: "title", after: "Created" }] }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let freshCreateDispatches = 0;
const createOutcome = executeConfirmedAdoOperation({ token: createPlan.token, confirmation: createPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => { throw new Error("create must not read a current snapshot"); }, dispatch: () => { freshCreateDispatches++; return { status: "succeeded", targetVersion: "1", result: "created" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "create-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(createOutcome.status, "succeeded"); assert.equal(freshCreateDispatches, 1); assert.match(readFileSync(actionLog, "utf8"), /create_work_item/);
const restartPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "restart", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "restart", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let restartDispatches = 0;
const restartAdapter = { getCurrentSnapshot: () => ({ workItemId: "restart", version: "7" }), dispatch: () => { restartDispatches++; return { status: "succeeded", targetVersion: "8", result: "updated" }; } };
assert.equal(executeConfirmedAdoOperation({ token: restartPlan.token, confirmation: restartPlan.token.confirmation, validation, adapter: restartAdapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "restart-recovery"), now: "2026-08-15T00:00:30.000Z" }).status, "succeeded");
consumed.clear();
assert.equal(executeConfirmedAdoOperation({ token: restartPlan.token, confirmation: restartPlan.token.confirmation, validation, adapter: restartAdapter, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "restart-recovery"), now: "2026-08-15T00:00:31.000Z" }).status, "blocked"); assert.equal(restartDispatches, 1);
const concurrentPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "concurrent-log", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "concurrent-log", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let concurrentDispatches = 0;
const concurrentOutcome = executeConfirmedAdoOperation({ token: concurrentPlan.token, confirmation: concurrentPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "concurrent-log", version: "8" }), dispatch: () => { concurrentDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "concurrent-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(concurrentOutcome.status, "blocked"); assert.equal(concurrentDispatches, 0); assert.match(readFileSync(actionLog, "utf8"), /concurrent_version/); assert.match(readFileSync(actionLog, "utf8"), /EVD-001/); assert.match(readFileSync(actionLog, "utf8"), /DEC-001/);
for (const scenario of [
  { id: "marker-file-fsync", durability: { syncFile: () => { throw new Error("file fsync unavailable"); }, syncDirectory: () => "ok" } },
  { id: "marker-directory-fsync", durability: { syncFile: () => "ok", syncDirectory: () => false } },
  { id: "marker-recovery-retained", durability: { syncFile: (path) => { if (path.includes("action-log.md")) throw new Error("marker fsync unavailable"); return "ok"; }, syncDirectory: () => "ok" }, recoveryFile: true }
]) {
  const markerPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: scenario.id, version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: scenario.id, version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
  let dispatches = 0;
  const outcome = executeConfirmedAdoOperation({ token: markerPlan.token, confirmation: markerPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: scenario.id, version: "7" }), dispatch: () => { dispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, `${scenario.id}-recovery`), dispatchDurability: scenario.durability, now: "2026-08-15T00:00:30.000Z" });
  assert.equal(outcome.status, "dispatch_preflight_durability_failed", scenario.id); assert.equal(dispatches, 0, scenario.id); assert.equal(outcome.recoveryRetained, true, scenario.id); if (scenario.recoveryFile) assert.equal(existsSync(outcome.recoveryPath), true, scenario.id);
}
const defaultMarkerPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "marker-default", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "marker-default", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let defaultMarkerDispatches = 0;
const defaultMarkerOutcome = executeRuntime({ token: defaultMarkerPlan.token, confirmation: defaultMarkerPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "marker-default", version: "7" }), dispatch: () => { defaultMarkerDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "marker-default-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(defaultMarkerOutcome.status, "dispatch_preflight_durability_unavailable"); assert.equal(defaultMarkerDispatches, 0);
const recoveryDurabilityPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "recovery-durability", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "recovery-durability", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let recoveryDurabilityDispatches = 0;
const recoveryDurabilityOutcome = executeConfirmedAdoOperation({ token: recoveryDurabilityPlan.token, confirmation: recoveryDurabilityPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "recovery-durability", version: "7" }), dispatch: () => { recoveryDurabilityDispatches++; return { status: "succeeded", result: "remote succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "recovery-durability-recovery"), dispatchDurability, recoveryDurability: { syncFile: () => { throw new Error("recovery fsync unavailable"); }, syncDirectory: () => "ok" }, failRecording: true, now: "2026-08-15T00:00:30.000Z" });
assert.equal(recoveryDurabilityOutcome.status, "remote_outcome_recovery_durability_failed"); assert.equal(recoveryDurabilityOutcome.remote.status, "succeeded"); assert.equal(recoveryDurabilityDispatches, 1); assert.equal(recoveryDurabilityOutcome.recoveryDurable, false);
const malformedExpiry = structuredClone(plan.token); malformedExpiry.expiresAt = "not-a-date"; malformedExpiry.integrityHash = hash(canonical(malformedExpiry)); malformedExpiry.confirmation = `confirm:${malformedExpiry.tokenId}:${malformedExpiry.integrityHash}`;
let malformedExpirySnapshots = 0, malformedExpiryDispatches = 0;
const malformedExpiryOutcome = executeRuntime({ token: malformedExpiry, confirmation: malformedExpiry.confirmation, validation, adapter: { getCurrentSnapshot: () => { malformedExpirySnapshots++; return { workItemId: "42", version: "7" }; }, dispatch: () => { malformedExpiryDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "malformed-expiry-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(malformedExpiryOutcome.status, "blocked"); assert.equal(malformedExpirySnapshots, 0); assert.equal(malformedExpiryDispatches, 0);
const issuerPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "issuer-bound", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "issuer-bound", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let issuerDispatches = 0, issuerSnapshots = 0;
const issuerAdapter = { getCurrentSnapshot: () => { issuerSnapshots++; return { workItemId: "issuer-bound", version: "7" }; }, dispatch: () => { issuerDispatches++; return { status: "succeeded" }; } };
const issuerLog = join(root, "issuer-legitimate.md"); writeFileSync(issuerLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const legitimateIssuerOutcome = executeRuntime({ token: issuerPlan.token, confirmation: issuerPlan.token.confirmation, validation, adapter: issuerAdapter, actionLogPath: issuerLog, recoveryRoot: root, recoveryPath: join(root, "issuer-legitimate-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(legitimateIssuerOutcome.status, "succeeded"); assert.equal(issuerDispatches, 1);
const rehashedIssuerMutation = structuredClone(planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "issuer-mutation", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "issuer-mutation", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token);
rehashedIssuerMutation.operation.changes[0].after = "Caller mutation"; rehashedIssuerMutation.integrityHash = hash(canonical(rehashedIssuerMutation)); rehashedIssuerMutation.confirmation = `confirm:${rehashedIssuerMutation.tokenId}:${rehashedIssuerMutation.integrityHash}`;
let mutatedIssuerSnapshots = 0, mutatedIssuerDispatches = 0;
const mutatedIssuerOutcome = executeRuntime({ token: rehashedIssuerMutation, confirmation: rehashedIssuerMutation.confirmation, validation, adapter: { getCurrentSnapshot: () => { mutatedIssuerSnapshots++; return { workItemId: "issuer-mutation", version: "7" }; }, dispatch: () => { mutatedIssuerDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "issuer-mutation-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(mutatedIssuerOutcome.status, "blocked"); assert.equal(mutatedIssuerSnapshots, 0); assert.equal(mutatedIssuerDispatches, 0);
const issuerContext = { directory: join(root, "host"), projectId: "project-a" }, alternateIssuerStore = join(root, "caller-controlled-store"); mkdirSync(issuerContext.directory, { recursive: true });
assert.equal(planAdoOperation({ validation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], context: issuerContext, now: "2026-08-15T00:00:00.000Z" }).status, "blocked");
const issuerPlanner = createPlannerHarness(issuerContext);
const issuerExecutor = createExecutorHarness(issuerContext);
const restartIssuerPlan = issuerPlanner({ validation, operation: { ...operation, target: { workItemId: "issuer-restart", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "issuer-restart", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
assert.equal(restartIssuerPlan.status, "ready_for_confirmation");
let crossContextSnapshots = 0, crossContextDispatches = 0;
const otherContext = { directory: join(root, "other-host"), projectId: "project-b" }, otherStore = join(otherContext.directory, ".bass", "issued-tokens");
const crossContextOutcome = createExecutorHarness(otherContext)({ token: restartIssuerPlan.token, confirmation: restartIssuerPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => { crossContextSnapshots++; return { workItemId: "issuer-restart", version: "7" }; }, dispatch: () => { crossContextDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "issuer-cross-context-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(crossContextOutcome.status, "blocked"); assert.equal(crossContextSnapshots, 0); assert.equal(crossContextDispatches, 0); assert.equal(existsSync(otherStore), false);
let restartIssuerDispatches = 0;
const restartIssuerOutcome = issuerExecutor({ token: restartIssuerPlan.token, confirmation: restartIssuerPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "issuer-restart", version: "7" }), dispatch: () => { restartIssuerDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "issuer-restart-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(restartIssuerOutcome.status, "succeeded"); assert.equal(restartIssuerDispatches, 1);
assert.equal(existsSync(join(alternateIssuerStore, ".bass", "issued-tokens", "caller-project", `${restartIssuerPlan.token.tokenId}.json`)), false);
const forgedIssuerPlan = issuerPlanner({ validation, operation: { ...operation, target: { workItemId: "issuer-forged", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "issuer-forged", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
const forgedPath = join(issuerContext.directory, ".bass", "issued-tokens", issuerContext.projectId, `${forgedIssuerPlan.token.tokenId}.json`), forgedRecord = JSON.parse(readFileSync(forgedPath, "utf8"));
forgedRecord.token.operation.changes[0].after = "Forged issuer change"; forgedRecord.token.integrityHash = hash(canonical(forgedRecord.token)); forgedRecord.token.confirmation = `confirm:${forgedRecord.token.tokenId}:${forgedRecord.token.integrityHash}`; writeFileSync(forgedPath, JSON.stringify(forgedRecord), "utf8");
let forgedSnapshots = 0, forgedDispatches = 0;
const forgedOutcome = issuerExecutor({ token: forgedRecord.token, confirmation: forgedRecord.token.confirmation, validation, adapter: { getCurrentSnapshot: () => { forgedSnapshots++; return { workItemId: "issuer-forged", version: "7" }; }, dispatch: () => { forgedDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "issuer-forged-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(forgedOutcome.status, "blocked"); assert.equal(forgedSnapshots, 0); assert.equal(forgedDispatches, 0);
const savedSigningKey = process.env.BASS_TOKEN_SIGNING_KEY; delete process.env.BASS_TOKEN_SIGNING_KEY;
assert.equal(planAdoOperation({ validation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).status, "blocked");
const missingKeyOutcome = issuerExecutor({ token: restartIssuerPlan.token, confirmation: restartIssuerPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => { throw new Error("must not snapshot"); }, dispatch: () => { throw new Error("must not dispatch"); } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "issuer-key-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
assert.equal(missingKeyOutcome.status, "blocked"); process.env.BASS_TOKEN_SIGNING_KEY = savedSigningKey;
const symlinkContext = { directory: join(root, "symlink-host"), projectId: "project-b" }, outsideStore = join(root, "outside-store"); mkdirSync(join(symlinkContext.directory, ".bass"), { recursive: true }); mkdirSync(outsideStore, { recursive: true }); symlinkSync(outsideStore, join(symlinkContext.directory, ".bass", "issued-tokens"), "junction");
assert.equal(createPlannerHarness(symlinkContext)({ validation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).status, "blocked"); assert.equal(existsSync(join(outsideStore, "project-b")), false);
for (const expiresAt of ["2027-02-30T00:00:00.000Z", "2027-01-01T00:00:00Z"]) {
  const invalidExpiry = structuredClone(plan.token); invalidExpiry.expiresAt = expiresAt; invalidExpiry.integrityHash = hash(canonical(invalidExpiry)); invalidExpiry.confirmation = `confirm:${invalidExpiry.tokenId}:${invalidExpiry.integrityHash}`;
  let snapshots = 0, dispatches = 0;
  const outcome = executeRuntime({ token: invalidExpiry, confirmation: invalidExpiry.confirmation, validation, adapter: { getCurrentSnapshot: () => { snapshots++; return { workItemId: "42", version: "7" }; }, dispatch: () => { dispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "invalid-expiry-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
  assert.equal(outcome.status, "blocked", expiresAt); assert.equal(snapshots, 0, expiresAt); assert.equal(dispatches, 0, expiresAt);
}
const actualCreatePlan = planAdoOperation({ validation, operation: { category: "create", kind: "create_work_item", workItemType: "Feature", target: { workItemId: "new", version: "new" }, changes: [{ field: "title", after: "Actual create" }] }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
const actualCreateLog = join(root, "actual-create.md"); writeFileSync(actualCreateLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const actualCreateOutcome = executeRuntime({ token: actualCreatePlan.token, confirmation: actualCreatePlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => { throw new Error("create should not snapshot"); }, dispatch: () => ({ status: "succeeded", workItemId: "9001", url: "https://ado.example/9001", version: "3", result: "created" }) }, actionLogPath: actualCreateLog, recoveryRoot: root, recoveryPath: join(root, "actual-create-recovery"), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
const actualCreateRow = readFileSync(actualCreateLog, "utf8").trim().split("\n").at(-1); assert.equal(actualCreateOutcome.status, "succeeded"); assert.match(actualCreateRow, /\| 9001 \|/); assert.match(actualCreateRow, /https:\/\/ado.example\/9001/); assert.doesNotMatch(actualCreateRow, /\| new \|/);
const finalDurabilityPlan = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: "final-durability", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "final-durability", version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
let finalDurabilityDispatches = 0;
const finalDurabilityOutcome = executeRuntime({ token: finalDurabilityPlan.token, confirmation: finalDurabilityPlan.token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "final-durability", version: "7" }), dispatch: () => { finalDurabilityDispatches++; return { status: "succeeded", workItemId: "final-9001", result: "updated" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "final-durability-recovery"), dispatchDurability, recoveryDurability: { syncFile: () => { throw new Error("final recovery fsync unavailable"); }, syncDirectory: () => "ok" }, outcomeDurability: { syncFile: () => { throw new Error("final outcome fsync unavailable"); }, syncDirectory: () => "ok" }, now: "2026-08-15T00:00:30.000Z" });
assert.equal(finalDurabilityOutcome.status, "remote_outcome_recovery_durability_failed"); assert.equal(finalDurabilityDispatches, 1); assert.equal(finalDurabilityOutcome.remote.workItemId, "final-9001"); assert.equal(finalDurabilityOutcome.recoveryDurable, false);
for (const remote of [{ status: "succeeded", result: "ok" }, { status: "permission_denied", reason: "denied" }, { status: "partial_failure", result: "partial" }, new Error("adapter unavailable")]) {
  const token = planAdoOperation({ validation, operation: { ...operation, target: { workItemId: `outcome-${typeof remote === "object" && !(remote instanceof Error) ? remote.status : "throw"}`, version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: `outcome-${typeof remote === "object" && !(remote instanceof Error) ? remote.status : "throw"}`, version: "7" } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
  const outcomeLog = join(root, `outcome-${token.tokenId}.md`); writeFileSync(outcomeLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
  const outcome = executeRuntime({ token, confirmation: token.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: token.operation.target.workItemId, version: "7" }), dispatch: () => { if (remote instanceof Error) throw remote; return remote; } }, actionLogPath: outcomeLog, recoveryRoot: root, recoveryPath: join(root, `outcome-${token.tokenId}`), dispatchDurability: { syncFile: () => "fsynced", syncDirectory: () => "fsynced" }, outcomeDurability: { syncFile: () => { throw new Error("outcome fsync unavailable"); }, syncDirectory: () => "ok" }, recoveryDurability: { syncFile: () => { throw new Error("recovery fsync unavailable"); }, syncDirectory: () => "ok" }, now: "2026-08-15T00:00:30.000Z" });
  assert.equal(outcome.status, "remote_outcome_recovery_durability_failed"); assert.equal(outcome.recoveryDurable, false); assert.equal(outcome.remote.status, remote instanceof Error ? "dispatch_failed" : remote.status);
}
console.log("bass-ado-executor behavior tests passed");

// Fixture outcomes are normalized so source-only assertions do not depend on UUIDs,
// hashes, timestamps, or host-specific temporary paths.
const fixtureRoot = join(import.meta.dirname, "../../../fixtures/d9-executor");
const fixture = (directory, name) => JSON.parse(readFileSync(join(fixtureRoot, directory, name), "utf8"));
const normalized = (value) => JSON.parse(JSON.stringify(value, (key, item) =>
  ["tokenId", "integrityHash", "confirmation", "createdAt", "expiresAt", "actionLogId", "recoveryPath", "journalPath"].includes(key) ? `<${key}>` : item));
const fixtureCapabilities = fixture("capabilities", "mapped-capabilities.json");
const fixtureValidation = validateAdoWriteCapabilities(fixtureCapabilities);
assert.equal(fixtureValidation.status, "ready");
const makeOperation = (scenario) => ({
  category: scenario.category,
  kind: scenario.kind,
  workItemType: scenario.workItemType,
  target: { workItemId: scenario.workItemId, version: "7" },
  snapshot: scenario.category === "create" ? undefined : { status: "current_mapped_authorized", workItemId: scenario.workItemId, version: "7" },
  changes: scenario.changes,
  localUpdate: scenario.localUpdate
});
const operationExpected = fixture("expected", "mapped-operation-plans.json");
const executionExpected = fixture("expected", "mapped-operation-executions.json");
for (let scenario of fixture("operations", "mapped-operations.json").scenarios) {
  const localRoot = join(root, `local-${scenario.id}`), artifactPath = join(localRoot, "artifact.json"), baselinePath = join(localRoot, "baseline.json");
  if (scenario.category === "query/import") {
    mkdirSync(localRoot, { recursive: true });
    writeFileSync(artifactPath, JSON.stringify({ title: "Old" }), "utf8");
    writeFileSync(baselinePath, JSON.stringify({ title: "Old" }), "utf8");
    scenario = structuredClone(scenario);
    scenario.localUpdate = { artifactPath, baselinePath, values: { title: "New" } };
  }
  const planned = planAdoOperation({ validation: fixtureValidation, operation: makeOperation(scenario), evidence: [{ id: "EVD-001", source: "fixture" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
  const previewOperation = structuredClone(planned.preview.operation);
  delete previewOperation.localUpdate;
  assert.deepEqual({ id: scenario.id, status: planned.status, operation: previewOperation }, operationExpected.scenarios.find((item) => item.id === scenario.id));
  const fixtureLog = join(root, `execution-${scenario.id}.md`), calls = [];
  writeFileSync(fixtureLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
  const adapter = { getCurrentSnapshot: (target) => ({ workItemId: target.workItemId, version: target.version }), dispatch: (request) => { calls.push(request); return { status: "succeeded", targetVersion: "8", result: "fixture success" }; } };
  const outcome = executeConfirmedAdoOperation({ token: planned.token, confirmation: planned.token.confirmation, validation: fixtureValidation, adapter, actionLogPath: fixtureLog, recoveryRoot: root, recoveryPath: join(root, `execution-${scenario.id}-recovery`), localRoot, durability: { syncFile: () => "fsynced", syncDirectory: () => "fsynced" }, dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, now: "2026-08-15T00:00:30.000Z" });
  const row = readFileSync(fixtureLog, "utf8").trim().split("\n").at(-1).split("|").map((item) => item.trim());
  const dispatchedOperation = calls[0] && structuredClone(calls[0].operation);
  if (dispatchedOperation) delete dispatchedOperation.localUpdate;
  const expected = executionExpected.scenarios.find((item) => item.id === scenario.id);
  const actual = { id: scenario.id, status: outcome.status, dispatched: outcome.dispatched, localImport: outcome.localImport ?? false, dispatchCount: calls.length, actionLog: [row[2], row[3], row[5], row[6], row[9]] };
  if (calls.length) Object.assign(actual, { toolName: calls[0].toolName, operation: dispatchedOperation });
  assert.deepEqual(actual, expected);
}
for (const scenario of fixture("sync", "three-way-sync.json").scenarios) {
  assert.deepEqual(compareAdoSync(scenario.input), fixture("expected", "sync-outcomes.json")[scenario.id]);
}
for (const scenario of fixture("failures", "confirmation-integrity.json").scenarios) {
  const planned = planAdoOperation({ validation: fixtureValidation, operation: makeOperation(scenario.operation), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z", ttlMs: scenario.ttlMs });
  const fixtureLog = join(root, `${scenario.id}.md`);
  writeFileSync(fixtureLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
  const altered = scenario.mutation === "hash" ? { ...planned.token, integrityHash: "altered" } : scenario.mutation === "operation" ? { ...planned.token, operation: { ...planned.token.operation, kind: "remove_tag" } } : planned.token;
  let integrityDispatches = 0;
  const fixtureAdapter = { getCurrentSnapshot: (target) => ({ workItemId: target.workItemId, version: "7" }), dispatch: () => { integrityDispatches++; return { status: "succeeded", targetVersion: "8", result: "fixture" }; } };
  if (scenario.replay) executeConfirmedAdoOperation({ token: planned.token, confirmation: planned.token.confirmation, validation: fixtureValidation, adapter: fixtureAdapter, actionLogPath: fixtureLog, recoveryRoot: root, recoveryPath: join(root, `${scenario.id}-replay-recovery`), now: "2026-08-15T00:00:30.000Z" });
  const outcome = executeConfirmedAdoOperation({ token: altered, confirmation: scenario.confirmed ? planned.token.confirmation : "", validation: fixtureValidation, adapter: fixtureAdapter, actionLogPath: fixtureLog, recoveryRoot: root, recoveryPath: join(root, `${scenario.id}-recovery`), now: scenario.now || "2026-08-15T00:00:30.000Z" });
  assert.deepEqual(normalized({ status: outcome.status, dispatched: outcome.dispatched ?? false }), fixture("expected", "confirmation-outcomes.json")[scenario.id]);
  if (scenario.replay) assert.equal(integrityDispatches, 1);
}
const validTag = planAdoOperation({ validation: fixtureValidation, operation: makeOperation({ category: "tags", kind: "add_tag", workItemType: "Feature", workItemId: "rehashed-tag", changes: [{ tag: "urgent", before: false, after: true }] }), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
const rehashedCrossCategoryTag = structuredClone(validTag);
rehashedCrossCategoryTag.operation.changes = [{ field: "title", before: "Old", after: "New" }];
rehashedCrossCategoryTag.integrityHash = hash(canonical(rehashedCrossCategoryTag));
rehashedCrossCategoryTag.confirmation = `confirm:${rehashedCrossCategoryTag.tokenId}:${rehashedCrossCategoryTag.integrityHash}`;
let rehashedDispatches = 0;
const rehashedOutcome = executeConfirmedAdoOperation({ token: rehashedCrossCategoryTag, confirmation: rehashedCrossCategoryTag.confirmation, validation: fixtureValidation, adapter: { getCurrentSnapshot: (target) => ({ workItemId: target.workItemId, version: target.version }), dispatch: () => { rehashedDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "rehashed-tag-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(rehashedOutcome.status, "blocked");
assert.equal(rehashedDispatches, 0);
const rehashToken = (token) => { token.integrityHash = hash(canonical(token)); token.confirmation = `confirm:${token.tokenId}:${token.integrityHash}`; return token; };
for (const scenario of [
  { category: "tags", kind: "add_tag", changes: [{ tag: "urgent", before: false, after: true }] },
  { category: "comments", kind: "add_comment", changes: [{ comment: { schema: "bass.comment.v1", body: "Approved" }, before: null, after: "added" }] },
  { category: "relations", kind: "add_relation", changes: [{ relation: { sourceId: "multi", targetId: "other", type: "System.LinkTypes.Hierarchy-Forward", action: "add" }, before: null, after: "added" }] },
  { category: "transitions", kind: "transition", changes: [{ state: { before: "New", after: "Active" }, reason: { before: "New", after: "Work started" } }] }
]) {
  const token = planAdoOperation({ validation: fixtureValidation, operation: makeOperation({ ...scenario, workItemType: "Feature", workItemId: "multi" }), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
  const rehashed = structuredClone(token); rehashed.operation.changes.push(structuredClone(rehashed.operation.changes[0])); rehashToken(rehashed);
  let snapshots = 0, dispatches = 0;
  const outcome = executeConfirmedAdoOperation({ token: rehashed, confirmation: rehashed.confirmation, validation: fixtureValidation, adapter: { getCurrentSnapshot: () => { snapshots++; return { workItemId: "multi", version: "7" }; }, dispatch: () => { dispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, `multi-${scenario.category}-recovery`), now: "2026-08-15T00:00:30.000Z" });
  assert.equal(outcome.status, "blocked", scenario.category); assert.equal(snapshots, 0, scenario.category); assert.equal(dispatches, 0, scenario.category);
}
const fieldToken = planAdoOperation({ validation: fixtureValidation, operation: makeOperation({ category: "fields", kind: "update_field", workItemType: "Feature", workItemId: "rehashed-field", changes: [{ field: "title", before: "Old", after: "New" }] }), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
const fieldAsTag = structuredClone(fieldToken);
fieldAsTag.operation.changes = [{ tag: "urgent", before: false, after: true }]; rehashToken(fieldAsTag);
let fieldSnapshots = 0, fieldDispatches = 0;
const fieldAsTagOutcome = executeConfirmedAdoOperation({ token: fieldAsTag, confirmation: fieldAsTag.confirmation, validation: fixtureValidation, adapter: { getCurrentSnapshot: () => { fieldSnapshots++; return { workItemId: "rehashed-field", version: "7" }; }, dispatch: () => { fieldDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "rehashed-field-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(fieldAsTagOutcome.status, "blocked"); assert.equal(fieldSnapshots, 0); assert.equal(fieldDispatches, 0);
const createToken = planAdoOperation({ validation: fixtureValidation, operation: makeOperation({ category: "create", kind: "create_work_item", workItemType: "Feature", workItemId: "new", changes: [{ field: "title", after: "New" }] }), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
const invalidCreate = structuredClone(createToken); invalidCreate.operation.workItemType = "Unsupported"; rehashToken(invalidCreate);
let createSnapshots = 0, createDispatches = 0;
const invalidCreateOutcome = executeConfirmedAdoOperation({ token: invalidCreate, confirmation: invalidCreate.confirmation, validation: fixtureValidation, adapter: { getCurrentSnapshot: () => { createSnapshots++; return { workItemId: "new", version: "7" }; }, dispatch: () => { createDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "invalid-create-recovery"), now: "2026-08-15T00:00:30.000Z" });
assert.equal(invalidCreateOutcome.status, "blocked"); assert.equal(createSnapshots, 0); assert.equal(createDispatches, 0);
const importRoot = join(root, "rehashed-import"), importArtifact = join(importRoot, "artifact.json"), importBaseline = join(importRoot, "baseline.json");
mkdirSync(importRoot, { recursive: true }); writeFileSync(importArtifact, '{"title":"Old"}', "utf8"); writeFileSync(importBaseline, '{"title":"Old"}', "utf8");
const importToken = planAdoOperation({ validation: fixtureValidation, operation: { ...makeOperation({ category: "query/import", kind: "import_field", workItemType: "Feature", workItemId: "rehashed-import", changes: [{ field: "title", before: "Old", after: "New" }] }), localUpdate: { artifactPath: importArtifact, baselinePath: importBaseline, values: { title: "New" } } }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" }).token;
const importWithExtraValue = structuredClone(importToken); importWithExtraValue.operation.localUpdate.values.extra = "must-not-write"; rehashToken(importWithExtraValue);
let importSnapshots = 0, importDispatches = 0;
const importExtraOutcome = executeConfirmedAdoOperation({ token: importWithExtraValue, confirmation: importWithExtraValue.confirmation, validation: fixtureValidation, adapter: { getCurrentSnapshot: () => { importSnapshots++; return { workItemId: "rehashed-import", version: "7" }; }, dispatch: () => { importDispatches++; return { status: "succeeded" }; } }, actionLogPath: actionLog, localRoot: importRoot, recoveryRoot: root, recoveryPath: join(root, "rehashed-import-recovery"), durability: { syncFile: () => "fsynced", syncDirectory: () => "fsynced" }, now: "2026-08-15T00:00:30.000Z" });
assert.equal(importExtraOutcome.status, "blocked"); assert.equal(importSnapshots, 0); assert.equal(importDispatches, 0); assert.equal(readFileSync(importArtifact, "utf8"), '{"title":"Old"}'); assert.equal(readFileSync(importBaseline, "utf8"), '{"title":"Old"}');
for (const scenario of fixture("failures", "rejected-category-payloads.json").scenarios) {
  const rejected = planAdoOperation({ validation: fixtureValidation, operation: makeOperation(scenario.operation), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
  assert.deepEqual(rejected, { status: "blocked", reason: "Invalid category payload." }, scenario.id);
}
for (const scenario of fixture("failures", "adapter-failures.json").scenarios) {
  const operation = { category: "fields", kind: "update_field", workItemType: "Feature", target: { workItemId: `adapter-${scenario.id}`, version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: `adapter-${scenario.id}`, version: "7" }, changes: [{ field: "title", before: "Old", after: "New" }] };
  const planned = planAdoOperation({ validation: fixtureValidation, operation, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"], now: "2026-08-15T00:00:00.000Z" });
  const fixtureLog = join(root, `${scenario.id}.md`);
  writeFileSync(fixtureLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
  const adapter = {
    getCurrentSnapshot: (target) => {
      if (scenario.adapter === "snapshot_throws") throw new Error("MCP unavailable");
      return { workItemId: target.workItemId, version: scenario.adapter === "version_changed" ? "8" : "7" };
    },
    dispatch: () => scenario.adapter === "permission_denied" ? { status: "permission_denied", reason: "permission denied" } : scenario.adapter === "partial_failure" ? { status: "partial_failure", reason: "comment created; relation rejected" } : { status: "succeeded", targetVersion: "8", result: "updated" }
  };
  const outcome = executeConfirmedAdoOperation({ token: planned.token, confirmation: planned.token.confirmation, validation: fixtureValidation, adapter, actionLogPath: fixtureLog, recoveryRoot: root, recoveryPath: join(root, `${scenario.id}-recovery`), dispatchDurability, recoveryDurability: dispatchDurability, outcomeDurability: dispatchDurability, failRecording: scenario.failRecording, now: "2026-08-15T00:00:30.000Z" });
  assert.deepEqual(normalized({ status: outcome.status, dispatched: outcome.dispatched ?? false }), { status: scenario.expected.status, dispatched: scenario.expected.dispatched });
  if (scenario.expected.actionLog) {
    const row = readFileSync(fixtureLog, "utf8").trim().split("\n").at(-1).split("|").map((item) => item.trim());
    assert.deepEqual([row[2], row[3], row[5], row[6], row[7], row[8], row[9], "<token-id>"], scenario.expected.actionLog);
  }
  if (scenario.expected.recovery) {
    assert.equal(existsSync(outcome.recoveryPath), true);
    assert.match(readFileSync(outcome.recoveryPath, "utf8"), /\| EVD-001 \| DEC-001 \| Executor \|/);
    assert.match(readFileSync(outcome.recoveryPath, "utf8"), new RegExp(`\\| ${scenario.expected.status} \\|`));
  }
}
const unavailableField = planAdoOperation({ validation: fixtureValidation, operation: makeOperation({ category: "fields", kind: "update_field", workItemType: "Feature", workItemId: "unmapped", changes: [{ field: "unmapped_custom", before: "Old", after: "New" }] }), evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"] });
assert.deepEqual(unavailableField, fixture("expected", "unavailable-field.json"));
const batch = planAdoOperation({ validation: fixtureValidation, operation: { ...makeOperation({ category: "fields", kind: "update_field", workItemType: "Feature", workItemId: "batch", changes: [{ field: "title", before: "Old", after: "New" }] }), changes: [{ field: "title", before: "Old", after: "New" }, { field: "business_value", before: 3, after: 5 }] }, evidence: [{ id: "EVD-001" }], decisionIds: ["DEC-001"] });
assert.deepEqual(batch, fixture("expected", "batch-blocked.json"));
for (const prohibited of fixture("capabilities", "prohibited-capabilities.json").scenarios) {
  const prohibitedValidation = validateAdoWriteCapabilities(prohibited.input), calls = [];
  const prohibitedPlan = planAdoOperation({ validation: prohibitedValidation, operation: makeOperation(prohibited.operation), evidence: [{ id: "EVD-001", source: "fixture" }], decisionIds: ["DEC-001"] });
  const attempted = prohibitedPlan.token ? executeConfirmedAdoOperation({ token: prohibitedPlan.token, confirmation: prohibitedPlan.token.confirmation, validation: prohibitedValidation, adapter: { getCurrentSnapshot: () => ({ workItemId: "99", version: "7" }), dispatch: (request) => calls.push(request) }, actionLogPath: actionLog, recoveryRoot: root, recoveryPath: join(root, "prohibited-recovery") }) : { status: "not_dispatched" };
  assert.deepEqual({ validation: prohibitedValidation.status, plan: prohibitedPlan.status, execution: attempted.status, dispatches: calls.length }, prohibited.expected);
}
assert.equal(validateAdoWriteCapabilities({ capabilities: { fields: { toolName: "ado_update_pr", operation: "update_field", resourceType: "pull_request", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" } }, fields }).status, "blocked");
assert.equal(validateAdoWriteCapabilities({ capabilities: { fields: { toolName: "ado_update_work_item_field", operation: "update_field", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" } }, fields }).status, "blocked");
const templateMapping = Object.fromEntries(readFileSync(join(fixtureRoot, "capabilities", "completed-template-mapping.txt"), "utf8").trim().split("\n").map((line) => line.split(": ")));
assert.equal(validateAdoWriteCapabilities({ capabilities: { fields: { ...templateMapping, verifiedReadWrite: templateMapping.verifiedReadWrite === "true" } }, fields }).status, "ready");
console.log("bass-ado-executor fixture tests passed");
