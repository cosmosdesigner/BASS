import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateAdoWriteCapabilities } from "./bass-validate-ado-write-capabilities.js";
process.env.BASS_TOKEN_SIGNING_KEY = "source-only-test-token-signing-key";
import { createPlannerHarness } from "../../../test-support/d9/executor-harness.mjs";
import { compareAdoSync } from "./bass-compare-ado-sync.js";
import { createExecutorHarness } from "../../../test-support/d9/executor-harness.mjs";
let trustedContext, planAdoOperation, executeTrusted; const executeConfirmedAdoOperation = (input) => executeTrusted({ ...input, dispatchDurability: input.dispatchDurability || { syncFile: () => "fsynced", syncDirectory: () => "fsynced" }, recoveryDurability: input.recoveryDurability || { syncFile: () => "fsynced", syncDirectory: () => "fsynced" }, outcomeDurability: input.outcomeDurability || { syncFile: () => "fsynced", syncDirectory: () => "fsynced" } });

const root = mkdtempSync(join(tmpdir(), "bass-d9-core-red-"));
trustedContext = { directory: root, projectId: "core" };
planAdoOperation = createPlannerHarness(trustedContext);
executeTrusted = createExecutorHarness(trustedContext);
const actionLog = join(root, "action-log.md"), recoveryRoot = join(root, "recovery"), recoveryPath = join(recoveryRoot, "outcome.json");
writeFileSync(actionLog, "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n", "utf8");
const validation = validateAdoWriteCapabilities({ capabilities: { create: { toolName: "ado_create_work_item", operation: "create_work_item", resourceType: "work_item", supportedInput: "workItemType,fields", verifiedReadWrite: true, verificationDate: "2026-08-15" }, fields: { toolName: "ado_update_work_item_field", operation: "update_field", resourceType: "work_item", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" }, "query/import": { toolName: "ado_import_work_item_field", operation: "import_field", resourceType: "work_item", supportedInput: "workItemId,field,before,after", verifiedReadWrite: true, verificationDate: "2026-08-15" } }, fields: { title: { adoFieldReference: "System.Title", supportedWorkItemTypes: ["Feature"], verificationStatus: "verified" }, description: { adoFieldReference: "System.Description", supportedWorkItemTypes: ["Feature"], verificationStatus: "verified" } } });
const evidence = [{ id: "EVD-001", source: "evidence-register.md", location: "row 1" }], decisions = ["DEC-001"];
const fieldOperation = (id) => ({ category: "fields", kind: "update_field", workItemType: "Feature", target: { workItemId: id, version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: id, version: "7" }, changes: [{ field: "title", before: "Old", after: "New" }] });
const issue = (operation) => planAdoOperation({ validation, operation, evidence, decisionIds: decisions, now: "2026-08-15T00:00:00.000Z" }).token;

const order = [], freshAdapter = { getCurrentSnapshot: (target) => { order.push(`snapshot:${target.workItemId}`); return { workItemId: target.workItemId, version: "7" }; }, dispatch: () => { order.push("dispatch"); return { status: "succeeded", result: "updated" }; } };
const fresh = issue(fieldOperation("101"));
assert.equal(executeConfirmedAdoOperation({ token: fresh, confirmation: fresh.confirmation, validation, adapter: freshAdapter, actionLogPath: actionLog, recoveryRoot, recoveryPath, now: "2026-08-15T00:00:30.000Z" }).status, "succeeded");
assert.deepEqual(order, ["snapshot:101", "dispatch"]);
const mismatch = issue(fieldOperation("102"));
assert.equal(executeConfirmedAdoOperation({ token: mismatch, confirmation: mismatch.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "wrong", version: "7" }), dispatch: () => { throw new Error("must not dispatch"); } }, actionLogPath: actionLog, recoveryRoot, recoveryPath, now: "2026-08-15T00:00:30.000Z" }).status, "blocked");

for (const [id, adapter] of [["103", { getCurrentSnapshot: () => ({ workItemId: "103", version: "7" }), dispatch: () => { throw new Error("MCP unavailable"); } }], ["104", { getCurrentSnapshot: () => ({ workItemId: "104", version: "7" }), dispatch: () => ({ status: "permission_denied", reason: "denied" }) }], ["105", { getCurrentSnapshot: () => ({ workItemId: "105", version: "7" }), dispatch: () => ({ status: "partial", result: "half" }) }]]) { const token = issue(fieldOperation(id)); assert.equal(executeConfirmedAdoOperation({ token, confirmation: token.confirmation, validation, adapter, actionLogPath: actionLog, recoveryRoot, recoveryPath, now: "2026-08-15T00:00:30.000Z" }).status, "failed"); }
assert.match(readFileSync(actionLog, "utf8"), /MCP unavailable/);
assert.match(readFileSync(actionLog, "utf8"), /permission_denied/);
assert.match(readFileSync(actionLog, "utf8"), /partial/);

const artifactPath = join(root, "artifact.json"), baselinePath = join(root, "baseline.json");
writeFileSync(artifactPath, JSON.stringify({ title: "Old" }), "utf8"); writeFileSync(baselinePath, JSON.stringify({ title: "Old" }), "utf8");
const imported = issue({ category: "query/import", kind: "import_field", workItemType: "Feature", target: { workItemId: "106", version: "7", artifactPath }, snapshot: { status: "current_mapped_authorized", workItemId: "106", version: "7" }, changes: [{ field: "title", before: "Old", after: "ADO" }], localUpdate: { artifactPath, baselinePath, values: { title: "ADO" } } });
let importDispatches = 0;
assert.equal(executeConfirmedAdoOperation({ token: imported, confirmation: imported.confirmation, validation, adapter: { getCurrentSnapshot: () => ({ workItemId: "106", version: "7" }), dispatch: () => { importDispatches++; } }, actionLogPath: actionLog, recoveryRoot, recoveryPath, localRoot: root, durability: { syncFile: () => "ok", syncDirectory: () => "ok" }, now: "2026-08-15T00:00:30.000Z" }).status, "succeeded");
assert.equal(importDispatches, 0);
assert.equal(JSON.parse(readFileSync(artifactPath, "utf8")).title, "ADO");
assert.equal(JSON.parse(readFileSync(baselinePath, "utf8")).title, "ADO");

assert.equal(planAdoOperation({ validation, operation: { category: "create", kind: "create_work_item", workItemType: "Feature", target: { workItemId: "new" }, changes: [{ field: "title", after: "Title" }, { field: "unknown", after: "No" }] }, evidence, decisionIds: decisions }).status, "blocked");
assert.equal(planAdoOperation({ validation, operation: { category: "query/import", kind: "import_field", workItemType: "Bug", target: { workItemId: "107", version: "7" }, snapshot: { status: "current_mapped_authorized", workItemId: "107", version: "7" }, changes: [{ field: "title", before: "a", after: "b" }], localUpdate: { artifactPath, baselinePath, values: { title: "b" } } }, evidence, decisionIds: decisions }).status, "blocked");
const converged = compareAdoSync({ fields: ["title"], baseline: { title: "Base" }, local: { title: "Same" }, ado: { title: "Same" } });
assert.equal(converged.localOnly.length + converged.adoOnly.length + converged.conflicts.length, 0);
console.log("bass-ado-executor core finding RED tests passed");
